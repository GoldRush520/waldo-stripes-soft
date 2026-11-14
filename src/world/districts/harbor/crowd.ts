/**
 * The harbour crowd: hero spots reserved first, then parade spectators packed along the quay edge
 * and down the jetties, anglers and strollers on the breakwater, window-shoppers and porters along
 * the house fronts, boatyard hands, promenade walkers and the partial look-alikes.
 */
import type { Hold } from '../../kit';
import type { Rng } from '../../../core/rng';
import { type Ctx, free, stand } from './ctx';
import { BW_END_X, BW_X, BW_Z, FRONT_Z, HOUSES_X0, HOUSES_X1, JETTIES, JETTY_Y, LANE_Z, PATH_Y, QUAY_Y, TEE, act, gait, gaitSpeed, holdOne, holds } from './plan';

const SPOTS: ReadonlyArray<readonly [number, number, number, number]> = [
  [-52.8, -1.4, 0, 0.3],
  [-32.6, -2.25, 0, 0.2],
  [-25.6, -2.2, 0, -0.3],
  [-10.6, -2.3, 0, 0.4],
  [-0.6, -2.25, 0, -0.2],
  [16.3, -2.4, 0, 0.3],
  [24.7, -2.2, 0, -0.4],
  [34.6, -2.25, 0, 0.2],
  [45.2, -2.0, 0, -0.5],
  [-30.1, 5.0, JETTY_Y, 0.4],
  [22.1, 5.6, JETTY_Y, -0.3],
  [-6.4, -2.35, 0, 0.1],
  [-51.8, -8.2, 0, 0.5],
  [39.8, -1.0, 0, -0.2],
];

/** Reserve hero spots before anything else is placed around them. */
export function reserveSpots(c: Ctx): void {
  for (const s of SPOTS) c.reserved.push(s);
}

/** Register the reserved spots that are still clear (all of them unless a story claimed one). */
export function targetSpots(c: Ctx): void {
  for (const [x, z, y, h] of c.reserved) {
    if (c.k.isFree(x, z, 0.3)) c.k.targetSpot(x, z, y, h);
  }
}

interface Act {
  readonly clip: string;
  readonly hold: Hold[];
}

/** A parade watcher: the action and the thing in hand always belong together. */
function watcher(rng: Rng): Act {
  const t = rng.pick(['coral', 'butter', 'blue', 'sage'] as const);
  const options: ReadonlyArray<() => Act> = [
    () => ({ clip: 'wave', hold: rng.chance(0.4) ? holdOne('hold.pennant', 'hold.flag') : [] }),
    () => ({ clip: act('greet.bigwave', 'wave'), hold: rng.chance(0.3) ? holds({ key: 'hold.balloon', tint: t }) : [] }),
    () => ({ clip: act('cheer.clap', 'cheer'), hold: [] }),
    () => ({ clip: act('cheer.jump', 'cheer'), hold: [] }),
    () => ({ clip: 'cheer', hold: holdOne('hold.pinwheel', 'hold.flag') }),
    () => ({ clip: 'point', hold: [] }),
    () => ({ clip: 'lookout', hold: rng.chance(0.3) ? holds('hold.umbrella') : [] }),
    () => ({ clip: act('photo.camera', 'lookout'), hold: holdOne('hold.camera') }),
    () => ({ clip: act('photo.selfie', 'talk'), hold: holdOne('hold.selfiestick', 'hold.phone') }),
    () => ({ clip: act('eat.icecream', 'stand'), hold: holdOne('hold.icecream') }),
    () => ({ clip: act('idle.watch', 'stand'), hold: rng.chance(0.4) ? holds({ key: 'hold.bag', tint: t }) : [] }),
    () => ({ clip: 'stand', hold: rng.chance(0.3) ? holdOne('hold.handfan', 'hold.parasol') : [] }),
    () => ({ clip: 'talk', hold: [] }),
    () => ({ clip: act('drink.cup', 'stand'), hold: holdOne('hold.mug', 'hold.teacup') }),
  ];
  return rng.pick(options)();
}

/** A shopper or gossip along the house fronts. */
function stroller(rng: Rng): Act {
  const options: ReadonlyArray<() => Act> = [
    () => ({ clip: 'talk', hold: holds({ key: 'hold.bag', tint: rng.pick(['sage', 'clay', 'blue'] as const) }) }),
    () => ({ clip: act('talk.nod', 'talk'), hold: [] }),
    () => ({ clip: act('talk.laugh', 'talk'), hold: [] }),
    () => ({ clip: act('talk.haggle', 'talk'), hold: holdOne('hold.basket.produce', 'hold.bag') }),
    () => ({ clip: act('read.paper', 'stand'), hold: holdOne('hold.newspaper') }),
    () => ({ clip: act('read.map', 'stand'), hold: holdOne('hold.map') }),
    () => ({ clip: act('drink.cup', 'stand'), hold: holdOne('hold.mug') }),
    () => ({ clip: act('idle.phone', 'stand'), hold: holdOne('hold.phone') }),
    () => ({ clip: act('eat.sandwich', 'stand'), hold: holdOne('hold.sandwich', 'hold.pretzel') }),
    () => ({ clip: 'stand', hold: rng.chance(0.4) ? holdOne('hold.shoppingbag', 'hold.bag') : [] }),
  ];
  return rng.pick(options)();
}

/** Three loose rows of parade watchers along the quay edge, gaps left at the jetty roots. */
export function edgeSpectators(c: Ctx): void {
  const k = c.k;
  const rows: ReadonlyArray<readonly [number, number, number]> = [
    [-0.5, 0.66, 0.4],
    [-1.25, 0.72, 0.1],
    [-2.05, 1.05, 0.04],
  ];
  const atRoot = (x: number): boolean => JETTIES.some((j) => Math.abs(x - j.x) < 1.35);
  for (const [z, step, kids] of rows) {
    for (let x = -42.4 + k.rng.range(0, step); x < 48; x += step + k.rng.range(-0.08, 0.12)) {
      if (atRoot(x)) continue;
      const px = x + k.rng.range(-0.12, 0.12);
      const pz = z + k.rng.range(-0.12, 0.12);
      stand(c, { x: px, z: pz, y: QUAY_Y, heading: k.rng.range(-0.5, 0.5), ...watcher(k.rng), age: k.rng.chance(kids) ? 'child' : k.rng.chance(0.12) ? 'elder' : 'adult' }, 0.29);
    }
  }
}

/** Spectators down both edges of each jetty and the ends of the T-head. */
export function jettySpectators(c: Ctx): void {
  const k = c.k;
  for (const j of JETTIES) {
    for (const side of [-1, 1]) {
      for (let z = 0.9; z < j.len - 1.2; z += k.rng.range(0.72, 0.95)) {
        stand(c, { x: j.x + side * 0.72, z, y: JETTY_Y, heading: side * 0.45 + k.rng.range(-0.35, 0.35), ...watcher(k.rng), age: k.rng.chance(0.2) ? 'child' : 'adult' }, 0.28);
      }
    }
  }
  for (const x of [TEE.x - 3.7, TEE.x + 3.5, TEE.x + 3.0]) {
    stand(c, { x, z: TEE.z + 0.45, y: JETTY_Y, heading: k.rng.range(-0.4, 0.4), ...watcher(k.rng) }, 0.28);
  }
}

/** Anglers along the breakwater crest and visitors at the lighthouse end. */
export function breakwaterPeople(c: Ctx): void {
  const k = c.k;
  for (let z = 2.5; z < BW_Z - 1; z += k.rng.range(2.6, 3.6)) {
    if (z > 27.5 && z < 33) continue;
    const east = k.rng.chance(0.6);
    stand(c, { x: BW_X + (east ? 0.55 : -0.55), z, y: PATH_Y, heading: east ? Math.PI / 2 : -Math.PI / 2, clip: act('fish.cast', 'lookout'), hold: holds('hold.fishingrod', 'holdL.bucket'), look: { hat: k.rng.pick(['hat.sun', 'hat.cap', 'hat.beanie', null]) } }, 0.28);
  }
  for (let x = BW_X + 2; x < BW_END_X - 0.4; x += 1.3) {
    if (x > -46 && x < -42.5) continue;
    stand(c, { x, z: BW_Z + (k.rng.chance(0.5) ? 0.5 : -0.5), y: PATH_Y, heading: k.rng.range(-0.6, 0.6), clip: k.rng.pick(['wave', act('photo.selfie', 'point'), 'point', act('cheer.clap', 'cheer')]) }, 0.28);
  }
}

/** Window-shoppers, porters and gossips along the house fronts and in the boatyard. */
export function fronts(c: Ctx): void {
  const k = c.k;
  for (let x = HOUSES_X0 + 0.6; x < HOUSES_X1 - 0.4; x += k.rng.range(1.0, 1.7)) {
    stand(c, { x, z: FRONT_Z + k.rng.range(0.85, 1.35), heading: k.rng.range(-0.9, 0.9) + (k.rng.chance(0.4) ? Math.PI : 0), ...stroller(k.rng), age: k.rng.chance(0.12) ? 'child' : 'adult' }, 0.3);
  }
  const yard = ['talk', act('vend.arrange', 'stand'), act('clean.sweep', 'stand'), act('point.down', 'point'), act('idle.hips', 'stand')];
  k.prop('harbour.oarRack', { x: -53.2, z: -10.6 });
  k.prop('harbour.lobsterPots', { x: -50.9, z: -10.8 });
  k.prop('harbour.ropeCoil', { x: -53.6, z: -8.6 });
  k.prop('harbour.anchor', { x: -50.6, z: -8.9, rot: 0.4 });
  for (let i = 0; i < 18; i++) {
    stand(c, { x: k.rng.range(-54.2, -49.8), z: k.rng.range(-10, -1.0), heading: k.rng.range(-1, 1), clip: k.rng.pick(yard), hold: k.rng.chance(0.4) ? ['upper.apron'] : holds('upper.overalls') }, 0.32);
  }
}

/** Promenade, alley and breakwater walkers (all on compact there-and-back routes). */
export function walkers(c: Ctx): void {
  const k = c.k;
  const bags = (rng: Rng): Hold[] | undefined => (rng.chance(0.3) ? [{ key: 'hold.bag', tint: rng.pick(['coral', 'sage', 'blue', 'butter'] as const) }] : rng.chance(0.1) ? [{ key: 'hold.balloon', tint: rng.pick(['coral', 'butter'] as const) }] : undefined);
  k.walkers([[-41, 0, LANE_Z], [-20, 0, LANE_Z + 0.15], [-2, 0, LANE_Z]], 40, { lanes: [0.25, 0.7], speed: [0.7, 1.2], hold: bags });
  k.walkers([[0, 0, LANE_Z], [18, 0, LANE_Z - 0.15], [36, 0, LANE_Z]], 40, { lanes: [0.25, 0.7], speed: [0.7, 1.2], hold: bags });
  k.walkers([[-13.3, 0, -12.6], [-13.3, 0, -4.6], [-4, 0, -3.1], [-4, 0, -0.3], [-4, JETTY_Y, 1], [-4, JETTY_Y, 13.4]], 16, { lanes: [0.22], speed: [0.6, 1.0], hold: bags });
  k.walkers([[13.8, 0, -12.6], [13.8, 0, -5.4], [17, 0, -4.9]], 10, { lanes: [0.35, 0.8], hold: bags });
  k.walkers([[BW_X, PATH_Y, 0.6], [BW_X, PATH_Y, BW_Z], [BW_END_X + 0.6, PATH_Y, BW_Z]], 14, { lanes: [0.2], speed: [0.6, 1.0] });
  const porter = gait('carry.stack', 'carry');
  const lane = k.street([[-38, 0, LANE_Z - 0.6], [-6, 0, LANE_Z - 0.6], [30, 0, LANE_Z - 0.6]], 0.15);
  for (let i = 0; i < 5; i++) {
    const m = k.onRoute(lane, i * 14, 0.9);
    k.person({ x: 0, z: 0, motion: m, clip: porter, speed: gaitSpeed(porter, 0.9), hold: ['carry.crate', 'upper.apron'], look: { hat: 'hat.cap', hatTint: 'blue', longLegs: true } });
  }
}

/** Partial look-alikes: each shares at most three of the hero's five features. */
export function lookalikes(c: Ctx): void {
  const k = c.k;
  const spots: ReadonlyArray<readonly [number, number]> = [[-28.4, -2.1], [6.9, -2.2], [27.6, -2.15], [44.2, -0.9]];
  const [a, b, d, e] = spots;
  if (a) k.person({ x: a[0], z: a[1], heading: 0.4, clip: 'wave', look: { pattern: 1, shirt: 'coral', shirt2: 'ivory', hat: 'hat.cap', hatTint: 'blue', glasses: null, pants: 'clayDeep', longLegs: true } });
  if (b) k.person({ x: b[0], z: b[1], heading: -0.3, clip: 'lookout', look: { pattern: 1, shirt: 'blue', shirt2: 'ivory', hat: 'hat.bobble', hatTint: 'coral', glasses: 'face.glasses.round', pants: 'sageDeep', longLegs: true } });
  if (d) k.person({ x: d[0], z: d[1], heading: 0.2, clip: 'stand.stick', age: 'elder', hold: ['hold.stick'], look: { pattern: 0, shirt: 'butter', hat: 'hat.bobble', hatTint: 'coral', glasses: null, pants: 'blue', longLegs: true } });
  if (e && free(c, e[0], e[1])) k.person({ x: e[0], z: e[1], heading: 0, clip: 'wave', look: { pattern: 1, shirt: 'coral', shirt2: 'ivory', hat: null, glasses: 'face.glasses.round', pants: 'blue', longLegs: true } });
}
