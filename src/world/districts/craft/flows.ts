/**
 * Movement and density for the craft yard: lane walkers, apprentices carrying planks and pushing
 * barrows, hero look-alikes, contextual filler crowds and the hero target spots.
 */
import { type Geo, box, detail, merge, translate } from '../../../core/geo';
import type { Vec3 } from '../../../crowd/stores';
import type { Kit } from '../../kit';
import { BACK_LANE_Z, HARD_HAT, LEG_LANE_X, SMOCK, YARD_STREET_Z, spotNear } from './plan';

let shoulderPlank: Geo | null = null;

/** A 3 m plank carried on the right shoulder (person frame: +z forward, right = -x). */
function shoulderPlankGeo(): Geo {
  if (!shoulderPlank) {
    shoulderPlank = merge(
      translate(box(0.14, 0.05, 3.0, 'butterLight'), -0.22, 1.5, -0.3),
      detail(translate(box(0.15, 0.02, 0.05, 'timber'), -0.22, 1.55, 0.9)),
    );
  }
  return shoulderPlank;
}

function laneWalkers(k: Kit): void {
  const bags = (rng: Kit['rng']) => (rng.chance(0.3) ? [{ key: 'hold.bag', tint: rng.pick(['coral', 'sage', 'blue'] as const) }] : rng.chance(0.15) ? ['back.pack'] : undefined);
  const z = YARD_STREET_Z;
  k.walkers([[-13.5, 0, z], [0, 0, z - 0.3], [17.5, 0, z]], 40, { lanes: [0.45, 1.25], hold: bags });
  const x = LEG_LANE_X;
  k.walkers([[x, 0, -7.5], [x + 0.1, 0, 10], [x, 0, 24], [x, 0, 37.5]], 36, { lanes: [0.35, 0.95], hold: bags });
  k.walkers([[-13.5, 0, BACK_LANE_Z], [1, 0, BACK_LANE_Z + 0.2], [15.5, 0, BACK_LANE_Z]], 16, { lanes: [0.5], hold: bags });
  k.walkers([[8.0, 0, 13.5], [8.0, 0, 25], [8.0, 0, 37.5]], 14, { lanes: [0.25], hold: bags });
  k.walkers([[-13.5, 0, z + 2.2], [2, 0, z + 2.4], [15.5, 0, z + 2.0]], 18, { lanes: [0.3], hold: bags });
  k.walkers([[8.2, 0, -12], [8.4, 0, -4], [8.0, 0, 4.4]], 14, { lanes: [0.35], hold: bags });
  k.walkers([[-3.4, 0, -28.4], [-3.2, 0, -22], [-3.6, 0, -16.2]], 10, { lanes: [0.3], childShare: 0, hold: () => ['upper.apron'] });
}

/** Apprentices shuttling planks from the timber yard to the site, and barrows of bricks. */
function apprentices(k: Kit): void {
  const plankRoute = k.street([[-4.2, 0, -16.6], [0, 0, -15.2], [4.4, 0, -14.6]] as Vec3[], 0.45);
  for (let i = 0; i < 6; i++) {
    const m = k.onRoute(plankRoute, i * 3.1, 0.9);
    k.person({ x: 0, z: 0, motion: m, clip: 'carry.plank', speed: 0.9 / 1.25, age: i % 2 ? 'teen' : 'adult', look: HARD_HAT });
    k.dynamic(shoulderPlankGeo(), m, {});
  }
  const barrowRoute = k.street([[7.0, 0, -13.6], [5.4, 0, -11.5], [3.2, 0, -5.5], [-1.6, 0, 5.2], [-1.4, 0, 8.0]] as Vec3[], 0.55);
  for (let i = 0; i < 6; i++) {
    const m = k.onRoute(barrowRoute, i * 6.2, 0.8);
    k.person({ x: 0, z: 0, motion: m, clip: 'push.cart', speed: 0.8 / 1.25, age: i % 3 === 0 ? 'teen' : 'adult', look: i % 2 ? HARD_HAT : SMOCK });
    k.dynamic('cart.wheelbarrowBricks', m, { z: 1.25 });
  }
}

/** Partial look-alikes of the hero: each shares at most three of the five identifying features. */
function lookAlikes(k: Kit): void {
  k.person({ x: -4.6, z: -1.6, heading: 0.3, clip: 'stand', look: { pattern: 1, shirt: 'coral', shirt2: 'ivory', hat: 'hat.hard', hatTint: 'butter', glasses: null, pants: 'blue', longLegs: true } });
  k.person({ x: 6.6, z: 31.6, heading: -0.4, clip: 'talk', look: { pattern: 3, shirt: 'blue', shirt2: 'ivory', hat: 'hat.bobble', hatTint: 'coral', glasses: 'face.glasses.round', pants: 'clayDeep', longLegs: true } });
  k.person({ x: -3.4, z: 16.2, heading: 0.8, clip: 'stand.stick', age: 'elder', hold: ['hold.stick'], look: { pattern: 0, shirt: 'sage', hat: 'hat.cap', hatTint: 'blue', glasses: 'face.glasses.round', pants: 'blue', longLegs: true } });
  k.person({ x: 0.6, z: -6.8, heading: 0, clip: 'wave', age: 'child', look: { pattern: 1, shirt: 'coral', shirt2: 'ivory', hat: 'hat.bobble', hatTint: 'coral', glasses: null, pants: 'cocoa', longLegs: true } });
  k.person({ x: -11.2, z: 6.4, heading: 0.5, clip: 'idle.hips', look: { pattern: 2, shirt: 'coral', shirt2: 'ivory', hat: 'hat.beanie', hatTint: 'coral', glasses: 'face.glasses.round', pants: 'slate', longLegs: true } });
}

const WORK = ['point', 'talk', 'idle.hips', 'lookout', 'point.down', 'talk.nod', 'stand'] as const;
const VISIT = ['talk', 'stand', 'point', 'lookout', 'talk.laugh', 'photo.camera', 'idle.shift', 'read.map'] as const;

/** Contextual filler crowds over every open patch (after all authored content). */
function density(k: Kit): void {
  k.fill([[-13.5, -29], [-3, -29], [-3, -16.5], [-13.5, -16.5]], 48, { clips: WORK, groupSize: [1, 3] });
  k.fill([[-1.5, -21], [15.3, -21], [15.3, -12.9], [-1.5, -12.9]], 48, { clips: WORK, groupSize: [1, 3] });
  k.fill([[-13.5, -31.3], [15.5, -31.3], [15.5, -28.6], [-13.5, -28.6]], 26, { clips: VISIT, groupSize: [1, 3] });
  k.fill([[-6.5, -12.2], [15.5, -12.2], [15.5, -6.4], [-6.5, -6.4]], 52, { clips: VISIT, groupSize: [2, 4] });
  k.fill([[-13.5, -6.2], [15.5, -6.2], [15.5, 4.5], [-13.5, 4.5]], 105, { clips: VISIT, groupSize: [1, 4], childShare: 0.18 });
  k.fill([[-7.5, 4.5], [8.5, 4.5], [8.5, 22], [-7.5, 22]], 80, { clips: VISIT, groupSize: [1, 3], childShare: 0.15 });
  k.fill([[-7.5, 22], [8.5, 22], [8.5, 37.5], [-7.5, 37.5]], 80, { clips: VISIT, groupSize: [1, 3], childShare: 0.15 });
}

function targetSpots(k: Kit): void {
  const spots: ReadonlyArray<readonly [number, number, number]> = [
    [1.2, 3.2, 0.3], [-3.2, -4.6, -0.4], [8.2, 2.6, 0.6], [6.4, -8.0, 0.2], [-10.8, -8.6, 0.5], [-4.4, 6.6, 0.2],
    [3.6, 16.0, -0.5], [-0.6, 28.4, 0.4], [7.2, 33.6, -0.3], [-4.6, 22.6, 0.3], [-9.6, -18.6, 0.2], [1.2, -18.4, -0.3],
  ];
  for (const [x, z, h] of spots) spotNear(k, x, z, h);
}

export function flowsAndCrowds(k: Kit): void {
  laneWalkers(k);
  apprentices(k);
  lookAlikes(k);
  density(k);
  targetSpots(k);
}
