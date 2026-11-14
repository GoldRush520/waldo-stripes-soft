/** Held props for the right hand (`hold.*`) and the left hand (`holdL.*`). */
import type { RigOption } from '../../rig';
import { heldOptions } from './grip';
import { ALOFT_PROPS } from './aloft';
import { FOOD_PROPS } from './food';
import { KITCHEN_PROPS } from './kitchen';
import { WATERSIDE_PROPS } from './waterside';
import { TOOL_PROPS } from './tools';
import { MUSIC_PROPS } from './music';
import { PLAY_PROPS } from './play';
import { EVERYDAY_PROPS } from './everyday';

export const HELD_OPTIONS: readonly RigOption[] = heldOptions([
  ...ALOFT_PROPS,
  ...FOOD_PROPS,
  ...KITCHEN_PROPS,
  ...WATERSIDE_PROPS,
  ...TOOL_PROPS,
  ...MUSIC_PROPS,
  ...PLAY_PROPS,
  ...EVERYDAY_PROPS,
]);
