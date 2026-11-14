/**
 * Canal Bridges district: the 10 m canal between its two promenade banks, from the harbour quay
 * (world z = 38) north to the tram district (z = -54). Five different bridges cross it (plank-rope,
 * stone arch, covered, raised drawbridge, iron footbridge), each crowded with people; the banks
 * carry quay walls, steps, railings, lamps, a café, anglers and dense promenade life; every pool of
 * water between two bridges has its own looping boats, moored boats and water birds.
 *
 * Authoring happens in canal coordinates (see canal/frame.ts): s along the centreline, d across.
 */
import type { Kit } from '../kit';
import { buildBanks } from './canal/banks';
import { buildBoats } from './canal/boats';
import { bridgeSites, placeBridges } from './canal/bridges';
import { S_NORTH, S_SOUTH } from './canal/frame';
import { buildLife } from './canal/life';
import { OPENINGS } from './canal/spots';
import { bankStories } from './canal/stories-bank';
import { waterStories } from './canal/stories-water';
import { dressWater } from './canal/water';

export function buildCanal(k: Kit): void {
  const sites = bridgeSites(k);
  placeBridges(k, sites);
  const flights = buildBanks(k, sites, OPENINGS);
  waterStories(k, sites);
  bankStories(k, sites);
  const { pools, claimed } = buildBoats(k, sites, flights, S_SOUTH, S_NORTH);
  dressWater(k, sites, pools, claimed);
  buildLife(k, sites);
}
