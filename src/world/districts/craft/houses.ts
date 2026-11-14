/** Craft yard street fronts: the northern workshop row and the western row along the craft leg. */
import { rowHouses } from '../../../props/arch/rowHouses';
import type { RowHousesResult } from '../../../props/arch/rowHouses';
import type { Kit } from '../../kit';
import { PI } from './plan';

interface RowPlace {
  readonly x: number;
  readonly z: number;
  readonly rot: number;
}

/** Shopkeepers in doorways and neighbours on balconies of a placed row. */
function populateRow(k: Kit, row: RowHousesResult, at: RowPlace): void {
  row.doors.forEach((d, i) => {
    if (i % 2 === 1) return;
    const p = k.rel(at, d.x, d.z + 0.55, d.heading);
    if (!k.isFree(p.x, p.z, 0.3)) return;
    k.person({ ...p, clip: k.rng.pick(['idle.hips', 'talk', 'wave', 'lookout']), hold: ['upper.apron'], look: { hat: k.rng.chance(0.5) ? 'hat.cap' : null } });
  });
  row.balconies.forEach((b, i) => {
    if (i % 3 === 2) return;
    const p = k.rel(at, b.x, b.z + 0.2, b.heading);
    k.person({ ...p, y: b.y, clip: k.rng.pick(['wave', 'lookout', 'point', 'idle.watch']) });
  });
}

/** Northern workshop row facing south over the back lane (x -13.5..15.5, z -37.5..-31.5). */
export function northRow(k: Kit): void {
  const widths = [7.2, 6.4, 8.0, 7.4];
  const row = rowHouses({
    widths,
    d: 6,
    floors: [2, 3],
    roofs: ['gable', 'gable', 'hip', 'mansard'],
    shops: 0.75,
    common: { front: { shop: { awning: 'straight', sign: 'key' }, balconies: [2], windowBoxes: true, shutters: true }, back: { simple: true }, tint: 'coral' },
    seed: 731,
  });
  const at = { x: 1, z: -34.5, rot: 0 };
  k.add(row.geo, at);
  k.block(at.x, at.z, row.footprint[0], row.footprint[1]);
  populateRow(k, row, at);
}

/** Western row along the craft leg, fronts facing east onto the leg lane. */
export function westRow(k: Kit): void {
  const widths = [6.6, 7.8, 7.0, 7.6];
  const row = rowHouses({
    widths,
    d: 6,
    floors: [2, 3],
    roofs: ['gable', 'shed', 'gable', 'hip'],
    shops: 0.9,
    common: { front: { shop: { awning: 'scalloped' }, balconies: [1], balconyFlowers: true, windowBoxes: true }, back: { simple: true }, tint: 'blue' },
    seed: 744,
  });
  const at = { x: -10.5, z: 22.7, rot: PI / 2 };
  k.add(row.geo, at);
  k.block(at.x, at.z, row.footprint[0], row.footprint[1], at.rot);
  populateRow(k, row, at);
}
