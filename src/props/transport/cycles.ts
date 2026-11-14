/** Pedal vehicles: bicycle (+ basket variant), tandem, child's tricycle, ice-cream cargo trike, pedicab. */
import { type Col, type Geo, beam, blob, cone, merge, rotateZ, sphere, tintable, torus, translate } from '../../core/geo';
import { type Q, type V3, boxAt, cylX, nearOnly, sg, soft, tray, wheel } from './kit';

const FRAME_T = 0.04;

function frameTube(a: V3, b: V3, t = FRAME_T, col: Col = 'coral'): Geo {
  return tintable(beam(a, b, t, col));
}

/** Handlebar: stem from `from` up to the bar centre (0, y, z), bar across x, grips near-only. */
export function handlebar(q: Q, from: V3, y: number, z: number, half = 0.28): Geo {
  return merge(
    beam(from, [0, y, z], 0.035, 'slate'),
    cylX(0.016, half * 2, 'slate', sg(q, 6, 4), -half, y, z),
    nearOnly(q, () => [-1, 1].map((sx) => cylX(0.024, 0.1, 'cocoa', 6, sx > 0 ? half - 0.1 : -half, y, z))),
  );
}

export function saddle(q: Q, x: number, y: number, z: number): Geo {
  return merge(
    translate(blob(0.08, 0.035, 0.13, 'cocoa', sg(q, 8, 4), sg(q, 5, 3)), x, y, z),
    beam([x, y - 0.12, z + 0.02], [x, y, z], 0.025, 'slate'),
  );
}

/** Chainring and pedal cranks around a bottom bracket (near only). */
export function crank(q: Q, bb: V3, r = 0.16): Geo[] {
  return nearOnly(q, () => [
    cylX(0.09, 0.012, 'slate', 8, 0.04, bb[1], bb[2]),
    beam([0.07, bb[1], bb[2]], [0.07, bb[1] - r, bb[2] + 0.04], 0.02, 'slate'),
    beam([-0.07, bb[1], bb[2]], [-0.07, bb[1] + r, bb[2] - 0.04], 0.02, 'slate'),
    boxAt(0.09, 0.02, 0.06, 'cocoa', 0.11, bb[1] - r - 0.01, bb[2] + 0.04),
    boxAt(0.09, 0.02, 0.06, 'cocoa', -0.11, bb[1] + r - 0.01, bb[2] - 0.04),
  ]);
}

const R = 0.34;

/** Diamond frame between a rear axle and a head tube, with the saddle at `seat`. */
function diamond(rearZ: number, bb: V3, seat: V3, head: V3): Geo[] {
  const top: V3 = [0, seat[1] - 0.1, seat[2] + 0.02];
  return [
    frameTube(bb, top),
    frameTube(top, [0, head[1], head[2] - 0.02]),
    frameTube(bb, [0, head[1] - 0.16, head[2] + 0.03]),
    frameTube(bb, [0, R, rearZ], 0.03),
    frameTube([0, top[1] - 0.03, top[2]], [0, R, rearZ], 0.03),
  ];
}

function fork(frontZ: number, head: V3): Geo {
  return merge(frameTube([0, head[1] - 0.18, head[2] + 0.04], [0, R, frontZ], 0.035), frameTube([0, head[1] - 0.18, head[2] + 0.04], head));
}

export interface BikeOptions {
  readonly basket?: boolean;
}

export function bicycle(q: Q, o: BikeOptions = {}): Geo {
  const rearZ = -0.52;
  const frontZ = 0.52;
  const bb: V3 = [0, 0.3, -0.06];
  const seat: V3 = [0, 0.9, -0.27];
  const head: V3 = [0, 0.82, 0.4];
  return merge(
    translate(wheel(q, R, 0.04, { spokes: 6 }), 0, 0, rearZ),
    translate(wheel(q, R, 0.04, { spokes: 6 }), 0, 0, frontZ),
    diamond(rearZ, bb, seat, head),
    fork(frontZ, head),
    saddle(q, 0, seat[1], seat[2]),
    handlebar(q, head, 0.98, 0.36),
    crank(q, bb),
    o.basket
      ? [
          translate(q.far ? boxAt(0.36, 0.22, 0.28, 'timber', 0, 0, 0) : tray(0.36, 0.28, 0.3, 0.24, 0.22, 0.015, 'timber', 'timberDeep'), 0, 0.72, 0.62),
          ...nearOnly(q, () => [0, 1, 2].map((i) => translate(sphere(0.06, i === 1 ? 'butter' : 'coral', 6, 4), -0.1 + i * 0.1, 0.94, 0.62))),
        ]
      : [],
    nearOnly(q, () => [
      translate(sphere(0.04, 'butterLight', 6, 4), 0, 0.8, 0.46),
      boxAt(0.14, 0.02, 0.32, 'slate', 0, 0.74, -0.58),
      beam([0, 0.74, -0.45], [0, R, -0.52], 0.02, 'slate'),
    ]),
  );
}

export function tandem(q: Q): Geo {
  const rearZ = -0.85;
  const frontZ = 0.85;
  const bb1: V3 = [0, 0.3, 0.3];
  const bb2: V3 = [0, 0.3, -0.42];
  const s1: V3 = [0, 0.9, 0.12];
  const s2: V3 = [0, 0.9, -0.62];
  const head: V3 = [0, 0.82, 0.72];
  return merge(
    translate(wheel(q, R, 0.04, { spokes: 6 }), 0, 0, rearZ),
    translate(wheel(q, R, 0.04, { spokes: 6 }), 0, 0, frontZ),
    frameTube(bb2, [0, s2[1] - 0.1, s2[2] + 0.02]),
    frameTube(bb1, [0, s1[1] - 0.1, s1[2] + 0.02]),
    frameTube(bb2, bb1),
    frameTube([0, 0.78, s2[2] + 0.02], [0, 0.8, head[2] - 0.02]),
    frameTube(bb1, [0, head[1] - 0.16, head[2] + 0.03]),
    frameTube(bb2, [0, R, rearZ], 0.03),
    frameTube([0, 0.76, s2[2]], [0, R, rearZ], 0.03),
    fork(frontZ, head),
    saddle(q, 0, s1[1], s1[2]),
    saddle(q, 0, s2[1], s2[2]),
    handlebar(q, head, 0.98, 0.68),
    handlebar(q, [0, 0.82, s1[2] - 0.02], 0.95, s1[2] - 0.12, 0.22),
    crank(q, bb1),
    crank(q, bb2),
  );
}

export function tricycle(q: Q): Geo {
  const fr = 0.2;
  const rr = 0.14;
  const head: V3 = [0, 0.52, 0.26];
  return merge(
    translate(wheel(q, fr, 0.05, { spokes: 6 }), 0, 0, 0.32),
    [-0.25, 0.25].map((x) => translate(wheel(q, rr, 0.05, { spokes: 5 }), x, 0, -0.28)),
    cylX(0.02, 0.5, 'slate', sg(q, 6, 4), -0.25, rr, -0.28),
    frameTube(head, [0, rr + 0.02, -0.26], 0.05),
    frameTube([0, 0.5, 0.24], [0, fr, 0.32], 0.035),
    tintable(translate(soft(q, 0.26, 0.05, 0.22, 0.03, 'coral'), 0, 0.37, -0.1)),
    q.far ? [] : [boxAt(0.24, 0.16, 0.04, 'coral', 0, 0.42, -0.22)].map((b) => tintable(b)),
    handlebar(q, head, 0.62, 0.22, 0.2),
    nearOnly(q, () => [
      beam([0.09, fr, 0.32], [0.09, fr - 0.08, 0.36], 0.02, 'slate'),
      beam([-0.09, fr, 0.32], [-0.09, fr + 0.08, 0.28], 0.02, 'slate'),
      boxAt(0.25, 0.02, 0.12, 'ivoryDeep', 0, 0.16, -0.38),
    ]),
  );
}

/** Ice-cream cargo trike: insulated box between two front wheels, rider behind. */
export function cargoTrike(q: Q): Geo {
  const fr = 0.25;
  const boxY = 0.32;
  const boxTop = boxY + 0.62;
  const bb: V3 = [0, 0.3, -0.25];
  const seat: V3 = [0, 0.92, -0.5];
  return merge(
    [-0.44, 0.44].map((x) => translate(wheel(q, fr, 0.06, { disc: 'ivoryShade' }), x, 0, 0.5)),
    translate(wheel(q, 0.3, 0.04, { spokes: 6 }), 0, 0, -0.85),
    translate(soft(q, 0.82, 0.62, 0.66, 0.08, 'ivory'), 0, boxY, 0.5),
    tintable(boxAt(0.84, 0.14, 0.68, 'coral', 0, boxY + 0.3, 0.5)),
    tintable(boxAt(0.86, 0.08, 0.7, 'coral', 0, boxTop, 0.5)),
    frameTube(bb, [0, 0.82, -0.48]),
    frameTube(bb, [0, boxY + 0.05, 0.16], 0.05),
    frameTube(bb, [0, 0.3, -0.85], 0.03),
    frameTube([0, 0.78, -0.47], [0, 0.3, -0.85], 0.03),
    saddle(q, 0, seat[1], seat[2]),
    handlebar(q, [0, boxTop, 0.16], 1.05, 0.12, 0.3),
    translate(cone(0.55, 0.22, 'butter', sg(q, 8, 5)), 0, 1.75, 0.5),
    beam([0.3, boxTop, 0.7], [0.0, 1.75, 0.5], 0.03, 'ivoryDeep'),
    crank(q, bb),
    nearOnly(q, () => [
      ...Array.from({ length: 4 }, (_, i) => {
        const a = (i / 4) * Math.PI * 2;
        return tintable(boxAt(0.25, 0.03, 0.02, 'coral', Math.sin(a) * 0.4, 1.76, 0.5 + Math.cos(a) * 0.4));
      }),
      cylX(0.015, 0.8, 'slate', 6, -0.4, fr, 0.5),
      translate(cone(0.05, 0.14, 'butterDeep', 6), 0.15, boxTop + 0.08, 0.6),
      translate(sphere(0.055, 'coralLight', 6, 4), 0.15, boxTop + 0.24, 0.6),
      boxAt(0.5, 0.2, 0.02, 'blue', 0, boxY + 0.36, 0.84),
    ]),
  );
}

/** Pedicab: bicycle front half pulling a two-seat carriage with a hood. Rider in front. */
export function pedicab(q: Q): Geo {
  const frontZ = 1.15;
  const axleZ = -0.3;
  const rr = 0.32;
  const bb: V3 = [0, 0.3, 0.68];
  const seat: V3 = [0, 0.92, 0.5];
  const head: V3 = [0, 0.84, 1.02];
  const benchY = 0.5;
  return merge(
    translate(wheel(q, R, 0.04, { spokes: 6 }), 0, 0, frontZ),
    [-0.62, 0.62].map((x) => translate(wheel(q, rr, 0.05, { spokes: 4 }), x, 0, axleZ)),
    frameTube(bb, [0, seat[1] - 0.1, seat[2] + 0.02]),
    frameTube([0, 0.8, seat[2]], [0, head[1], head[2] - 0.02]),
    frameTube(bb, [0, head[1] - 0.16, head[2] + 0.03]),
    frameTube(bb, [0, benchY - 0.05, 0.12], 0.05),
    fork(frontZ, head),
    saddle(q, 0, seat[1], seat[2]),
    handlebar(q, head, 0.98, 0.98),
    crank(q, bb),
    boxAt(1.1, 0.1, 0.7, 'ivoryDeep', 0, benchY - 0.12, -0.25),
    tintable(translate(soft(q, 1.05, 0.12, 0.48, 0.05, 'coral'), 0, benchY, -0.2)),
    tintable(boxAt(1.05, 0.5, 0.1, 'coral', 0, benchY + 0.1, -0.5)),
    nearOnly(q, () => boxAt(1.0, 0.04, 0.3, 'ivoryDeep', 0, 0.28, 0.2)),
    [-0.52, 0.52].map((x) => beam([x, benchY, -0.55], [x, 1.62, -0.5], 0.035, 'ivoryDeep')),
    tintable(boxAt(1.15, 0.06, 0.8, 'coral', 0, 1.62, -0.25)),
    nearOnly(q, () => [
      ...[-0.52, 0.52].map((x) => beam([x, 1.6, -0.5], [x, 1.62, 0.12], 0.025, 'ivoryDeep')),
    ]),
  );
}
