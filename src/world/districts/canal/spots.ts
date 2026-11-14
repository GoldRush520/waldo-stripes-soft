/**
 * Shared staging plan in canal coordinates (s = metres along the centreline, d = signed metres
 * across, + = east bank). Stories claim these spots; the bank scatter and water dressing keep out.
 */
import type { Opening, Side } from './banks';

export interface Zone {
  readonly s0: number;
  readonly s1: number;
  readonly d0: number;
  readonly d1: number;
}

export const inZone = (z: Zone, s: number, d: number, pad = 0): boolean =>
  s > z.s0 - pad && s < z.s1 + pad && d > Math.min(z.d0, z.d1) - pad && d < Math.max(z.d0, z.d1) + pad;

/** Bridge arc lengths are fixed by bridges.ts; these spots are chosen between them. */
export const SERENADE = { s: 48.5, d: -3.85 } as const;
export const BARGE = { s: 72.2, d: 2.6 } as const;
export const LOST_OAR = { s: 69.8, d: -2.4 } as const;
export const OAR = { s: 74.4, d: -0.9 } as const;
export const TOY_BOATS = { s: 59.2, side: 1 as Side } as const;
export const ANGLERS: readonly { s: number; side: Side; n: number }[] = [
  { s: 27.5, side: 1, n: 3 },
  { s: 100.4, side: -1, n: 2 },
];
export const CAFE = { s0: 62.6, s1: 72.6, d: -7.4 } as const;
export const SCARF_RUN = { s0: 38, s1: 52, d: 7.0 } as const;

/** Railing gaps for staged waterside action (steps add their own). */
export const OPENINGS: readonly Opening[] = [
  ...ANGLERS.map((a) => ({ side: a.side, s: a.s, half: a.n * 0.65 + 0.2 })),
  { side: -1, s: SERENADE.s, half: 1.4 },
  { side: TOY_BOATS.side, s: TOY_BOATS.s, half: 1.0 },
];

/** Land kept free of the generic scatter so the authored scenes stay legible. */
export const STORY_LAND: readonly Zone[] = [
  { s0: 29.2, s1: 31, d0: -8.6, d1: -6 },
  { s0: SCARF_RUN.s0 - 0.5, s1: SCARF_RUN.s1 + 0.5, d0: 6.3, d1: 7.7 },
  { s0: 47, s1: 50.5, d0: -8.8, d1: -5.7 },
  { s0: 56.8, s1: 73.5, d0: -8.8, d1: -5.7 },
  { s0: 57.5, s1: 61, d0: 5.7, d1: 8.8 },
  { s0: 73.2, s1: 75.6, d0: -8.4, d1: -5.7 },
  { s0: 81.8, s1: 86.6, d0: 5.7, d1: 8.8 },
  { s0: 91, s1: 93.8, d0: -8.8, d1: -5.7 },
  { s0: 18.5, s1: 22.5, d0: -8.8, d1: -5.7 },
  { s0: 24.8, s1: 30.2, d0: 5.7, d1: 7.4 },
  { s0: 98.6, s1: 102, d0: -7.4, d1: -5.7 },
  { s0: 41.5, s1: 44.6, d0: 7.7, d1: 8.8 },
];

/** Water claimed by story boats (the dressing pass keeps clear). */
export const STORY_WATER: readonly Zone[] = [
  { s0: SERENADE.s - 3.8, s1: SERENADE.s + 3.8, d0: -5, d1: -3 },
  { s0: BARGE.s - 5, s1: BARGE.s + 5, d0: 1.2, d1: 4.2 },
  { s0: LOST_OAR.s - 2.2, s1: LOST_OAR.s + 2.2, d0: -3.4, d1: -1.4 },
  { s0: OAR.s - 1.6, s1: OAR.s + 1.6, d0: -2, d1: 0.2 },
  { s0: TOY_BOATS.s - 1.2, s1: TOY_BOATS.s + 1.2, d0: 3, d1: 5 },
];

/** Open promenade spots kept clear for the hero (canal coordinates; decks are added by the stories). */
export const LAND_TARGETS: readonly { s: number; d: number }[] = [
  { s: 10.5, d: 7.3 },
  { s: 19.8, d: 7.5 },
  { s: 23.6, d: -7.2 },
  { s: 37.6, d: -7.4 },
  { s: 45, d: -7.4 },
  { s: 51.2, d: -7.6 },
  { s: 64, d: 7.2 },
  { s: 70, d: 7.4 },
  { s: 77, d: -7.2 },
  { s: 82.5, d: -7.4 },
  { s: 88.6, d: 7.3 },
  { s: 103, d: 7.2 },
];
