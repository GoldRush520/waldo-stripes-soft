import { Game, randomSeed } from './game/game';
import { Engine } from './render/engine';
import { hudSafeInsets, mountHud } from './ui/index';
import { debugParams } from './dev/debugParams';
import { installDevTools } from './dev/devTools';
import { Town } from './world/town';

const engine = new Engine(document.getElementById('app') as HTMLElement);
const game = new Game(engine);
/* debugging switches only work on a developer's own machine; a public host ignores them all */
const params = debugParams(location);
/* every visit gets a fresh local seed; `?seed=` is a debugging override for reproducible scenes */
const seed = params.get('seed') ?? randomSeed();
let town: Town | null = null;

engine.addSystem({
  update(animDt, e) {
    if (town) town.update(animDt, e, game.reducedMotion);
    game.update(animDt);
  },
});
engine.dynamicShadows = () => (town ? town.crowd.currentTier >= 1 && town.crowd.castShadows : false);
mountHud(document.getElementById('ui') as HTMLElement, game);
/* debugging override for reproducible measurements: ?quality=low|medium|high pins the quality */
const pinned = params.get('quality');
if (pinned === 'low' || pinned === 'medium' || pinned === 'high') game.setQuality(pinned);
game.hudBlocks = () => hudSafeInsets().blocks;
window.addEventListener('resize', () => game.recompose());
engine.start();

/* boot timeline for developer evidence (startup measurement); not shown in the product UI */
const boot: { stage: string; progress: number; marks: Record<string, number> } = { stage: 'building', progress: 0, marks: { start: performance.now() } };
if (params.has('dev')) (window as unknown as { __boot: typeof boot }).__boot = boot;

/** Terminal failure state: stop the loading UI and offer a retry with a fresh seed. */
function fail(error: unknown): void {
  boot.stage = `failed: ${error instanceof Error ? `${error.message}\n${error.stack ?? ''}` : String(error)}`;
  const ui = document.getElementById('ui');
  if (ui) ui.hidden = true;
  const box = document.createElement('div');
  box.setAttribute('role', 'alert');
  box.style.cssText =
    'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);max-width:min(420px,86vw);padding:20px 22px;border-radius:16px;background:#F7F3EE;border:1px solid #D9B8A8;box-shadow:0 10px 30px rgba(91,64,56,.18);font:15px/1.45 system-ui,sans-serif;color:#5B4038;text-align:center';
  const text = document.createElement('p');
  text.style.margin = '0 0 14px';
  text.textContent = import.meta.env.MODE === 'taptap' ? '小镇加载失败，请重试。' : 'The festival town could not be set up this time.';
  box.append(text);
  if (import.meta.env.MODE !== 'taptap' || params.has('dev')) {
    const detail = document.createElement('p');
    detail.style.cssText = 'margin:0 0 14px;font-size:12px;opacity:.75';
    detail.textContent = error instanceof Error ? error.message : String(error);
    box.append(detail);
  }
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.textContent = import.meta.env.MODE === 'taptap' ? '重试' : 'Try a new scene';
  retry.style.cssText = 'font:inherit;padding:9px 16px;border-radius:999px;border:0;background:#F28B82;color:#3E2C2A;cursor:pointer';
  retry.addEventListener('click', () => {
    const url = new URL(location.href);
    url.searchParams.delete('seed');
    location.assign(url);
  });
  box.append(retry);
  document.body.appendChild(box);
  retry.focus();
}
game.onFailure = fail;

/*
 * Optional crowd path that resolves joint matrices once per person in a GPU pass (`?joints=1`).
 * Measured on the baseline machine it is no faster than posing per vertex (see PERFORMANCE.md),
 * so the simpler per-vertex path is the default.
 */
const jointTexture = params.get('joints') === '1' && engine.renderer.capabilities.isWebGL2 && engine.renderer.extensions.has('EXT_color_buffer_float');

Town.create(
  seed,
  (p) => {
    boot.progress = p * 0.95;
    game.setProgress(p * 0.95);
  },
  { jointTexture },
)
  .then(async (built) => {
    boot.stage = 'composing';
    boot.marks.built = performance.now();
    town = built;
    engine.scene.add(built.group);
    /* measurement-only switches (dev): isolate the cost of individual render components */
    if (params.get('crowdShadows') === '0') built.crowd.setCastShadows(false);
    if (params.get('noCrowd') === '1') built.crowd.group.visible = false;
    if (params.get('noStatics') === '1') built.build.statics.group.visible = false;
    if (params.get('noDynamics') === '1') built.build.dynamics.group.visible = false;
    if (params.get('noShadows') === '1') engine.sun.castShadow = false;
    await game.attach(built, seed);
    boot.stage = 'playing';
    boot.marks.playing = performance.now();
    if (params.has('dev')) installDevTools(engine, built, game);
  })
  .catch(fail);
