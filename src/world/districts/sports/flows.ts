/**
 * Movement and the connective tissue of the strip: the two-lane running track along the south edge
 * (joggers and cyclists on two compact loops), the west stroll path, the learner cyclist, the
 * hero look-alikes and the fair hiding spots.
 */
import type { RouteRef, Vec3 } from '../../../crowd/stores';
import type { Kit } from '../../kit';
import type { Age } from '../../../crowd/look';
import { gait, gear, rideClip, strideOf } from './catalog';
import { SPORT_TINTS, TRACK_Z, rect, ride } from './plan';

const [ZA, ZB] = TRACK_Z;

/** A long oval: out along lane A, round the end, back along lane B. */
function oval(k: Kit, x0: number, x1: number): RouteRef {
  const mid = (ZA + ZB) / 2;
  const r = (ZB - ZA) / 2;
  const cap = (cx: number, sign: number): Vec3[] =>
    Array.from({ length: 5 }, (_, i) => {
      const t = -Math.PI / 2 + ((i + 1) / 6) * Math.PI;
      return [cx + sign * Math.cos(t) * r, 0, mid + sign * Math.sin(t) * r];
    });
  return k.loop([[x0, 0, ZA], [(x0 + x1) / 2, 0, ZA], [x1, 0, ZA], ...cap(x1, 1), [x1, 0, ZB], [(x0 + x1) / 2, 0, ZB], [x0, 0, ZB], ...cap(x0, -1)]);
}

function cyclist(k: Kit, route: RouteRef, s0: number, speed: number, key: string, age: Age = 'adult'): number {
  const m = k.onRoute(route, s0, speed);
  k.dynamic(key, m, { tint: k.rng.pick(SPORT_TINTS) });
  const pedal = rideClip('sit', 'bike.pedal', 'bike.cruise');
  ride(k, key, { x: 0, z: 0 }, m, { age, clips: [pedal], speed: speed / strideOf(pedal), look: () => ({ hat: age === 'adult' ? 'hat.cycling' : 'hat.cap', hatTint: k.rng.pick(SPORT_TINTS) }) });
  return m;
}

function track(k: Kit): void {
  k.ground(rect(-48.6, ZA - 0.6, 51.4, ZB + 0.45), 'clayLight', 0.03, 0.02);
  const west = oval(k, -47, 13.5);
  const east = oval(k, 15, 50);
  const jog = gait('jog.easy', 'jog.run');
  const kit = (rng: Kit['rng']) => (rng.chance(0.3) ? gear(['hat.visor', 'hat.cap']) : undefined);
  k.walkers(west, 46, { clip: jog, speed: [2.0, 2.9], childShare: 0.04, hold: kit });
  k.walkers(east, 28, { clip: jog, speed: [2.0, 2.8], childShare: 0.04, hold: kit });
  [3, 31, 64, 97].forEach((s, i) => cyclist(k, west, s, 4.2 + i * 0.3, i % 2 ? 'vehicle.bicycleBasket' : 'vehicle.bicycle'));
  [10, 48].forEach((s) => cyclist(k, east, s, 4.4, 'vehicle.bicycle'));
  k.vignette({ id: 'learner-cyclist', title: 'Don\'t let go!', story: 'A small boy wobbles round the track on his first bicycle, his dad jogging alongside with a hand off the saddle he thinks is still holding on.' }, () => {
    const speed = 1.5;
    cyclist(k, west, 140, speed, 'vehicle.bicycle', 'child');
    const dad = k.onRoute(west, 140, speed, { lateral: -0.75 });
    const run = gait('jog.easy', 'walk');
    k.person({ x: 0, z: 0, motion: dad, clip: run, speed: speed / strideOf(run), look: { hat: 'hat.cap', hatTint: 'coral', shirt: 'sageLight', pattern: 0 } });
  });
}

function strolls(k: Kit): void {
  const bags = (rng: Kit['rng']) => (rng.chance(0.35) ? [{ key: 'hold.bag', tint: rng.pick(SPORT_TINTS) }] : rng.chance(0.15) ? [{ key: 'hold.balloon', tint: rng.pick(SPORT_TINTS) }] : undefined);
  k.walkers([[-73.6, 0, 1.6], [-62, 0, 4.4], [-53, 0, 7.2], [-49, 0, 7.6]], 16, { lanes: [0.35, 1.0], hold: bags });
}

function lookalikes(k: Kit): void {
  /* each shares at most three of the hero's five features */
  k.person({ x: 1.6, z: -3.9, heading: 0.3, clip: 'cheer', look: { pattern: 1, shirt: 'coral', shirt2: 'ivory', hat: 'hat.cap', hatTint: 'coral', glasses: null, pants: 'sageDeep', longLegs: false } });
  k.person({ x: 33.6, z: 6.2, heading: -0.4, clip: 'talk', look: { pattern: 0, shirt: 'butter', hat: 'hat.bobble', hatTint: 'coral', glasses: 'face.glasses.round', pants: 'blue', longLegs: true } });
  k.person({ x: -45.4, z: 6.0, heading: 0.2, age: 'elder', clip: 'stand.stick', hold: ['hold.stick'], look: { pattern: 1, shirt: 'blue', shirt2: 'ivory', glasses: 'face.glasses.round', hat: null, pants: 'clayDeep', longLegs: true } });
  k.person({ x: -63.2, z: 2.6, heading: -0.5, age: 'elder', clip: 'stand.stick', hold: ['hold.stick'], look: { pattern: 1, shirt: 'coral', shirt2: 'ivory', hat: 'hat.beret', hatTint: 'blue', glasses: null, pants: 'blue', longLegs: true } });
}

/** Register a hiding spot at the nearest point around (x, z) that has ~0.6 m of free ground. */
function spot(k: Kit, x: number, z: number, heading: number): void {
  for (let r = 0; r <= 2.4; r += 0.4) {
    for (let a = 0; a < 6.28; a += 0.8) {
      const px = x + Math.cos(a) * r;
      const pz = z + Math.sin(a) * r;
      if (k.isFree(px, pz, 0.6)) {
        k.targetSpot(px, pz, 0, heading);
        return;
      }
    }
  }
}

export function buildFlows(k: Kit): void {
  track(k);
  strolls(k);
  lookalikes(k);
}

/** Hiding spots, called after all staged people so free ground is known. */
export function buildSpots(k: Kit): void {
  const spots: ReadonlyArray<readonly [number, number, number]> = [
    [-70.2, -1.8, 0.4],
    [-59.6, -3.0, -0.3],
    [-48.6, 0.6, 0.2],
    [-34.6, -3.4, -0.5],
    [-26.6, 1.2, 0.3],
    [-12.6, 6.3, 2.8],
    [-1.6, 0.4, 0.6],
    [10.4, -2.4, -0.2],
    [15.6, 5.8, 0.5],
    [23.0, 6.2, 0.1],
    [41.6, -0.8, -0.6],
    [46.8, 5.0, 0.3],
    [-40.6, 5.6, 0.1],
    [5.2, 6.2, -0.3],
    [-66.4, -2.8, 0.2],
  ];
  for (const [x, z, h] of spots) spot(k, x, z, h);
}
