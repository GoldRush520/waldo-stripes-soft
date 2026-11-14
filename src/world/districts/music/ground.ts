/** Paving, parade ring, trees, lamps and festival dressing of the music square. */
import type { Kit } from '../../kit';
import { treeGeo } from '../shared';
import { FOUNTAIN, RING, circle, ellipse, ellipsePoint } from './plan';

const PAVED: ReadonlyArray<readonly [number, number]> = [
  [-10.8, -33],
  [9.8, -39.3],
  [21.5, -39.3],
  [21.5, 35.5],
  [-12.8, 35.5],
  [-24.2, 20.3],
  [-20.6, -8.3],
];

export function paving(k: Kit): void {
  k.ground(PAVED, 'clayLight');
  k.ground(ellipse(RING.x, RING.z, RING.rx + 1.5, RING.rz + 1.5, 40), 'ivory', 0.03, 0.02);
  k.ground(ellipse(RING.x, RING.z, RING.rx - 1.5, RING.rz - 1.5, 40), 'butterLight', 0.05, 0.02);
  k.ground(circle(FOUNTAIN.x, FOUNTAIN.z, 3.6, 24), 'ivory', 0.03, 0.02);
  k.ground(circle(FOUNTAIN.x, FOUNTAIN.z, 2.6, 24), 'blueLight', 0.05, 0.02);
}

const TREES: ReadonlyArray<readonly [number, number, 'lollipop' | 'blossom']> = [
  [-21.5, -9.5, 'lollipop'],
  [-22.3, 3, 'blossom'],
  [-22.8, 16, 'lollipop'],
  [-14.5, 31, 'blossom'],
  [-19.6, 23.8, 'lollipop'],
  [17.5, 33.5, 'blossom'],
  [-14.8, -24.5, 'lollipop'],
];

export function greenery(k: Kit): void {
  TREES.forEach(([x, z, kind], i) => {
    k.add(treeGeo(kind, i % 3), { x, z, tint: kind === 'blossom' ? 'coralLight' : undefined });
    k.block(x, z, 0.6, 0.6);
  });
  for (const [x, z] of [[-8.5, 16.6], [4.2, 16.4], [-16.8, 12.5]] as const) k.prop('planter.urn', { x, z });
  k.prop('flowerbed.round', { x: -9.2, z: -14.5 });
}

export function lamps(k: Kit): void {
  for (let i = 0; i < 8; i++) {
    const [x, z] = ellipsePoint(RING.x, RING.z, RING.rx - 2.1, RING.rz - 2.1, (i / 8) * Math.PI * 2);
    k.prop(i % 2 === 0 ? 'lamp.double' : 'lamp.classic', { x, z, rot: (i / 8) * Math.PI * 2 });
  }
  for (const [x, z] of [[-12, -20], [9.5, -27.5], [13.6, -4.5], [13.6, 0.6], [-20.5, 10.5]] as const) k.prop('lamp.swan', { x, z, rot: -Math.PI / 2 });
}

export function dressing(k: Kit): void {
  k.prop('bunting.poles.10m', { x: -3.5, z: -21.2, rot: 0.27 });
  k.prop('lights.string.poles', { x: 4.6, z: -24.3, rot: 0.27 });
  k.prop('banner.street', { x: 13.9, z: -2, rot: Math.PI / 2 });
  k.prop('bunting.poles.6m', { x: -1, z: 35, rot: 0 });
  k.prop('bunting.poles.6m', { x: 17.8, z: 29, rot: Math.PI / 2 });
  k.prop('music.bannerPoles', { x: -17.5, z: -18, rot: 0.38 });
  k.prop('flag.pole.pennant', { x: -16, z: 17.5 });
  k.prop('flag.pole', { x: 12.6, z: 17.2, tint: 'blue' });
  k.prop('board.notice', { x: -10.5, z: -21.5, rot: 0.27 });
  k.prop('bin.litter', { x: 11.2, z: 14.2 });
  k.prop('bin.litter', { x: -15.2, z: 20.6 });
  k.prop('postbox', { x: 12.9, z: -29.6 });
}
