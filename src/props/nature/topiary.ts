/** Clipped topiary forms for the botanical gardens: ball stack, spiral, cone, cube, walk-through arch. */
import * as THREE from 'three';
import { type Geo, box, cone, cyl, fromThree, lathe, merge, rbox, sway, tintable, translate } from '../../core/geo';
import { type Q, ell, hiOnly, orient } from './kit';
import { pot, trunk } from './tree-parts';

/** Clipped greenery: tint-masked (default sage) with a little stiff sway. */
export function clip(g: Geo, amount = 0.1): Geo {
  return sway(tintable(g), amount);
}

/** Square ivory-banded clay plinth that figure topiary stands on. */
export function plinth(q: Q, w: number, d: number, h = 0.3): Geo[] {
  return [box(w, h, d, 'clay'), ...hiOnly(q, () => translate(box(w + 0.04, 0.06, d + 0.04, 'ivory'), 0, h - 0.06, 0))];
}

/** Three diminishing clipped balls on one stem in a terracotta pot. */
export function ballStack(q: Q): Geo {
  const ph = 0.45;
  const balls = [
    ell(q, 'big', 0, 0.95, 0, 0.42, 0.4, 0.42, 'sage'),
    ell(q, 'mid', 0, 1.62, 0, 0.3, 0.28, 0.3, 'sage'),
    ell(q, 'small', 0, 2.08, 0, 0.18, 0.17, 0.18, 'sage'),
  ];
  return merge(pot(q, 0.34, ph), trunk(q, [[0, ph, 0], [0, 2.0, 0]], 0.03, 0.025), clip(merge(balls)));
}

/** Spiral: a slim core cone wrapped by a corkscrew of shrinking clipped puffs. */
export function spiral(q: Q): Geo {
  const ph = 0.42;
  const n = q.s(8, 4);
  const top = 2.4;
  const puffs = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const a = t * Math.PI * 4.2;
    const r = 0.42 * (1 - t * 0.75);
    const y = ph + 0.25 + t * (top - ph - 0.4);
    return ell(q, q.hi ? 'tiny' : 'nub', Math.sin(a) * r * 0.55, y, Math.cos(a) * r * 0.55, r, 0.16 * (1 - t * 0.4), r, 'sage');
  });
  const core = translate(cone(0.18, top - ph, 'sageDeep', q.s(6, 4)), 0, ph, 0);
  return merge(pot(q, 0.34, ph), core, clip(merge(puffs)));
}

/** Tall clipped cone with a softened tip, on the ground. */
export function coneTopiary(q: Q): Geo {
  const prof: ReadonlyArray<readonly [number, number]> = q.hi
    ? [
        [0.5, 0],
        [0.62, 0.15],
        [0.45, 0.9],
        [0.22, 1.7],
        [0.04, 2.2],
      ]
    : [
        [0.6, 0],
        [0.3, 1.5],
        [0.04, 2.2],
      ];
  return clip(lathe(prof, 'sage', q.s(12, 6)));
}

/** Clipped cube on a short stem over a low collar. */
export function cubeTopiary(q: Q): Geo {
  const s = 1.0;
  const cube = q.hi ? rbox(s, s, s, 0.12, 'sage') : box(s, s, s, 'sage');
  const collar = hiOnly(q, () => cyl(0.32, 0.28, 0.12, 'sageDeep', 8));
  return merge(collar, trunk(q, [[0, 0, 0], [0, 0.5, 0]], 0.05, 0.04), clip(translate(cube, 0, 0.42, 0)));
}

/** Walk-through clipped arch: two round pillars and a half-ring lintel, 2.4 m clear. */
export function archTopiary(q: Q): Geo {
  const span = 1.05;
  const pr = 0.32;
  const ph = 2.4;
  const pillars = [1, -1].map((s) => translate(cyl(pr, pr * 0.95, ph, 'sage', q.s(8, 4)), s * span, 0, 0));
  const ring = fromThree(new THREE.TorusGeometry(span, pr * 0.92, q.s(6, 4), q.s(10, 5), Math.PI), 'sage');
  const lintel = translate(ring, 0, ph, 0);
  const finials = hiOnly(q, () => [1, -1].map((s) => ell(q, 'small', s * span * 0.7, ph + span * 0.95, 0, 0.16, 0.16, 0.16, 'sageLight')));
  return clip(merge(pillars, lintel, finials), 0.06);
}

/** Rotate helper for flat side-profile topiary pieces. */
export function faceX(g: Geo): Geo {
  return orient(g, [0, Math.PI / 2, 0]);
}
