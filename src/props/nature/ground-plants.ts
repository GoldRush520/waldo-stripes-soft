/** Foliage and ground plants: fern, agave, cacti, grass, reeds, lily pads. */
import { type Geo, cone, cyl, disc, merge, sway, tintable, translate } from '../../core/geo';
import type { Rng } from '../../core/rng';
import { type Q, type V3, chain, ell, ellR, hiOnly, limb, orient } from './kit';
import { pot } from './tree-parts';

/** Ring of n items around the y axis with a seeded yaw jitter. */
function ring(rng: Rng, n: number): number[] {
  return Array.from({ length: n }, (_, i) => (i / n) * Math.PI * 2 + rng.range(-0.2, 0.2));
}

export function fern(q: Q, rng: Rng): Geo {
  const yaws = ring(rng, 7);
  const fronds = (q.hi ? yaws : yaws.filter((_, i) => i % 2 === 0)).map((a, i) =>
    ellR(q, 'nub', [Math.sin(a) * 0.32, 0.3, Math.cos(a) * 0.32], [0.09, 0.025, 0.36], [-0.5, a, 0], i % 2 ? 'sage' : 'sageLight'),
  );
  const core = hiOnly(q, () => ell(q, 'tiny', 0, 0.1, 0, 0.12, 0.1, 0.12, 'sageDeep'));
  return sway(merge(fronds, core), (x, _y, z) => Math.min(0.4, 0.15 + Math.hypot(x, z) * 0.4));
}

export function agave(q: Q, rng: Rng): Geo {
  if (!q.hi) return cone(0.45, 0.6, 'sageLight', 4);
  const yaws = ring(rng, 9);
  const leaves = yaws.map((a, i) => orient(cone(0.09, 0.7 - (i % 3) * 0.08, i % 2 ? 'sageLight' : 'sage', 3), [0.55 + (i % 3) * 0.2, a, 0]));
  const heart = cone(0.08, 0.55, 'sageDeep', 4);
  return merge(leaves, heart);
}

/** Saguaro-style column cactus with two arms. */
export function cactusColumn(q: Q, _rng: Rng): Geo {
  const h = 1.8;
  const body = limb([0, 0, 0], [0, h - 0.16, 0], 0.17, 0.16, 'sage', q.s(7, 4));
  const top = hiOnly(q, () => ell(q, 'small', 0, h - 0.17, 0, 0.16, 0.17, 0.16, 'sage'));
  const arm = (s: 1 | -1, y: number, up: number): Geo[] => {
    const pts: V3[] = [
      [0, y, 0],
      [s * 0.38, y + 0.05, 0],
      [s * 0.4, y + up, 0],
    ];
    const tip = hiOnly(q, () => ell(q, 'tiny', s * 0.4, y + up, 0, 0.1, 0.1, 0.1, 'sage'));
    return q.hi ? [...chain(pts, 0.1, 0.1, 'sage', 6), ...tip] : [limb(pts[0] as V3, pts[2] as V3, 0.1, 0.1, 'sage', 3)];
  };
  return merge(body, top, arm(1, 0.7, 0.45), arm(-1, 0.95, 0.35));
}

/** Prickly-pear paddles in a terracotta pot, one butter flower. */
export function cactusPaddle(q: Q, rng: Rng): Geo {
  const ph = 0.3;
  const pads: ReadonlyArray<readonly [V3, number]> = q.hi
    ? [
        [[0, ph + 0.2, 0], 0],
        [[0.16, ph + 0.42, 0.02], -0.5],
        [[-0.15, ph + 0.4, -0.02], 0.45],
        [[0.05, ph + 0.62, 0.03], 0.1],
        [[-0.26, ph + 0.62, 0], 0.7],
      ]
    : [
        [[0, ph + 0.25, 0], 0],
        [[0.05, ph + 0.55, 0], 0.2],
      ];
  const spin = rng.range(-0.4, 0.4);
  const padGeo = pads.map(([p, roll]) => ellR(q, 'nub', p, [0.12, 0.16, 0.035], [0, spin, roll], 'sage'));
  const flower = hiOnly(q, () => tintable(translate(cone(0.05, 0.06, 'butter', 5), 0.05, ph + 0.76, 0.03)));
  return merge(pot(q, 0.2, ph), padGeo, flower);
}

/** Three tufts of grass blades. */
export function grassTufts(q: Q, rng: Rng): Geo {
  const tufts: V3[] = [
    [0, 0, 0],
    [0.28, 0, 0.12],
    [-0.22, 0, 0.18],
  ];
  const blades = tufts.flatMap((t) =>
    q.hi
      ? ring(rng, 5).map((a, i) => orient(cone(0.035, 0.32 + (i % 2) * 0.12, i % 2 ? 'sage' : 'sageLight', 3), [0.3, a, 0], t))
      : [translate(cone(0.12, 0.38, 'sage', 3), t[0], 0, t[2])],
  );
  return sway(merge(blades), (_x, y) => Math.min(0.4, y * 1.1));
}

/** Reeds and bulrushes for pond and canal edges. */
export function reeds(q: Q, rng: Rng): Geo {
  if (!q.hi) {
    return sway(merge([0, 2.1, 4.2].map((a) => translate(cone(0.16, 1.3, 'sageDeep', 3), Math.sin(a) * 0.15, 0, Math.cos(a) * 0.15))), (_x, y) => Math.min(0.4, y * 0.3));
  }
  const stems = Array.from({ length: 9 }, () => {
    const x = rng.range(-0.3, 0.3);
    const z = rng.range(-0.25, 0.25);
    const top: V3 = [x + rng.range(-0.1, 0.1), rng.range(0.9, 1.5), z + rng.range(-0.08, 0.08)];
    return { base: [x, 0, z] as V3, top };
  });
  const reedGeo = stems.map((s, i) => limb(s.base, s.top, 0.014, 0.006, i % 2 ? 'sage' : 'sageDeep', 3));
  const rushes = stems.slice(0, 4).map((s) => limb([s.top[0], s.top[1] - 0.28, s.top[2]], [s.top[0], s.top[1] - 0.06, s.top[2]], 0.03, 0.03, 'cocoa', 4));
  const blades = [0.4, 2.5, 4.4].map((a) => orient(cone(0.05, 0.8, 'sageLight', 3), [0.25, a, 0]));
  return sway(merge(reedGeo, rushes, blades), (_x, y) => Math.min(0.4, y * 0.3));
}

/** Lily pads floating at y = 0 (the water surface) with one tint-masked bloom (default coralLight). */
export function lilyPads(q: Q, rng: Rng): Geo {
  const spots: ReadonlyArray<readonly [number, number, number]> = q.hi
    ? [
        [0, 0, 0.32],
        [0.42, 0.15, 0.24],
        [-0.36, 0.22, 0.2],
        [0.12, -0.38, 0.26],
        [-0.25, -0.3, 0.17],
      ]
    : [
        [0, 0, 0.36],
        [0.1, -0.3, 0.3],
      ];
  const pads = spots.map(([x, z, r], i) => translate(disc(r, i % 2 ? 'sage' : 'sageLight', q.s(9, 5)), x, 0.01 + i * 0.002, z));
  const bloom = q.hi
    ? [
        tintable(translate(cone(0.11, 0.1, 'coralLight', 6), 0.02, 0.012, 0.04)),
        tintable(translate(cyl(0.07, 0.11, 0.08, 'coralLight', 6, false), 0.02, 0.02, 0.04)),
        translate(cyl(0.035, 0.03, 0.12, 'butter', 5), 0.02, 0.02, 0.04),
      ]
    : [tintable(ell(q, 'nub', 0.02, 0.07, 0.04, 0.1, 0.07, 0.1, 'coralLight'))];
  const twist = rng.range(0, Math.PI * 2);
  return orient(merge(pads, sway(merge(bloom), 0.15)), [0, twist, 0]);
}
