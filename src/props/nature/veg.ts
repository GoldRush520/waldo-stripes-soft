/** Kitchen-garden pieces: pumpkins, cabbages, tomatoes, bean wigwam, raised bed, seedlings, prize marrow. */
import { type Geo, beam, box, cone, cyl, merge, sphere, sway, tintable, translate } from '../../core/geo';
import type { Rng } from '../../core/rng';
import { type Q, type V3, ell, ellR, hiOnly, limb, orient } from './kit';

const soft = (g: Geo, k = 0.3): Geo => sway(g, (_x, y) => Math.min(0.35, y * k));

export function pumpkinPatch(q: Q, rng: Rng): Geo {
  const spots: ReadonlyArray<readonly [number, number, number]> = [
    [-0.45, 0.1, 0.28],
    [0.35, -0.2, 0.22],
    [0.2, 0.45, 0.18],
  ];
  const pumpkins = spots.flatMap(([x, z, r]) => [
    ell(q, q.hi ? 'mid' : 'nub', x, r * 0.75, z, r * 1.15, r * 0.75, r * 1.1, 'butterDeep'),
    ...hiOnly(q, () => limb([x, r * 1.45, z], [x + 0.03, r * 1.65, z], 0.025, 0.02, 'timberDeep', 3)),
  ]);
  const leaves = hiOnly(q, () =>
    [0.6, 2.4, 4.1].map((a) => ellR(q, 'nub', [Math.sin(a) * 0.5, 0.05, Math.cos(a) * 0.5], [0.22, 0.04, 0.2], [0, a + rng.range(-0.3, 0.3), 0], 'sage')),
  );
  return merge(pumpkins, soft(merge(leaves)));
}

export function cabbageRow(q: Q, _rng: Rng): Geo {
  const soil = box(2.0, 0.06, 0.45, 'cocoa');
  const xs = [-0.76, -0.38, 0, 0.38, 0.76];
  const heads = xs.flatMap((x, i) => [
    ell(q, 'small', x, 0.17, 0, 0.17, 0.14, 0.17, i % 2 ? 'sageLight' : 'sage'),
  ]);
  return merge(soil, soft(merge(heads), 0.6));
}

export function tomatoCanes(q: Q, rng: Rng): Geo {
  const soil = box(1.4, 0.06, 0.4, 'cocoa');
  const xs = [-0.45, 0, 0.45];
  const canes = hiOnly(q, () => xs.map((x) => beam([x, 0, -0.05], [x, 1.55, -0.05], 0.03, 'timber')));
  const plants = xs.map((x, i) => ell(q, q.hi ? 'small' : 'nub', x, 0.75, 0.04, 0.2, 0.65, 0.18, i % 2 ? 'sageDeep' : 'sage'));
  const fruit = hiOnly(q, () =>
    xs.flatMap((x) => [0.35, 0.65, 0.95].map((y) => translate(sphere(0.045, 'coral', 4, 2), x + rng.range(-0.15, 0.15), y, 0.2))),
  );
  return merge(soil, canes, soft(merge(plants, fruit)));
}

export function beanWigwam(q: Q, rng: Rng): Geo {
  const top: V3 = [0, 2.0, 0];
  if (!q.hi) return soft(merge(cone(0.5, 2.05, 'sage', 5)), 0.15);
  const poles = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2;
    return limb([Math.sin(a) * 0.55, 0, Math.cos(a) * 0.55], top, 0.02, 0.015, 'timber', 3);
  });
  const leaves = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + 0.5;
    const y = 0.4 + (i % 3) * 0.5;
    const r = 0.55 * (1 - y / 2.1) + 0.06;
    return ell(q, 'tiny', Math.sin(a) * r, y, Math.cos(a) * r, 0.18, 0.28, 0.18, i % 2 ? 'sage' : 'sageLight');
  });
  const flowers = Array.from({ length: 6 }, () => {
    const a = rng.range(0, Math.PI * 2);
    const y = rng.range(0.5, 1.6);
    const r = 0.55 * (1 - y / 2.1) + 0.14;
    return tintable(translate(sphere(0.04, 'coral', 4, 2), Math.sin(a) * r, y, Math.cos(a) * r));
  });
  return merge(poles, soft(merge(leaves, flowers), 0.15));
}

export function vegBed(q: Q, _rng: Rng): Geo {
  const frame = box(2.0, 0.3, 1.0, 'timber');
  const soil = hiOnly(q, () => translate(box(1.88, 0.04, 0.88, 'cocoa'), 0, 0.28, 0));
  const rows = q.hi
    ? [-0.3, 0, 0.3].flatMap((z, r) =>
        [-0.66, -0.22, 0.22, 0.66].map((x) => ell(q, 'tiny', x, 0.38, z, 0.13, 0.1, 0.13, r === 1 ? 'sageLight' : 'sage')),
      )
    : [-0.3, 0, 0.3].map((z) => ell(q, 'nub', 0, 0.36, z, 0.85, 0.08, 0.12, 'sage'));
  return merge(frame, soil, soft(merge(rows)));
}

export function seedlingBench(q: Q, _rng: Rng): Geo {
  const top = translate(box(1.6, 0.06, 0.6, 'timber'), 0, 0.72, 0);
  const legs = q.hi
    ? [-0.72, 0.72].flatMap((x) => [-0.24, 0.24].map((z) => translate(box(0.06, 0.72, 0.06, 'timberDeep'), x, 0, z)))
    : [-0.72, 0.72].map((x) => translate(box(0.06, 0.72, 0.54, 'timberDeep'), x, 0, 0));
  const xs = [-0.5, 0, 0.5];
  const trays = q.hi
    ? xs.map((x) => translate(box(0.44, 0.08, 0.36, 'clayDeep'), x, 0.78, 0))
    : [translate(box(1.44, 0.08, 0.36, 'clayDeep'), 0, 0.78, 0)];
  const shoots = q.hi
    ? xs.flatMap((x) =>
        [-0.13, 0, 0.13].flatMap((dx) => [-0.09, 0.09].map((dz) => translate(cone(0.04, 0.1, 'sageLight', 3), x + dx, 0.86, dz))),
      )
    : [translate(box(1.4, 0.06, 0.3, 'sageLight'), 0, 0.86, 0)];
  return merge(top, legs, trays, sway(merge(shoots), 0.15));
}

/** Giant prize marrow on a pallet, with a rosette (tint-masked) and a label card. */
export function prizeMarrow(q: Q, _rng: Rng): Geo {
  const pallet = box(1.3, 0.12, 0.7, 'timber');
  const marrow = ell(q, 'big', 0, 0.38, 0, 0.62, 0.27, 0.27, 'sage');
  const stripes = hiOnly(q, () =>
    [-0.3, 0, 0.3].map((x) => ell(q, 'nub', x, 0.38, 0, 0.07, 0.27 * Math.sqrt(1 - (x / 0.62) ** 2) + 0.02, 0.27 * Math.sqrt(1 - (x / 0.62) ** 2) + 0.02, 'sageLight')),
  );
  const rosette = hiOnly(q, () => [
    tintable(orient(cyl(0.1, 0.1, 0.02, 'coral', 8), [Math.PI / 2, 0, 0], [0.15, 0.42, 0.27])),
    tintable(beam([0.12, 0.38, 0.29], [0.08, 0.22, 0.3], 0.04, 'coral')),
    tintable(beam([0.18, 0.38, 0.29], [0.22, 0.22, 0.3], 0.04, 'coral')),
    translate(box(0.22, 0.12, 0.02, 'ivory'), -0.4, 0.12, 0.33),
  ]);
  return merge(pallet, marrow, stripes, rosette);
}
