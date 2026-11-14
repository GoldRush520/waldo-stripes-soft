/**
 * Seeded appearance generation. A Look is a compact, anatomy- and context-aware description of one
 * person; `lookToRecord` turns it into the GPU record.
 */
import type { ColorName, RGB } from '../core/palette';
import type { Rng } from '../core/rng';
import { CAT_COUNT, Cat, Pattern, type PatternId } from './skeleton';
import type { ClipRef, PaletteStore, PersonRecord } from './stores';

export type Col = ColorName | RGB;

export interface Look {
  readonly skin: number;
  readonly hairTone: number;
  readonly hairStyle: string | null;
  readonly hat: string | null;
  readonly hatTint: Col;
  readonly glasses: string | null;
  readonly shirt: Col;
  readonly shirt2: Col;
  readonly pattern: PatternId;
  readonly patternScale: number;
  readonly longSleeves: boolean;
  readonly pants: Col;
  readonly longLegs: boolean;
  readonly lower: string | null;
  readonly shoes: Col;
  readonly face: number;
  readonly build: number;
  readonly scale: number;
  readonly headScale: number;
  /** extra option keys (held props, backpack, apron...) with optional tints */
  readonly extras: ReadonlyArray<{ readonly key: string; readonly cat: number; readonly tint?: Col }>;
}

const SHIRTS: readonly Col[] = [
  'coral', 'ivory', 'blue', 'butter', 'sage', 'clay', 'coralLight', 'blueLight', 'butterLight', 'sageLight',
  'coralDeep', 'blueDeep', 'sageDeep', 'clayDeep', 'butterDeep', 'white', 'ivoryShade',
];
const PANTS: readonly Col[] = ['blueDeep', 'clayDeep', 'cocoa', 'slate', 'ivoryShade', 'sageDeep', 'timber', 'blue', 'clay', 'timberDeep', 'butterDeep'];
const SHOES: readonly Col[] = ['cocoa', 'ink', 'timberDeep', 'ivory', 'coralDeep', 'blueDeep', 'timber'];
const HAIR_STYLES: readonly (string | null)[] = ['hair.short', 'hair.short', 'hair.long', 'hair.bob', 'hair.bun', 'hair.ponytail', 'hair.curly', null];
const HATS: readonly string[] = ['hat.sun', 'hat.cap', 'hat.beret', 'hat.boater', 'hat.beanie', 'hat.top', 'hat.sailor', 'hat.bobble'];
const HAT_TINTS: readonly Col[] = ['coral', 'blue', 'butter', 'sage', 'clay', 'ivory', 'blueDeep', 'coralDeep'];

export type Age = 'adult' | 'child' | 'teen' | 'elder';

/** A plausible random townsperson. Never produces the hero's full identifying combination. */
export function randomLook(rng: Rng, age: Age = 'adult'): Look {
  const child = age === 'child';
  const pattern = rng.weighted<PatternId>(
    [Pattern.Solid, Pattern.HStripe, Pattern.VStripe, Pattern.Dots, Pattern.Check, Pattern.Block, Pattern.WideStripe],
    [52, 9, 6, 7, 7, 10, 6],
  );
  const shirt = rng.pick(SHIRTS);
  let shirt2 = rng.pick(SHIRTS);
  if (shirt2 === shirt) shirt2 = shirt === 'ivory' ? 'blue' : 'ivory';
  const skirt = rng.chance(0.24);
  const hat = rng.chance(0.3) ? rng.pick(HATS) : null;
  const stripedCoral = pattern === Pattern.HStripe && (shirt === 'coral' || shirt2 === 'coral');
  const hatTint = rng.pick(HAT_TINTS);
  return {
    skin: rng.int(0, 5),
    hairTone: age === 'elder' ? rng.pick([7, 8, 7, 5]) : rng.int(0, 6),
    hairStyle: age === 'elder' && rng.chance(0.3) ? null : rng.pick(HAIR_STYLES),
    hat: hat === 'hat.bobble' && stripedCoral ? 'hat.beanie' : hat,
    hatTint: hat === 'hat.bobble' && hatTint === 'coral' && stripedCoral ? 'blue' : hatTint,
    glasses: rng.chance(0.14) ? (rng.chance(0.55) ? 'face.glasses.round' : 'face.sunglasses') : null,
    shirt,
    shirt2,
    pattern,
    patternScale: rng.range(0.85, 1.3),
    longSleeves: rng.chance(0.45),
    pants: rng.pick(PANTS),
    longLegs: skirt ? false : rng.chance(child ? 0.35 : 0.72),
    lower: skirt ? rng.pick(['lower.skirt', 'lower.skirt.long', 'lower.dress', 'lower.dress.long']) : null,
    shoes: rng.pick(SHOES),
    face: rng.weighted([0, 1, 2, 3, 4], [46, 10, 16, 20, 8]),
    build: rng.range(0.86, child ? 1.05 : 1.24),
    scale: child ? rng.range(0.56, 0.74) : age === 'teen' ? rng.range(0.82, 0.92) : rng.range(0.92, 1.07),
    headScale: child ? rng.range(1.2, 1.34) : rng.range(0.98, 1.08),
    extras: [],
  };
}

export interface Placement {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly heading: number;
  readonly motion: number;
  readonly clip: ClipRef;
  /** playback speed multiplier, or for locomotion the travel speed in m/s */
  readonly rate: number;
  readonly phase: number;
  readonly blob?: number;
  readonly roaming?: boolean;
}

export function lookToRecord(look: Look, place: Placement, palette: PaletteStore): PersonRecord {
  const tints: number[] = new Array<number>(CAT_COUNT).fill(0);
  const options: string[] = [];
  if (look.hairStyle) options.push(look.hairStyle);
  if (look.hat) {
    options.push(look.hat);
    tints[Cat.Hat] = palette.index(look.hatTint);
  }
  if (look.glasses) options.push(look.glasses);
  if (look.lower) options.push(look.lower);
  for (const e of look.extras) {
    options.push(e.key);
    if (e.tint) tints[e.cat] = palette.index(e.tint);
  }
  return {
    x: place.x,
    y: place.y,
    z: place.z,
    heading: place.heading,
    motion: place.motion,
    clip: place.clip,
    rate: place.rate,
    phase: place.phase,
    scale: look.scale,
    build: look.build,
    headScale: look.headScale,
    longSleeves: look.longSleeves,
    longLegs: look.longLegs,
    pattern: look.pattern,
    patternScale: look.patternScale,
    face: look.face,
    shirt: palette.index(look.shirt),
    shirt2: palette.index(look.shirt2),
    pants: palette.index(look.pants),
    skin: palette.skin(look.skin),
    hair: palette.hair(look.hairTone),
    shoes: palette.index(look.shoes),
    tints,
    options,
    blob: place.blob ?? 1,
    roaming: place.roaming ?? false,
  };
}

/** The hero: coral/ivory hooped shirt, matching bobble hat, round glasses, blue trousers, stick. */
export const HERO_LOOK: Look = {
  skin: 0,
  hairTone: 2,
  hairStyle: 'hair.short',
  hat: 'hat.bobble',
  hatTint: 'coral',
  glasses: 'face.glasses.round',
  shirt: 'coral',
  shirt2: 'ivory',
  pattern: Pattern.HStripe,
  patternScale: 1.55,
  longSleeves: true,
  pants: 'blue',
  longLegs: true,
  lower: null,
  shoes: 'cocoa',
  face: 0,
  build: 0.96,
  scale: 1.05,
  headScale: 1.1,
  extras: [{ key: 'hold.stick', cat: Cat.HandR }],
};
