/**
 * Craft & construction yard — shared plan constants and small staging helpers.
 *
 * District-local plan (anchor -119,-16; rotation 0). The polygon is an L: the wide northern block
 * x ∈ [-16, 18], z ∈ [-40, 7] and the southern leg x ∈ [-16, 11], z ∈ [7, 40].
 *   - north edge: a row of workshop houses (z ≈ -34.5) with a back lane in front of it (z ≈ -30);
 *   - construction site (x -1..15, z -29..-13) with the tower crane mast at the timber yard corner;
 *   - timber yard (x -13.5..-3, z -29..-16);
 *   - Yard Street, the east-west lane (z ≈ -9) joining the café lanes;
 *   - the work yard (z -6..4.5): carpenters (west), painter's plaza (centre), smithy (east);
 *   - the craft leg: workshop row on the west (x ≈ -10.5), a north-south lane (x ≈ -6) and the
 *     potters, sculptor, weavers, dyers, basket makers and sign painter on the east side.
 */
import { ACTIVE_CLIPS } from '../../../crowd/clips/active/index';
import { BASE_CLIPS } from '../../../crowd/clips/base';
import { EVERYDAY_CLIPS } from '../../../crowd/clips/everyday/index';
import type { Look } from '../../../crowd/look';
import type { Kit } from '../../kit';

export const PI = Math.PI;

const KNOWN_CLIPS: ReadonlySet<string> = new Set([...BASE_CLIPS, ...EVERYDAY_CLIPS, ...ACTIVE_CLIPS].map((c) => c.id));

/**
 * The craft-specific clip when the clip library registers it, else a registered stand-in that reads
 * similarly (the crowd libraries land independently of this district).
 */
export function clip(id: string, fallback: string): string {
  return KNOWN_CLIPS.has(id) ? id : fallback;
}

/** Tower crane mast centre; the jib runs along +x from the mast at JIB_Y. */
export const CRANE = { x: -9, z: -13.5 } as const;
export const MAST_HALF = 0.8;
export const JIB_Y = 0.6 + 22 + 0.5;

/** The brick building being raised behind the scaffold. */
export const SITE = { x: 3.5, z: -25, w: 8, d: 6 } as const;

/** Lanes (district-local). */
export const YARD_STREET_Z = -9;
export const LEG_LANE_X = -6;
export const BACK_LANE_Z = -30;

export type Rect = ReadonlyArray<readonly [number, number]>;

/** Axis-aligned rectangle polygon centred on (x, z). */
export function rect(x: number, z: number, w: number, d: number): Rect {
  return [
    [x - w / 2, z - d / 2],
    [x + w / 2, z - d / 2],
    [x + w / 2, z + d / 2],
    [x - w / 2, z + d / 2],
  ];
}

/** Hard hat + hi-vis butter shirt for site crews. */
export const HARD_HAT: Partial<Look> = { hat: 'hat.hard', hatTint: 'butter', shirt: 'butter', shirt2: 'coral', pattern: 5, pants: 'blueDeep' };

/** Craftsman's working look (apron added through `hold`). */
export const SMOCK: Partial<Look> = { shirt: 'ivory', pattern: 0, longSleeves: true, pants: 'clayDeep' };

/** Paint-spatter look: dotted shirts in paint colours. */
export function spattered(k: Kit): Partial<Look> {
  return { pattern: 3, shirt: k.rng.pick(['ivory', 'butterLight', 'blueLight'] as const), shirt2: k.rng.pick(['coral', 'blue', 'butter', 'sage'] as const), patternScale: 1.4 };
}

/** Register a small standing surface (deck patch) around a raised person or object top. */
export function pad(k: Kit, x: number, z: number, y: number, w = 0.8, d = 0.8): void {
  k.surface('deck', rect(x, z, w, d), y);
}

/**
 * Declare a fair hero spot near (x, z): the first free point on a small spiral that has ~0.6 m of
 * clear ground around it.
 */
export function spotNear(k: Kit, x: number, z: number, heading: number): void {
  for (let r = 0; r <= 3; r += 0.3) {
    for (let a = 0; a < PI * 2; a += 0.7) {
      const px = x + Math.sin(a) * r;
      const pz = z + Math.cos(a) * r;
      if (k.isFree(px, pz, 0.62)) {
        k.targetSpot(px, pz, 0, heading);
        return;
      }
    }
  }
}
