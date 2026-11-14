/** Garden pieces: gnome, bird bath, urn, beehives, compost bin, rocks, driftwood, pebbles. */
import { type Geo, box, cone, disc, dome, gable, lathe, merge, shadeY, sphere, sway, tintable, translate } from '../../core/geo';
import type { Rng } from '../../core/rng';
import { type Q, type V3, chain, ell, hiOnly, limb, lumpy, pair } from './kit';

type Prof = ReadonlyArray<readonly [number, number]>;

/** Garden gnome (0.5 m) with a tint-masked hat (default coral) and an ivory beard. */
export function gnome(q: Q, _rng: Rng): Geo {
  const coat = cone(0.16, 0.34, 'blue', q.s(8, 4));
  const head = ell(q, q.hi ? 'small' : 'nub', 0, 0.33, 0.01, 0.075, 0.075, 0.075, 'clayLight');
  const hat = tintable(translate(cone(0.085, 0.2, 'coral', q.s(8, 4)), 0, 0.36, 0));
  const extras = hiOnly(q, () => [
    translate(cone(0.07, 0.15, 'ivory', 6), 0, 0.2, 0.05),
    ell(q, 'nub', 0, 0.32, 0.08, 0.025, 0.025, 0.025, 'coralLight'),
    ...pair((s) => ell(q, 'nub', s * 0.06, 0.03, 0.06, 0.045, 0.03, 0.07, 'cocoa')),
    ...pair((s) => limb([s * 0.12, 0.25, 0.02], [s * 0.07, 0.15, 0.1], 0.025, 0.022, 'blue', 4)),
  ]);
  return merge(coat, head, hat, extras);
}

const BATH_HI: Prof = [
  [0.2, 0],
  [0.2, 0.06],
  [0.08, 0.12],
  [0.07, 0.6],
  [0.12, 0.7],
  [0.38, 0.78],
  [0.4, 0.86],
];
const BATH_LO: Prof = [
  [0.2, 0],
  [0.07, 0.15],
  [0.08, 0.68],
  [0.4, 0.86],
];

/** Stone bird bath with water and (near only) a perched sparrow. */
export function birdBath(q: Q, _rng: Rng): Geo {
  const stand = lathe(q.hi ? BATH_HI : BATH_LO, 'stone', q.s(10, 5));
  const water = translate(disc(0.36, 'blueLight', q.s(10, 5)), 0, 0.82, 0);
  const bird = hiOnly(q, () => [
    ell(q, 'tiny', 0.3, 0.92, 0.1, 0.05, 0.045, 0.08, 'clayDeep'),
    ell(q, 'nub', 0.3, 0.98, 0.17, 0.035, 0.035, 0.035, 'clayDeep'),
    translate(cone(0.012, 0.03, 'butterDeep', 3), 0.3, 0.97, 0.2),
  ]);
  return merge(stand, water, bird);
}

const URN_HI: Prof = [
  [0.14, 0],
  [0.16, 0.05],
  [0.08, 0.12],
  [0.22, 0.3],
  [0.28, 0.45],
  [0.25, 0.55],
  [0.3, 0.6],
];
const URN_LO: Prof = [
  [0.14, 0],
  [0.08, 0.12],
  [0.28, 0.42],
  [0.3, 0.6],
];

/** Classical urn on a plinth with a trailing plant. */
export function urn(q: Q, _rng: Rng): Geo {
  const base = box(0.5, 0.35, 0.5, 'ivoryShade');
  const body = translate(lathe(q.hi ? URN_HI : URN_LO, 'ivory', q.s(10, 5)), 0, 0.35, 0);
  const plant = ell(q, q.hi ? 'small' : 'nub', 0, 0.98, 0, 0.32, 0.18, 0.32, 'sage');
  const trails = hiOnly(q, () =>
    [0.4, 2.3, 4.2].map((a) => ell(q, 'nub', Math.sin(a) * 0.3, 0.82, Math.cos(a) * 0.3, 0.09, 0.16, 0.09, 'sageLight')),
  );
  return merge(base, body, sway(tintable(merge(plant, trails), 0.6), 0.2));
}

const SKEP_HI: Prof = [
  [0.32, 0],
  [0.34, 0.1],
  [0.31, 0.12],
  [0.32, 0.25],
  [0.27, 0.28],
  [0.26, 0.4],
  [0.18, 0.45],
  [0.14, 0.53],
  [0.02, 0.6],
];

/** Straw skep beehive on a timber stand, bees near only. */
export function skep(q: Q, rng: Rng): Geo {
  const top = translate(box(0.8, 0.06, 0.8, 'timber'), 0, 0.45, 0);
  const legs = q.hi
    ? pair((s) => translate(box(0.08, 0.45, 0.6, 'timberDeep'), s * 0.3, 0, 0))
    : [box(0.6, 0.45, 0.6, 'timberDeep')];
  const hive = q.hi ? lathe(SKEP_HI, 'butter', 10) : dome(0.33, 'butter', 5, 2);
  const door = hiOnly(q, () => translate(box(0.12, 0.06, 0.04, 'cocoa'), 0, 0.51, 0.32));
  const bees = hiOnly(q, () =>
    Array.from({ length: 3 }, () => translate(sphere(0.02, 'ink', 4, 2), rng.range(-0.3, 0.3), rng.range(0.6, 1.1), rng.range(0.3, 0.6))),
  );
  return merge(legs, top, translate(shadeY(hive, 0.85, 1), 0, 0.51, 0), door, bees);
}

/** Classic stacked box hive: ivory and butter lifts under a gabled roof, on legs. */
export function boxHive(q: Q, _rng: Rng): Geo {
  const legs = q.hi
    ? pair((s) => translate(box(0.06, 0.3, 0.5, 'timberDeep'), s * 0.22, 0, 0))
    : [box(0.5, 0.3, 0.5, 'timberDeep')];
  const lifts = q.hi
    ? [
        translate(box(0.6, 0.22, 0.6, 'ivory'), 0, 0.3, 0),
        translate(box(0.56, 0.2, 0.56, 'butter'), 0, 0.52, 0),
        translate(box(0.6, 0.22, 0.6, 'ivory'), 0, 0.72, 0),
      ]
    : [translate(box(0.6, 0.64, 0.6, 'ivory'), 0, 0.3, 0)];
  const roof = translate(gable(0.74, 0.22, 0.74, 'coralDeep'), 0, 0.94, 0);
  const porch = hiOnly(q, () => [translate(box(0.4, 0.03, 0.08, 'timber'), 0, 0.3, 0.33), translate(box(0.3, 0.02, 0.01, 'ink'), 0, 0.33, 0.305)]);
  return merge(legs, lifts, roof, porch);
}

/** Slatted timber compost bin with a heap. */
export function compost(q: Q, _rng: Rng): Geo {
  const walls = q.hi
    ? [0.1, 0.32, 0.54, 0.76].flatMap((y) => [
        translate(box(1.2, 0.16, 0.05, 'timber'), 0, y, -0.55),
        translate(box(0.05, 0.16, 1.1, 'timber'), -0.58, y, 0),
        translate(box(0.05, 0.16, 1.1, 'timberDeep'), 0.58, y, 0),
      ])
    : [translate(box(1.2, 0.86, 0.05, 'timber'), 0, 0.06, -0.55), translate(box(0.05, 0.86, 1.1, 'timber'), -0.58, 0.06, 0), translate(box(0.05, 0.86, 1.1, 'timberDeep'), 0.58, 0.06, 0)];
  const posts = hiOnly(q, () => [-0.58, 0.58].map((x) => translate(box(0.08, 0.95, 0.08, 'timberDeep'), x, 0, -0.55)));
  const heap = ell(q, q.hi ? 'mid' : 'nub', 0, 0.2, 0.05, 0.5, 0.55, 0.5, 'cocoa');
  const greens = hiOnly(q, () => [ell(q, 'tiny', 0.15, 0.62, 0.1, 0.16, 0.08, 0.14, 'sage'), ell(q, 'tiny', -0.2, 0.55, 0.25, 0.14, 0.06, 0.12, 'butterDeep')]);
  return merge(walls, posts, heap, greens);
}

/** Smooth beach / garden rock of radius r. */
export function rock(q: Q, r: number, seed: number): Geo {
  const c: V3 = [0, r * 0.45, 0];
  const main = lumpy(ell(q, 'mid', 0, c[1], 0, r, r * 0.62, r * 0.85, 'stone'), c, 0.12, seed);
  const side = hiOnly(q, () => ell(q, 'tiny', r * 0.65, r * 0.25, r * 0.3, r * 0.45, r * 0.32, r * 0.4, 'stone'));
  return shadeY(merge(main, side), 0.75, 1.05);
}

/** A cluster of five rocks. */
export function rockCluster(q: Q, _rng: Rng): Geo {
  const spots: ReadonlyArray<readonly [number, number, number]> = [
    [0, 0, 0.55],
    [0.7, 0.2, 0.4],
    [-0.6, 0.3, 0.35],
    [0.25, -0.55, 0.3],
    [-0.35, -0.45, 0.22],
  ];
  return merge(spots.map(([x, z, r], i) => translate(rockLite(q, r, i + 3), x, 0, z)));
}

function rockLite(q: Q, r: number, seed: number): Geo {
  const c: V3 = [0, r * 0.45, 0];
  return shadeY(lumpy(ell(q, q.hi ? 'small' : 'nub', 0, c[1], 0, r, r * 0.62, r * 0.85, seed % 2 ? 'stone' : 'clayLight'), c, 0.14, seed), 0.75, 1.05);
}

/** Bleached driftwood log with a forked stub. */
export function driftwood(q: Q, _rng: Rng): Geo {
  const path: V3[] = q.hi
    ? [
        [-0.9, 0.1, 0.05],
        [-0.3, 0.13, -0.05],
        [0.35, 0.11, 0.06],
        [0.95, 0.08, -0.02],
      ]
    : [
        [-0.9, 0.1, 0.05],
        [0.95, 0.08, -0.02],
      ];
  const log = chain(path, 0.11, 0.07, 'ivoryDeep', q.s(6, 3));
  const stubs = hiOnly(q, () => [
    limb([0.2, 0.12, 0.05], [0.5, 0.35, 0.3], 0.05, 0.02, 'ivoryDeep', 4),
    limb([-0.5, 0.12, 0], [-0.75, 0.25, -0.3], 0.045, 0.02, 'ivoryDeep', 4),
  ]);
  return merge(log, stubs);
}

/** Patch of flat pebbles. */
export function pebbles(q: Q, rng: Rng): Geo {
  if (!q.hi) return translate(disc(0.55, 'stone', 6), 0, 0.02, 0);
  const cols = ['stone', 'clayLight', 'ivoryDeep', 'blueLight'] as const;
  return merge(
    Array.from({ length: 8 }, (_, i) => {
      const a = rng.range(0, Math.PI * 2);
      const d = 0.5 * Math.sqrt(rng.next());
      const r = rng.range(0.06, 0.12);
      return ell(q, 'nub', Math.sin(a) * d, r * 0.3, Math.cos(a) * d, r, r * 0.35, r * 0.8, cols[i % 4] ?? 'stone');
    }),
  );
}
