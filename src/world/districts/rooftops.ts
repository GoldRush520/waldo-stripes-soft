/**
 * Rooftop Terraces — a hillside of flat-roofed houses stacked on three terraces rising northward.
 *
 * Plan (district-local metres, +z toward the camera): a paved ground strip with the piazza, a café
 * corner and two low workshops; three terrace platforms (y = 3, 6, 9) with retaining-wall faces and
 * railings, joined by six flights of stairs (the grand stair, a flight along the wall face and four
 * alley stairs between houses); a continuous row of houses at the back of each terrace whose roof
 * terraces are the stage. The water tower crowns the hill-top terrace; the belvedere bastion juts out
 * over the piazza. See rooftops/plan.ts for the numbers.
 */
import type { Kit } from '../kit';
import { buildHill } from './rooftops/hill';
import { buildHouses } from './rooftops/houses';
import { crossLines, roofLife } from './rooftops/roofLife';
import { lookalikes, targetSpots } from './rooftops/spots';
import { roofStories } from './rooftops/stories';
import { moreStories } from './rooftops/stories2';
import { fills, streetLife } from './rooftops/street';

export function buildRooftops(k: Kit): void {
  buildHill(k);
  const roofs = buildHouses(k);
  const taken = new Set<number>();
  roofStories(k, roofs, taken);
  moreStories(k, roofs, taken);
  const open = roofLife(k, roofs, taken);
  crossLines(k, roofs, new Set([...taken, ...open]));
  streetLife(k);
  lookalikes(k);
  targetSpots(k, roofs, open);
  fills(k, 1);
}
