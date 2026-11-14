/** Rider helpers: people locked to a moving ride frame, sitting on the ride prop's seat anchors. */
import type { Age } from '../../../crowd/look';
import { hasProp, propDef } from '../../../props/registry';
import type { Hold, Kit } from '../../kit';

/** Hip height above the seat anchor for the `sit*` clips (matches Kit.seated). */
const HIP = 0.47;

export interface RideOpts {
  /** offset of the prop inside the motion frame */
  readonly at?: { readonly x?: number; readonly y?: number; readonly z?: number; readonly rot?: number };
  readonly fill?: number;
  readonly clips?: readonly string[];
  readonly ages?: readonly Age[];
  readonly hold?: (k: Kit) => readonly Hold[] | undefined;
  /** only use these seat indices (default: all) */
  readonly seats?: readonly number[];
}

/**
 * Seat riders on a moving prop's seat anchors (prop space -> motion frame). Returns the person ids.
 * The prop itself must be attached separately with `k.dynamic(key, motion, at)`.
 */
export function ride(k: Kit, key: string, motion: number, opts: RideOpts = {}): number[] {
  if (!hasProp(key)) return [];
  const seats = propDef(key).seats ?? [];
  const at = opts.at ?? {};
  const r = at.rot ?? 0;
  const c = Math.cos(r);
  const s = Math.sin(r);
  const ids: number[] = [];
  seats.forEach((seat, i) => {
    if (opts.seats && !opts.seats.includes(i)) return;
    if (!k.rng.chance(opts.fill ?? 0.8)) return;
    ids.push(
      k.person({
        x: (at.x ?? 0) + seat.x * c + seat.z * s,
        y: (at.y ?? 0) + seat.y - HIP,
        z: (at.z ?? 0) - seat.x * s + seat.z * c,
        heading: seat.heading + r,
        motion,
        clip: k.rng.pick(opts.clips ?? ['sit', 'sit.talk', 'sit']),
        age: k.rng.pick(opts.ages ?? ['adult', 'child', 'teen']),
        hold: opts.hold?.(k),
      }),
    );
  });
  return ids;
}
