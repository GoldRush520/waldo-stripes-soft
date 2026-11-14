/**
 * Casting helpers for the rooftops district: pick the most expressive clip / wardrobe option that is
 * actually registered (the clip and option libraries are assembled from the same lists the town
 * uses), falling back to a basic one so the district never produces unknown-id build warnings.
 */
import { ACTIVE_CLIPS } from '../../../crowd/clips/active/index';
import { BASE_CLIPS } from '../../../crowd/clips/base';
import { EVERYDAY_CLIPS } from '../../../crowd/clips/everyday/index';
import { BASIC_OPTIONS } from '../../../crowd/options/basic';
import { EXTRA_OPTION_LIST } from '../../../crowd/options/extra';
import type { Hold } from '../../kit';

const CLIP_IDS: ReadonlySet<string> = new Set([...BASE_CLIPS, ...EVERYDAY_CLIPS, ...ACTIVE_CLIPS].map((c) => c.id));
const OPTION_KEYS: ReadonlySet<string> = new Set([...BASIC_OPTIONS, ...EXTRA_OPTION_LIST].map((o) => o.key));

/** First registered clip id among the candidates (the last one should be a base clip). */
export function clip(...ids: readonly string[]): string {
  return ids.find((id) => CLIP_IDS.has(id)) ?? 'stand';
}

/** First registered option key among the candidates, or null when none exists. */
export function opt(...keys: readonly string[]): string | null {
  return keys.find((key) => OPTION_KEYS.has(key)) ?? null;
}

/** Held / worn extras filtered to registered option keys. */
export function holds(...items: readonly Hold[]): Hold[] {
  return items.filter((h) => OPTION_KEYS.has(typeof h === 'string' ? h : h.key));
}
