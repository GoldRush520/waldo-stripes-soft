/** Tree kinds, part B: blossom, fruit, birch, clipped cube, espalier, bare sculptural. */
import { type Col, type Geo, box, cyl, merge, rbox, tintable, translate } from '../../core/geo';
import type { Rng } from '../../core/rng';
import { type Q, type V3, ell, hiOnly, leafSway, limb } from './kit';
import { canopy, fruit, jitter, jv, trunk } from './tree-parts';

/** Blossom tree: spreading low fork with four loose crown puffs (tint them coral / butter / ivory). */
export function blossomTree(q: Q, h: number, rng: Rng): Geo {
  const j = jitter(rng, 10);
  const fork: V3 = [0, 0.36 * h, 0];
  const R = 0.2 * h;
  const tips: V3[] = [
    [0.32 * h, 0.66 * h, 0.05 * h * jv(j, 0)],
    [-0.28 * h, 0.7 * h, 0.08 * h * jv(j, 1)],
    [0.04 * h, 0.84 * h, -0.06 * h],
  ];
  const leaves = tips.map((p, i) => ({
    p,
    r: [R * (1 + 0.15 * jv(j, i + 2)), R * 0.78, R] as V3,
    size: 'mid' as const,
    col: (i === 1 ? 'sageLight' : 'sage') as Col,
  }));
  const crown = canopy(
    q,
    [...leaves, { p: [0, 0.6 * h, 0.1 * h], r: [R * 0.8, R * 0.6, R * 0.8], size: 'small', col: 'sageDeep', tint: false }],
    0.45 * h,
    h,
  );
  const limbs = q.hi
    ? tips.slice(0, 2).map((t) => limb(fork, [t[0] * 0.7, t[1] * 0.85, t[2]], 0.025 * h, 0.012 * h, 'timber', 5))
    : [];
  return merge(trunk(q, [[0, 0, 0], fork], 0.045 * h, 0.032 * h), limbs, crown);
}

/** Fruit tree: short trunk, squat crown, oranges or lemons (fruit is near-only detail). */
export function fruitTree(q: Q, h: number, rng: Rng, fruitCol: Col = 'butterDeep'): Geo {
  const j = jitter(rng, 20);
  const c = 0.62 * h;
  const R = 0.34 * h;
  const crown = canopy(
    q,
    [
      { p: [0, c, 0], r: [R, R * 0.75, R], size: 'big' },
      { p: [R * 0.6, c + 0.08 * h, -R * 0.2], r: [R * 0.5, R * 0.45, R * 0.5], size: 'small', col: 'sageLight' },
      { p: [-R * 0.55, c + 0.12 * h, R * 0.1], r: [R * 0.5, R * 0.45, R * 0.5], size: 'small', col: 'sageDeep', tint: false },
    ],
    0.35 * h,
    h,
  );
  const fruits = hiOnly(q, () =>
    Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2 + jv(j, i) * 0.3;
      const y = c + jv(j, i + 10) * R * 0.45;
      const rr = R * Math.sqrt(Math.max(0.1, 1 - ((y - c) / (R * 0.75)) ** 2)) * 1.0;
      return fruit([Math.sin(a) * rr, y, Math.cos(a) * rr], 0.055 * h * 0.5 + 0.03, fruitCol);
    }),
  );
  return merge(trunk(q, [[0, 0, 0], [0.03 * h, 0.4 * h, 0]], 0.055 * h, 0.04 * h), crown, fruits);
}

/** Slender birch: pale trunk with dark bands and a few tall airy puffs. */
export function birch(q: Q, h: number, rng: Rng): Geo {
  const j = jitter(rng, 6);
  const path: V3[] = [
    [0, 0, 0],
    [0.02 * h * jv(j, 0), 0.4 * h, 0],
    [0.03 * h, 0.82 * h, 0.01 * h],
  ];
  const R = 0.12 * h;
  const crown = canopy(
    q,
    [
      { p: [0.03 * h, 0.8 * h, 0], r: [R, R * 1.5, R], size: 'mid', col: 'sageLight' },
      { p: [0.12 * h, 0.62 * h, 0.04 * h * jv(j, 1)], r: [R * 0.8, R * 1.2, R * 0.8], size: 'mid' },
      { p: [-0.09 * h, 0.66 * h, -0.03 * h], r: [R * 0.85, R * 1.25, R * 0.85], size: 'mid', col: 'sageLight' },
    ],
    0.5 * h,
    h,
    0.2,
    0.4,
  );
  const bands = hiOnly(q, () =>
    [0.14, 0.27, 0.4].map((t) => translate(cyl(0.024 * h, 0.023 * h, 0.03, 'timberDeep', 5, false), 0.004 * h * jv(j, 0), t * h, 0)),
  );
  return merge(trunk(q, path, 0.022 * h, 0.012 * h, 'ivory'), bands, crown);
}

/** Clipped cube tree on a straight stem. */
export function cubeTree(q: Q, h: number, _rng: Rng): Geo {
  const s = 0.36 * h;
  const cube = q.hi ? rbox(s, s, s, s * 0.14, 'sage') : box(s, s, s, 'sage');
  const crown = leafSway(tintable(translate(cube, 0, h - s, 0)), h - s, h, 0.15, 0.25);
  return merge(trunk(q, [[0, 0, 0], [0, h - s + 0.05, 0]], 0.05, 0.04), crown);
}

/** Espalier: a tree trained flat against a wall (back of the prop is -z). */
export function espalier(q: Q, h: number, rng: Rng): Geo {
  const j = jitter(rng, 8);
  const z = 0.05;
  const w = 1.1 * h;
  const tiers = [0.35, 0.62, 0.88].map((t) => t * h);
  const arms = q.hi
    ? tiers.flatMap((y) => [1, -1].map((s) => limb([0, y, z], [s * w * 0.5, y + 0.04, z], 0.03, 0.015, 'timber', 4)))
    : [];
  const leaves = q.hi
    ? tiers.flatMap((y, i) =>
        [0.27, -0.27].map((t, k) =>
          ell(q, 'tiny', t * w, y + 0.08, z + 0.03, 0.24 * w, 0.13, 0.07, (i + k) % 2 ? 'sage' : 'sageLight'),
        ),
      )
    : tiers.map((y) => ell(q, 'nub', 0, y + 0.06, z, w * 0.5, 0.14, 0.08, 'sage'));
  const fruits = hiOnly(q, () => tiers.map((y, i) => fruit([w * 0.33 * jv(j, i), y - 0.05, z + 0.08], 0.04, 'coral')));
  const foliage = leafSway(tintable(merge(leaves)), 0, h, 0.15, 0.25);
  return merge(trunk(q, [[0, 0, z], [0, h * 0.92, z]], 0.06, 0.03), arms, foliage, fruits);
}

/** Bare sculptural tree: twisting trunk and splayed limbs, no foliage. */
export function bareTree(q: Q, h: number, rng: Rng): Geo {
  const j = jitter(rng, 24);
  const path: V3[] = [
    [0, 0, 0],
    [0.06 * h * jv(j, 0), 0.25 * h, 0.04 * h],
    [-0.05 * h, 0.48 * h, 0.05 * h * jv(j, 1)],
  ];
  const fork = path[2] as V3;
  const n = q.s(6, 4);
  const limbs = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + jv(j, i + 2) * 0.4;
    const len = (0.32 + 0.1 * jv(j, i + 8)) * h;
    const tip: V3 = [fork[0] + Math.sin(a) * len * 0.6, fork[1] + len * (0.75 + 0.15 * jv(j, i + 14)), fork[2] + Math.cos(a) * len * 0.6];
    const twig = q.hi
      ? [limb(tip, [tip[0] + Math.sin(a + 0.8) * 0.18 * h, tip[1] + 0.12 * h, tip[2] + Math.cos(a + 0.8) * 0.18 * h], 0.008 * h, 0.003 * h, 'timberDeep', 3)]
      : [];
    return merge(limb(fork, tip, 0.022 * h, 0.009 * h, 'timberDeep', q.s(4, 3)), twig);
  });
  return merge(trunk(q, path, 0.055 * h, 0.035 * h, 'timberDeep'), limbs);
}
