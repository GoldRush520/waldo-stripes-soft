/**
 * Fixed-view benchmark in a real, headed Chromium with the machine's GPU.
 * Usage: node scripts/bench.mjs [baseUrl] [seconds] [seed,seed,...] [shape,shape,...] [extraQuery]
 *   shapes: desktop (default), desktop1x, portrait, wide    extraQuery: e.g. "&uncapped=1&quality=high"
 * Loads the game with a debug seed, waits for the puzzle, then runs the in-page benchmark
 * (full animation plus periodic picks and a pause/resume) and saves a screenshot.
 */
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.argv[2] ?? 'http://127.0.0.1:5181';
const seconds = Number(process.argv[3] ?? 60);
const seeds = (process.argv[4] ?? 'bench-1').split(',');
const shapes = (process.argv[5] ?? 'desktop').split(',');
const extra = process.argv[6] ?? '';
/* results and screenshots land here (ignored by git) */
const OUT_DIR = 'bench-results';
const SHAPES = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 2 },
  desktop1x: { width: 1440, height: 900, deviceScaleFactor: 1 },
  portrait: { width: 390, height: 844, deviceScaleFactor: 3 },
  wide: { width: 1920, height: 1080, deviceScaleFactor: 1 },
};
const unknown = shapes.filter((name) => !Object.hasOwn(SHAPES, name));
if (unknown.length > 0) {
  process.stderr.write(`Unknown shape: ${unknown.join(', ')}. Choose from ${Object.keys(SHAPES).join(', ')}.\n`);
  process.exit(1);
}
const stamp = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
};

/* `uncapped=1` in the extra query string removes the display-rate cap so frame times show real render cost */
const uncapped = extra.includes('uncapped=1') ? ['--disable-gpu-vsync', '--disable-frame-rate-limit'] : [];
/* HEADLESS=1 runs without a window (still on the GPU): draw calls, triangles, CPU and startup are
 * comparable with headed runs; frame pacing is only meaningful in a real window on the display */
const headless = process.env.HEADLESS === '1';
const browser = await chromium.launch({
  headless,
  ...(headless ? { channel: 'chromium' } : {}),
  args: [...uncapped, '--use-angle=metal', '--ignore-gpu-blocklist', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'],
});
const results = [];
await mkdir(OUT_DIR, { recursive: true });
for (const shapeName of shapes) {
  const shape = SHAPES[shapeName];
  for (const seed of seeds) {
    const context = await browser.newContext({ viewport: { width: shape.width, height: shape.height }, deviceScaleFactor: shape.deviceScaleFactor });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    const t0 = Date.now();
    await page.goto(`${base}/?dev&seed=${seed}${extra}`);
    await page.waitForFunction(() => window.__waldo || String(window.__boot?.stage).startsWith('failed'), null, { timeout: 90000 });
    const ready = Date.now() - t0;
    /* past the how-to-play card (it holds the clock and input until Start) */
    await page.evaluate(() => document.querySelector('.wss-howto-start')?.click());
    const boot = await page.evaluate(() => ({ stage: String(window.__boot.stage).slice(0, 300), marks: window.__boot.marks }));
    if (!boot.stage.startsWith('playing')) {
      results.push({ shape: shapeName, seed, failed: boot.stage, errors });
      await context.close();
      continue;
    }
    const gpu = await page.evaluate(() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      const ext = gl?.getExtension('WEBGL_debug_renderer_info');
      return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown';
    });
    await page.waitForTimeout(1200);
    const file = `${OUT_DIR}/${stamp()}_${shapeName}-${shape.width}x${shape.height}_seed-${seed}.png`;
    await page.screenshot({ path: file });
    const puzzle = await page.evaluate(() => {
      const p = window.__waldo.puzzle();
      return { heroOnOpeningScreen: p.heroOnOpeningScreen, hero: p.hero, tried: p.tried, scanned: p.scanned, shortlisted: p.shortlisted, shortlistMs: p.shortlistMs, composeMs: p.totalMs, visibility: p.visibility, occupancy: { total: p.occupancy.total, emptyShare: p.occupancy.emptyShare, company: p.occupancy.company } };
    });
    const stats = seconds > 0 ? await page.evaluate(([s, i]) => window.__waldo.bench(s, i), [seconds, !extra.includes('idle=1')]) : null;
    const info = await page.evaluate(() => {
      const i = window.__waldo.info();
      return { people: i.people, vignettes: i.vignettes, clips: i.clips, crowd: i.crowd, statics: i.statics, gpu: i.gpu, quality: i.quality, dpr: i.dpr, canvas: i.canvas };
    });
    results.push({
      shape: shapeName,
      viewport: `${shape.width}x${shape.height} CSS @ deviceScaleFactor ${shape.deviceScaleFactor}`,
      seed,
      gpu,
      screenshot: file,
      readyWallMs: ready,
      buildMs: Math.round(boot.marks.built - boot.marks.start),
      composeMs: Math.round(boot.marks.playing - boot.marks.built),
      moduleLoadMs: Math.round(boot.marks.start),
      puzzle,
      stats,
      info,
      errors,
    });
    await context.close();
  }
}
await browser.close();
const out = `${OUT_DIR}/${stamp()}_bench.json`;
await writeFile(out, JSON.stringify(results, null, 2));
process.stdout.write(`${JSON.stringify(results, null, 1)}\nsaved ${out}\n`);
