/**
 * Ambient crowd: midway walkers, partial hero look-alikes, hero target spots and a dense seeded fill
 * of small sociable groups over all remaining open ground (keeping the target spots clear).
 */
import type { Rng } from '../../../core/rng';
import { Pattern } from '../../../crowd/skeleton';
import type { Hold, Kit } from '../../kit';
import { CLOTHS } from '../shared';
import { AVENUE, GROUND } from './plan';

const TREATS = ['hold.cottoncandy', 'hold.icecream', 'hold.toffeeapple', 'hold.pinwheel', 'hold.teddy', 'hold.lollipop', 'hold.camera'] as const;

const treats = (rng: Rng): readonly Hold[] | undefined => {
  if (rng.chance(0.16)) return [{ key: 'hold.balloon', tint: rng.pick(CLOTHS) }];
  if (rng.chance(0.3)) return [rng.pick(TREATS)];
  return rng.chance(0.2) ? [{ key: 'hold.bag', tint: rng.pick(CLOTHS) }] : undefined;
};

export function walkers(k: Kit): void {
  k.walkers([[AVENUE.x0 + 1, 0, AVENUE.mid - 0.4], [-10, 0, AVENUE.mid - 0.1], [12, 0, AVENUE.mid - 0.5], [AVENUE.x1 - 1, 0, AVENUE.mid - 0.3]], 70, { lanes: [0.5, 1.4], speed: [0.6, 1.2], hold: treats, childShare: 0.2 });
  k.walkers([[-12, 0, -6.6], [0, 0, -6.2], [9, 0, -7.4], [24, 0, -7.6], [36, 0, -7.0]], 34, { lanes: [0.4, 1.0], hold: treats, childShare: 0.2 });
  k.walkers([[-4, 0, 8.6], [-2.2, 0, 12], [0, 0, 17], [-5, 0, 25.5]], 16, { lanes: [0.45], hold: treats });
  k.walkers([[36.2, 0, -26], [36.6, 0, -8], [36.4, 0, 24]], 18, { lanes: [0.35, 0.95], hold: treats });
  k.walkers([[-36.5, 0, -26], [-36.6, 0, 26]], 14, { lanes: [0.4], hold: treats });
  k.walkers([[-20, 0, 25.8], [8, 0, 26.2], [32, 0, 25.6]], 20, { lanes: [0.4, 1.0], hold: treats });
}

/** Partial look-alikes: none carries more than three of the hero's five features. */
export function lookAlikes(k: Kit): void {
  k.person({ x: -18.4, z: 1.6, heading: 0.4, clip: 'eat.icecream', hold: ['hold.icecream'], look: { pattern: Pattern.HStripe, shirt: 'coral', shirt2: 'ivory', pants: 'blue', longLegs: true, hat: 'hat.cap', hatTint: 'blue', glasses: null } });
  k.person({ x: 22.5, z: 1.4, heading: -0.5, clip: 'talk', look: { pattern: Pattern.Solid, shirt: 'sage', hat: 'hat.bobble', hatTint: 'coral', glasses: 'face.glasses.round', pants: 'blue', longLegs: true } });
  k.person({ x: 6.2, z: 23.6, heading: 0.2, clip: 'stand.stick', hold: ['hold.stick'], look: { pattern: Pattern.HStripe, shirt: 'blue', shirt2: 'ivory', hat: 'hat.bobble', hatTint: 'coral', glasses: null, pants: 'cocoa', longLegs: true } });
  k.person({ x: -33.2, z: 22.8, heading: 0.6, clip: 'stand.stick', age: 'elder', hold: ['hold.stick'], look: { pattern: Pattern.HStripe, shirt: 'coral', shirt2: 'ivory', glasses: 'face.glasses.round', hat: 'hat.beret', hatTint: 'blue', pants: 'clayDeep', longLegs: true } });
  k.person({ x: 29.6, z: -12.6, heading: 0.9, clip: 'point', age: 'child', look: { pattern: Pattern.WideStripe, shirt: 'coral', shirt2: 'ivory', hat: 'hat.bobble', hatTint: 'coral', glasses: null, pants: 'blueDeep', longLegs: true } });
}

/** Candidate hero spots spread over the whole district, in open view (never under canopies). */
const SPOT_CANDIDATES: ReadonlyArray<readonly [number, number]> = [
  [-30.5, 1.2], [-20.5, 2.6], [-8.5, 5.4], [2.8, 2.4], [12.4, 6.6], [24.6, 3.0], [32.5, 6.0],
  [-31.5, -9.6], [-12.2, -10.8], [1.2, -9.6], [19.8, -9.4], [35.2, -14.0], [-34.2, 7.6], [-22.4, 13.4],
  [-3.6, 16.8], [10.6, 12.0], [33.4, 15.4], [-20.2, 23.8], [-8.4, 24.4], [11.6, 24.2], [26.2, 25.0],
  [-2.2, -26.4], [10.8, -26.2], [-34.6, -18.0], [27.4, -26.0],
];
const SPOT_CLEAR = 1.3;

export function targetSpots(k: Kit): Array<readonly [number, number]> {
  const spots = SPOT_CANDIDATES.filter(([x, z]) => k.isFree(x, z, 0.7));
  spots.forEach(([x, z], i) => k.targetSpot(x, z, 0, k.rng.range(-0.6, 0.6) + (i % 3 === 0 ? 0.4 : 0)));
  return spots;
}

const inside = (x: number, z: number): boolean => x > (GROUND[0]?.[0] ?? -37) + 1.6 && x < (GROUND[1]?.[0] ?? 38) - 1.6 && z > -27 && z < 27;

const FILL_CLIPS = ['talk', 'stand', 'talk.laugh', 'eat.icecream', 'point', 'drink.cup', 'photo.selfie', 'idle.watch', 'cheer.clap', 'talk.nod', 'idle.phone', 'wave', 'lookout'];

/**
 * Seeded group scatter over all open ground, rejecting points near the target spots. Mirrors
 * `Kit.fill` but with keep-outs; returns the number of people made.
 */
export function crowdFill(k: Kit, count: number, spots: ReadonlyArray<readonly [number, number]>, sizes: readonly [number, number] = [2, 5]): number {
  let made = 0;
  for (let tries = 0; tries < count * 14 && made < count; tries++) {
    const x = k.rng.range(-36, 37);
    const z = k.rng.range(-27, 27);
    const n = Math.min(count - made, k.rng.int(sizes[0], sizes[1]));
    const r = 0.45 + n * 0.11;
    if (!inside(x, z) || spots.some(([sx, sz]) => Math.hypot(sx - x, sz - z) < SPOT_CLEAR + r)) continue;
    if (!k.isFree(x, z, r + 0.32)) continue;
    made += group(k, x, z, n, r);
  }
  return made;
}

/** A ring of `n` people facing its centre; members that would land on a footprint are skipped. */
function group(k: Kit, x: number, z: number, n: number, r: number): number {
  const start = k.rng.range(0, Math.PI * 2);
  let made = 0;
  for (let i = 0; i < n; i++) {
    const a = start + (i / n) * Math.PI * 2 + k.rng.range(-0.25, 0.25);
    const rr = n === 1 ? 0 : r * k.rng.range(0.85, 1.1);
    const px = x + Math.sin(a) * rr;
    const pz = z + Math.cos(a) * rr;
    if (!k.isFree(px, pz, 0.32)) continue;
    k.person({
      x: px,
      z: pz,
      heading: n === 1 ? k.rng.range(-Math.PI, Math.PI) : Math.atan2(x - px, z - pz),
      clip: k.rng.pick(FILL_CLIPS),
      age: k.rng.chance(0.14) ? 'child' : k.rng.chance(0.1) ? 'elder' : 'adult',
      hold: k.rng.chance(0.3) ? [k.rng.pick(TREATS)] : undefined,
    });
    made++;
  }
  return made;
}
