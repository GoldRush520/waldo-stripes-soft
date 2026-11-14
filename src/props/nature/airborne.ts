/** Airborne festive things: diamond kite, box kite, fish windsock, tethered hot-air balloon, paper lanterns. */
import * as THREE from 'three';
import { type Col, type Geo, beam, box, cone, cyl, fromThree, lathe, merge, paint, profile, sway, tintable, translate } from '../../core/geo';
import type { Rng } from '../../core/rng';
import { type Q, type V3, chain, ell, hiOnly, limb, orient, swayFrom } from './kit';

type P2 = readonly [number, number];

/** Thin flat triangle panel in the x/y plane (front faces +z). */
function tri(a: P2, b: P2, c: P2, col: Col): Geo {
  return profile([a, b, c], 0.02, col);
}

/** Diamond kite (origin at the kite) with a swaying bow tail; top half tint-masked, bottom ivory. */
export function diamondKite(q: Q, rng: Rng): Geo {
  const top: P2 = [0, 0.55];
  const l: P2 = [-0.38, 0.08];
  const r: P2 = [0.38, 0.08];
  const bot: P2 = [0, -0.5];
  const c: P2 = [0, 0.08];
  const sail = merge(tintable(tri(l, c, top, 'coral')), tintable(tri(c, r, top, 'coral')), tri(l, bot, c, 'ivory'), tri(c, bot, r, 'ivory'));
  const spars = hiOnly(q, () => [beam([0, -0.5, 0.02], [0, 0.55, 0.02], 0.015, 'timberDeep'), beam([-0.38, 0.08, 0.02], [0.38, 0.08, 0.02], 0.015, 'timberDeep')]);
  const n = q.s(6, 2);
  const tail: V3[] = Array.from({ length: n + 1 }, (_, i) => [Math.sin(i * 1.3 + rng.range(-0.2, 0.2)) * 0.18, -0.5 - (i / n) * 2.4, -0.05 - i * 0.04]);
  const string = hiOnly(q, () => chain(tail, 0.006, 0.006, 'ivoryDeep', 3));
  const bows = tail.slice(1).map((p) =>
    tintable(merge([1, -1].map((s) => orient(ell(q, 'nub', 0, 0, 0, 0.07, 0.03, 0.015, 'coral'), [0, 0, s * 0.3], [p[0] + s * 0.06, p[1], p[2]])))),
  );
  const line = hiOnly(q, () => limb([0, 0, 0.02], [0, -0.6, 0.6], 0.004, 0.004, 'ivoryDeep', 3));
  const kite = orient(merge(sail, spars), [-0.35, 0, 0]);
  return merge(kite, line, swayFrom(merge(string, bows), [0, -0.5, 0], 2.5, 1));
}

/** Two-cell box kite (origin at the kite): tinted cells with ivory middle bands. */
export function boxKite(q: Q, _rng: Rng): Geo {
  const w = 0.32;
  const cell = (y: number): Geo[] =>
    q.hi
      ? [
          tintable(translate(box(w, 0.32, 0.015, 'coral'), 0, y, w / 2)),
          tintable(translate(box(w, 0.32, 0.015, 'coral'), 0, y, -w / 2)),
          tintable(translate(box(0.015, 0.32, w, 'coral'), w / 2, y, 0)),
          tintable(translate(box(0.015, 0.32, w, 'coral'), -w / 2, y, 0)),
        ]
      : [tintable(translate(box(w, 0.32, w, 'coral'), 0, y, 0))];
  const sticks = hiOnly(q, () => [1, -1].flatMap((x) => [1, -1].map((z) => beam([x * w / 2, -0.45, z * w / 2], [x * w / 2, 0.45, z * w / 2], 0.015, 'timberDeep'))));
  const kite = merge(cell(0.08), cell(-0.4), sticks);
  const line = hiOnly(q, () => limb([0, -0.1, 0.16], [0, -0.7, 0.7], 0.004, 0.004, 'ivoryDeep', 3));
  return merge(sway(orient(kite, [-0.4, 0.3, 0.15]), 0.4), line);
}

/** Fish windsock on a 4 m pole: banded body (tint / ivory) streams along +x and sways toward the tail. */
export function fishWindsock(q: Q, _rng: Rng): Geo {
  const H = 4;
  const pole = limb([0, 0, 0], [0, H + 0.3, 0], 0.04, 0.03, 'timber', q.s(6, 3));
  const L = 1.6;
  const bands = q.hi ? 4 : 1;
  const body = Array.from({ length: bands }, (_, i) => {
    const t0 = i / bands;
    const t1 = (i + 1) / bands;
    const rAt = (t: number): number => 0.22 * (1 - t * 0.7);
    const band = lathe([[rAt(t0), t0 * L], [rAt(t1), t1 * L]], 'coral', q.s(8, 4));
    return i % 2 === 0 ? tintable(band) : paint(band, 'ivory');
  });
  const fins = [1, -1].map((s) => tintable(orient(cone(0.08, 0.3, 'coral', q.s(4, 3)), [s * 0.5, 0, 0], [0, L, 0])));
  const eyes = hiOnly(q, () => [1, -1].map((s) => translate(ell(q, 'nub', 0, 0, 0, 0.04, 0.04, 0.02, 'ink'), 0, 0.12, s * 0.2)));
  const fish = orient(merge(body, fins, eyes), [0, 0, -Math.PI / 2], [0.05, H, 0]);
  return merge(pole, swayFrom(fish, [0, H, 0], L, 0.9));
}

const ENV_HI: ReadonlyArray<THREE.Vector2> = [
  [0.55, 2.9],
  [1.5, 3.5],
  [2.6, 4.9],
  [3.0, 6.3],
  [2.75, 7.6],
  [1.75, 8.5],
  [0.05, 8.8],
].map(([r, y]) => new THREE.Vector2(r, y));
const ENV_LO: ReadonlyArray<THREE.Vector2> = [
  [0.55, 2.9],
  [3.0, 5.6],
  [1.9, 8.3],
  [0.05, 8.8],
].map(([r, y]) => new THREE.Vector2(r, y));

/** Tethered miniature hot-air balloon (~9 m): striped gores (tint / ivory), basket for two, tether lines. */
export function balloon(q: Q, _rng: Rng): Geo {
  const gores = 8;
  const env = Array.from({ length: gores }, (_, i) => {
    const g = fromThree(new THREE.LatheGeometry(q.hi ? [...ENV_HI] : [...ENV_LO], q.s(2, 1), (i / gores) * Math.PI * 2, (Math.PI * 2) / gores), 'coral');
    return i % 2 === 0 ? tintable(g) : paint(g, 'ivory');
  });
  const by = 0.6;
  const basket = [translate(box(1.2, 0.95, 1.2, 'timber'), 0, by, 0), ...hiOnly(q, () => translate(box(1.26, 0.12, 1.26, 'timberDeep'), 0, by + 0.85, 0))];
  const ropes = hiOnly(q, () =>
    [1, -1].flatMap((x) => [1, -1].map((z) => limb([x * 0.55, by + 0.95, z * 0.55], [x * 0.5, 2.95, z * 0.5], 0.015, 0.015, 'ivoryDeep', 3))),
  );
  const burner = hiOnly(q, () => translate(cyl(0.2, 0.25, 0.25, 'slate', 6), 0, 2.2, 0));
  const tethers = hiOnly(q, () => [
    limb([0.6, by + 0.1, 0.6], [1.6, 0, 1.4], 0.012, 0.012, 'ivoryDeep', 3),
    limb([-0.6, by + 0.1, -0.6], [-1.6, 0, -1.4], 0.012, 0.012, 'ivoryDeep', 3),
    translate(box(0.24, 0.16, 0.18, 'clay'), 1.6, 0, 1.4),
    translate(box(0.24, 0.16, 0.18, 'clay'), -1.6, 0, -1.4),
  ]);
  return merge(sway(merge(env), (_x, y) => Math.min(0.3, Math.max(0, (y - 3) * 0.05))), basket, ropes, burner, tethers);
}

/** Seat anchors (feet) for two passengers in the balloon basket. */
export const BALLOON_SEATS = [
  { x: -0.28, y: 0.7, z: 0, heading: 0 },
  { x: 0.28, y: 0.7, z: 0, heading: 0 },
] as const;

/** Five floating paper lanterns drifting at slightly different heights (origin at the cluster centre). */
export function lanterns(q: Q, rng: Rng): Geo {
  const spots = Array.from({ length: 5 }, (_, i) => [Math.sin(i * 2.4) * 0.9, rng.range(-0.6, 0.6), Math.cos(i * 2.4) * 0.9] as V3);
  const one = (p: V3): Geo[] =>
    q.hi
      ? [
          tintable(translate(cyl(0.16, 0.2, 0.42, 'coral', 8, false), p[0], p[1], p[2])),
          translate(cyl(0.16, 0.12, 0.04, 'butterLight', 6), p[0], p[1] + 0.42, p[2]),
        ]
      : [tintable(translate(box(0.34, 0.44, 0.34, 'coral'), p[0], p[1], p[2]))];
  return sway(merge(spots.flatMap(one)), 0.5);
}
