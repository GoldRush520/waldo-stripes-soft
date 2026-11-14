/** Seat helper: the seat prop never blocks its own sitters (its footprint is the seat itself). */
import type { At, Hold, Kit } from '../../kit';

export function seatOn(
  k: Kit,
  key: string,
  at: At,
  opts: { clips?: readonly string[]; fill?: number; hold?: readonly Hold[] } = {},
): number[] {
  k.prop(key, at, { walkThrough: true });
  return k.seated(key, at, { place: false, clips: opts.clips, fill: opts.fill, hold: opts.hold ? () => opts.hold : undefined });
}
