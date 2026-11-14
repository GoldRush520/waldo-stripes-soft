/** Planting and furniture along the walks: box edging, flower beds, lamps, benches and edge trees. */
import type { Kit } from '../../kit';
import { PROMENADE, TOPIARY, seatedOn } from './plan';

function edging(k: Kit): void {
  for (const x of [15, 19, 23, 27, 35]) k.prop('hedge.box.4', { x, z: TOPIARY.z0 - 0.3 });
  for (const z of [20, 24]) {
    k.prop('garden.flowerbed', { x: -4.6, z, tint: z === 20 ? 'coral' : 'butter' });
    k.prop('garden.flowerbed', { x: 4.6, z, tint: z === 20 ? 'blue' : 'coral' });
  }
  for (const z of [16.4, 22, 28]) {
    k.prop('lamp.swan', { x: -1.8, z });
    k.prop('lamp.swan', { x: 1.8, z: z + 1.2 });
  }
  k.prop('garden.birdbath', { x: -12.6, z: 4.6 });
  k.prop('sundial', { x: -36.4, z: -6.8 });
  k.prop('plant.hydrangea', { x: -10.4, z: -2.8 });
  k.prop('plant.rosebush', { x: 11.6, z: 12.6 });
  k.prop('plant.rosebush', { x: -11.6, z: 12.8 });
}

function edgeTrees(k: Kit): void {
  const trees: ReadonlyArray<readonly [string, number, number]> = [
    ['tree.blossom', 39.4, 15.2],
    ['tree.lollipop', 39.6, 24.6],
    ['tree.blossom.ivory', -31, 13.2],
    ['tree.cypress', -45, -12.4],
    ['tree.birch', 24, -26.4],
  ];
  for (const [key, x, z] of trees) k.prop(key, { x, z });
}

function promenadeBenches(k: Kit): void {
  const z = PROMENADE.z + PROMENADE.half + 0.75;
  for (const x of [-33, -20.5, 26, 37.6]) {
    seatedOn(k, 'bench.park', { x, z: z + 0.1, rot: Math.PI }, { fill: 0.85, clips: ['sit', 'sit.talk', 'sit.read', 'sit.eat'] });
    k.block(x, z + 0.25, 1.7, 0.3);
  }
}

export function borders(k: Kit): void {
  edging(k);
  edgeTrees(k);
  promenadeBenches(k);
}
