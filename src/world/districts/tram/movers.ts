/**
 * Everything that moves on foot or wheels (besides the trams): pedicabs, porters pushing heaped
 * luggage trolleys, travellers dragging suitcases, lane walkers, and boats on the canal.
 */
import { BASE_CLIPS } from '../../../crowd/clips/base';
import { ACTIVE_CLIPS } from '../../../crowd/clips/active';
import { EVERYDAY_CLIPS } from '../../../crowd/clips/everyday';
import type { Vec3 } from '../../../crowd/stores';
import { propDef } from '../../../props/registry';
import type { Kit } from '../../kit';
import { WATER_Y } from '../../layout';
import { CLOTHS } from '../shared';
import { LANES, canalX } from './plan';

const ALL_CLIPS = [...BASE_CLIPS, ...EVERYDAY_CLIPS, ...ACTIVE_CLIPS];

/** Metres covered by one loop of a locomotion clip (fallback when the clip is not loaded). */
export function strideOf(id: string, fallback = 1.3): number {
  return ALL_CLIPS.find((c) => c.id === id)?.stride ?? fallback;
}

const bags = (rng: Kit['rng']) =>
  rng.chance(0.4) ? [{ key: 'hold.bag', tint: rng.pick(CLOTHS) }] : rng.chance(0.15) ? ['back.rucksack'] : rng.chance(0.1) ? [{ key: 'hold.umbrella', tint: rng.pick(CLOTHS) }] : undefined;

/** Feet anchor (pusher spot) of a pushed prop. */
function pusherSpot(key: string): { x: number; z: number } {
  const seats = propDef(key).seats ?? [];
  const s = seats[seats.length - 1];
  return { x: s?.x ?? 0, z: s?.z ?? -0.9 };
}

function pedicabs(k: Kit): void {
  const route = k.street([[-35.5, 0, LANES.pedicabs], [-14, 0, LANES.pedicabs + 0.3], [12, 0, LANES.pedicabs]], 0.75);
  for (let i = 0; i < 3; i++) {
    const m = k.onRoute(route, (i / 3) * route.length, 1.9);
    const tint = (['coral', 'butter', 'sage'] as const)[i] ?? 'coral';
    k.dynamic('vehicle.pedicab', m, { tint });
    (propDef('vehicle.pedicab').seats ?? []).forEach((seat, j) => {
      if (j > 0 && !k.rng.chance(0.7)) return;
      k.person({ x: seat.x, y: seat.y - 0.47, z: seat.z, heading: seat.heading, motion: m, clip: j === 0 ? 'bike.pedal' : k.rng.pick(['sit', 'sit.talk', 'ride.cheer']), look: j === 0 ? { hat: 'hat.cap', hatTint: tint } : undefined });
    });
  }
}

function trolleys(k: Kit): void {
  const route = k.street([[-35.5, 0, LANES.yard], [-12, 0, LANES.yard - 0.3], [6, 0, LANES.yard]], 0.55);
  const spot = pusherSpot('cart.luggageHeaped');
  const speed = 0.9;
  for (let i = 0; i < 4; i++) {
    const m = k.onRoute(route, (i / 4) * route.length + k.rng.range(0, 3), speed);
    k.dynamic(i % 2 ? 'cart.luggageHeaped' : 'cart.luggage', m, { tint: k.rng.pick(CLOTHS) });
    k.person({ x: spot.x, z: spot.z, motion: m, clip: 'push.cart', speed: speed / strideOf('push.cart'), look: { hat: 'hat.officer', hatTint: 'coralDeep' }, hold: ['upper.waistcoat'] });
  }
}

/** Travellers dragging wheeled suitcases along a lane. */
function draggers(k: Kit, path: readonly Vec3[], count: number, lane: number): void {
  const route = k.street(path, lane);
  const stride = strideOf('pull.suitcase');
  for (let i = 0; i < count; i++) {
    const v = k.rng.range(0.9, 1.25);
    const m = k.onRoute(route, ((i + k.rng.next()) / count) * route.length, v, { lateral: k.rng.range(-0.2, 0.2) });
    k.person({ x: 0, z: 0, motion: m, clip: 'pull.suitcase', speed: v / stride, hold: k.rng.chance(0.4) ? ['back.rucksack'] : [] });
    k.dynamic(k.rng.pick(['luggage.suitcase.m', 'luggage.suitcase.s', 'luggage.suitcase.l']), m, { x: -0.32, z: -0.62, tint: k.rng.pick(CLOTHS) });
  }
}

function walkers(k: Kit): void {
  k.walkers([[-42, 0, LANES.forecourt], [-14, 0, LANES.forecourt - 0.3], [13, 0, LANES.forecourt]], 30, { lanes: [0.35, 1.0], hold: bags });
  k.walkers([[-42.6, 0, -3.4], [-42.4, 0, 3], [-42.6, 0, 9]], 10, { lanes: [0.3, 0.8], hold: bags });
  k.walkers([[-6, 0, -2.6], [4, 0, -2.4], [15, 0, -2.6]], 14, { lanes: [0.3, 0.8], hold: bags });
  /* east bank promenade (north and south of the track) */
  const east = (z: number): Vec3 => [canalX(z) + 8.2, 0, z];
  k.walkers([east(-19), east(-16)], 4, { lanes: [0.3], speed: [0.6, 0.9] });
  k.walkers([east(-4), east(6), east(16)], 12, { lanes: [0.3, 0.9], hold: bags });
  draggers(k, [[-35.5, 0, LANES.draggers], [-12, 0, LANES.draggers], [12, 0, LANES.draggers]], 10, 0.3);
  draggers(k, [east(-3), east(15)], 4, 0.6);
}

/** Boats on the canal reach: a moored line along the west bank and two rowboats looping. */
function boats(k: Kit): void {
  const zs = [-19, 2, 8, 14, 19];
  zs.forEach((z, i) => {
    const x = canalX(z) - 3.2;
    const m = k.bob([x, WATER_Y, z], 1.2, 0.9 + i * 0.1, i, 0.04, 0.03, 4);
    k.dynamic(i % 2 ? 'boat.row' : 'boat.dinghy', m, { tint: CLOTHS[i % CLOTHS.length] });
    if (i % 2 === 0) k.person({ x: 0, y: 0.15, z: 0, heading: Math.PI, motion: m, clip: 'fish.sit', blob: 0 });
  });
  const lane = k.street([[canalX(-1.5) + 1, WATER_Y, -1.5], [canalX(9) + 1, WATER_Y, 9], [canalX(20) + 1, WATER_Y, 20]], 1.2);
  for (let i = 0; i < 2; i++) {
    const m = k.onRoute(lane, i * (lane.length / 2), 0.8, { bob: 0.04 });
    k.dynamic('boat.row', m, { tint: i ? 'butter' : 'coral' });
    k.person({ x: 0, y: 0.15, z: 0, heading: Math.PI, motion: m, clip: 'row.easy', blob: 0 });
    k.person({ x: 0, y: 0.15, z: -0.9, motion: m, clip: 'sit.talk', blob: 0 });
  }
  for (const [z, key] of [[-17, 'animal.duck'], [-1, 'animal.ducklings'], [5, 'animal.swan'], [12, 'animal.duck'], [17, 'animal.ducklings']] as const) {
    const m = k.bob([canalX(z) + 2.2, WATER_Y, z], 0.4, 0.8, z, 0.03, 0.02, 2);
    k.dynamic(key, m, {});
  }
}

export function movers(k: Kit): void {
  pedicabs(k);
  trolleys(k);
  walkers(k);
  boats(k);
}
