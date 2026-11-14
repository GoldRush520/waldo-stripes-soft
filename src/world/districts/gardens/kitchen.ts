/** West side: beehives, the kitchen garden, a little orchard and the wildflower picnic meadow. */
import { type Geo, blob, box, detail, merge, translate } from '../../../core/geo';
import type { Vec3 } from '../../../crowd/stores';
import type { Kit } from '../../kit';
import { MEADOW } from './plan';

let beeGeo: Geo | undefined;

/** A cartoon bee, oversized (~16 cm) so the queue reads from the default camera. */
function bee(): Geo {
  beeGeo ??= merge(
    blob(0.08, 0.06, 0.06, 'butter', 6, 4),
    translate(box(0.03, 0.115, 0.115, 'ink'), 0.01, -0.057, 0),
    translate(box(0.03, 0.105, 0.105, 'ink'), -0.04, -0.052, 0),
    detail(translate(blob(0.05, 0.012, 0.03, 'ivory', 5, 3), 0.0, 0.065, 0.04)),
    detail(translate(blob(0.05, 0.012, 0.03, 'ivory', 5, 3), 0.0, 0.065, -0.04)),
  );
  return beeGeo;
}

function hives(k: Kit): void {
  for (const x of [-43.6, -41.9, -40.2]) k.prop('garden.beehive.box', { x, z: -25.6, tint: x < -42 ? 'butter' : x < -41 ? 'coralLight' : 'blueLight' });
  k.prop('garden.beehive.skep', { x: -43, z: -22.4 });
  k.prop('garden.beehive.skep', { x: -39.4, z: -22.6 });
  for (const [x, z] of [
    [-44.4, -21],
    [-38.2, -24.2],
    [-41.2, -21.4],
  ] as const) {
    k.prop('plant.lavender', { x, z });
  }
  k.prop('fence.picket4', { x: -42.5, z: -20.1 });
  k.prop('arbour.trellis', { x: -36.2, z: -27, tint: 'coral' });
  k.prop('arbour.trellis', { x: -33.8, z: -27, tint: 'butter' });
  k.prop('tree.espalier', { x: -29.6, z: -27.1 });
  k.prop('tree.espalier', { x: -26.4, z: -27.1 });
}

/** Rows of beds: [prop, x, z, rot]. */
const BEDS: ReadonlyArray<readonly [string, number, number, number]> = [
  ['veg.bed', -34.6, -25.4, 0],
  ['veg.cabbages', -31.4, -25.4, 0],
  ['veg.beans', -28.4, -25.4, 0],
  ['veg.tomatoes', -26, -25.4, 0],
  ['veg.tomatoes', -34.8, -22.4, 0],
  ['veg.bed', -31.6, -22.4, 0],
  ['veg.pumpkins', -28.6, -22.4, 0],
  ['plant.sunflowers', -26.2, -22.6, 0],
  ['veg.cabbages', -34.4, -19.2, 0],
  ['veg.beans', -31.2, -19.2, 0],
  ['veg.bed', -27.8, -19.2, 0],
  ['veg.seedlings', -34.2, -15.6, 0],
  ['veg.pumpkins', -26.2, -15.8, 0],
];

function beds(k: Kit): void {
  for (const [key, x, z, rot] of BEDS) k.prop(key, { x, z, rot });
  k.prop('garden.compost', { x: -43.8, z: -14.6 });
  k.prop('cart.wheelbarrowSoil', { x: -41.6, z: -15, rot: 1.2 });
  k.prop('tree.fruit.lemon', { x: -43.4, z: -17.6 });
  k.prop('tree.fruit.orange', { x: -39.6, z: -18 });
  k.prop('tree.fruit.lemon', { x: -39.2, z: -14.4 });
  k.prop('garden.gnome', { x: -36.8, z: -14.2, rot: 0.4 });
  const gardeners: ReadonlyArray<readonly [number, number, number, string]> = [
    [-33.2, -23.9, 0.2, 'garden.dig'],
    [-29.8, -23.9, -0.3, 'garden.water'],
    [-26.8, -20.8, 0.4, 'garden.rake'],
    [-33.6, -17.6, Math.PI, 'garden.plant'],
    [-28.2, -26.4, Math.PI, 'garden.prune'],
    [-40.9, -16.2, 2.4, 'carry.sack'],
  ];
  for (const [x, z, heading, clip] of gardeners) {
    k.person({ x, z, heading, clip, hold: [{ key: k.rng.chance(0.5) ? 'upper.overalls' : 'upper.apron', tint: k.rng.pick(['sage', 'clay', 'butter', 'blue'] as const) }], look: { hat: k.rng.pick(['hat.straw.wide', 'hat.cap', 'hat.beanie', 'hat.bucket']), hatTint: 'sage', pants: 'sageDeep' } });
  }
}

function marrow(k: Kit): void {
  k.vignette({ id: 'prize-marrow', title: 'The prize marrow', story: 'A grower beams beside a marrow so big it came in its own wheelbarrow, while two judges measure it with straight faces and last year\'s champion sulks next to his modest pumpkins.' }, () => {
    const x = -30;
    const z = -15.6;
    k.prop('veg.marrow', { x, z });
    k.prop('cart.wheelbarrow', { x: x - 2.2, z: z + 0.2, rot: 0.9 });
    const grower = k.person({ x: x + 0.1, z: z - 1.1, heading: 0.1, clip: 'cheer.fistpump', hold: [{ key: 'upper.overalls', tint: 'blue' }], look: { hat: 'hat.straw.wide', hatTint: 'butter', shirt: 'butterLight', pattern: 4 } });
    k.searchable(grower, 'the marrow grower');
    k.person({ x: x - 0.7, z: z + 1.25, heading: Math.PI - 0.2, clip: 'point.down', look: { hat: 'hat.top', hatTint: 'ink' } });
    k.person({ x: x + 0.8, z: z + 1.3, heading: Math.PI + 0.3, clip: 'talk.nod', age: 'elder', look: { hat: 'hat.boater', hatTint: 'ivory' } });
    k.person({ x: x + 3.0, z: z + 0.9, heading: -1.4, clip: 'idle.arms', age: 'elder', look: { hat: 'hat.cap', hatTint: 'clay' } });
  });
}

function meadowPlants(k: Kit): void {
  for (let i = 0; i < 14; i++) {
    const x = k.rng.range(MEADOW.x0 + 1, MEADOW.x1 - 1);
    const z = k.rng.range(MEADOW.z0 + 1, MEADOW.z1 - 1);
    if (Math.abs(x + 36) < 4 && Math.abs(z + 2) < 4) continue;
    k.prop(k.rng.pick(['plant.flowers.c', 'plant.flowers.a', 'plant.flowers.b', 'plant.grass']), { x, z, rot: k.rng.range(0, 6.28), tint: k.rng.pick(['coral', 'butter', 'ivory', 'blueLight'] as const) });
  }
  k.prop('animal.butterflies', { x: -38.4, z: -5.4, y: 1.0 });
  k.prop('animal.butterflies', { x: -30.6, z: 2.6, y: 0.9 });
  k.prop('tree.blossom', { x: -44, z: 4.4 });
  k.prop('tree.blossom.butter', { x: -44.2, z: -9.6 });
}

/** The meadow loop the beekeeper patrols (just inside the meadow edge). */
const LOOP: readonly Vec3[] = [
  [-42.4, 0, -9.6],
  [-30.4, 0, -9.6],
  [-28.8, 0, -8],
  [-28.8, 0, 3.4],
  [-30.4, 0, 4.8],
  [-41.2, 0, 4.8],
  [-42.6, 0, 3.4],
];

function beekeeper(k: Kit): void {
  k.vignette({ id: 'beekeeper', title: 'A very polite swarm', story: 'A beekeeper strolls round the meadow followed by a neat single-file queue of bees, while the picnickers ahead flee with their hamper and the family dog stays behind to finish the sandwiches.' }, () => {
    const route = k.loop(LOOP);
    const v = 0.9;
    const walk = (v * 1.05) / 1.42;
    const s0 = 6;
    const keeper = k.person({ x: 0, z: 0, motion: k.onRoute(route, s0, v), clip: 'walk', speed: walk, hold: [{ key: 'upper.smock', tint: 'ivory' }], look: { hat: 'hat.beekeeper', hatTint: 'ivory', shirt: 'ivory', pants: 'ivoryShade', longSleeves: true } });
    k.searchable(keeper, 'the beekeeper');
    for (let i = 0; i < 8; i++) {
      const m = k.onRoute(route, s0 - 0.8 - i * 0.42, v, { lateral: i % 2 ? 0.12 : -0.12, y: 1.25 + (i % 3) * 0.16, bob: 0.08 });
      k.dynamic(bee(), m, { rot: Math.PI / 2 });
    }
    const fleeing: ReadonlyArray<readonly [number, string, readonly string[]]> = [
      [3.2, 'carry', ['carry.crate']],
      [4.1, 'walk', ['hold.umbrella']],
      [5.0, 'walk', ['hold.bag']],
    ];
    fleeing.forEach(([ds, clip, hold], i) => {
      k.person({ x: 0, z: 0, motion: k.onRoute(route, s0 + ds, v, { lateral: i % 2 ? 0.4 : -0.3 }), clip, speed: walk * 1.05, age: i === 2 ? 'child' : 'adult', hold: [...hold] });
    });
    k.prop('beach.picnic', { x: -36, z: -2, tint: 'coral' });
    k.prop('animal.dog.terrier.sit', { x: -35.6, z: -1.6, rot: -0.8 });
    k.prop('luggage.picnicHamper', { x: -36.9, z: -2.8 });
  });
  k.prop('beach.picnic', { x: -32.6, z: -6.2, tint: 'blue', rot: 0.3 });
  const cx = -32.6;
  const cz = -6.2;
  [0.4, 2.2, 4.1].forEach((a, i) => {
    k.person({ x: cx + Math.sin(a) * 1.15, z: cz + Math.cos(a) * 1.15, face: [cx, cz], clip: i === 1 ? 'sit.eat' : 'sit.ground', age: i === 2 ? 'child' : 'adult' });
  });
}

export function kitchen(k: Kit): void {
  hives(k);
  beds(k);
  marrow(k);
  meadowPlants(k);
  beekeeper(k);
}
