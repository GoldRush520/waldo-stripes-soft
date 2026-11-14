/** Tree kinds, part A: round plane tree, lollipop, cypress, umbrella pine, palm, weeping willow. */
import { type Geo, beam, cyl, lathe, merge, sway, tintable, translate } from '../../core/geo';
import type { Rng } from '../../core/rng';
import { type Q, type V3, ell, ellR, hiOnly, leafSway, limb, swayFrom } from './kit';
import { canopy, jitter, jv, trunk } from './tree-parts';

/** Broad plane tree: forked trunk under one big crown blob and two shoulder blobs. */
export function roundTree(q: Q, h: number, rng: Rng): Geo {
  const j = jitter(rng, 8);
  const lean = jv(j, 0) * 0.04 * h;
  const top: V3 = [lean, 0.5 * h, 0];
  const c = 0.68 * h;
  const R = 0.3 * h;
  const side = (s: 1 | -1, k: number): V3 => [s * 0.24 * h + lean, c - 0.05 * h + jv(j, k) * 0.04 * h, jv(j, k + 1) * 0.12 * h];
  const crown = canopy(
    q,
    [
      { p: [lean, c + 0.05 * h, 0], r: [R, R * 0.82, R * 0.95], size: 'big' },
      { p: side(1, 1), r: [R * 0.66, R * 0.6, R * 0.66], size: 'mid', col: 'sageLight' },
      { p: side(-1, 3), r: [R * 0.62, R * 0.58, R * 0.62], size: 'mid', col: 'sageDeep', tint: false },
    ],
    0.45 * h,
    h,
  );
  const branches = hiOnly(q, () =>
    [1, -1].map((s) => limb(top, [lean + s * 0.16 * h, 0.62 * h, jv(j, 5) * 0.05 * h], 0.022 * h, 0.012 * h, 'timber', 5)),
  );
  return merge(trunk(q, [[0, 0, 0], top], 0.05 * h, 0.032 * h), branches, crown);
}

/** Clipped street tree: straight stem, ball crown with two bumps, a timber stake. */
export function lollipopTree(q: Q, h: number, rng: Rng): Geo {
  const j = jitter(rng, 4);
  const c = 0.76 * h;
  const R = 0.22 * h;
  const crown = canopy(
    q,
    [
      { p: [0, c, 0], r: [R, R * 0.92, R], size: 'big' },
      { p: [R * 0.55, c + R * 0.55, jv(j, 0) * R * 0.3], r: [R * 0.5, R * 0.45, R * 0.5], size: 'small', col: 'sageLight' },
      { p: [-R * 0.6, c - R * 0.25, R * 0.3 + jv(j, 1) * 0.1], r: [R * 0.5, R * 0.48, R * 0.5], size: 'small' },
    ],
    0.6 * h,
    h,
    0.15,
    0.3,
  );
  const stake = hiOnly(q, () => [
    beam([0.12, 0, 0.05], [0.1, 0.32 * h, 0.04], 0.04, 'timberDeep'),
    translate(cyl(0.065, 0.065, 0.05, 'ivoryDeep', 6, false), 0, 0.28 * h, 0),
  ]);
  return merge(trunk(q, [[0, 0, 0], [0, c - R * 0.6, 0]], 0.045, 0.035), stake, crown);
}

/** Italian cypress: one tall flame lathe with an offset bulge so the silhouette is never a cone. */
export function cypress(q: Q, h: number, rng: Rng): Geo {
  const j = jitter(rng, 3);
  const w = 0.11 * h;
  const prof: ReadonlyArray<readonly [number, number]> = q.hi
    ? [
        [0.05, 0.25 * h * 0.5],
        [w * 0.85, 0.14 * h],
        [w, 0.32 * h],
        [w * 0.92, 0.52 * h],
        [w * 0.66, 0.72 * h],
        [w * 0.32, 0.9 * h],
        [0.02, h],
      ]
    : [
        [0.05, 0.12 * h],
        [w, 0.32 * h],
        [w * 0.6, 0.72 * h],
        [0.02, h],
      ];
  const flame = tintable(lathe(prof, 'sageDeep', q.s(10, 5)));
  const bulge = tintable(ell(q, 'mid', w * 0.35, 0.46 * h + jv(j, 0) * 0.04 * h, w * 0.2, w * 0.75, 0.2 * h, w * 0.75, 'sage'));
  const foliage = leafSway(merge(flame, bulge), 0.1 * h, h, 0.15, 0.35);
  return merge(trunk(q, [[0, 0, 0], [0, 0.16 * h, 0]], 0.06 * h * 0.5, 0.04 * h * 0.5), foliage);
}

/** Stone pine: long curving bare trunk and a wide flat parasol crown. */
export function umbrellaPine(q: Q, h: number, rng: Rng): Geo {
  const j = jitter(rng, 4);
  const lean = 0.08 * h * (j[0] ?? 0.5);
  const path: V3[] = [
    [0, 0, 0],
    [lean * 0.4, 0.35 * h, 0.02 * h],
    [lean, 0.72 * h, 0],
  ];
  const c = 0.82 * h;
  const R = 0.32 * h;
  const crown = canopy(
    q,
    [
      { p: [lean, c, 0], r: [R, 0.1 * h, R * 0.9], size: 'big' },
      { p: [lean + R * 0.62, c - 0.04 * h, R * 0.25 * jv(j, 1)], r: [R * 0.55, 0.08 * h, R * 0.55], size: 'mid', col: 'sageDeep', tint: false },
      { p: [lean - R * 0.55, c + 0.03 * h, -R * 0.2], r: [R * 0.6, 0.085 * h, R * 0.6], size: 'mid', col: 'sageLight' },
    ],
    0.7 * h,
    h,
    0.15,
    0.35,
  );
  const branch = hiOnly(q, () => limb([lean, 0.66 * h, 0], [lean + R * 0.55, c - 0.06 * h, 0], 0.03 * h, 0.015 * h, 'timberDeep', 4));
  return merge(trunk(q, path, 0.045 * h, 0.028 * h, 'timberDeep'), branch, crown);
}

/** Palm: curved ringed trunk, drooping fronds that sway, coconuts. */
export function palm(q: Q, h: number, rng: Rng): Geo {
  const j = jitter(rng, 10);
  const bend = 0.12 * h * (0.6 + 0.4 * jv(j, 0));
  const path: V3[] = [
    [0, 0, 0],
    [bend * 0.15, 0.3 * h, 0],
    [bend * 0.45, 0.62 * h, 0],
    [bend, 0.95 * h, 0],
  ];
  const crown: V3 = [bend, 0.95 * h, 0];
  const L = Math.min(2.2, 0.28 * h);
  const n = q.s(7, 5);
  const fronds = Array.from({ length: n }, (_, i) => {
    const yaw = (i / n) * Math.PI * 2 + jv(j, i + 1) * 0.25;
    const droop = 0.35 + 0.25 * Math.abs(jv(j, i + 2));
    const cx = crown[0] + Math.sin(yaw) * (L / 2) * Math.cos(droop);
    const cz = crown[2] + Math.cos(yaw) * (L / 2) * Math.cos(droop);
    const cy = crown[1] - (L / 2) * Math.sin(droop) + 0.08;
    return ellR(q, q.hi ? 'tiny' : 'nub', [cx, cy, cz], [0.24, 0.035, L / 2], [droop, yaw, 0], i % 2 ? 'sage' : 'sageLight');
  });
  const leafs = swayFrom(tintable(merge(fronds)), crown, L, 0.4);
  const nuts = hiOnly(q, () =>
    [0, 2, 4].map((k) => ell(q, 'nub', crown[0] + Math.sin(k) * 0.16, crown[1] - 0.12, Math.cos(k) * 0.16, 0.1, 0.1, 0.1, 'timberDeep')),
  );
  return merge(trunk(q, path, 0.035 * h, 0.022 * h, 'timber'), nuts, leafs);
}

/** Weeping willow: domed crown over a long swaying curtain of leaves. */
export function willow(q: Q, h: number, rng: Rng): Geo {
  const j = jitter(rng, 3);
  const c = 0.72 * h;
  const R = 0.28 * h;
  const crown = canopy(
    q,
    [
      { p: [0, c, 0], r: [R, R * 0.6, R], size: 'big' },
      { p: [R * 0.3 * jv(j, 0), c + R * 0.42, R * 0.2], r: [R * 0.62, R * 0.45, R * 0.62], size: 'mid', col: 'sageLight' },
    ],
    0.5 * h,
    h,
  );
  const drop = 0.48 * h;
  const outer = translate(cyl(R * 1.18, R * 0.95, drop, 'sageLight', q.s(11, 5), false), 0, c - drop, 0);
  const inner = translate(cyl(R * 0.98, R * 0.8, drop * 0.85, 'sageDeep', q.s(9, 4), false), 0, c - drop * 0.8, 0);
  const curtain = merge(tintable(outer), inner);
  const swaying = leafSwayDown(curtain, c - drop, c);
  return merge(trunk(q, [[0, 0, 0], [0.04 * h, 0.4 * h, 0], [0, c, 0]], 0.05 * h, 0.03 * h), crown, swaying);
}

/** Willow strands: still at the crown, loosest at the hem. */
function leafSwayDown(g: Geo, yBottom: number, yTop: number): Geo {
  const span = Math.max(1e-3, yTop - yBottom);
  return sway(g, (_x, y) => 0.15 + 0.3 * Math.min(1, Math.max(0, (yTop - y) / span)));
}
