/**
 * Sports & playground strip — shared plan and staging helpers.
 *
 * District-local metres (anchor world 80,32, rotation 0). The usable strip is z ∈ [-9.5, 9.5]
 * (funfair to the north, beach promenade to the south) and x ∈ [-78, 52.5]; the far west tail
 * narrows to z ≤ 3.5. West -> east the strip is a sequence of separate venues:
 *   skate & wheels corner | playground | football pitch | the green (tug-of-war, yoga) |
 *   tennis court | basketball half-court, with a two-lane running track along the south edge.
 */
import type { Col, Geo } from '../../../core/geo';
import { sphere, translate } from '../../../core/geo';
import type { Age, Look } from '../../../crowd/look';
import { hasProp, propDef } from '../../../props/registry';
import type { At, Hold, Kit } from '../../kit';

export const SKATE = { x0: -78, x1: -56, ramp: { x: -65.5, z: -6.6 }, tramp: { x: -73.2, z: -5.4 } } as const;
export const PLAY = { x0: -52.5, x1: -29.5 } as const;
export const PITCH = { cx: -14, cz: -0.8, w: 20, d: 12 } as const;
export const GREEN = { x0: 0, x1: 15 } as const;
export const TENNIS = { cx: 29.5, cz: -1, len: 23.77, wid: 10.97 } as const;
export const HOOPS = { x0: 43.4, x1: 52.6, hoop: { x: 51.6, z: -2 } } as const;
/** running-track lanes (outbound / return) along the south edge */
export const TRACK_Z: readonly [number, number] = [7.9, 9.1];

/** sitting hip height above the feet for a scale-1 person */
const HIP = 0.47;

/** Small bespoke balls for tossed / rolling play. */
export const TENNIS_BALL: Geo = translate(sphere(0.04, 'butterLight', 6, 4), 0, 0.04, 0);

export interface RideOpts {
  readonly clips?: readonly string[];
  readonly age?: Age;
  readonly fill?: number;
  readonly look?: (i: number) => Partial<Look>;
  readonly hold?: (i: number) => readonly Hold[];
  /** playback speed multiplier (riders of locomotion clips pass travel speed / stride) */
  readonly speed?: number;
}

/**
 * People on the seat anchors of a registered prop. With `motion` the anchors are local to that
 * motion frame (riders locked to a moving ride), otherwise they are relative to `at`. Hip height
 * follows each person's own scale so children sit ON the seat instead of sinking through it.
 */
export function ride(k: Kit, key: string, at: At, motion: number | undefined, opts: RideOpts = {}): number[] {
  if (!hasProp(key)) {
    k.prop(key, at);
    return [];
  }
  const def = propDef(key);
  const feet = def.tags?.includes('seat:feet') ?? false;
  const age = opts.age ?? 'adult';
  const s = at.scale ?? 1;
  const ids: number[] = [];
  (def.seats ?? []).forEach((seat, i) => {
    if (!k.rng.chance(opts.fill ?? 1)) return;
    const scale = age === 'child' ? k.rng.range(0.58, 0.7) : age === 'teen' ? k.rng.range(0.82, 0.9) : k.rng.range(0.94, 1.05);
    const p = k.rel({ x: at.x, z: at.z, rot: at.rot }, seat.x * s, seat.z * s, seat.heading);
    ids.push(
      k.person({
        x: p.x,
        z: p.z,
        y: (at.y ?? 0) + seat.y * s - (feet ? 0 : HIP * scale),
        heading: p.heading,
        motion,
        age,
        clip: k.rng.pick(opts.clips ?? [feet ? 'stand' : 'sit']),
        look: { scale, ...opts.look?.(i) },
        hold: opts.hold?.(i),
        speed: opts.speed,
        blob: motion === undefined && feet ? 1 : 0,
      }),
    );
  });
  return ids;
}

/**
 * A static seat prop (bench, bleachers) that people sit on: the prop does not block its seat
 * line, only a strip behind it (`back` = [centre z, depth] in prop space), so seated people are
 * not reported inside a footprint while walkers and fills still keep clear of the back.
 */
export function seatProp(k: Kit, key: string, at: At, back: readonly [number, number], opts: RideOpts = {}): number[] {
  k.prop(key, at, { walkThrough: true });
  if (!hasProp(key)) return [];
  const def = propDef(key);
  const c = k.rel({ x: at.x, z: at.z, rot: at.rot }, 0, back[0]);
  k.block(c.x, c.z, def.footprint[0], back[1], at.rot ?? 0);
  return ride(k, key, at, undefined, opts);
}

/** A row of trees across the strip (north -> south) with a deliberate gap for a path. */
export function treeLine(k: Kit, x: number, zs: readonly number[], keys: readonly string[]): void {
  zs.forEach((z, i) => {
    const key = keys[i % keys.length] ?? 'tree.round.m';
    k.prop(key, { x: x + k.rng.range(-0.4, 0.4), z, rot: k.rng.range(0, 6.28) });
  });
}

/** Axis-aligned local rectangle as a ground polygon. */
export function rect(x0: number, z0: number, x1: number, z1: number): Array<[number, number]> {
  return [
    [x0, z0],
    [x1, z0],
    [x1, z1],
    [x0, z1],
  ];
}

/** Yaw for a toss motion whose local +x runs from a to b. */
export function tossYaw(a: readonly [number, number], b: readonly [number, number]): number {
  return Math.atan2(-(b[1] - a[1]), b[0] - a[0]);
}

export const TEAM_A: Partial<Look> = { shirt: 'blue', shirt2: 'ivory', pattern: 2, pants: 'ivory', longLegs: false, longSleeves: false };
export const TEAM_B: Partial<Look> = { shirt: 'butter', shirt2: 'coral', pattern: 5, pants: 'sageDeep', longLegs: false, longSleeves: false };
export const SPORT_TINTS: readonly Col[] = ['coral', 'butter', 'blue', 'sage', 'coralDeep', 'blueDeep'];
