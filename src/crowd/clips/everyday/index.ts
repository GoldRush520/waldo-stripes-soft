/**
 * Everyday / social / service clip library. Clip ids are dotted `family.variant`; the family table
 * is derived from the ids so it can never list a clip that does not exist.
 */
import type { ClipDef } from '../../pose';
import { CARRY_CLIPS_ALL } from './carry';
import { CHORE_CLIPS } from './chores';
import { COMEDY_CLIPS } from './comedy';
import { GESTURE_CLIPS } from './gestures';
import { IDLE_CLIPS } from './idle';
import { KID_CLIPS_ALL } from './kids';
import { READ_EAT_CLIPS } from './readEat';
import { SIT_CLIPS_ALL } from './sit';
import { SOCIAL_CLIPS } from './social';
import { TRADE_CLIPS } from './trade';
import { WALK_CLIPS } from './walks';

export const EVERYDAY_CLIPS: readonly ClipDef[] = [
  ...IDLE_CLIPS,
  ...SOCIAL_CLIPS,
  ...GESTURE_CLIPS,
  ...READ_EAT_CLIPS,
  ...SIT_CLIPS_ALL,
  ...TRADE_CLIPS,
  ...CARRY_CLIPS_ALL,
  ...CHORE_CLIPS,
  ...KID_CLIPS_ALL,
  ...WALK_CLIPS,
  ...COMEDY_CLIPS,
];

const familyOf = (id: string): string => id.slice(0, id.indexOf('.'));

/** activity family name -> clip ids (in authoring order) */
export const EVERYDAY_FAMILIES: Readonly<Record<string, readonly string[]>> = EVERYDAY_CLIPS.reduce<
  Readonly<Record<string, readonly string[]>>
>((acc, clip) => {
  const fam = familyOf(clip.id);
  return { ...acc, [fam]: [...(acc[fam] ?? []), clip.id] };
}, {});
