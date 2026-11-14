/**
 * The two trams. Each runs out-and-back on its own track (a lane-0 street route). A consist is
 * tram car + summer trailer + tram car turned round, mirror-symmetric about its centre, so the
 * instant reversal at the end of the line is invisible. Riders sit on the real seat anchors.
 */
import { propDef } from '../../../props/registry';
import { seatKindsOf } from '../../../props/transport';
import type { Col } from '../../../core/geo';
import type { Kit } from '../../kit';
import { RIDE_Y, TRACKS, TRACK_X0, TRACK_X1 } from './plan';
import { CLOTHS } from '../shared';

/** z of each car centre in the consist frame (trailer at 0). */
export const CAR_Z = 9.1;
const HALF = CAR_Z + 4.75;
/** consist centre travel limits along x */
export const RIDE_X0 = TRACK_X0 + HALF + 0.4;
export const RIDE_X1 = TRACK_X1 - HALF - 0.4;
export const TRAM_SPEED = 2.6;

const SIT = ['sit', 'sit.talk', 'sit', 'sit.read', 'sit.crossed', 'sit.talk'] as const;
const STANDING = ['stand', 'talk', 'idle.watch', 'read.paper'] as const;

function carRiders(k: Kit, motion: number, z: number, rot: number): void {
  const def = propDef('tram.car');
  const kinds = seatKindsOf(def);
  (def.seats ?? []).forEach((seat, i) => {
    const feet = kinds[i] === 'feet';
    if (!k.rng.chance(feet ? 0.3 : 0.62)) return;
    const p = k.rel({ x: 0, z, rot }, seat.x, seat.z, seat.heading);
    k.person({
      x: p.x,
      z: p.z,
      y: seat.y - (feet ? 0 : 0.47),
      heading: p.heading,
      motion,
      clip: k.rng.pick(feet ? STANDING : SIT),
      age: k.rng.chance(0.15) ? 'child' : k.rng.chance(0.15) ? 'elder' : 'adult',
      hold: k.rng.chance(0.2) ? [{ key: 'hold.bag', tint: k.rng.pick(CLOTHS) }] : [],
    });
  });
  /* the driver at the leading controller of this car */
  const d = k.rel({ x: 0, z, rot }, -0.45, 3.75, 0);
  k.person({ ...d, y: 0.75, motion, clip: 'stand', look: { hat: 'hat.officer', hatTint: 'blueDeep', shirt: 'blueDeep', pattern: 0 } });
}

function consist(k: Kit, z: number, s0: number, body: Col): number {
  const route = k.street(
    [
      [RIDE_X0, RIDE_Y, z],
      [RIDE_X0 + 1, RIDE_Y, z],
      [RIDE_X1 - 1, RIDE_Y, z],
      [RIDE_X1, RIDE_Y, z],
    ],
    0,
  );
  const m = k.onRoute(route, s0 * route.length, TRAM_SPEED);
  k.dynamic('tram.car', m, { z: CAR_Z, tint: body });
  k.dynamic('tram.car', m, { z: -CAR_Z, rot: Math.PI, tint: body });
  k.dynamic('tram.trailer', m, { tint: body });
  carRiders(k, m, CAR_Z, 0);
  carRiders(k, m, -CAR_Z, Math.PI);
  k.seated('tram.trailer', { x: 0, z: 0 }, { motion: m, place: false, fill: 0.72, clips: ['sit', 'sit.talk', 'sit.eat', 'sit', 'sit.crossed'] });
  k.person({ x: 0, y: 0.75, z: 3.55, heading: Math.PI, motion: m, clip: 'talk', look: { hat: 'hat.officer', hatTint: 'coral', shirt: 'blue', pattern: 0 } });
  return m;
}

/** Builds both trams and returns the motion ids (north track, south track). */
export function trams(k: Kit): readonly [number, number] {
  const north = consist(k, TRACKS[0], 0, 'coral');
  const south = consist(k, TRACKS[1], 0.5, 'blue');
  return [north, south];
}
