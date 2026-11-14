/** Tramway furniture: catenary pole, stop shelter, buffer stop, signal post, level-crossing gate. */
import { type Col, type Geo, beam, box, cyl, merge, sphere, tintable, translate } from '../../core/geo';
import { type Q, type V3, boxAt, cylZ, nearOnly, post, sg, soft } from './kit';

/** Catenary pole on the -x side of the track; the bracket arm reaches over the track toward +x. */
export const CATENARY_WIRE: V3 = [2.6, 5.5, 0];

export function catenaryPole(q: Q): Geo {
  const top = 6.3;
  return merge(
    translate(cyl(0.13, 0.09, top, 'sageDeep', sg(q, 10, 5)), 0, 0, 0),
    q.far ? [] : [translate(cyl(0.17, 0.15, 0.5, 'ivory', 10), 0, 0, 0)],
    beam([0, 5.9, 0], [CATENARY_WIRE[0] + 0.2, 5.9, 0], 0.07, 'sageDeep'),
    beam([0, 5.1, 0], [1.8, 5.88, 0], 0.05, 'sageDeep'),
    nearOnly(q, () => [
      beam([CATENARY_WIRE[0], 5.88, 0], [CATENARY_WIRE[0], CATENARY_WIRE[1], 0], 0.025, 'slate'),
      translate(cyl(0.04, 0.04, 0.12, 'ivory', 6), CATENARY_WIRE[0], 5.62, 0),
      boxAt(0.02, 0.02, 4.0, 'slate', CATENARY_WIRE[0], CATENARY_WIRE[1] - 0.01, 0),
      translate(sphere(0.12, 'butter', 6, 4), 0, top + 0.08, 0),
      translate(cyl(0.12, 0.12, 0.08, 'ivory', 10), 0, 3.0, 0),
    ]),
  );
}

/** Stop shelter facing +z (toward the track) with a bench for three. */
export const STOP_BENCH: { readonly y: number; readonly z: number; readonly x: readonly number[] } = {
  y: 0.45,
  z: -0.25,
  x: [-0.8, 0, 0.8],
};

export function tramStop(q: Q): Geo {
  const roofY = 2.4;
  if (q.far) {
    return merge(
      boxAt(3.0, 2.35, 0.08, 'ivory', 0, 0, -0.62),
      [-1, 1].map((sx) => boxAt(0.06, 2.35, 1.1, 'ivoryShade', sx * 1.5, 0, -0.1)),
      [-1, 1].map((sx) => boxAt(0.1, roofY, 0.1, 'blueDeep', sx * 1.5, 0, 0.42)),
      tintable(boxAt(3.4, 0.14, 1.6, 'sage', 0, roofY, -0.1)),
      boxAt(2.6, STOP_BENCH.y, 0.42, 'timber', 0, 0, STOP_BENCH.z),
      beam([1.85, 0, 0.4], [1.85, 2.6, 0.4], 0.08, 'slate'),
      cylZ(0.25, 0.04, 'coral', 6, 1.85, 2.6, 0.4),
    );
  }
  return merge(
    boxAt(3.0, 2.3, 0.08, 'ivory', 0, 0.05, -0.62),
    boxAt(3.04, 0.12, 0.12, 'blueDeep', 0, 0, -0.62),
    [-1, 1].map((sx) => boxAt(0.06, 2.2, 1.1, 'ivoryShade', sx * 1.5, 0.15, -0.1)),
    [-1, 1].flatMap((sx) => [-0.62, 0.42].map((z) => boxAt(0.1, roofY, 0.1, 'blueDeep', sx * 1.5, 0, z))),
    tintable(translate(soft(q, 3.4, 0.14, 1.6, 0.06, 'sage'), 0, roofY, -0.1)),
    boxAt(3.42, 0.06, 1.62, 'ivory', 0, roofY - 0.02, -0.1),
    boxAt(2.6, 0.06, 0.42, 'timber', 0, STOP_BENCH.y - 0.06, STOP_BENCH.z),
    [-1.1, 1.1].map((x) => boxAt(0.06, STOP_BENCH.y - 0.06, 0.36, 'slate', x, 0, STOP_BENCH.z)),
    post(q, 0.04, 0, 2.6, 'slate', 1.85, 0.4),
    cylZ(0.25, 0.04, 'coral', 12, 1.85, 2.6, 0.4),
    boxAt(2.6, 0.32, 0.05, 'timberDeep', 0, STOP_BENCH.y + 0.08, -0.55),
    boxAt(0.7, 0.9, 0.04, 'butterLight', -0.9, 1.1, -0.56),
    boxAt(0.6, 0.06, 0.02, 'ink', -0.9, 1.75, -0.53),
    cylZ(0.17, 0.05, 'ivory', 10, 1.85, 2.6, 0.43),
    boxAt(0.2, 0.08, 0.02, 'blueDeep', 1.85, 2.56, 0.46),
    translate(cyl(0.18, 0.16, 0.7, 'sage', 10), 1.85, 0, -0.1),
    boxAt(0.5, 0.35, 0.03, 'coralLight', 0.9, 1.3, -0.56),
  );
}

/** Buffer stop at the end of a track running along z (the train arrives from +z). */
export function bufferStop(q: Q): Geo {
  const by = 0.85;
  const stripes = q.far ? 2 : 6;
  const w = 2.0 / stripes;
  return merge(
    q.far ? [] : [-0.72, 0.72].map((x) => boxAt(0.08, 0.12, 1.6, 'slate', x, 0, 0)),
    q.far ? [] : [-0.45, 0.45].map((z) => boxAt(2.0, 0.06, 0.25, 'timberDeep', 0, 0, z)),
    [-0.72, 0.72].flatMap((x) => [beam([x, 0.0, -0.7], [x, by, 0.2], 0.12, 'timberDeep'), ...(q.far ? [] : [beam([x, 0.1, 0.25], [x, by, 0.2], 0.12, 'timberDeep')])]),
    Array.from({ length: stripes }, (_, i) => boxAt(w, 0.35, 0.2, i % 2 ? 'ivory' : 'coral', -1.0 + w * (i + 0.5), by - 0.1, 0.25)),
    [-0.7, 0.7].map((x) => (q.far ? boxAt(0.3, 0.3, 0.15, 'slate', x, by - 0.07, 0.42) : cylZ(0.15, 0.15, 'slate', 10, x, by + 0.08, 0.43))),
    nearOnly(q, () => [
      boxAt(0.16, 0.28, 0.1, 'cocoa', 0, by + 0.25, 0.25),
      cylZ(0.05, 0.03, 'coral', 8, 0, by + 0.42, 0.31),
    ]),
  );
}

/** Signal post: mast with a two-lamp head facing +z, ladder at the back. */
export function signalPost(q: Q): Geo {
  const headY = 3.2;
  return merge(
    boxAt(0.4, 0.15, 0.4, 'stone', 0, 0, 0),
    translate(cyl(0.07, 0.06, headY + 0.9, 'blueDeep', sg(q, 8, 4)), 0, 0.15, 0),
    translate(soft(q, 0.36, 0.8, 0.22, 0.06, 'blueDeep'), 0, headY, 0.12),
    cylZ(0.09, 0.03, 'butter', sg(q, 10, 5), 0, headY + 0.58, 0.24),
    cylZ(0.09, 0.03, 'sage', sg(q, 10, 5), 0, headY + 0.24, 0.24),
    nearOnly(q, () => [
      ...[0.24, 0.58].map((dy) => boxAt(0.22, 0.03, 0.12, 'blueDeep', 0, headY + dy + 0.1, 0.29)),
      ...[-0.12, 0.12].map((x) => beam([x, 0.15, -0.14], [x, headY, -0.14], 0.025, 'slate')),
      ...[0.5, 1.0, 1.5, 2.0, 2.5].map((y) => beam([-0.12, y, -0.14], [0.12, y, -0.14], 0.02, 'slate')),
      translate(cyl(0.1, 0.0, 0.15, 'blueDeep', 8), 0, headY + 0.9 + 0.15, 0),
    ]),
  );
}

/** Crossing-gate arm (separate moving part): origin at the pivot, arm reaches +x for 4 m. */
export function crossingArm(q: Q): Geo {
  const n = q.far ? 4 : 8;
  const len = 4.0;
  const w = len / n;
  const stripe = (i: number): Col => (i % 2 ? 'ivory' : 'coral');
  return merge(
    Array.from({ length: n }, (_, i) => boxAt(w, 0.14, 0.07, stripe(i), 0.25 + w * (i + 0.5), -0.07, 0)),
    boxAt(0.6, 0.35, 0.2, 'slate', -0.45, -0.17, 0.2),
    nearOnly(q, () => [
      cylZ(0.06, 0.03, 'coral', 8, 1.8, 0.12, 0.05),
      ...Array.from({ length: 7 }, (_, i) => beam([0.8 + i * 0.5, -0.07, 0], [0.8 + i * 0.5, -0.45, 0], 0.015, 'ivoryDeep')),
    ]),
  );
}

/** Pivot of the crossing arm in the gate post's prop space. */
export const CROSSING_PIVOT: V3 = [0.2, 1.0, 0];

/** Gate post with its pivot housing and warning lamps (no arm). */
export function crossingPost(q: Q): Geo {
  if (q.far) {
    return merge(
      [0, 1].map((i) => boxAt(0.18, 0.6, 0.18, i ? 'ivory' : 'coral', 0, i * 0.6, 0)),
      boxAt(0.3, 0.3, 0.3, 'slate', CROSSING_PIVOT[0] - 0.05, CROSSING_PIVOT[1] - 0.15, 0),
      boxAt(0.65, 0.2, 0.1, 'coral', 0, 1.56, 0.03),
    );
  }
  return merge(
    boxAt(0.5, 0.12, 0.5, 'stone', 0, 0, 0),
    Array.from({ length: 4 }, (_, i) => boxAt(0.16, 0.3, 0.16, i % 2 ? 'ivory' : 'coral', 0, 0.12 + i * 0.3, 0)),
    boxAt(0.3, 0.3, 0.3, 'slate', CROSSING_PIVOT[0] - 0.05, CROSSING_PIVOT[1] - 0.15, 0),
    translate(box(0.6, 0.12, 0.08, 'slate'), 0, 1.6, 0),
    [-0.22, 0.22].map((x) => cylZ(0.09, 0.05, 'coral', 10, x, 1.66, 0.07)),
    [-0.22, 0.22].map((x) => cylZ(0.12, 0.03, 'ink', 10, x, 1.66, 0.02)),
  );
}

/** Complete crossing gate: post plus the arm lowered across the road. */
export function crossingGate(q: Q): Geo {
  const arm = crossingArm(q);
  return merge(crossingPost(q), translate(arm, CROSSING_PIVOT[0], CROSSING_PIVOT[1], CROSSING_PIVOT[2]));
}
