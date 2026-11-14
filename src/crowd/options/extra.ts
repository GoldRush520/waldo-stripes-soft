/**
 * Extra character options beyond basic.ts: wardrobe (hair, hats, face, beards, garments, back,
 * neck, two-handed carries) and held props for either hand. Geometry is built once at module load.
 */
import type { RigOption } from '../rig';
import { WARDROBE_OPTIONS } from './wardrobe/index';
import { HELD_OPTIONS } from './held/index';

export const EXTRA_OPTION_LIST: readonly RigOption[] = [...WARDROBE_OPTIONS, ...HELD_OPTIONS];
