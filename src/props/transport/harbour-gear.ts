/** Harbour gear: anchor, buoys, life-ring post, ship's-wheel sign, winch, gangway, oar rack, net frame, tide board. */
import {
  type Col,
  type Geo,
  beam,
  blob,
  box,
  cone,
  cyl,
  merge,
  profile,
  rotateX,
  sphere,
  sway,
  tintable,
  torus,
  translate,
} from '../../core/geo';
import { type Q, type V3, boxAt, cylX, nearOnly, sg } from './kit';

/** Decorative anchor standing upright on a low stone plinth, arms across x. */
export function anchor(q: Q): Geo {
  const col: Col = 'blueDeep';
  const crown = 0.28;
  const arm = (sx: number): Geo[] =>
    q.far
      ? [beam([0, crown, 0], [sx * 0.45, crown + 0.38, 0], 0.08, col)]
      : [
          beam([0, crown, 0], [sx * 0.32, crown + 0.08, 0], 0.07, col),
          beam([sx * 0.32, crown + 0.08, 0], [sx * 0.45, crown + 0.38, 0], 0.07, col),
        ];
  const fluke = (sx: number): Geo =>
    translate(
      profile(
        [
          [0, 0],
          [sx * 0.12, -0.05],
          [sx * 0.04, 0.16],
        ],
        0.03,
        col,
      ),
      sx * 0.42,
      crown + 0.3,
      0,
    );
  return merge(
    boxAt(0.7, 0.2, 0.4, 'stone', 0, 0, 0),
    beam([0, 0.18, 0], [0, 1.45, 0], 0.08, col),
    arm(-1),
    arm(1),
    q.far ? [] : [fluke(-1), fluke(1)],
    cylX(0.035, 0.6, col, sg(q, 6, 4), -0.3, 1.3, 0),
    nearOnly(q, () => [
      translate(rotateX(torus(0.1, 0.025, 'ivoryDeep', 4, 10), Math.PI / 2), 0, 1.55, 0),
      ...[-0.3, 0.3].map((x) => translate(sphere(0.05, col, 6, 4), x, 1.3, 0)),
    ]),
  );
}

/** Can buoy: striped drum with a cone top; y = 0 is its waterline. */
export function canBuoy(q: Q): Geo {
  const s = sg(q, 12, 6);
  if (q.far) {
    return merge(
      translate(cyl(0.35, 0.3, 0.6, 'coral', 6), 0, -0.45, 0),
      translate(cyl(0.3, 0.28, 0.25, 'ivory', 6), 0, 0.15, 0),
      translate(cone(0.28, 0.3, 'coral', 6), 0, 0.4, 0),
    );
  }
  return merge(
    translate(cyl(0.35, 0.33, 0.35, 'coralDeep', s), 0, -0.45, 0),
    translate(cyl(0.33, 0.3, 0.25, 'coral', s), 0, -0.1, 0),
    translate(cyl(0.3, 0.28, 0.25, 'ivory', s), 0, 0.15, 0),
    translate(cone(0.28, 0.3, 'coral', s), 0, 0.4, 0),
    translate(sphere(0.07, 'butter', 6, 4), 0, 0.72, 0),
    translate(rotateX(torus(0.06, 0.015, 'slate', 3, 6), Math.PI / 2), 0, 0.82, 0),
  );
}

/** Spar marker buoy: round float with a pole and a double-cone top mark. */
export function markerBuoy(q: Q): Geo {
  if (q.far) {
    return merge(
      translate(blob(0.35, 0.3, 0.35, 'butter', 6, 4), 0, 0.05, 0),
      boxAt(0.06, 1.0, 0.06, 'ivoryDeep', 0, 0.3, 0),
      translate(cone(0.12, 0.2, 'coral', 4), 0, 1.25, 0),
    );
  }
  return merge(
    translate(blob(0.35, 0.3, 0.35, 'butter', 10, 7), 0, 0.05, 0),
    translate(torus(0.33, 0.05, 'coral', 4, 12), 0, 0.12, 0),
    translate(cyl(0.035, 0.03, 1.0, 'ivoryDeep', 6), 0, 0.3, 0),
    translate(cone(0.12, 0.2, 'coral', 8), 0, 1.25, 0),
    translate(rotateX(cone(0.12, 0.2, 'coral', 8), Math.PI), 0, 1.24, 0),
  );
}

/** Life ring hung on a timber post, facing +z. */
export function lifeRingPost(q: Q): Geo {
  const ringY = 1.15;
  const ring = translate(rotateX(torus(0.28, 0.065, 'coral', sg(q, 4, 3), sg(q, 14, 8)), Math.PI / 2), 0, ringY, 0.14);
  const bands = (q.far ? [0] : [0, 1, 2, 3]).map((i) => {
    const seg = q.far ? 4 : 6;
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const p: V3 = [Math.cos(a) * 0.28, ringY + Math.sin(a) * 0.28, 0.1];
    return translate(rotateX(cyl(0.075, 0.075, 0.1, 'ivory', seg), Math.PI / 2), p[0], p[1], p[2] - 0.01);
  });
  return merge(
    boxAt(0.12, 1.6, 0.12, 'timber', 0, 0, 0),
    q.far ? [] : [boxAt(0.16, 0.05, 0.16, 'timberDeep', 0, 1.6, 0)],
    ring,
    bands,
    nearOnly(q, () => [boxAt(0.3, 0.14, 0.02, 'ivory', 0, 1.6 - 0.25, 0.07), beam([0, 1.5, 0.07], [0, 1.43, 0.1], 0.02, 'slate')]),
  );
}

/** Signpost with a ship's wheel above a name board, facing +z. */
export function wheelSign(q: Q): Geo {
  const wy = 1.85;
  const R = 0.35;
  const spokes = nearOnly(q, () =>
    [0, 1, 2].map((i) => {
      const a = (i / 3) * Math.PI;
      return beam([Math.cos(a) * R, wy + Math.sin(a) * R, 0.08], [-Math.cos(a) * R, wy - Math.sin(a) * R, 0.08], 0.03, 'timberDeep');
    }),
  );
  const handles = nearOnly(q, () =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2;
      return beam(
        [Math.cos(a) * R, wy + Math.sin(a) * R, 0.08],
        [Math.cos(a) * (R + 0.14), wy + Math.sin(a) * (R + 0.14), 0.08],
        0.035,
        'timber',
      );
    }),
  );
  return merge(
    [-0.5, 0.5].map((x) => boxAt(0.1, 1.55, 0.1, 'timber', x, 0, 0)),
    boxAt(1.25, 0.4, 0.06, 'ivory', 0, 1.0, 0.05),
    nearOnly(q, () => beam([0, 1.38, 0.04], [0, wy, 0.06], 0.07, 'timber')),
    translate(rotateX(torus(R, 0.035, 'timberDeep', sg(q, 4, 3), sg(q, 12, 6)), Math.PI / 2), 0, wy, 0.08),
    spokes,
    handles,
    nearOnly(q, () => [0, 1, 2, 3].map((i) => boxAt(0.18, 0.16, 0.02, i % 2 ? 'blue' : 'coral', -0.4 + i * 0.27, 1.12, 0.09))),
  );
}

/** Hand winch: drum between two cheek plates on a timber base, crank on the +x side. */
export function winch(q: Q): Geo {
  const y = 0.45;
  return merge(
    box(0.8, 0.12, 0.6, 'timber'),
    [-0.32, 0.32].map((x) => boxAt(0.05, 0.5, 0.45, 'slate', x, 0.12, 0)),
    cylX(0.13, 0.6, 'slate', sg(q, 10, 6), -0.3, y, 0),
    nearOnly(q, () => [
      cylX(0.15, 0.4, 'butterDeep', 10, -0.2, y, 0),
      cylX(0.22, 0.03, 'blueDeep', 12, 0.35, y, 0),
      beam([0.42, y, 0], [0.42, y + 0.32, 0.05], 0.035, 'slate'),
      cylX(0.025, 0.14, 'cocoa', 6, 0.42, y + 0.32, 0.05),
    ]),
  );
}

/** Gangway plank, 4 m along z, with cleats and rope rails. Rests flat; the engine tilts it. */
export function gangway(q: Q): Geo {
  const len = 4;
  if (q.far) {
    return merge(
      box(0.7, 0.08, len, 'timber'),
      [-1, 1].map((sx) => boxAt(0.04, 0.05, len - 0.2, 'butterDeep', sx * 0.36, 0.85, 0)),
    );
  }
  const stanchions = [-1, 1].flatMap((sx) => [-1.8, 0, 1.8].map((z) => translate(cyl(0.02, 0.02, 0.85, 'slate', 4), sx * 0.36, 0.06, z)));
  const rails = [-1, 1].flatMap((sx) =>
    [
      [-1.8, 0],
      [0, 1.8],
    ].map(([a, b]) => beam([sx * 0.36, 0.88, a ?? 0], [sx * 0.36, 0.85, b ?? 0], 0.03, 'butterDeep')),
  );
  const cleats = Array.from({ length: 8 }, (_, i) => boxAt(0.6, 0.03, 0.05, 'timberDeep', 0, 0.08, -1.75 + i * 0.5));
  return merge(box(0.7, 0.08, len, 'timber'), stanchions, rails, cleats);
}

/** A-frame oar rack with four oars standing in it. */
export function oarRack(q: Q): Geo {
  const oarAt = (x: number, c: Col): Geo[] =>
    q.far
      ? [boxAt(0.06, 2.4, 0.06, 'timber', x, 0.05, 0.05)]
      : [
          translate(cyl(0.022, 0.022, 1.8, 'timber', 4), x, 0.65, 0.05),
          tintable(boxAt(0.15, 0.5, 0.025, c, x, 0.1, 0.05)),
        ];
  return merge(
    q.far
      ? boxAt(1.4, 1.8, 0.05, 'timberDeep', 0, 0, -0.06)
      : [
          ...[-0.65, 0.65].map((x) => boxAt(0.08, 1.8, 0.08, 'timberDeep', x, 0, -0.06)),
          boxAt(1.4, 0.08, 0.1, 'timberDeep', 0, 1.6, -0.04),
          boxAt(1.4, 0.06, 0.25, 'timberDeep', 0, 0, 0.05),
        ],
    oarAt(-0.42, 'coral'),
    oarAt(-0.14, 'blue'),
    oarAt(0.14, 'coral'),
    oarAt(0.42, 'butter'),
    nearOnly(q, () => [-0.42, -0.14, 0.14, 0.42].map((x) => beam([x - 0.07, 1.62, 0.02], [x - 0.07, 1.62, 0.16], 0.03, 'timber'))),
  );
}

/** Two posts with a crossbar and a fishing net hung to dry, with floats along the top. */
export function netFrame(q: Q): Geo {
  const top = 2.0;
  const net = (z: number, h: number, c: Col): Geo =>
    sway(boxAt(2.3, h, 0.03, c, 0, top - h - 0.02, z), (_x, y) => Math.min(1, (top - y) / h) * 0.6);
  return merge(
    [-1.3, 1.3].map((x) => (q.far ? boxAt(0.1, top + 0.1, 0.1, 'timber', x, 0, 0) : translate(cyl(0.05, 0.05, top + 0.1, 'timber', 6), x, 0, 0))),
    boxAt(2.7, 0.07, 0.07, 'timberDeep', 0, top, 0),
    net(0.05, 1.4, 'sageDeep'),
    nearOnly(q, () => [
      net(-0.05, 1.0, 'blue'),
      ...Array.from({ length: 7 }, (_, i) => translate(sphere(0.06, i % 2 ? 'coral' : 'butter', 5, 3), -1.05 + i * 0.35, top - 0.08, 0.08)),
      ...[-0.6, 0.6].map((x) => boxAt(0.12, 0.08, 0.06, 'slate', x, top - 1.45, 0.05)),
    ]),
  );
}

/** Tide gauge board: coral / ivory striped board on a post, facing +z. */
export function tideBoard(q: Q): Geo {
  const n = q.far ? 4 : 10;
  const h = 2.6 / n;
  return merge(
    boxAt(0.1, 3.0, 0.1, 'timber', 0, 0, -0.05),
    Array.from({ length: n }, (_, i) => boxAt(0.3, h, 0.03, i % 2 ? 'ivory' : 'coral', 0, 0.3 + i * h, 0.015)),
    nearOnly(q, () => Array.from({ length: 5 }, (_, i) => boxAt(0.08, 0.1, 0.02, 'ink', 0.08, 0.4 + i * 0.52, 0.04))),
  );
}
