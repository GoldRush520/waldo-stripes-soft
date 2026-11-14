/**
 * Low buildings around the station (kept to 1–3 floors so nothing hides the forecourt), kiosks,
 * trees and the east terminus. Balcony people are placed with each house.
 */
import { house } from '../../../props/arch/house';
import { rowHouses } from '../../../props/arch/rowHouses';
import type { HouseResult } from '../../../props/arch/types';
import type { Kit } from '../../kit';
import { CLOTHS, ROOFS, WALLS, treeGeo } from '../shared';
import { canalX, dry } from './plan';

const BALCONY_CLIPS = ['wave', 'lookout', 'stand', 'point', 'talk'] as const;

/** Place a built house and people on its balconies. */
function placeHouse(k: Kit, h: Pick<HouseResult, 'geo' | 'balconies' | 'footprint'>, x: number, z: number, rot: number): void {
  k.add(h.geo, { x, z, rot });
  k.block(x, z, h.footprint[0], h.footprint[1], rot);
  for (const b of h.balconies) {
    if (!k.rng.chance(0.8)) continue;
    const p = k.rel({ x, z, rot }, b.x, b.z + 0.25, b.heading);
    k.person({ ...p, y: b.y, clip: k.rng.pick(BALCONY_CLIPS) });
  }
}

/** Two-storey row closing the west edge, fronts facing the forecourt (east). */
function westRow(k: Kit): void {
  const row = rowHouses({ widths: [4.4, 5.2, 4.6], d: 6, floors: [2, 3], shops: 0.9, seed: 7101, common: { roof: 'gable' } });
  placeHouse(k, row, -40.4, 16.2, Math.PI / 2);
}

/** East terminus: a station café north of the track and two houses along the east edge. */
function eastHouses(k: Kit): void {
  const cafe = house({
    w: 5,
    d: 6,
    floors: 2,
    wall: 'butterLight',
    roof: 'hip',
    roofColor: 'coral',
    front: { shop: { awning: 'scalloped', sign: 'teacup' }, windowBoxes: true },
    tint: 'coral',
    seed: 7120,
  });
  placeHouse(k, cafe, 44.4, -16.9, -Math.PI / 2);
  [1.5, 9.2].forEach((z, i) => {
    const h = house({
      w: 7,
      d: 6,
      floors: 2 + i,
      wall: WALLS[(i + 2) % WALLS.length],
      roof: i ? 'mansard' : 'gable',
      roofColor: ROOFS[(i + 3) % ROOFS.length],
      front: { shop: i === 0 ? { awning: 'straight', sign: 'icecream' } : false, balconies: i ? [1] : [], balconyFlowers: true, windowBoxes: true },
      tint: CLOTHS[(i + 1) % CLOTHS.length],
      seed: 7130 + i,
    });
    placeHouse(k, h, 44.4, z, -Math.PI / 2);
  });
}

function kiosks(k: Kit): void {
  k.prop('kiosk.news', { x: 9.6, z: 3.2, rot: -Math.PI / 2 });
  k.prop('cart.icecream', { x: 36.5, z: 4.2, rot: -Math.PI / 2 });
  k.prop('postbox', { x: -33.4, z: 1.2 });
  k.prop('signpost.arrows', { x: -21.8, z: 6.6 });
  k.prop('bin.litter', { x: -26.5, z: -1.2 });
  k.prop('bin.litter', { x: 3.4, z: 7.6 });
}

/** Trees along the canal banks and the west yard; each is checked against the water. */
function trees(k: Kit): void {
  const spots: ReadonlyArray<readonly [number, number]> = [
    [-42.6, -17],
    [-37.6, -18.6],
    [22.5, -19],
    [canalX(-1) - 7.8, -1],
    [canalX(16) - 7.6, 15.6],
    [canalX(1) + 8.6, 0.5],
    [canalX(14) + 7.6, 14.2],
    [47.4, 15],
    [-43, 4.5],
  ];
  spots.forEach(([x, z], i) => {
    if (!dry(k, x, z, 1.2)) return;
    k.add(treeGeo(i % 3 === 0 ? 'blossom' : 'lollipop', i % 4), { x, z, tint: i % 3 === 0 ? 'coralLight' : undefined });
    k.block(x, z, 0.7, 0.7);
  });
}

export function buildings(k: Kit): void {
  westRow(k);
  eastHouses(k);
  kiosks(k);
  trees(k);
}
