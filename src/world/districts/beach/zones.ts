/**
 * Reserved sand zones (local x range + sand fraction range) used by landmarks and microstories, so
 * the procedural beach cells and fills keep out of them.
 */
import { UNDER_PIER } from './frame';

export interface Zone {
  readonly id: string;
  readonly x0: number;
  readonly x1: number;
  readonly t0: number;
  readonly t1: number;
  /** true when even small standing groups must keep out (play areas, ride routes, the pier) */
  readonly clear?: boolean;
}

export const ZONES: readonly Zone[] = [
  { id: 'rockpool', x0: -73, x1: -63, t0: 0.5, t1: 0.95 },
  { id: 'huts-west', x0: -72, x1: -59, t0: 0, t1: 0.3 },
  { id: 'sculpture', x0: -57, x1: -45, t0: 0.18, t1: 0.72 },
  { id: 'volleyball', x0: -42, x1: -24, t0: 0.28, t1: 0.84, clear: true },
  { id: 'lifeguard', x0: -23, x1: -16, t0: 0.55, t1: 1 },
  { id: 'buried-dad', x0: -13, x1: -5, t0: 0.22, t1: 0.5 },
  { id: 'umbrella-chase', x0: -16, x1: 11, t0: 0.54, t1: 0.74, clear: true },
  { id: 'sandcastle', x0: -3, x1: 7, t0: 0.76, t1: 1 },
  { id: 'pier', x0: UNDER_PIER[0], x1: UNDER_PIER[1], t0: -0.1, t1: 1.1, clear: true },
  { id: 'huts-east', x0: 22.5, x1: 54, t0: 0, t1: 0.26 },
  { id: 'donkeys', x0: 24, x1: 51, t0: 0.36, t1: 0.62, clear: true },
  { id: 'lifeguard-east', x0: 38, x1: 44, t0: 0.66, t1: 1 },
];

/** Stair landings at the foot of the sea wall stay clear. */
export function inZone(x: number, t: number, margin = 0, stairs: readonly number[] = [], clearOnly = false): boolean {
  if (stairs.some((s) => Math.abs(s - x) < 2.4 + margin && t < 0.16)) return true;
  return ZONES.some((z) => (!clearOnly || z.clear === true) && x > z.x0 - margin && x < z.x1 + margin && t > z.t0 - margin * 0.05 && t < z.t1 + margin * 0.05);
}

export function zone(id: string): Zone {
  const z = ZONES.find((q) => q.id === id);
  if (!z) throw new Error(`Unknown beach zone ${id}`);
  return z;
}
