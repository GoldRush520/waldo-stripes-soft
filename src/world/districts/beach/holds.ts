/**
 * Held props and accessories for beach characters. Keys are checked against the registered
 * character options so a prop that has not landed in the option library is simply left out
 * (the person still reads through clip and wardrobe) instead of producing a build warning.
 */
import { BASIC_OPTIONS } from '../../../crowd/options/basic';
import { EXTRA_OPTION_LIST } from '../../../crowd/options/extra';
import type { Col } from '../../../core/geo';
import type { Hold } from '../../kit';

const KNOWN = new Set<string>([...BASIC_OPTIONS, ...EXTRA_OPTION_LIST].map((o) => o.key));

export const HOLD = {
  rod: 'hold.rod',
  bucket: 'hold.bucket',
  spade: 'hold.spade',
  icecream: 'hold.icecream',
  cone: 'hold.cone',
  camera: 'neck.camera',
  binoculars: 'neck.binoculars',
  whistle: 'neck.whistle',
  accordion: 'hold.accordion',
  ball: 'hold.ball',
  towel: 'hold.towel',
  lifejacket: 'upper.lifejacket',
  swimring: 'lower.swimring',
  clipboard: 'hold.clipboard',
  rope: 'hold.rope',
  bag: 'hold.bag',
  balloon: 'hold.balloon',
  umbrella: 'hold.umbrella',
  stick: 'hold.stick',
  apron: 'upper.apron',
  pack: 'back.pack',
} as const;

/** True when an option key is registered right now. */
export function hasOption(key: string): boolean {
  return KNOWN.has(key);
}

/** Hold list containing only the registered keys (first available alternative per entry). */
export function hold(...wanted: ReadonlyArray<string | readonly string[] | { key: string; tint?: Col }>): Hold[] {
  const out: Hold[] = [];
  for (const w of wanted) {
    if (typeof w === 'string') {
      if (KNOWN.has(w)) out.push(w);
    } else if (Array.isArray(w)) {
      const found = (w as readonly string[]).find((k) => KNOWN.has(k));
      if (found) out.push(found);
    } else {
      const t = w as { key: string; tint?: Col };
      if (KNOWN.has(t.key)) out.push(t.tint ? { key: t.key, tint: t.tint } : t.key);
    }
  }
  return out;
}

/** An option key when registered, otherwise null (for hats / glasses / lower garments). */
export function opt(key: string): string | null {
  return KNOWN.has(key) ? key : null;
}
