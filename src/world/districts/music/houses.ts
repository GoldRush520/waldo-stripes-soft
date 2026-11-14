/**
 * House rows closing the north and east sides of the square. People lean from balconies and a few
 * listen from flat roof terraces; every elevated stance is registered as a walkable patch.
 */
import { rowHouses } from '../../../props/arch/rowHouses';
import type { RowHousesResult } from '../../../props/arch/rowHouses';
import type { Kit } from '../../kit';
import { BAND, patch } from './plan';

interface RowSpec {
  readonly x: number;
  readonly z: number;
  readonly rot: number;
  readonly widths: readonly number[];
  readonly d: number;
  readonly floors: readonly [number, number];
  readonly seed: number;
  readonly shops: number;
}

/** slanted north row (parallel to the polygon edge), short flat NE row, two east rows split by a lane */
const ROWS: readonly RowSpec[] = [
  { x: 0.64, z: -32.97, rot: 0.266, widths: [4.2, 3.6, 4.8, 4.4], d: 7.5, floors: [3, 4], seed: 7101, shops: 0.8 },
  { x: 16.5, z: -36, rot: 0, widths: [5.2, 4.8], d: 7, floors: [3, 4], seed: 7102, shops: 0.5 },
  { x: 18, z: -17, rot: -Math.PI / 2, widths: [4.6, 5.4, 4.2, 5.2, 4.6], d: 7, floors: [2, 4], seed: 7103, shops: 0.9 },
  { x: 18, z: 13, rot: -Math.PI / 2, widths: [5, 4.4, 5.6, 4.4, 4.8], d: 7, floors: [2, 3], seed: 7104, shops: 0.6 },
];

const BALCONY_CLIPS = ['wave', 'lookout', 'cheer.clap', 'sway.wave', 'point', 'talk'] as const;

function balconyPeople(k: Kit, spec: RowSpec, row: RowHousesResult): void {
  row.balconies.forEach((b, i) => {
    const p = k.rel(spec, b.x, b.z + 0.12, b.heading);
    patch(k, p.x, p.z, 0.45, 0.45, b.y);
    if (i % 4 === 3) return;
    k.person({ x: p.x, z: p.z, y: b.y, face: [BAND.x, BAND.z], clip: k.rng.pick(BALCONY_CLIPS), age: k.rng.chance(0.15) ? 'child' : 'adult' });
  });
}

function terracePeople(k: Kit, spec: RowSpec, row: RowHousesResult): void {
  for (const t of row.terraces) {
    const c = k.rel(spec, t.x, 0);
    patch(k, c.x, c.z, Math.min(t.w, t.d) / 2 - 0.4, Math.min(t.w, t.d) / 2 - 0.4, t.y, 'roof');
    for (const [dx, clip] of [[-0.45, 'sway.hands-up'], [0.45, 'cheer.clap']] as const) {
      const p = k.rel(spec, t.x + dx, 0.6);
      k.person({ x: p.x, z: p.z, y: t.y, face: [BAND.x, BAND.z], clip });
    }
  }
}

export function houseRows(k: Kit): void {
  for (const spec of ROWS) {
    const row = rowHouses({
      widths: spec.widths,
      d: spec.d,
      floors: spec.floors,
      shops: spec.shops,
      roofs: ['gable', 'gable', 'mansard', 'flat', 'hip'],
      ends: 'windows',
      seed: spec.seed,
    });
    k.add(row.geo, { x: spec.x, z: spec.z, rot: spec.rot });
    k.block(spec.x, spec.z, row.footprint[0], row.footprint[1], spec.rot);
    balconyPeople(k, spec, row);
    terracePeople(k, spec, row);
  }
}
