/** Wardrobe options: hair, hats, face, beards, garments, back, neck and two-handed carries. */
import type { RigOption } from '../../rig';
import { HAIR_OPTIONS } from './hair';
import { BRIM_HATS } from './hats-brim';
import { SOFT_HATS } from './hats-soft';
import { FACE_OPTIONS } from './face';
import { LOWER_OPTIONS } from './lower';
import { VEST_OPTIONS } from './upper-vests';
import { COAT_OPTIONS } from './upper-coats';
import { BACK_OPTIONS } from './back';
import { NECK_OPTIONS } from './neck';
import { MUSIC_CARRIES } from './special-music';
import { LOAD_CARRIES } from './special-loads';

export const WARDROBE_OPTIONS: readonly RigOption[] = [
  ...HAIR_OPTIONS,
  ...BRIM_HATS,
  ...SOFT_HATS,
  ...FACE_OPTIONS,
  ...LOWER_OPTIONS,
  ...VEST_OPTIONS,
  ...COAT_OPTIONS,
  ...BACK_OPTIONS,
  ...NECK_OPTIONS,
  ...MUSIC_CARRIES,
  ...LOAD_CARRIES,
];
