/**
 * Developer inspection hooks, only installed with `?dev` in the URL on a local host (see
 * debugParams.ts; a public host ignores the switch). Nothing here is part of the
 * normal product UI: counts, picking probes and the repeatable performance route.
 */
import { VIEW_ELEVATION, basePpm, clampView } from '../game/composition';
import type { Game } from '../game/game';
import type { Engine, FrameStats } from '../render/engine';
import { Vector3 } from 'three';
import type { ViewState } from '../render/cameraRig';
import type { Town } from '../world/town';

export function installDevTools(engine: Engine, town: Town, game: Game): void {
  engine.rig.interactive = new URLSearchParams(location.search).get('dev') === 'free';
  const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
  const dev = {
    engine,
    town,
    game,
    view(v: Partial<ViewState>): void {
      engine.rig.setView(v, true);
    },
    info: () => ({
      ...town.counts(),
      buildMs: Math.round(town.buildMs),
      tier: town.crowd.currentTier,
      draws: engine.drawCalls,
      tris: engine.triangles,
      ppm: +engine.rig.pixelsPerMetre.toFixed(2),
      dpr: engine.pixelRatio,
      canvas: [engine.renderer.domElement.width, engine.renderer.domElement.height],
      quality: engine.qualityName,
      statics: town.build.statics.stats(),
      crowd: town.crowd.stats(),
      gpu: { ...engine.renderer.info.memory, programs: engine.renderer.info.programs?.length ?? 0 },
      warnings: town.build.warnings.slice(0, 20),
    }),
    /** Enable free camera navigation for inspection (never available in the product). */
    freeCamera(on = true): void {
      engine.rig.interactive = on;
    },
    puzzle: () => game.puzzleDebug(),
    visibility: () => game.heroVisibility(),
    heroScreen: () => game.heroScreen(),
    /**
     * Screen-space occupancy aid: people standing in each cell of an 8 x 5 grid over the canvas
     * (static people only). Low cells are where density should be raised.
     */
    density(cols = 8, rows = 5): number[][] {
      const { width, height } = engine.rig.size;
      const grid = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
      const v = new Vector3();
      for (const p of town.build.people.all()) {
        if (p.motion >= 0 || p.scale < 0.01) continue;
        v.set(p.x, p.y + 0.9, p.z).project(engine.rig.camera);
        const x = (v.x * 0.5 + 0.5) * width;
        const y = (-v.y * 0.5 + 0.5) * height;
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        const row = grid[Math.floor((y / height) * rows)];
        if (row) row[Math.floor((x / width) * cols)] = (row[Math.floor((x / width) * cols)] ?? 0) + 1;
      }
      return grid;
    },
    /**
     * Repeatable benchmark: `seconds` of panning across the districts at the game scale with full
     * animation, a pick every few seconds and a pause / resume — what a player produces.
     * `interact = false` holds the opening view still (isolates steady-state rendering).
     */
    async bench(
      seconds = 60,
      interact = true,
    ): Promise<
      FrameStats & {
        dpr: number;
        canvas: number[];
        people: number;
        submittedPeople: number;
        legsCompleted: number;
        legsTotal: number;
        metresPanned: number;
        events: Array<readonly [number, string]>;
        slow: Array<readonly [number, number, number]>;
      }
    > {
      await wait(3000);
      const { width, height } = engine.rig.size;
      const events: Array<readonly [number, string]> = [];
      const mark = (name: string): void => {
        events.push([Math.round(performance.now()), name]);
      };
      /* district anchors, each clamped to what the camera can actually reach at this viewport */
      const az = engine.rig.state.azimuth;
      const ppm = basePpm(width, height);
      const stops = (
        [
          [-70, 8], [-78, 30], [-119, -16], [-94, -78], [-58, -32], [-6, 2], [-6, -78], [34, -18], [92, -70], [96, -9], [80, 32], [78, 52], [20, 30], [-40, 20],
        ] as ReadonlyArray<readonly [number, number]>
      ).map(([x, z]) => {
        const v = clampView({ x, z, azimuth: az, elevation: VIEW_ELEVATION, ppm }, width, height);
        return [v.x, v.z] as const;
      });
      const PAN_SPEED = 16;
      let leg = 0;
      let metres = 0;
      let last = performance.now();
      let active = interact;
      const drive = (now: number): void => {
        if (!active) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!engine.paused) {
          const target = stops[leg % stops.length] as readonly [number, number];
          const s = engine.rig.state;
          const dx = target[0] - s.x;
          const dz = target[1] - s.z;
          const dist = Math.hypot(dx, dz);
          const step = PAN_SPEED * dt;
          if (dist <= Math.max(0.5, step)) {
            leg++;
            mark(`leg ${leg}`);
          } else {
            engine.rig.setView({ x: s.x + (dx / dist) * step, z: s.z + (dz / dist) * step }, true);
            metres += step;
          }
        }
        requestAnimationFrame(drive);
      };
      engine.beginSampling();
      if (interact) requestAnimationFrame(drive);
      const t0 = performance.now();
      let step = 0;
      while (performance.now() - t0 < seconds * 1000) {
        await wait(1000);
        step++;
        if (!interact) continue;
        if (step % 4 === 0) {
          /* the real click path: asynchronous id readback, exactly what a player's tap triggers */
          mark('click');
          engine.rig.onTap?.(width * (0.2 + 0.6 * ((step * 0.37) % 1)), height * (0.25 + 0.6 * ((step * 0.61) % 1)));
        }
        if (step === Math.round(seconds * 0.6)) {
          mark('pause');
          game.setPaused(true);
        }
        if (step === Math.round(seconds * 0.6) + 2) {
          mark('resume');
          game.setPaused(false);
        }
      }
      active = false;
      /* let any outstanding asynchronous pick resolve inside the sampled window */
      await wait(400);
      const stats = engine.endSampling();
      const c = engine.renderer.domElement;
      return {
        ...stats,
        dpr: engine.pixelRatio,
        canvas: [c.width, c.height],
        people: town.build.people.count,
        submittedPeople: town.crowd.stats().visiblePeople,
        legsCompleted: leg,
        legsTotal: stops.length,
        metresPanned: Math.round(metres),
        events,
        slow: engine.slowFrameLog(25),
      };
    },
  };
  (window as unknown as { __waldo: typeof dev }).__waldo = dev;
}
