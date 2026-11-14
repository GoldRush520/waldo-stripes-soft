/**
 * Harbour & Boat Parade.
 *
 * Plan (district-local metres, +z toward the basin): a terrace of harbour houses closes the north
 * side of the quay strip; in front of it runs the promenade and the packed quay edge with cranes,
 * fish crates, nets and parade spectators. Three jetties reach into the basin among rows of moored
 * boats; the breakwater leaves the west end and turns east to the banded lighthouse. The boat parade
 * loops round the middle of the basin past the judges' barge. See harbor/plan.ts for the numbers.
 */
import type { Kit } from '../kit';
import { anchoredBoats, infield, mooredBoats, waterLife } from './harbor/boats';
import { createCtx } from './harbor/ctx';
import { breakwaterPeople, edgeSpectators, fronts, jettySpectators, lookalikes, reserveSpots, targetSpots, walkers } from './harbor/crowd';
import { parade } from './harbor/parade';
import { breakwater, jetties } from './harbor/piers';
import { benches, boathouse, clutter, cranes, dressing, houses, lookout, paving, quayWall } from './harbor/quay';
import { quayStories } from './harbor/stories-quay';
import { waterStories } from './harbor/stories-water';

export function buildHarbor(k: Kit): void {
  const c = createCtx(k);
  paving(k);
  quayWall(k);
  boathouse(k);
  cranes(k);
  dressing(k);
  const rim = lookout(k);
  jetties(c);
  breakwater(c);
  reserveSpots(c);
  const units = parade(c);
  waterStories(c, units);
  const tug = mooredBoats(c);
  quayStories(c, rim, tug);
  benches(k);
  clutter(k);
  houses(k);
  lookalikes(c);
  edgeSpectators(c);
  jettySpectators(c);
  breakwaterPeople(c);
  fronts(c);
  infield(c);
  waterLife(c);
  anchoredBoats(c);
  walkers(c);
  targetSpots(c);
}
