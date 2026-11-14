/**
 * Craft & Construction Yard. An L-shaped yard: workshop rows close the north and west sides, the
 * tower crane (landmark) towers over a brick house being raised behind a crewed scaffold, the
 * timber yard and carpenters sit west, the smithy east, the painter's plaza in the middle, and the
 * southern leg holds the potters, sculptor, weavers, dyers, basket makers and sign painter.
 * See craft/plan.ts for the plan and coordinates.
 */
import type { Kit } from '../kit';
import { dyersAndPainters } from './craft/dyers';
import { flowsAndCrowds } from './craft/flows';
import { northRow, westRow } from './craft/houses';
import { pottersAndSculptor } from './craft/potters';
import { constructionSite } from './craft/site';
import { timberYard } from './craft/timber';
import { workYard } from './craft/yard';

function paving(k: Kit): void {
  k.ground([[-16, -40], [18, -40], [18, 7], [11, 7], [11, 40], [-16, 40]], 'clayLight');
  k.ground([[-13.5, -10.6], [17.5, -10.6], [17.5, -7.4], [-13.5, -7.4]], 'ivoryShade', 0.03, 0.02);
  k.ground([[-7.4, -6.2], [-4.6, -6.2], [-4.6, 37.5], [-7.4, 37.5]], 'ivoryShade', 0.03, 0.02);
}

export function buildCraft(k: Kit): void {
  paving(k);
  northRow(k);
  westRow(k);
  constructionSite(k);
  timberYard(k);
  workYard(k);
  pottersAndSculptor(k);
  dyersAndPainters(k);
  flowsAndCrowds(k);
}
