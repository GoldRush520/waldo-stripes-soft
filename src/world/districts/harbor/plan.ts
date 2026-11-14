/**
 * Harbour master plan (district-local metres, anchor = world (-78, 38), rotation 0).
 *
 * Land is the quay strip z ∈ [-14, 0]; the harbour basin (water y = -1) lies at z > 0. From north to
 * south the quay reads: a terrace of harbour houses (backs at z = -11.5, fronts at z = -6.5), a narrow
 * shopfront strip, the promenade lane (z ≈ -3.9), and the busy quay edge (z ∈ [-3, 0]) with cranes,
 * crates and spectators. Three jetties reach south, a breakwater leaves the west end of the quay and
 * turns east to the lighthouse, and the boat parade loops round the middle of the basin.
 *
 * This module also resolves clip ids and wardrobe keys against the libraries that are loaded, so the
 * district stays warning-free while those libraries grow: every staged action names its preferred
 * clip first and a plain fallback after it.
 */
import { ACTIVE_CLIPS } from '../../../crowd/clips/active/index';
import { BASE_CLIPS } from '../../../crowd/clips/base';
import { EVERYDAY_CLIPS } from '../../../crowd/clips/everyday/index';
import { BASIC_OPTIONS } from '../../../crowd/options/basic';
import { EXTRA_OPTION_LIST } from '../../../crowd/options/extra';
import type { ClipDef } from '../../../crowd/pose';
import type { Hold } from '../../kit';

export const WATER = -1;
/** hip height above a seat anchor used by the kit for seated people */
export const HIP = 0.47;

export const HOUSE_Z = -9;
export const HOUSE_D = 5;
export const FRONT_Z = HOUSE_Z + HOUSE_D / 2;
/** promenade walking lane */
export const LANE_Z = -3.9;
/** quay edge strip where spectators line the water */
export const EDGE_Z = -0.55;
export const QUAY_Y = 0.05;

export const HOUSES_X0 = -41;
export const HOUSES_X1 = 37;
/** alleys from the market down to the quay (x ranges kept free of houses) */
export const ALLEYS: ReadonlyArray<readonly [number, number]> = [
  [-15, -11.6],
  [12.2, 15.4],
];

export interface JettySpec {
  readonly x: number;
  readonly len: number;
  readonly tee: boolean;
}
export const JETTY_Y = 0.3;
export const JETTY_W = 2.2;
export const JETTIES: readonly JettySpec[] = [
  { x: -30, len: 14, tee: false },
  { x: -4, len: 14, tee: true },
  { x: 22, len: 14, tee: false },
];
/** T-head landing stage across the end of the middle jetty */
export const TEE = { x: -4, z: 14.95, len: 8, w: 1.8 } as const;

/** centres of the quay-wall pieces that carry a flight of steps (steps descend at their +x end) */
export const STEP_XS: readonly number[] = [-22.6, 1.4, 25.4];

export const BOATHOUSE = { x: -46, z: -4 } as const;
export const LOOKOUT = { x: 42, z: -3.6 } as const;
export const CRANES = [
  { x: 9.5, z: -2.2 },
  { x: 30.5, z: -2.2 },
] as const;

/** breakwater crest path: south from the quay along x = BW_X, then east to the lighthouse */
export const BW_X = -52;
export const BW_Z = 46;
export const BW_END_X = -37.6;
export const PATH_Y = 0.3;
export const LIGHTHOUSE = { x: -34, z: 46 } as const;

/** boat-parade ellipse */
export const PARADE = { cx: 6, cz: 25, rx: 33, rz: 7.5, speed: 1.05 } as const;

/* ------------------------------------------------------------------ library resolution */

const CLIP_DEFS = new Map<string, ClipDef>([...BASE_CLIPS, ...EVERYDAY_CLIPS, ...ACTIVE_CLIPS].map((c) => [c.id, c]));
const OPTION_KEYS = new Set<string>([...BASIC_OPTIONS, ...EXTRA_OPTION_LIST].map((o) => o.key));

/** First clip id that exists and is not locomotion (for people standing in place). */
export function act(...ids: readonly string[]): string {
  return ids.find((id) => {
    const c = CLIP_DEFS.get(id);
    return c !== undefined && !c.stride;
  }) ?? 'stand';
}

/** First locomotion clip that exists (for route riders). */
export function gait(...ids: readonly string[]): string {
  return ids.find((id) => (CLIP_DEFS.get(id)?.stride ?? 0) > 0) ?? 'walk';
}

/** Playback speed that keeps a locomotion clip's feet in step with a route speed in m/s. */
export function gaitSpeed(id: string, metresPerSecond: number): number {
  const c = CLIP_DEFS.get(id);
  if (!c?.stride) return 1;
  return (metresPerSecond * c.duration) / c.stride;
}

/** Wardrobe key if it exists, otherwise the fallback (which may be null). */
export function opt(key: string, fallback: string | null = null): string | null {
  return OPTION_KEYS.has(key) ? key : fallback !== null && OPTION_KEYS.has(fallback) ? fallback : null;
}

/** Held / worn extras filtered to the keys that exist. */
export function holds(...items: readonly Hold[]): Hold[] {
  return items.filter((h) => OPTION_KEYS.has(typeof h === 'string' ? h : h.key));
}

/** Pick the first existing key among alternatives as a single hold (or nothing). */
export function holdOne(...keys: readonly string[]): Hold[] {
  const k = keys.find((x) => OPTION_KEYS.has(x));
  return k ? [k] : [];
}
