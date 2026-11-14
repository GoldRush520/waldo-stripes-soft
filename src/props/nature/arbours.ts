/** Walk-through garden structures with climbers: rose arch, vine pergola, trellis panel. */
import * as THREE from 'three';
import { type Col, type Geo, beam, box, fromThree, merge, sphere, sway, tintable, translate } from '../../core/geo';
import type { Rng } from '../../core/rng';
import { type Q, type V3, chain, ell, hiOnly, leafSway, limb, orient } from './kit';

function bloom(p: V3, r = 0.06, color: Col = 'coral'): Geo {
  return tintable(translate(sphere(r, color, 4, 2), p[0], p[1], p[2]));
}

/** Half-ring hoop in the x/y plane of radius R, centred at (0, y, z). */
function hoop(q: Q, R: number, r: number, y: number, z: number, color: Col): Geo {
  return translate(fromThree(new THREE.TorusGeometry(R, r, q.s(4, 3), q.s(9, 4), Math.PI), color), 0, y, z);
}

/** Rose arch: ivory-painted hoops on four posts, climbing roses with tint-masked blooms (2.3 m clear). */
export function roseArch(q: Q, rng: Rng): Geo {
  const w = 0.7;
  const ph = 1.9;
  const zs = [-0.25, 0.25];
  const posts = zs.flatMap((z) => [1, -1].map((s) => limb([s * w, 0, z], [s * w, ph, z], 0.035, 0.035, 'ivory', q.s(5, 3))));
  const hoops = zs.map((z) => hoop(q, w, 0.035, ph, z, 'ivory'));
  const bars = hiOnly(q, () => [0.4, 1.0, 1.6].flatMap((y) => [1, -1].map((s) => beam([s * w, y, -0.25], [s * w, y, 0.25], 0.03, 'ivory'))));
  const clumpAt = (t: number): V3 => {
    const a = Math.PI * t;
    return t < 0 ? [-w, ph * (1 + t * 0.9), 0] : [Math.cos(a) * w, ph + Math.sin(a) * w, 0];
  };
  const ts = q.hi ? [-0.8, -0.3, 0.02, 0.25, 0.5, 0.75, 0.98, -0.55] : [-0.5, 0.25, 0.75];
  const leaves = ts.map((t, i) => {
    const p = t < 0 && i % 2 === 0 ? ([w, ph * (1 + t * 0.9), 0] as V3) : clumpAt(t);
    return ell(q, q.hi ? 'small' : 'nub', p[0], p[1], p[2], 0.26, 0.24, 0.32, i % 2 ? 'sage' : 'sageDeep');
  });
  const roses = q.hi
    ? Array.from({ length: 16 }, () => {
        const t = rng.range(-0.2, 1.2);
        const side = rng.chance(0.5) ? 1 : -1;
        const base = t < 0 || t > 1 ? ([side * w, ph * rng.range(0.35, 0.95), 0] as V3) : clumpAt(t);
        return bloom([base[0] + rng.range(-0.15, 0.15), base[1] + rng.range(-0.1, 0.15), rng.range(-0.3, 0.3)]);
      })
    : [0, 1].map((i) => tintable(ell(q, 'nub', i ? 0.4 : -0.6, ph + (i ? 0.62 : 0.2), 0.05, 0.2, 0.14, 0.3, 'coral')));
  return merge(posts, hoops, bars, leafSway(merge(leaves, roses), 0, ph + w, 0.15, 0.35));
}

/** Vine pergola: timber posts, beams and rafters under a swaying vine roof with grape bunches. */
export function vinePergola(q: Q, rng: Rng): Geo {
  const W = 1.5;
  const D = 1.4;
  const H = 2.6;
  const posts = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => translate(box(0.16, H, 0.16, 'timber'), sx * W, 0, sz * D)));
  const beams = [-1, 1].map((sx) => translate(box(0.14, 0.2, 2 * D + 0.6, 'timberDeep'), sx * W, H, 0));
  const rafters = hiOnly(q, () => [-1.2, -0.6, 0, 0.6, 1.2].map((z) => translate(box(2 * W + 0.6, 0.12, 0.1, 'timber'), 0, H + 0.2, z)));
  const roof = [-0.75, 0.75].flatMap((x) =>
    [-0.7, 0.7].map((z, i) => ell(q, 'mid', x * W * 0.9, H + 0.42, z * D * 0.9, 0.95, 0.24, 0.9, i % 2 ? 'sage' : 'sageLight')),
  );
  const vines = hiOnly(q, () =>
    [-1, 1].flatMap((s) =>
      chain(
        [
          [s * W + 0.1, 0, D + 0.1],
          [s * W - 0.1, 1.2, D + 0.12],
          [s * W + 0.1, H, D + 0.1],
        ],
        0.04,
        0.03,
        'timberDeep',
        4,
      ),
    ),
  );
  const grapes = hiOnly(q, () =>
    Array.from({ length: 6 }, () =>
      orient(fromThree(new THREE.ConeGeometry(0.09, 0.22, 5, 1), 'clayDeep'), [Math.PI, 0, 0], [rng.range(-1.2, 1.2), H + 0.08, rng.range(-1.1, 1.1)]),
    ),
  );
  return merge(posts, beams, rafters, vines, grapes, leafSway(tintable(merge(roof)), H, H + 0.7, 0.2, 0.35));
}

/** Free-standing trellis panel (back is -z) with a tint-blooming climber. */
export function trellis(q: Q, rng: Rng): Geo {
  const w = 0.9;
  const h = 2.0;
  const frame = [1, -1].map((s) => translate(box(0.07, h, 0.07, 'timber'), s * w, 0, 0));
  const rails = hiOnly(q, () => [
    beam([-w, h - 0.04, 0], [w, h - 0.04, 0], 0.06, 'timber'),
    ...[-0.6, 0, 0.6].map((x) => beam([x, 0.05, 0], [x, h, 0], 0.03, 'timberDeep')),
    ...[0.6, 1.3].map((y) => beam([-w, y, 0], [w, y, 0], 0.03, 'timberDeep')),
  ]);
  const leaves = q.hi
    ? [
        [-0.45, 0.6],
        [0.3, 0.9],
        [-0.2, 1.4],
        [0.5, 1.6],
        [0, 0.3],
      ].map(([x, y], i) => ell(q, 'tiny', x ?? 0, y ?? 0, 0.08, 0.3, 0.26, 0.09, i % 2 ? 'sage' : 'sageDeep'))
    : [ell(q, 'nub', 0, 1.0, 0.07, 0.6, 0.7, 0.08, 'sage')];
  const blooms = q.hi ? Array.from({ length: 8 }, () => bloom([rng.range(-0.7, 0.7), rng.range(0.3, 1.8), 0.17], 0.05, 'butter')) : [];
  return merge(frame, rails, sway(merge(leaves, blooms), (_x, y) => Math.min(0.35, 0.1 + y * 0.12)));
}
