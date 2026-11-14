/**
 * The promenade: striped railing along the sea wall with stairs down to the sand, lamps, benches
 * facing the sea, kiosks and shelters on the landward side, the pier entrance arch and the
 * promenade crowd (strollers, bench sitters, railing watchers, kiosk queues).
 */
import type { Geo } from '../../../core/geo';
import { festivalArch, stairs } from '../../../props/civic';
import { promenadeRailing } from '../../../props/leisure';
import type { Kit } from '../../kit';
import { CLOTHS } from '../shared';
import { CLIP } from './clips';
import { seatProp } from './place';
import { PIER, SAND_Y, alongShore, promBand, shoreRot, shoreZ } from './frame';

/** stairs down to the sand (local x of their centre) */
export const STAIRS_X: readonly number[] = [-56, -44, -20, 6, 36.5];
const STAIR_W = 2.6;
const RAIL_START = -64;
const RAIL_END = 54;

let stairCache: ReturnType<typeof stairs> | null = null;
function stairGeo(): ReturnType<typeof stairs> {
  stairCache ??= stairs(STAIR_W, -SAND_Y, 4, { color: 'clayLight', cheek: 'ivoryShade' });
  return stairCache;
}

const railCache = new Map<number, Geo>();
function railGeo(len: number): Geo {
  const key = Math.round(len * 4) / 4;
  let g = railCache.get(key);
  if (!g) {
    g = promenadeRailing(key);
    railCache.set(key, g);
  }
  return g;
}

/** gaps in the railing: stairs and the pier mouth */
function gaps(): ReadonlyArray<readonly [number, number]> {
  const s = STAIRS_X.map((x) => [x - STAIR_W / 2 - 0.3, x + STAIR_W / 2 + 0.3] as const);
  return [...s, [PIER.x - PIER.width / 2 - 1.4, PIER.x + PIER.width / 2 + 1.4] as const].sort((a, b) => a[0] - b[0]);
}

function railings(k: Kit): void {
  let x = RAIL_START;
  const runs: Array<readonly [number, number]> = [];
  for (const [a, b] of gaps()) {
    if (a > x) runs.push([x, a]);
    x = Math.max(x, b);
  }
  if (x < RAIL_END) runs.push([x, RAIL_END]);
  for (const [a, b] of runs) {
    const pts = alongShore(a, b, 6, -0.12);
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i] as readonly [number, number, number];
      const q = pts[i + 1] as readonly [number, number, number];
      const len = Math.hypot(q[0] - p[0], q[2] - p[2]);
      const rot = Math.atan2(-(q[2] - p[2]), q[0] - p[0]);
      k.add(railGeo(len), { x: (p[0] + q[0]) / 2, z: (p[2] + q[2]) / 2, rot });
      k.block((p[0] + q[0]) / 2, (p[2] + q[2]) / 2, len, 0.16, rot);
    }
  }
}

function stairsDown(k: Kit): void {
  const s = stairGeo();
  for (const x of STAIRS_X) {
    const rot = shoreRot(x);
    const at = k.rel({ x, z: shoreZ(x), rot }, 0, s.length / 2 + 0.02);
    k.add(s.geo, { x: at.x, z: at.z, y: SAND_Y, rot });
    k.surface('stairs', [
      [x - STAIR_W / 2, shoreZ(x) - 0.1],
      [x + STAIR_W / 2, shoreZ(x) - 0.1],
      [x + STAIR_W / 2, shoreZ(x) + s.length + 0.1],
      [x - STAIR_W / 2, shoreZ(x) + s.length + 0.1],
    ], SAND_Y / 2);
  }
}

function lampsAndBenches(k: Kit): void {
  for (let x = RAIL_START + 4; x < RAIL_END; x += 11) {
    if (STAIRS_X.some((s) => Math.abs(s - x) < 3) || Math.abs(x - PIER.x) < 5) continue;
    k.prop('lamp.classic', { x, z: shoreZ(x) - 0.45 });
  }
  const benches = [-52, -41, -13, -1, 11, 25, 32, 43, 52];
  benches.forEach((x, i) => {
    const rot = shoreRot(x);
    const at = { x, z: shoreZ(x) - 0.85, rot };
    seatProp(k, i % 3 === 0 ? 'bench.park.long' : 'bench.park', at, {
      clips: [CLIP.sitTalk, CLIP.sit, CLIP.sitEat, CLIP.sitRead, CLIP.sitAsleep],
      fill: 0.6,
      age: k.rng.chance(0.3) ? 'elder' : 'adult',
    });
  });
  for (const x of [-26, 23, 41]) k.prop('bin.litter', { x, z: shoreZ(x) - 0.5 });
}

/** landward structures sit where the promenade is wide enough to keep a clear walking band */
function kioskWithQueue(k: Kit, key: string, x: number, depth: number, vendor: boolean): void {
  const [north] = promBand(x);
  const z = north + depth / 2;
  k.prop(key, { x, z, tint: key === 'kiosk.ticket' ? 'blue' : undefined });
  if (vendor) k.person({ x: x + 1.65, z: z + 0.1, heading: 0.4, clip: CLIP.hawk, hold: ['upper.apron'], look: { hat: 'hat.boater', hatTint: 'coral' } });
  k.queue([x + 3.6, z + depth / 2 + 0.45], [x - 0.2, z + depth / 2 + 0.45], 4, { clips: [CLIP.stand, CLIP.idlePhone, CLIP.talk, CLIP.idleWatch, CLIP.idleTap] });
}

function landside(k: Kit): void {
  kioskWithQueue(k, 'kiosk.news', -18, 2.4, true);
  kioskWithQueue(k, 'kiosk.ticket', 9, 2.4, true);
  const [n4] = promBand(-4);
  seatProp(k, 'beach.shelter', { x: -4, z: n4 + 1.2 }, { clips: [CLIP.sitTalk, CLIP.sit, CLIP.sitRead, CLIP.sitEat], fill: 0.75, age: 'elder' });
  for (const x of [-46, -34, 26, 36, 47]) {
    const [north] = promBand(x);
    k.prop('flag.pole.pennant', { x, z: north + 0.3, tint: k.rng.pick(CLOTHS) });
  }
  k.prop('beach.telescope', { x: -33, z: shoreZ(-33) - 0.5 });
  k.prop('beach.telescope', { x: 46, z: shoreZ(46) - 0.5 });
}

function pierMouth(k: Kit): void {
  const arch = festivalArch(PIER.width + 1.6, 4.6);
  const z = shoreZ(PIER.x) - 0.7;
  k.add(arch, { x: PIER.x, z });
  for (const s of [-1, 1]) k.block(PIER.x + s * (PIER.width / 2 + 0.8), z, 1.0, 1.0);
}

/** people leaning on the railing looking out to sea, and strollers on the promenade */
function crowd(k: Kit): void {
  const watchers = [-61, -53, -47, -35, -31, -24, -17, -9, 1, 13, 21, 24, 30, 35, 48, 52];
  for (const x of watchers) {
    const n = k.rng.int(1, 2);
    for (let i = 0; i < n; i++) {
      const xx = x + i * 0.65;
      const z = shoreZ(xx) - 0.55;
      if (!k.isFree(xx, z, 0.3)) continue;
      k.person({ x: xx, z, heading: shoreRot(xx) + k.rng.range(-0.4, 0.4), clip: k.rng.pick([CLIP.lookout, CLIP.point, CLIP.idleBehind, CLIP.photo, CLIP.talk]), age: k.rng.chance(0.2) ? 'child' : 'adult' });
    }
  }
  const bags = (rng: Kit['rng']) => (rng.chance(0.25) ? [{ key: 'hold.bag', tint: rng.pick(CLOTHS) }] : rng.chance(0.15) ? [{ key: 'hold.umbrella', tint: rng.pick(CLOTHS) }] : undefined);
  /* the walking band runs between the bench line and the landward kiosks */
  const lane = (x: number): readonly [number, number, number] => [x, 0, Math.max(promBand(x)[0] + 0.9, shoreZ(x) - 2.3)];
  k.walkers([-50, -42, -34, -26, -18, -10, -2].map(lane), 44, { lanes: [0.35, 0.85], speed: [0.7, 1.2], hold: bags });
  k.walkers([-4, 4, 12, 22, 32, 42, 53].map(lane), 38, { lanes: [0.35, 0.85], speed: [0.7, 1.2], hold: bags });
}

export function buildPromenade(k: Kit): void {
  railings(k);
  stairsDown(k);
  pierMouth(k);
  landside(k);
  lampsAndBenches(k);
  crowd(k);
}
