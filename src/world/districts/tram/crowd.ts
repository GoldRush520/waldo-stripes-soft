/**
 * Ambient life: luggage chaos scattered over every open patch, waiting passengers on the
 * platforms, the pedicab rank, the east tram stop, bank strollers, look-alikes, procedural fill
 * and the hero target spots (chosen last, on whatever ground is still free).
 */
import type { Kit } from '../../kit';
import { CLOTHS } from '../shared';
import { CANAL_HALF_X, NORTH_PLATFORM, SOUTH_PLATFORM, canalX, dry, eastRect, rect, westRect } from './plan';
import { seatOn } from './seat';

type Poly = ReadonlyArray<readonly [number, number]>;

const LUGGAGE = [
  'luggage.suitcase.s',
  'luggage.suitcase.m',
  'luggage.suitcase.l',
  'luggage.suitcase.mFlat',
  'luggage.duffel',
  'luggage.rucksack',
  'luggage.hatBoxes',
  'luggage.steamerTrunk',
  'luggage.celloCase',
  'luggage.golfBag',
  'luggage.tower',
  'luggage.carpetRoll',
  'cart.luggageHeaped',
  'cart.luggage',
] as const;

const FORECOURT = ['stand', 'talk', 'idle.watch', 'talk.nod', 'lookout', 'greet.handshake', 'read.paper', 'eat.icecream', 'drink.cup', 'wave', 'point', 'talk.laugh', 'idle.shift', 'greet.hattip'];
const PLATFORM = ['stand', 'idle.watch', 'lookout', 'talk', 'read.paper', 'idle.tap', 'queue.tiptoe', 'idle.behind', 'wave'];
const YARD = ['talk', 'stand', 'carry.wobble', 'porter.balance', 'luggage.rack', 'idle.hips', 'talk.haggle', 'point.down', 'idle.arms'];
const EAST = ['eat.icecream', 'talk', 'stand', 'lookout', 'photo.camera', 'drink.cup', 'talk.nod', 'wave'];

/** Luggage pieces dropped on free ground inside a polygon (they block, so fills flow round them). */
function luggage(k: Kit, poly: Poly, n: number, y = 0): void {
  const xs = poly.map((p) => p[0]);
  const zs = poly.map((p) => p[1]);
  let placed = 0;
  for (let t = 0; t < n * 10 && placed < n; t++) {
    const x = k.rng.range(Math.min(...xs), Math.max(...xs));
    const z = k.rng.range(Math.min(...zs), Math.max(...zs));
    if (!inside(poly, x, z) || !k.isFree(x, z, 0.75) || !dry(k, x, z, 0.6)) continue;
    k.prop(k.rng.pick(LUGGAGE), { x, z, y, rot: k.rng.range(-0.6, 0.6), tint: k.rng.pick(CLOTHS) });
    placed++;
  }
}

function inside(poly: Poly, x: number, z: number): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i] as readonly [number, number];
    const b = poly[j] as readonly [number, number];
    if (a[1] > z !== b[1] > z && x < ((b[0] - a[0]) * (z - a[1])) / (b[1] - a[1]) + a[0]) hit = !hit;
  }
  return hit;
}

function platforms(k: Kit): void {
  const y = SOUTH_PLATFORM.y;
  for (const x of [-29, -16, -6, 0.5]) seatOn(k, 'station.bench', { x, z: SOUTH_PLATFORM.z1 - 0.45, y, rot: Math.PI }, { clips: ['sit', 'sit.read', 'sit.talk', 'sit.eat'], fill: 0.85 });
  for (const x of [-27, -9, -1]) seatOn(k, 'station.bench', { x, z: NORTH_PLATFORM.z0 + 0.45, y }, { clips: ['sit', 'sit.read', 'sit.talk'], fill: 0.85 });
  const south = rect(SOUTH_PLATFORM.x0 + 0.6, SOUTH_PLATFORM.z0 + 0.5, SOUTH_PLATFORM.x1 - 0.6, SOUTH_PLATFORM.z1 - 0.4);
  const north = rect(NORTH_PLATFORM.x0 + 0.6, NORTH_PLATFORM.z0 + 0.4, NORTH_PLATFORM.x1 - 0.6, NORTH_PLATFORM.z1 - 0.5);
  luggage(k, south, 9, y);
  luggage(k, north, 6, y);
  k.prop('station.portersBell', { x: -30.2, z: SOUTH_PLATFORM.z0 + 1.6, y });
  k.fill(south, 46, { clips: PLATFORM, y, groupSize: [1, 3] });
  k.fill(north, 30, { clips: PLATFORM, y, groupSize: [1, 3] });
}

function rankAndStops(k: Kit): void {
  ['coral', 'butter', 'sage'].forEach((tint, i) => {
    const at = { x: -40.2, z: -2.4 + i * 2.8, tint: tint as 'coral' };
    k.prop('vehicle.pedicab', at, { walkThrough: true });
    k.seated('vehicle.pedicab', at, { place: false, fill: 0.5, clips: i === 1 ? ['sit.asleep'] : ['sit', 'sit.talk', 'sit.eat'] });
  });
  seatOn(k, 'tram.stop', { x: 39.6, z: -5.3, rot: Math.PI }, { clips: ['sit', 'sit.read', 'sit.talk'], fill: 0.9 });
  k.block(39.6, -4.68, 3.2, 0.2);
  k.queue([31.6 + 0.3, 6.4], [35.6, 4.6], 6, { clips: ['queue.impatient', 'stand', 'talk', 'queue.shuffle'] });
  k.person({ x: 37.4, z: 4.2, heading: -Math.PI / 2, clip: 'vend.handover', look: { hat: 'hat.sailor', hatTint: 'ivory' }, hold: ['upper.apron'] });
  for (const x of [-12.5, -2.5]) seatOn(k, 'bench.park', { x, z: 19.6 }, { clips: ['sit', 'sit.talk', 'sit.eat', 'sit.crossed'], fill: 0.8 });
  k.prop('station.mailSacks', { x: -15.5, z: 15.2 });
  k.prop('station.newspapers', { x: 8.2, z: 3.1 });
  k.prop('station.leftLuggage', { x: -6.5, z: 19.2 });
  k.person({ x: -6.5, z: 18.25, heading: 0, clip: 'vend.arrange', look: { hat: 'hat.officer', hatTint: 'blue' }, hold: ['upper.waistcoat'] });
  k.queue([-6.5, 22.2], [-6.5, 20.1], 3, { clips: ['stand', 'idle.tap', 'talk'] });
}

/** People leaning on the canal railings looking at the water, both banks. */
function bankLife(k: Kit): void {
  for (let z = -18; z < 21; z += 2.3) {
    if (z > -16 && z < -6) continue;
    for (const s of [-1, 1]) {
      if (!k.rng.chance(0.55)) continue;
      const x = canalX(z) + s * 6.4;
      if (!dry(k, x, z, 0.5) || !k.isFree(x, z, 0.4)) continue;
      k.person({ x, z, heading: s < 0 ? 1.2 : -1.9, clip: k.rng.pick(['lookout', 'idle.arms', 'talk', 'fish.cast', 'point']), age: k.rng.chance(0.15) ? 'child' : undefined });
    }
  }
}

function lookAlikes(k: Kit): void {
  k.person({ x: -18.6, z: 1.4, heading: 0.3, clip: 'idle.watch', look: { pattern: 1, shirt: 'coral', shirt2: 'ivory', hat: 'hat.beret', hatTint: 'blue', glasses: 'face.glasses.round', pants: 'blue', longLegs: true } });
  k.person({ x: 4.2, z: 13.9, heading: -0.4, clip: 'stand.stick', hold: ['hold.stick'], age: 'elder', look: { pattern: 0, shirt: 'sage', hat: 'hat.bobble', hatTint: 'coral', pants: 'blue', longLegs: true } });
  k.person({ x: 40.6, z: 13.2, heading: -2.2, clip: 'talk', look: { pattern: 1, shirt: 'coral', shirt2: 'ivory', hat: 'hat.bobble', hatTint: 'coral', glasses: null, pants: 'cocoa', longLegs: true } });
  k.person({ x: -35.2, z: 11.4, heading: 0.8, clip: 'stand.stick', hold: ['hold.stick'], look: { pattern: 1, shirt: 'blue', shirt2: 'ivory', hat: 'hat.bobble', hatTint: 'blue', glasses: 'face.glasses.round', pants: 'clayDeep', longLegs: true } });
  k.person({ x: 14.5, z: -17.4, heading: 0.2, clip: 'lookout', look: { pattern: 1, shirt: 'coral', shirt2: 'ivory', hat: 'hat.cap', hatTint: 'coral', pants: 'blue', longLegs: true } });
}

/** Luggage chaos and procedural crowds over every open patch. */
function fills(k: Kit): void {
  const forecourt = westRect(-39, -1.2, 16, 8.1, 1.4);
  const yard = westRect(-36.6, 13.9, 16, 16.3, 1.4);
  const south = westRect(-36.6, 18.1, 14, 21.2, 1.4);
  const west = rect(-41.6, -3.6, -31.4, 9.6);
  const westYard = rect(-43, -19.4, -31.5, -14.4);
  const northEast = westRect(2.5, -19.4, 30, -14.4, 1.4);
  const hallFront = westRect(-30, -3.9, 18, -3.2, 1.4);
  const eastSouth = eastRect(-3.6, 17.5, 40.2, 1.8);
  const eastTip: Poly = [[canalX(17.6) + CANAL_HALF_X + 1.8, 17.6], [40, 17.6], [31, 21], [canalX(21) + CANAL_HALF_X + 1.8, 21]];
  const eastNorth = eastRect(-19.4, -14.6, 40.2, 1.6);
  luggage(k, forecourt, 26);
  luggage(k, yard, 12);
  luggage(k, south, 10);
  luggage(k, west, 6);
  luggage(k, westYard, 4);
  luggage(k, northEast, 6);
  luggage(k, eastSouth, 8);
  k.fill(forecourt, 150, { clips: FORECOURT, groupSize: [1, 4], childShare: 0.12 });
  k.fill(yard, 34, { clips: YARD, groupSize: [1, 3] });
  k.fill(south, 46, { clips: FORECOURT, groupSize: [1, 4] });
  k.fill(west, 34, { clips: FORECOURT, groupSize: [1, 3] });
  k.fill(westYard, 16, { clips: YARD, groupSize: [1, 3] });
  k.fill(northEast, 34, { clips: [...YARD, 'lookout', 'wave'], groupSize: [1, 3] });
  k.fill(hallFront, 12, { clips: FORECOURT, groupSize: [1, 2] });
  k.fill(eastSouth, 64, { clips: EAST, groupSize: [1, 4] });
  k.fill(eastTip, 16, { clips: EAST, groupSize: [1, 3] });
  luggage(k, eastTip, 3);
  k.fill(eastNorth, 12, { clips: EAST, groupSize: [1, 3] });
}

const TARGETS: ReadonlyArray<readonly [number, number]> = [
  [-34, 8],
  [-24, 0.5],
  [-11, 7.4],
  [-5, 2.4],
  [6.4, 6.2],
  [-26, 19.6],
  [-8, 20.6],
  [2.5, 17.6],
  [-38.5, -1],
  [-38, -17],
  [12, -16.8],
  [38.4, 10.8],
  [36.4, -1.2],
  [-12, -3.6],
  [-30, 12.6],
  [10, 12.2],
  [-20, 17.6],
  [33, 14.6],
];

/** Hero spots: the nearest free open ground to each planned point. */
function targetSpots(k: Kit): void {
  for (const [x, z] of TARGETS) {
    for (let t = 0; t < 60; t++) {
      const r = t * 0.08;
      const a = t * 2.4;
      const px = x + Math.cos(a) * r;
      const pz = z + Math.sin(a) * r;
      if (!dry(k, px, pz, 1) || !k.isFree(px, pz, 0.6)) continue;
      k.targetSpot(px, pz, 0, k.rng.range(-0.6, 0.6));
      break;
    }
  }
}

export function crowd(k: Kit): void {
  platforms(k);
  rankAndStops(k);
  bankLife(k);
  lookAlikes(k);
  fills(k);
  targetSpots(k);
}

