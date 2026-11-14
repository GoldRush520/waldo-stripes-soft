/**
 * Tram station district: the glass-and-iron station hall and double track along the north edge,
 * twin viaducts carrying the line over the canal, two shuttling trams with their passengers, and
 * a forecourt, luggage yard and east terminus drowning in luggage chaos.
 * See tram/plan.ts for the layout.
 */
import type { Kit } from '../kit';
import { buildings } from './tram/buildings';
import { crowd } from './tram/crowd';
import { movers } from './tram/movers';
import { railway } from './tram/railway';
import { storiesA } from './tram/stories';
import { storiesB } from './tram/stories2';
import { trams } from './tram/trams';

export function buildTram(k: Kit): void {
  railway(k);
  buildings(k);
  const [, southTram] = trams(k);
  storiesA(k, southTram);
  storiesB(k);
  movers(k);
  crowd(k);
}
