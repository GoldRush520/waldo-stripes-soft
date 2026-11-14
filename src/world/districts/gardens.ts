/**
 * Botanical gardens — the glass palm-house on its raised terrace, the hedge maze, the topiary lawn,
 * rose and vine walks, the lily pond, beehives and kitchen beds, picnic and kite lawns and the
 * tethered hot-air balloon. The plan lives in `gardens/plan.ts`; each area is its own module.
 */
import type { Kit } from '../kit';
import { borders } from './gardens/borders';
import { flows } from './gardens/flows';
import { groundworks } from './gardens/ground';
import { kitchen } from './gardens/kitchen';
import { lawns } from './gardens/lawns';
import { leisure } from './gardens/leisure';
import { maze } from './gardens/maze';
import { pond } from './gardens/pond';
import { terrace } from './gardens/terrace';

export function buildGardens(k: Kit): void {
  groundworks(k);
  terrace(k);
  maze(k);
  pond(k);
  kitchen(k);
  lawns(k);
  leisure(k);
  borders(k);
  flows(k);
}
