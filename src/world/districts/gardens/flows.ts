/** Gardens crowd flows: walkers on the walks, look-alike decoys, hero spots and density fill. */
import type { Rng } from '../../../core/rng';
import type { Vec3 } from '../../../crowd/stores';
import type { Hold, Kit } from '../../kit';
import { CLOTHS } from '../shared';
import { sealTerrace } from './terrace';
import { MAZE, MEADOW, type P2, PROMENADE, TERRACE, TOPIARY, rect } from './plan';

const strollHold = (rng: Rng): readonly Hold[] | undefined =>
  rng.chance(0.25) ? [{ key: 'hold.bag', tint: rng.pick(CLOTHS) }] : rng.chance(0.12) ? [{ key: 'hold.umbrella', tint: rng.pick(CLOTHS) }] : rng.chance(0.08) ? [{ key: 'hold.balloon', tint: rng.pick(CLOTHS) }] : undefined;

const ROUTES: ReadonlyArray<{ path: readonly Vec3[]; n: number; lanes: readonly number[] }> = [
  { path: [[-44, 0, PROMENADE.z], [-24, 0, PROMENADE.z + 0.1], [-2.5, 0, PROMENADE.z]], n: 26, lanes: [0.25, 0.55] },
  { path: [[2.5, 0, PROMENADE.z], [20, 0, PROMENADE.z - 0.1], [39, 0, PROMENADE.z]], n: 24, lanes: [0.25, 0.55] },
  { path: [[0, 0, 1], [0, 0, -7.3], [0, TERRACE.y, -12.1], [0, TERRACE.y, -15.2]], n: 10, lanes: [0.45, 1.1] },
  { path: [[0, 0, 29], [0.2, 0, 21], [0, 0, 15.6]], n: 8, lanes: [0.35, 0.85] },
  { path: [[6.5, 0, 12.3], [18, 0, 16.6], [29.5, 0, 20.6]], n: 8, lanes: [0.3, 0.8] },
  { path: [[-6.5, 0, 12.3], [-13, 0, 15], [-19.2, 0, 17.4]], n: 6, lanes: [0.3, 0.8] },
  { path: [[-23.5, 0, -26.5], [-23.5, 0, -16], [-23.5, 0, -8]], n: 8, lanes: [0.3, 0.75] },
  { path: [[-46, 0, -29], [-12, 0, -29.1], [8, 0, -29]], n: 14, lanes: [0.3, 0.9] },
  { path: [[8, 0, -29], [26, 0, -29.1], [41.6, 0, -29]], n: 12, lanes: [0.3, 0.9] },
  { path: [[41.6, 0, -27], [41.7, 0, 0], [41.6, 0, 30.6]], n: 16, lanes: [0.3, 0.9] },
  { path: [[-32.5, 0, 30.8], [0, 0, 30.9], [30, 0, 30.8]], n: 16, lanes: [0.3, 0.9] },
  { path: [[-46.6, 0, -27], [-46.7, 0, -8], [-46.6, 0, 8.6]], n: 6, lanes: [0.3, 0.8] },
];

function walkers(k: Kit): void {
  for (const r of ROUTES) k.walkers(r.path, r.n, { lanes: r.lanes, speed: [0.6, 1.2], hold: strollHold });
}

function lookalikes(k: Kit): void {
  k.person({ x: -12, z: -2.6, heading: 0.4, clip: 'stand', look: { pattern: 1, shirt: 'coral', shirt2: 'ivory', hat: 'hat.cap', hatTint: 'blue', glasses: null, pants: 'clayDeep', longLegs: true } });
  k.person({ x: 26.2, z: 14.6, heading: -0.5, clip: 'talk', look: { pattern: 1, shirt: 'blue', shirt2: 'ivory', hat: 'hat.bobble', hatTint: 'coral', glasses: 'face.glasses.round', pants: 'cocoa', longLegs: true } });
  k.person({ x: -38.6, z: 6.4, heading: 0.9, clip: 'stand.stick', age: 'elder', hold: ['hold.stick'], look: { pattern: 0, shirt: 'sage', hat: 'hat.beret', hatTint: 'coral', pants: 'blue', longLegs: true } });
  k.person({ x: -5.2, z: -14.6, y: TERRACE.y, heading: 0.2, clip: 'wave', age: 'child', look: { pattern: 0, shirt: 'coral', hat: 'hat.bobble', hatTint: 'coral', glasses: 'face.glasses.round', pants: 'sageDeep' } });
}

/** Open, busy, unroofed standing spots spread across the whole district. */
const SPOTS: ReadonlyArray<readonly [number, number, number, number]> = [
  [-8.6, -1.6, 0, 0.4],
  [6.4, -2.4, 0, -0.3],
  [-14, 13.4, 0, 0.6],
  [8.6, 13.8, 0, -0.5],
  [35.4, 4.4, 0, 0.2],
  [-40.4, -0.6, 0, 0.8],
  [-28.2, -12, 0, 0],
  [-5.6, 22, 0, 0.3],
  [30.4, 27.6, 0, -0.4],
  [36.2, -3.6, 0, 0],
  [-7.8, -13.4, TERRACE.y, 0.2],
  [-28.6, 16.8, 0, 0.5],
];

const NUDGE: readonly P2[] = [[0, 0], [0.8, 0], [-0.8, 0], [0, 0.8], [0, -0.8], [1.4, 0.7], [-1.4, 0.7], [1.4, -0.7], [-1.4, -0.7], [0, 1.6], [0, -1.6], [2.2, 0], [-2.2, 0]];

/** Run after everyone is placed: each spot slides to the nearest point with clear ground around it. */
function spots(k: Kit): void {
  for (const [x, z, y, h] of SPOTS) {
    const free = NUDGE.find(([dx, dz]) => k.isFree(x + dx, z + dz, 0.45));
    const [dx, dz] = free ?? [0, 0];
    k.targetSpot(x + dx, z + dz, y, h);
  }
}

const CHAT = ['talk', 'talk.laugh', 'stand', 'point', 'idle.shift', 'talk.nod', 'photo.camera', 'lookout'] as const;
const LAWN = ['talk', 'sit.ground', 'stand', 'point', 'talk.laugh', 'sit.ground', 'photo.selfie', 'eat.icecream'] as const;

const FILLS: ReadonlyArray<{ poly: readonly P2[]; n: number; clips: readonly string[]; y?: number }> = [
  { poly: rect(-31, 12.5, -10, 29), n: 69, clips: LAWN },
  { poly: rect(9, 14, 40, 29), n: 78, clips: LAWN },
  { poly: rect(-9, 15, 9, 29), n: 45, clips: LAWN },
  { poly: rect(-11, -2.5, 11, 15), n: 39, clips: CHAT },
  { poly: rect(-31, -3.5, -11, 7.5), n: 42, clips: LAWN },
  { poly: rect(TOPIARY.x0, TOPIARY.z0, TOPIARY.x1, TOPIARY.z1), n: 39, clips: CHAT },
  { poly: rect(MEADOW.x0 + 0.5, MEADOW.z0 + 0.5, MEADOW.x1 - 0.5, MEADOW.z1 - 0.5), n: 27, clips: LAWN },
  { poly: rect(-45, -27, -24.6, -12.2), n: 18, clips: ['garden.dig', 'garden.plant', 'talk', 'point.down', 'garden.water'] },
  { poly: rect(MAZE.x0 + 0.4, MAZE.z0 + 0.4, MAZE.x1 - 0.4, MAZE.z1 - 0.4), n: 24, clips: ['lookout', 'point', 'read.maplost', 'talk.shrug', 'talk.laugh'] },
  { poly: rect(22.5, -9, 40.5, -1.8), n: 21, clips: CHAT },
  { poly: rect(-45, -4.2, 40, -3.6), n: 9, clips: CHAT },
  { poly: rect(TERRACE.x0 + 0.8, -16.4, TERRACE.x1 - 0.8, TERRACE.z1 - 0.6), n: 33, clips: CHAT, y: TERRACE.y },
  { poly: rect(-21.4, -27.4, -15, -16.8), n: 12, clips: CHAT, y: TERRACE.y },
  { poly: rect(15, -27.4, 21.4, -16.8), n: 9, clips: CHAT, y: TERRACE.y },
  { poly: rect(-13.4, -24.8, -5.2, -18.4), n: 12, clips: ['point.sky', 'lookout', 'photo.camera', 'talk'], y: TERRACE.y },
  { poly: rect(5.2, -24.8, 9.2, -18.4), n: 6, clips: ['point.sky', 'lookout', 'photo.camera', 'talk'], y: TERRACE.y },
];

/** The shared street margin round the edge: pairs and singles only, kept a metre off the edge. */
const MARGINS: ReadonlyArray<{ poly: readonly P2[]; n: number }> = [
  { poly: rect(-46.8, -29, 41.8, -28.5), n: 30 },
  { poly: rect(41.2, -27.6, 42, 30.8), n: 24 },
  { poly: rect(-32.6, 30.2, 41.8, 31), n: 28 },
  { poly: rect(-47, -27.6, -46.2, 8.8), n: 14 },
  { poly: rect(-45.6, 8.4, -33.6, 9), n: 6 },
  { poly: rect(-33, 9.6, -32.2, 30), n: 8 },
];

function fills(k: Kit): void {
  for (const f of FILLS) k.fill(f.poly, f.n, { clips: f.clips, groupSize: [1, 4], y: f.y, childShare: 0.18 });
  for (const m of MARGINS) k.fill(m.poly, m.n, { clips: CHAT, groupSize: [1, 2], childShare: 0.1 });
}

export function flows(k: Kit): void {
  lookalikes(k);
  walkers(k);
  fills(k);
  spots(k);
  sealTerrace(k);
}
