import { type Page, expect, test } from '@playwright/test';

/** Minimal shape of the developer hooks installed by `?dev` (see src/dev/devTools.ts). */
interface Dev {
  game: {
    getState(): { status: string; seed: string; wrongClicks: number; paused: boolean; elapsedMs: number };
    setPaused(on: boolean): void;
    setWaiting(on: boolean): void;
    setReducedMotion(on: boolean): void;
    newPuzzle(seed?: string): void;
    heroOnScreen(): boolean;
    recompose(): void;
  };
  engine: {
    rig: { state: { x: number; z: number; ppm: number; azimuth: number }; size: { width: number; height: number }; camera: unknown };
    renderer: { info: { memory: { geometries: number; textures: number } } };
  };
  town: {
    hero: { person: number; spot: { x: number; y: number; z: number } };
    crowdUniforms: { uMoveTime: { value: number }; uPoseTime: { value: number } };
    build: { people: { count: number; get(i: number): { x: number; y: number; z: number; motion: number; scale: number } } };
    cullNow(engine: unknown): number;
  };
  view(v: { x?: number; z?: number }): void;
  heroScreen(): { x: number; y: number };
  puzzle(): { hero: { x: number; z: number; district: string }; heroOnOpeningScreen: boolean; visibility: { body: number; head: number; pixels: number } };
}
declare global {
  interface Window {
    __waldo?: Dev;
    __boot?: { stage: string };
  }
}

/** Load the game; by default also press Start on the how-to-play card so the puzzle is under way. */
async function open(page: Page, query: string, start = true): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto(`/?dev${query}`);
  await page.waitForFunction(() => window.__waldo !== undefined || String(window.__boot?.stage).startsWith('failed'), null, { timeout: 80_000 });
  expect(await page.evaluate(() => String(window.__boot?.stage))).toBe('playing');
  if (start) {
    await page.getByRole('button', { name: 'Start' }).click();
    await expect(page.locator('.wss-howto-card')).toBeHidden();
  }
  return errors;
}

const state = (page: Page) => page.evaluate(() => window.__waldo!.game.getState());
const view = (page: Page) => page.evaluate(() => ({ ...window.__waldo!.engine.rig.state }));

test('opens on a busy scene without Waldo on screen, with no hints or picture of him', async ({ page }) => {
  const errors = await open(page, '&seed=e2e-open');
  const puzzle = await page.evaluate(() => window.__waldo!.puzzle());
  expect(puzzle.heroOnOpeningScreen).toBe(false);
  expect(await page.evaluate(() => window.__waldo!.game.heroOnScreen())).toBe(false);
  expect(puzzle.visibility.pixels).toBeGreaterThan(0);
  expect(puzzle.visibility.body).toBeGreaterThanOrEqual(0.55);
  expect(puzzle.visibility.head).toBeGreaterThanOrEqual(0.7);
  /* the only canvas is the world itself (no reference portrait) and the HUD offers no hint */
  expect(await page.locator('canvas').count()).toBe(1);
  expect((await page.locator('#ui').innerText()).toLowerCase()).not.toContain('hint');
  await expect(page.locator('[role="timer"]')).toBeVisible();
  expect(errors).toEqual([]);
});

test('a debug seed reproduces the puzzle; an ordinary visit gets a fresh seed', async ({ page }) => {
  await open(page, '&seed=e2e-repro');
  const first = await page.evaluate(() => window.__waldo!.puzzle().hero);
  await open(page, '&seed=e2e-repro');
  expect(await page.evaluate(() => window.__waldo!.puzzle().hero)).toEqual(first);
  await open(page, '');
  const seedA = (await state(page)).seed;
  const heroA = await page.evaluate(() => window.__waldo!.puzzle().hero);
  await open(page, '');
  const seedB = (await state(page)).seed;
  const heroB = await page.evaluate(() => window.__waldo!.puzzle().hero);
  expect(seedA).not.toBe(seedB);
  expect(heroA).not.toEqual(heroB);
});

test('the player can pan but never zoom', async ({ page }) => {
  await open(page, '&seed=e2e-pan');
  const start = await view(page);
  const box = (await page.locator('canvas').boundingBox())!;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx - 220, cy - 90, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(700);
  const dragged = await view(page);
  expect(Math.hypot(dragged.x - start.x, dragged.z - start.z)).toBeGreaterThan(3);
  expect(dragged.ppm).toBe(start.ppm);
  expect(dragged.azimuth).toBe(start.azimuth);
  /* wheel scroll pans; ctrl+wheel (browser zoom / pinch) is never intercepted and changes nothing */
  await page.mouse.wheel(0, 240);
  await page.waitForTimeout(500);
  const scrolled = await view(page);
  expect(Math.hypot(scrolled.x - dragged.x, scrolled.z - dragged.z)).toBeGreaterThan(2);
  expect(scrolled.ppm).toBe(start.ppm);
  await page.keyboard.down('Control');
  await page.mouse.wheel(0, -300);
  await page.keyboard.up('Control');
  /* no key zooms, including the chord that used to be a hidden zoom on Waldo */
  for (const key of ['+', '=', '-', 'q', 'e', '0', 'Meta+Shift+KeyC', 'Control+Shift+KeyC']) await page.keyboard.press(key);
  await page.waitForTimeout(400);
  const after = await view(page);
  /* (the browser's own zoom may resize the page; the game's scale and angle must not change) */
  expect(after.ppm).toBe(start.ppm);
  expect(after.azimuth).toBe(start.azimuth);
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(500);
  await page.keyboard.up('ArrowRight');
  await page.waitForTimeout(400);
  const keyed = await view(page);
  expect(Math.hypot(keyed.x - after.x, keyed.z - after.z)).toBeGreaterThan(2);
  expect(keyed.ppm).toBe(start.ppm);
});

test('clicking someone else is a wrong guess; clicking Waldo wins', async ({ page }) => {
  await open(page, '&seed=e2e-win');
  /* an ordinary bystander in the opening view */
  const bystander = await page.evaluate(() => {
    const w = window.__waldo!;
    const { width, height } = w.engine.rig.size;
    const s = w.engine.rig.state;
    const ca = Math.cos(s.azimuth);
    const sa = Math.sin(s.azimuth);
    const el = 0.72;
    const people = w.town.build.people;
    for (let i = 0; i < people.count; i++) {
      const p = people.get(i);
      if (i === w.town.hero.person || p.motion >= 0 || p.scale < 0.9 || Math.abs(p.y) > 0.2) continue;
      const dx = p.x - s.x;
      const dz = p.z - s.z;
      const x = width / 2 + (dx * ca - dz * sa) * s.ppm;
      const y = height / 2 - (-dx * sa - dz * ca) * s.ppm * Math.sin(el) - 1.0 * s.ppm * Math.cos(el);
      if (x > width * 0.3 && x < width * 0.7 && y > height * 0.3 && y < height * 0.7) return { x, y };
    }
    return null;
  });
  expect(bystander).not.toBeNull();
  let clicked = 0;
  for (const dy of [0, -8, 8, -16]) {
    await page.mouse.click(bystander!.x, bystander!.y + dy);
    clicked++;
    await page.waitForTimeout(350);
    if ((await state(page)).wrongClicks > 0) break;
  }
  const afterMiss = await state(page);
  expect(afterMiss.status).toBe('playing');
  expect(afterMiss.wrongClicks).toBeGreaterThan(0);
  expect(afterMiss.wrongClicks).toBeLessThanOrEqual(clicked);

  /* pan to Waldo and click his chest */
  await page.evaluate(() => {
    const w = window.__waldo!;
    w.view({ x: w.town.hero.spot.x, z: w.town.hero.spot.z });
    w.game.recompose();
    w.town.cullNow(w.engine);
  });
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.__waldo!.game.heroOnScreen())).toBe(true);
  const hero = await page.evaluate(() => window.__waldo!.heroScreen());
  /* a click well away from him must not win */
  await page.mouse.click(hero.x + 140, hero.y - 120);
  await page.waitForTimeout(350);
  expect((await state(page)).status).toBe('playing');
  await page.mouse.click(hero.x, hero.y);
  await expect.poll(async () => (await state(page)).status, { timeout: 15_000 }).toBe('won');
  await expect(page.locator('#ui')).toContainText(/found|congrat/i);
});

test('pause freezes motion and reduced motion stops locomotion', async ({ page }) => {
  await open(page, '&seed=e2e-motion');
  const clocks = () => page.evaluate(() => ({ move: window.__waldo!.town.crowdUniforms.uMoveTime.value, pose: window.__waldo!.town.crowdUniforms.uPoseTime.value }));
  const a = await clocks();
  await page.waitForTimeout(500);
  const b = await clocks();
  expect(b.move).toBeGreaterThan(a.move);
  await page.evaluate(() => window.__waldo!.game.setPaused(true));
  await page.waitForTimeout(150);
  const c = await clocks();
  await page.waitForTimeout(500);
  const d = await clocks();
  expect(d.move).toBe(c.move);
  expect(d.pose).toBe(c.pose);
  /* searching still works while paused */
  const start = await view(page);
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(400);
  expect((await view(page)).z).not.toBe(start.z);
  await page.evaluate(() => {
    window.__waldo!.game.setPaused(false);
    window.__waldo!.game.setReducedMotion(true);
  });
  await page.waitForTimeout(150);
  const e = await clocks();
  await page.waitForTimeout(600);
  const f = await clocks();
  expect(f.move).toBe(e.move);
  expect(f.pose).toBeGreaterThan(e.pose);
  expect(f.pose - e.pose).toBeLessThan(0.4);
});

test('resizing keeps the same puzzle and a new puzzle reuses the town', async ({ page }) => {
  await open(page, '&seed=e2e-resize');
  const before = await page.evaluate(() => ({ hero: { ...window.__waldo!.town.hero.spot }, seed: window.__waldo!.game.getState().seed, people: window.__waldo!.town.build.people.count }));
  await page.setViewportSize({ width: 420, height: 860 });
  await page.waitForTimeout(600);
  const portrait = await page.evaluate(() => ({ hero: { ...window.__waldo!.town.hero.spot }, state: window.__waldo!.game.getState(), ppm: window.__waldo!.engine.rig.state.ppm }));
  expect(portrait.hero).toEqual(before.hero);
  expect(portrait.state.seed).toBe(before.seed);
  expect(portrait.state.status).toBe('playing');
  expect(portrait.ppm).toBeGreaterThanOrEqual(26);
  expect(portrait.ppm).toBeLessThan(34);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(400);
  const memory = () => page.evaluate(() => ({ ...window.__waldo!.engine.renderer.info.memory }));
  const m0 = await memory();
  const heroes: string[] = [];
  for (const seed of ['e2e-next-1', 'e2e-next-2', 'e2e-next-3']) {
    await page.evaluate((s) => window.__waldo!.game.newPuzzle(s), seed);
    await expect.poll(async () => (await state(page)).seed, { timeout: 15_000 }).toBe(seed);
    await expect.poll(async () => (await state(page)).status, { timeout: 15_000 }).toBe('playing');
    const h = await page.evaluate(() => window.__waldo!.town.hero.spot);
    heroes.push(`${h.x.toFixed(2)},${h.z.toFixed(2)}`);
    expect(await page.evaluate(() => window.__waldo!.game.heroOnScreen())).toBe(false);
  }
  expect(new Set(heroes).size).toBe(3);
  const m1 = await memory();
  expect(m1.geometries).toBeLessThanOrEqual(m0.geometries + 2);
  expect(m1.textures).toBeLessThanOrEqual(m0.textures + 1);
  expect(await page.evaluate(() => window.__waldo!.town.build.people.count)).toBe(before.people);
});

test('the top ten sits under the clock; after a win the card saves a time and shares on X', async ({ page }) => {
  const errors = await open(page, '&seed=e2e-board');
  /* during play: ten numbered places in the top right corner, below the clock */
  const side = page.locator('.wss-side-board');
  await expect(side).toBeVisible();
  await expect(side.locator('.wss-board-row')).toHaveCount(10);
  await expect(side.locator('.wss-board-rank')).toHaveText(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
  const clockBox = (await page.getByRole('timer').boundingBox())!;
  const sideBox = (await side.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(sideBox.y).toBeGreaterThanOrEqual(clockBox.y + clockBox.height);
  expect(viewport.width - (sideBox.x + sideBox.width)).toBeLessThan(24);
  expect(Math.abs(sideBox.x + sideBox.width - (clockBox.x + clockBox.width))).toBeLessThan(2);
  /* it does not get in the way: a drag that starts on the board still pans the town */
  const origin = await view(page);
  const grabX = sideBox.x + sideBox.width / 2;
  const grabY = sideBox.y + sideBox.height / 2;
  await page.mouse.move(grabX, grabY);
  await page.mouse.down();
  await page.mouse.move(grabX - 160, grabY + 60, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  const dragged = await view(page);
  expect(Math.hypot(dragged.x - origin.x, dragged.z - origin.z)).toBeGreaterThan(2);
  await page.evaluate(() => {
    const w = window.__waldo!;
    w.view({ x: w.town.hero.spot.x, z: w.town.hero.spot.z });
    w.game.recompose();
    w.town.cullNow(w.engine);
  });
  /* the server refuses times under two seconds as impossible, so play a little longer than that */
  await expect.poll(async () => (await state(page)).elapsedMs, { timeout: 15_000 }).toBeGreaterThan(2_600);
  const hero = await page.evaluate(() => window.__waldo!.heroScreen());
  await page.mouse.click(hero.x, hero.y);
  await expect.poll(async () => (await state(page)).status, { timeout: 15_000 }).toBe('won');

  const card = page.locator('.wss-win-card');
  await expect(card).toContainText('Congrats!');
  await expect(card.locator('.wss-win-time')).toHaveText(/^You found Waldo in \d+:\d\d\.\d$/);

  const share = card.getByRole('link', { name: 'Share on X' });
  const href = new URL((await share.getAttribute('href'))!);
  expect(`${href.origin}${href.pathname}`).toBe('https://x.com/intent/post');
  expect(href.searchParams.get('text')).toMatch(/^I found Waldo in \d+:\d\d\.\d in Waldo Stripes Soft/);
  /* played on this machine there is no address anyone else could open, so none is shared */
  expect(href.searchParams.has('url')).toBe(false);
  await expect(share).toHaveAttribute('target', '_blank');
  await expect(share).toHaveAttribute('rel', /noopener/);

  await expect(card).toContainText('Enter a username');
  /* typing a name must not steer the camera (W, A, S and D pan the town elsewhere) */
  const before = await view(page);
  const name = `Wasd ${Date.now() % 100_000}`;
  const input = card.getByLabel('Username');
  await input.click();
  await input.pressSequentially(`${name} <`);
  await page.waitForTimeout(300);
  const after = await view(page);
  expect(Math.hypot(after.x - before.x, after.z - before.z)).toBe(0);

  await card.getByRole('button', { name: 'Save my time' }).click();
  await expect(card.locator('.wss-board-note')).toHaveText(/^Saved\. You are number \d+\.$/);
  await expect(card.locator('.wss-board-form')).toBeHidden();
  /* the saved time is highlighted in the corner board, which still has its ten places */
  await expect(side.locator('.wss-board-own .wss-board-who')).toHaveText(name);
  await expect(side.locator('.wss-board-own .wss-board-time')).toHaveText(/^\d+:\d\d\.\d$/);
  await expect(side.locator('.wss-board-row')).toHaveCount(10);
  await expect(card.locator('.wss-board-row')).toHaveCount(0);

  /* the time really reached the server */
  const board = await (await page.request.get('/api/leaderboard')).json();
  expect(board.success).toBe(true);
  expect(board.data.entries.some((e: { name: string }) => e.name === name)).toBe(true);
  await page.screenshot({ path: 'test-results/win-card.png' });
  expect(errors).toEqual([]);
});

test('a how-to-play card holds the clock and the town until Start; the leaderboard can be closed', async ({ page }) => {
  const errors = await open(page, '&seed=e2e-intro', false);
  const card = page.locator('.wss-howto-card');
  const startButton = page.getByRole('button', { name: 'Start' });
  await expect(card).toBeVisible();
  await expect(card).toContainText('Find Waldo');
  await expect(card.getByRole('listitem')).toHaveCount(3);
  /* it explains the controls only: no description of him and no word on where he is */
  expect((await card.innerText()).toLowerCase()).not.toMatch(/stripe|hat|glasses|hint|near|district/);
  await expect(startButton).toBeFocused();

  /* while it is up the clock waits, the crowd keeps moving and the town cannot be moved */
  const before = await view(page);
  const moveBefore = await page.evaluate(() => window.__waldo!.town.crowdUniforms.uMoveTime.value);
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(400);
  await page.keyboard.up('ArrowRight');
  await page.mouse.move(300, 560);
  await page.mouse.down();
  await page.mouse.move(120, 470, { steps: 8 });
  await page.mouse.up();
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(600);
  const held = await view(page);
  expect(Math.hypot(held.x - before.x, held.z - before.z)).toBe(0);
  expect((await state(page)).elapsedMs).toBe(0);
  await expect(page.getByRole('timer')).toHaveText('00:00');
  expect(await page.evaluate(() => window.__waldo!.town.crowdUniforms.uMoveTime.value)).toBeGreaterThan(moveBefore);

  /* Start: the card goes, the clock runs and dragging works */
  await startButton.click();
  await expect(card).toBeHidden();
  await expect.poll(async () => (await state(page)).elapsedMs, { timeout: 5_000 }).toBeGreaterThan(300);
  await page.mouse.move(640, 500);
  await page.mouse.down();
  await page.mouse.move(440, 420, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  const dragged = await view(page);
  expect(Math.hypot(dragged.x - held.x, dragged.z - held.z)).toBeGreaterThan(2);

  /* the leaderboard closes to a small button, opens again, and the choice survives a reload */
  const side = page.locator('.wss-side-board');
  const reopen = page.getByRole('button', { name: 'Open the leaderboard' });
  await expect(side).toBeVisible();
  await expect(reopen).toBeHidden();
  await page.getByRole('button', { name: 'Close the leaderboard' }).click();
  await expect(side).toBeHidden();
  await expect(reopen).toBeVisible();
  await expect(reopen).toHaveAttribute('aria-expanded', 'false');
  await open(page, '&seed=e2e-intro');
  await expect(page.locator('.wss-side-board')).toBeHidden();
  await page.getByRole('button', { name: 'Open the leaderboard' }).click();
  await expect(page.locator('.wss-side-board')).toBeVisible();
  await expect(page.locator('.wss-side-board .wss-board-row')).toHaveCount(10);
  await open(page, '&seed=e2e-intro');
  await expect(page.locator('.wss-side-board')).toBeVisible();
  expect(errors).toEqual([]);
});
