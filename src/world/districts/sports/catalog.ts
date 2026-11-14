/**
 * Clip / option resolution for the sports district. The clip and wardrobe libraries are shared and
 * keep growing, so every staged action names its preferred ids in order and takes the first one
 * that is registered (the same lists the town feeds into the pose library and the option map).
 * This keeps the district free of unknown-id build warnings while still using the most specific
 * action available.
 */
import { ACTIVE_CLIPS } from '../../../crowd/clips/active/index';
import { BASE_CLIPS } from '../../../crowd/clips/base';
import { EVERYDAY_CLIPS } from '../../../crowd/clips/everyday/index';
import { BASIC_OPTIONS } from '../../../crowd/options/basic';
import { EXTRA_OPTION_LIST } from '../../../crowd/options/extra';
import type { Col } from '../../../core/geo';
import type { Hold } from '../../kit';

const ALL_CLIPS = [...BASE_CLIPS, ...EVERYDAY_CLIPS, ...ACTIVE_CLIPS];
const CLIP_IDS: ReadonlySet<string> = new Set(ALL_CLIPS.map((c) => c.id));
const STRIDES: ReadonlyMap<string, number> = new Map(ALL_CLIPS.filter((c) => c.stride).map((c) => [c.id, c.stride ?? 1.4]));
const OPTION_KEYS: ReadonlySet<string> = new Set([...BASIC_OPTIONS, ...EXTRA_OPTION_LIST].map((o) => o.key));

/** First registered static (non-locomotion) clip of the list, else `stand`. */
export function clip(...ids: readonly string[]): string {
  return ids.find((id) => CLIP_IDS.has(id) && !STRIDES.has(id)) ?? 'stand';
}

/** First registered locomotion clip of the list, else `walk`. */
export function gait(...ids: readonly string[]): string {
  return ids.find((id) => STRIDES.has(id)) ?? 'walk';
}

/** First registered clip of any kind (for riders locked to a moving frame), else `fallback`. */
export function rideClip(fallback: string, ...ids: readonly string[]): string {
  return ids.find((id) => CLIP_IDS.has(id)) ?? fallback;
}

/** Metres travelled per loop of a locomotion clip. */
export function strideOf(id: string): number {
  return STRIDES.get(id) ?? 1.4;
}

/** First registered option key of the list, or null. */
export function opt(...keys: readonly string[]): string | null {
  return keys.find((key) => OPTION_KEYS.has(key)) ?? null;
}

export type GearChoice = string | readonly string[] | { readonly keys: readonly string[]; readonly tint: Col };

const isList = (c: GearChoice): c is readonly string[] => Array.isArray(c);

/** Held / worn extras: each entry is a key or a preference list; unresolvable entries are dropped. */
export function gear(...choices: readonly GearChoice[]): Hold[] {
  return choices.flatMap((c): Hold[] => {
    if (typeof c === 'string') return OPTION_KEYS.has(c) ? [c] : [];
    if (isList(c)) {
      const key = opt(...c);
      return key ? [key] : [];
    }
    const key = opt(...c.keys);
    return key ? [{ key, tint: c.tint }] : [];
  });
}
