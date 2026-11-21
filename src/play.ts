import { Game, randomSeed } from './game/game';
import type { Campaign } from './game/campaign';
import type { CampaignNavigation } from './ui/leaderboard/taptapPanel';
import { Engine } from './render/engine';
import { hudSafeInsets, mountHud } from './ui/index';
import { debugParams } from './dev/debugParams';
import { installDevTools } from './dev/devTools';
import { Town } from './world/town';

export async function startGame(campaign: Campaign | undefined, navigation: CampaignNavigation | undefined, onFailure: (error: unknown) => void): Promise<() => void> {
  const engine = new Engine(document.getElementById('app') as HTMLElement);
  const game = new Game(engine, campaign);
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
  const hud = mountHud(document.getElementById('ui') as HTMLElement, game, navigation);
  /* debugging override for reproducible measurements: ?quality=low|medium|high pins the quality */
  const pinned = params.get('quality');
  if (pinned === 'low' || pinned === 'medium' || pinned === 'high') game.setQuality(pinned);
  game.hudBlocks = () => hudSafeInsets().blocks;
  const resize = () => game.recompose();
  window.addEventListener('resize', resize);
  engine.start();

  /* boot timeline for developer evidence (startup measurement); not shown in the product UI */
  const boot: { stage: string; progress: number; marks: Record<string, number> } = { stage: 'building', progress: 0, marks: { start: performance.now() } };
  if (params.has('dev')) (window as unknown as { __boot: typeof boot }).__boot = boot;

  game.onFailure = onFailure;
  function dispose(): void {
    window.removeEventListener('resize', resize);
    hud.dispose();
    town?.dispose();
    engine.renderer.forceContextLoss();
    engine.dispose();
  }

  /*
   * Optional crowd path that resolves joint matrices once per person in a GPU pass (`?joints=1`).
   * Measured on the baseline machine it is no faster than posing per vertex (see PERFORMANCE.md),
   * so the simpler per-vertex path is the default.
   */
  const jointTexture = params.get('joints') === '1' && engine.renderer.capabilities.isWebGL2 && engine.renderer.extensions.has('EXT_color_buffer_float');

  await Town.create(
    seed,
    (p) => {
      boot.progress = p * 0.95;
      game.setProgress(p * 0.95);
    },
    { jointTexture, ...(campaign?.district ? { only: [campaign.district.id] } : {}) },
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
    .catch(error => { dispose(); throw error; });
  return dispose;
}
