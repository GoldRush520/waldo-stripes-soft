/**
 * Craft library: music-square gear, craft & construction yard, tram-station luggage and rooftop life.
 * Exports the registered PropDefs plus the parametric builders used by world generation.
 */
import type { PropDef } from '../registry';
import { CRAFT_ARTS } from './craft-arts';
import { CRAFT_MATERIALS } from './craft-materials';
import { CRAFT_STUDIO } from './craft-studio';
import { CRANE_PROPS } from './crane';
import { LUGGAGE_PROPS } from './luggage';
import { LUGGAGE_PILES } from './luggage-piles';
import { MUSIC_INSTRUMENTS } from './music-instruments';
import { MUSIC_STAGE } from './music-stage';
import { ROOFTOP_PROPS } from './rooftop';
import { STATION_PROPS } from './station';

export const PROPS: readonly PropDef[] = [
  ...MUSIC_INSTRUMENTS,
  ...MUSIC_STAGE,
  ...CRAFT_STUDIO,
  ...CRAFT_MATERIALS,
  ...CRANE_PROPS,
  ...CRAFT_ARTS,
  ...LUGGAGE_PROPS,
  ...LUGGAGE_PILES,
  ...STATION_PROPS,
  ...ROOFTOP_PROPS,
];

export { TIGHTROPE_HEIGHT, danceFloor, tightropeRig } from './music-stage';
export { paintSplatter } from './craft-studio';
export { type TimberKind, ladder, leaningLadder, stepLadder, timberStack } from './craft-materials';
export { CRANE_MAST_HEIGHT } from './crane';
export { basketStack, giantLetters } from './craft-arts';
export { SUITCASE_DIMS, type SuitcaseSize, suitcase } from './luggage';
export { luggageAvalanche, luggageTower } from './luggage-piles';
