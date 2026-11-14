/**
 * Clip and character-option lookups for the café district. The clip and wardrobe libraries land
 * independently, so every staged clip / option goes through these helpers: the first id that is
 * registered wins, and a safe base clip is the last resort (never an unknown id).
 */
import { ACTIVE_CLIPS } from '../../../crowd/clips/active/index';
import { BASE_CLIPS } from '../../../crowd/clips/base';
import { EVERYDAY_CLIPS } from '../../../crowd/clips/everyday/index';
import { BASIC_OPTIONS } from '../../../crowd/options/basic';
import { EXTRA_OPTION_LIST } from '../../../crowd/options/extra';
import type { ClipDef } from '../../../crowd/pose';

const CLIPS = new Map<string, ClipDef>([...BASE_CLIPS, ...EVERYDAY_CLIPS, ...ACTIVE_CLIPS].map((c) => [c.id, c]));
const OPTIONS = new Set<string>([...BASIC_OPTIONS, ...EXTRA_OPTION_LIST].map((o) => o.key));

/** First registered clip id among the candidates (the last candidate should be a base clip). */
export function clip(...ids: readonly string[]): string {
  for (const id of ids) if (CLIPS.has(id)) return id;
  return 'stand';
}

/** Registered option key, or null when the wardrobe item does not exist (yet). */
export function opt(...keys: readonly string[]): string | null {
  for (const key of keys) if (OPTIONS.has(key)) return key;
  return null;
}

/** Registered option keys only (for `hold: [...]`). */
export function opts(...keys: readonly string[]): string[] {
  return keys.filter((key) => OPTIONS.has(key));
}

/**
 * A locomotion clip for a route rider plus the playback speed that keeps its feet planted at
 * `metresPerSecond` (kit rate = speed / duration; one gait cycle covers `stride` metres).
 */
export function gait(metresPerSecond: number, ...ids: readonly string[]): { clip: string; speed: number } {
  const id = [...ids, 'walk'].find((c) => CLIPS.get(c)?.stride) ?? 'walk';
  const def = CLIPS.get(id);
  const stride = def?.stride ?? 1.42;
  const duration = def?.duration ?? 1.05;
  return { clip: id, speed: (metresPerSecond * duration) / stride };
}

/** Baker's whites: the toque when the hat library has it, otherwise a plain ivory cap. */
export const BAKER_HAT = opt('hat.toque', 'hat.baker', 'hat.cap');
