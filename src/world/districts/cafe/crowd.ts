/**
 * Density pass and puzzle fairness: partial hero look-alikes, contextual filler groups over every
 * open patch, and hero target spots on the lanes (checked free, so any seed yields enough).
 */
import type { Kit } from '../../kit';
import { clip } from './catalog';
import { FILL_CLIPS } from './population';
import { type P2, edge } from './plan';

const at = (u: number, v: number): P2 => {
  const p = edge(u, v);
  return [p.x, p.z];
};

const ZONES: ReadonlyArray<{ poly: readonly P2[]; count: number; clips: readonly string[] }> = [
  /* bakery piazza round the fountain and terraces */
  { poly: [[-13.6, -11.2], [6.8, -14.6], [7.2, 6.4], [-13.2, 8.6]], count: 120, clips: FILL_CLIPS.piazza },
  /* florist & café garden (south-west) */
  { poly: [[-36, 13.4], [-16.6, 12.6], [-16.4, 23.4], [-35.6, 25.4]], count: 80, clips: FILL_CLIPS.garden },
  /* in front of the corner café and its flanks */
  { poly: [[-16, 12.2], [8.4, 9.8], [8.4, 20.2], [-16, 23.2]], count: 70, clips: FILL_CLIPS.garden },
  /* chess & proposal terrace (south-east) */
  { poly: [[8.6, 8.6], [40.6, 7.2], [40.4, 13.2], [8.6, 18.6]], count: 100, clips: FILL_CLIPS.piazza },
  /* book square */
  { poly: [[30.8, -18.8], [44.6, -21.6], [43.4, 5.6], [30.8, 5.0]], count: 90, clips: FILL_CLIPS.lane },
  /* west end of the lanes */
  { poly: [[-41.4, -6.4], [-36.6, -5.2], [-36.6, 12.6], [-39.2, 12.8]], count: 26, clips: FILL_CLIPS.lane },
  /* lane 1 and the north-east lane: doorstep chats */
  { poly: [[-39.6, -8.2], [-14, -11.6], [-14, -4.4], [-36.4, -4.2]], count: 36, clips: FILL_CLIPS.lane },
  { poly: [[7.6, -16.4], [33, -20], [32, -11.4], [8.6, -11.2]], count: 40, clips: FILL_CLIPS.lane },
  /* east margin beside the bookshop and the south-east corner */
  { poly: [at(46.2, -22.6), at(49.8, -22.6), at(48.4, -13.4), at(46.2, -13.4)], count: 12, clips: FILL_CLIPS.lane },
  { poly: [[40.8, 6], [44.6, 5.6], [43.8, 15.4], [40.6, 15.8]], count: 14, clips: FILL_CLIPS.piazza },
];

export function fillCrowd(k: Kit): void {
  for (const z of ZONES) k.fill(z.poly, z.count, { clips: z.clips, groupSize: [1, 4], childShare: 0.14 });
}

/** Look-alikes: each shares at most three of the hero's five features. */
export function decoys(k: Kit): void {
  const spots: ReadonlyArray<readonly [number, number]> = [
    [-24.6, 13.4],
    [18.8, 8.6],
    [36.2, -10.4],
    [-30.5, -6.0],
    [1.8, -10.2],
  ];
  const free = spots.map(([x, z]) => near(k, x, z));
  const [a, b, c, d, e] = free;
  if (a) k.person({ ...a, heading: 0.3, clip: 'stand', look: { pattern: 1, shirt: 'coral', shirt2: 'ivory', hat: 'hat.beret', hatTint: 'coral', glasses: null, pants: 'clayDeep', longLegs: true } });
  if (b) k.person({ ...b, heading: -0.4, clip: 'talk', look: { pattern: 1, shirt: 'blue', shirt2: 'ivory', hat: 'hat.bobble', hatTint: 'coral', glasses: 'face.glasses.round', pants: 'blueDeep', longLegs: true } });
  if (c) k.person({ ...c, heading: 0.1, clip: 'stand.stick', age: 'elder', hold: ['hold.stick'], look: { pattern: 0, shirt: 'coral', hat: null, glasses: 'face.glasses.round', pants: 'blue', longLegs: true } });
  if (d) k.person({ ...d, heading: 0.6, age: 'child', clip: clip('eat.icecream', 'stand'), look: { pattern: 1, shirt: 'coral', shirt2: 'ivory', hat: 'hat.bobble', hatTint: 'blue', glasses: null, pants: 'blue', longLegs: true } });
  if (e) k.person({ ...e, heading: -0.2, clip: 'lookout', hold: ['hold.stick'], look: { pattern: 6, shirt: 'coral', shirt2: 'ivory', hat: 'hat.bobble', hatTint: 'coral', glasses: null, pants: 'sageDeep', longLegs: true } });
}

/** A free point within ~1.5 m of (x, z), or null. */
function near(k: Kit, x: number, z: number): { x: number; z: number } | null {
  for (let i = 0; i < 14; i++) {
    const a = i * 2.4;
    const r = i === 0 ? 0 : 0.35 + i * 0.09;
    const px = x + Math.sin(a) * r;
    const pz = z + Math.cos(a) * r;
    if (k.isFree(px, pz, 0.42)) return { x: px, z: pz };
  }
  return null;
}

const TARGETS: readonly P2[] = [
  [-33, -6.4],
  [-25, -6.8],
  [-18, -8.0],
  [11, -13.0],
  [19, -13.4],
  [28, -14.2],
  [-32, 12.0],
  [-20, 11.4],
  [-8, 9.6],
  [9, 8.0],
  [23, 6.9],
  [35, 6.2],
  [32.4, -7.6],
  [33.2, 0.4],
  [-39.4, 2.0],
  [-38.4, 8.0],
  [38.8, -9.6],
  [-12.2, 13.6],
  [6.2, 12.8],
  [-1.2, 1.2],
];

export function targetSpots(k: Kit): number {
  let n = 0;
  for (const [x, z] of TARGETS) {
    const p = near(k, x, z);
    if (!p || !k.isFree(p.x, p.z, 0.45)) continue;
    k.targetSpot(p.x, p.z, 0, k.rng.range(-0.6, 0.6));
    n++;
  }
  return n;
}
