/**
 * Clip and wardrobe availability. The clip and option libraries land independently of this
 * district, so every specialised clip / option is resolved against what is actually registered:
 * the authored intent is kept in the code and a plain base clip stands in until the library lands.
 */
import { ACTIVE_CLIPS } from '../../../crowd/clips/active/index';
import { BASE_CLIPS } from '../../../crowd/clips/base';
import { EVERYDAY_CLIPS } from '../../../crowd/clips/everyday/index';
import { BASIC_OPTIONS } from '../../../crowd/options/basic';
import { EXTRA_OPTION_LIST } from '../../../crowd/options/extra';
import type { Hold } from '../../kit';

const CLIPS = new Set<string>([...BASE_CLIPS, ...EVERYDAY_CLIPS, ...ACTIVE_CLIPS].map((c) => c.id));
const OPTIONS = new Set<string>([...BASIC_OPTIONS, ...EXTRA_OPTION_LIST].map((o) => o.key));

/** The first registered clip id of the list (the last entry should be a base clip). */
export function clip(...ids: readonly string[]): string {
  return ids.find((id) => CLIPS.has(id)) ?? 'stand';
}

/** The first registered option key of the list, or null. */
export function opt(...keys: readonly string[]): string | null {
  return keys.find((key) => OPTIONS.has(key)) ?? null;
}

/** Held / worn extras filtered to the registered ones. */
export function holds(...items: readonly Hold[]): Hold[] {
  return items.filter((h) => OPTIONS.has(typeof h === 'string' ? h : h.key));
}
