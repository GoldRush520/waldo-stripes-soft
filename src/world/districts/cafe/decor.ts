/**
 * Ground tones, the piazza fountain, bunting and festoon lights across the lanes, street lamps,
 * planters and trees. Restrained paving: clay base, ivory lanes, butter piazzas, one sage lawn.
 */
import { bunting, stringLights } from '../../../props/street/festival-lines';
import type { Kit } from '../../kit';
import { treeGeo } from '../shared';
import { BOOK_SQUARE, LANE1, LANE2, LANE_NE, type P2, PIAZZA, POLY, type V3 } from './plan';

/** z of the north terraces' front façades (world-aligned v = -14) at local x. */
export const northFrontZ = (x: number): number => (-14 - 0.15932 * x) / 0.98723;
/** z of the C2 block's north face at local x. */
export const c2NorthZ = (x: number): number => -10.15 + (x - 8.41) * 0.0614;

function strip(points: readonly V3[], hw: number): P2[] {
  const left: P2[] = [];
  const right: P2[] = [];
  points.forEach((p, i) => {
    const a = points[Math.max(0, i - 1)] as V3;
    const b = points[Math.min(points.length - 1, i + 1)] as V3;
    const dx = b[0] - a[0];
    const dz = b[2] - a[2];
    const len = Math.hypot(dx, dz) || 1;
    left.push([p[0] - (dz / len) * hw, p[2] + (dx / len) * hw]);
    right.push([p[0] + (dz / len) * hw, p[2] - (dx / len) * hw]);
  });
  return [...left, ...right.reverse()];
}

function ring(cx: number, cz: number, r: number, n = 24): P2[] {
  return Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2) * r, cz + Math.sin((i / n) * Math.PI * 2) * r] as const);
}

function ground(k: Kit): void {
  k.ground(POLY, 'clayLight');
  for (const lane of [LANE1, LANE_NE, LANE2]) k.ground(strip(lane, 1.6), 'ivory', 0.03, 0.02);
  k.ground(ring(PIAZZA.x, PIAZZA.z, 8.6, 28), 'butterLight', 0.03, 0.02);
  k.ground(ring(PIAZZA.x, PIAZZA.z, 3.6, 20), 'ivory', 0.05, 0.02);
  k.ground(ring(BOOK_SQUARE.x, BOOK_SQUARE.z, 5.2, 22), 'butterLight', 0.03, 0.02);
  k.ground(
    [
      [-35.5, 14.2],
      [-19, 13.8],
      [-18.5, 22.8],
      [-35, 24.2],
    ],
    'sageLight',
    0.03,
    0.02,
  );
}

function lines(k: Kit): void {
  const geos = [
    ...[-18.5, -29, -34].map((x) => bunting([x, 5.0, northFrontZ(x) + 0.15], [x + 0.7, 4.5, -3.62], { seed: `l1${x}` }).geo),
    ...[11, 16, 22].map((x) => bunting([x, 5.2, northFrontZ(x) + 0.15], [x - 0.6, 4.6, c2NorthZ(x - 0.6) - 0.12], { seed: `ne${x}` }).geo),
    stringLights([-1.2, 5.6, northFrontZ(-1.2) + 0.2], [-4, 4.2, -2.5]).geo,
    stringLights([-4, 4.2, -2.5], [6.6, 4.4, 1.0]).geo,
    stringLights([-4, 4.2, -2.5], [-15.8, 4.4, 2.0]).geo,
  ];
  for (const g of geos) k.add(g, { x: 0, z: 0 }, { cast: false });
  k.prop('lights.string.poles', { x: -27, z: 14.2, rot: 0.02 });
  k.prop('bunting.poles.10m', { x: 14, z: 9.6, rot: 0.12 });
  k.prop('lanterns.string.poles', { x: -4, z: 22.4, rot: 0.08 });
}

function furniture(k: Kit): void {
  k.prop('fountain.round', { x: PIAZZA.x, z: PIAZZA.z });
  k.prop('fountain.round.water', { x: PIAZZA.x, z: PIAZZA.z });
  const lamps: P2[] = [
    [-33, -2.9],
    [-23.5, -2.9],
    [12, -9.4],
    [25, -8.5],
    [-31, 10.2],
    [-20, 10.1],
    [10, 4.2],
    [27, 3.4],
    [-12.6, 6.6],
    [5.4, -8.6],
    [32.6, -13.5],
    [41.4, 2.5],
  ];
  lamps.forEach(([x, z], i) => k.prop(i % 3 === 2 ? 'lamp.double' : 'lamp.classic', { x, z }));
  const tubs: P2[] = [
    [-15.4, -3.2],
    [-15.4, 9.6],
    [7.2, 2.4],
    [8.2, -9.6],
    [30.9, -8.6],
    [30.3, 3.4],
  ];
  tubs.forEach(([x, z], i) => k.prop(i % 2 ? 'planter.urn' : 'planter.tub', { x, z, tint: i % 3 ? 'coral' : 'butter' }));
  k.prop('postbox', { x: -38.2, z: -1.2 });
  k.prop('bin.litter', { x: 31.2, z: -2 });
  k.prop('clock.street', { x: 4.6, z: 5.6 });
  k.prop('signpost.arrows', { x: -14.8, z: 12.8 });
}

function trees(k: Kit): void {
  const big: ReadonlyArray<readonly [number, number, number]> = [
    [-37.2, 21.5, 0],
    [24.6, 15.6, 1],
    [42, 9.5, 2],
  ];
  for (const [x, z, v] of big) {
    k.add(treeGeo('umbrellaPine', v), { x, z });
    k.block(x, z, 0.7, 0.7);
  }
  const potted: P2[] = [
    [-8.6, 19.6],
    [0.6, 19.4],
    [-16.4, 15.6],
    [8.4, 10.2],
    [32.2, -4],
    [41.6, -14],
  ];
  potted.forEach(([x, z], i) => {
    k.add(treeGeo(i % 2 ? 'pottedLemon' : 'pottedOrange', i % 3), { x, z });
    k.block(x, z, 0.7, 0.7);
  });
}

export function buildDecor(k: Kit): void {
  ground(k);
  lines(k);
  furniture(k);
  trees(k);
}
