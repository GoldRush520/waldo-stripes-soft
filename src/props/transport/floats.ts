/**
 * Boat-parade floats: an 8 m flat barge dressed with pennants, carrying one giant geometric
 * figure (fish, swan, lighthouse cake, flower-crown arch). Six people stand on deck.
 */
import {
  type Col,
  type Geo,
  blob,
  cone,
  cyl,
  merge,
  profile,
  rotateX,
  rotateY,
  rotateZ,
  scale,
  sphere,
  torus,
  translate,
  tube,
} from '../../core/geo';
import { type Q, type V3, boxAt, nearOnly, pennants, post, sg } from './kit';
import { type HullSpec, hull } from './hull';
import { swanNeck } from './boats-leisure';

export const FLOAT_HULL: HullSpec = {
  length: 8,
  beam: 3,
  draft: 0.35,
  freeboard: 0.5,
  bowRise: 0.12,
  transom: 0.8,
  bowLen: 0.3,
  round: 4.5,
  floor: 0.35,
  shell: 0.07,
  trimH: 0.1,
  hullCol: 'blue',
  trimCol: 'ivory',
  bottomCol: 'clayDeep',
  floorCol: 'butterLight',
};

export const FLOAT_DECK = 0.35;
const FESTIVE: readonly Col[] = ['coral', 'butter', 'blue', 'ivory', 'sage'];

export type FloatFigure = 'fish' | 'swan' | 'lighthouseCake' | 'flowerArch';

/** The dressed barge without its figure. `peak` is the top the pennant lines run to. */
function floatBase(q: Q, peak: V3): Geo {
  const bow: V3 = [0, 3.2, 3.6];
  const stern: V3 = [0, 3.0, -3.6];
  return merge(
    hull(q, FLOAT_HULL),
    post(q, 0.06, FLOAT_DECK, bow[1] + 0.1, 'ivory', bow[0], bow[2]),
    post(q, 0.06, FLOAT_DECK, stern[1] + 0.1, 'ivory', stern[0], stern[2]),
    pennants(q, bow, peak, 9, FESTIVE, 0.3, 0.35),
    pennants(q, peak, stern, 9, FESTIVE.slice(1), 0.3, 0.35),
    ...[-1, 1].map((sx) => pennants(q, [sx * 1.1, 1.5, 2.4], [sx * 1.25, 1.5, -3.2], 8, FESTIVE.slice(2), 0.22, 0.3)),
    ...[-1, 1].flatMap((sx) => [2.4, -3.2].map((z) => post(q, 0.035, FLOAT_DECK, 1.55, 'ivory', sx * (z > 0 ? 1.1 : 1.25), z))),
    nearOnly(q, () => [
      translate(sphere(0.12, 'butter', 6, 4), bow[0], bow[1] + 0.15, bow[2]),
      translate(sphere(0.12, 'butter', 6, 4), stern[0], stern[1] + 0.15, stern[2]),
    ]),
  );
}

function plinth(q: Q, w: number, d: number, h: number): Geo {
  return merge(
    boxAt(w, h, d, 'ivory', 0, FLOAT_DECK, 0),
    boxAt(w + 0.06, 0.12, d + 0.06, 'coral', 0, FLOAT_DECK + h - 0.12, 0),
    nearOnly(q, () => boxAt(w + 0.06, 0.08, d + 0.06, 'butter', 0, FLOAT_DECK + 0.05, 0)),
  );
}

/* ------------------------------------------------------------------ figures */

function fish(q: Q): Geo {
  const y = FLOAT_DECK + 0.5 + 1.0;
  const ring = (z: number): Geo => {
    const k = Math.sqrt(Math.max(0, 1 - (z / 2.0) ** 2));
    return translate(scale(rotateX(torus(1, 0.06, 'ivory', 4, sg(q, 14, 8)), Math.PI / 2), 0.8 * k + 0.02, 1.0 * k + 0.02, 1), 0, y, z);
  };
  const tail = rotateY(
    profile(
      [
        [0, 0],
        [-0.9, 0.75],
        [-0.65, 0],
        [-0.9, -0.75],
      ],
      0.12,
      'butter',
    ),
    -Math.PI / 2,
  );
  const fin = rotateY(
    profile(
      [
        [0.6, 0],
        [-0.5, 0],
        [-0.6, 0.55],
      ],
      0.08,
      'butter',
    ),
    -Math.PI / 2,
  );
  return merge(
    plinth(q, 1.4, 2.4, 0.5),
    translate(blob(0.8, 1.0, 2.0, 'coral', sg(q, 14, 7), sg(q, 10, 6)), 0, y, 0),
    [-0.9, 0, 0.9].map(ring),
    translate(tail, 0, y, -1.85),
    translate(fin, 0, y + 0.92, -0.1),
    [-1, 1].map((sx) => translate(rotateZ(rotateY(fin, Math.PI / 2), sx * 1.2), sx * 0.6, y - 0.35, 0.6)),
    [-1, 1].map((sx) => translate(sphere(0.22, 'ivory', sg(q, 8, 5), sg(q, 6, 4)), sx * 0.52, y + 0.3, 1.45)),
    nearOnly(q, () => [
      ...[-1, 1].map((sx) => translate(sphere(0.11, 'ink', 6, 4), sx * 0.66, y + 0.32, 1.55)),
      translate(scale(torus(0.18, 0.05, 'coralDeep', 4, 10), 1, 0.7, 1), 0, y - 0.2, 1.98),
      ...[0.3, 0.6, 0.9].map((dy) => translate(sphere(0.06 + dy * 0.05, 'blueLight', 6, 4), 0.1, y + 0.2 + dy, 2.2 + dy * 0.2)),
    ]),
  );
}

function swan(q: Q): Geo {
  const y = FLOAT_DECK + 0.4 + 0.8;
  return merge(
    plinth(q, 1.6, 2.6, 0.4),
    translate(blob(1.0, 0.8, 1.7, 'ivory', sg(q, 14, 7), sg(q, 10, 6)), 0, y, -0.2),
    [-1, 1].map((sx) => translate(rotateZ(blob(0.35, 0.75, 1.4, 'ivoryShade', sg(q, 10, 6), sg(q, 7, 4)), sx * -0.5), sx * 0.85, y + 0.35, -0.4)),
    translate(rotateX(cone(0.45, 0.9, 'ivory', sg(q, 10, 5)), -1.0), 0, y + 0.1, -1.7),
    swanNeck(q, [0, y + 0.3, 1.0], 2.0),
    nearOnly(q, () => [translate(torus(0.22, 0.05, 'butter', 4, 12), 0, y + 2.95, 1.56)]),
  );
}

function lighthouseCake(q: Q): Geo {
  const tiers: ReadonlyArray<readonly [number, number, Col, Col]> = [
    [1.25, 0.7, 'ivory', 'coral'],
    [0.95, 0.6, 'butter', 'ivory'],
    [0.65, 0.5, 'coralLight', 'butter'],
  ];
  let y = FLOAT_DECK;
  const parts: Geo[] = [];
  for (const [r, h, c, icing] of tiers) {
    parts.push(translate(cyl(r, r, h, c, sg(q, 14, 10)), 0, y, 0));
    parts.push(translate(torus(r, 0.09, icing, sg(q, 4, 3), sg(q, 14, 10)), 0, y + h, 0));
    if (!q.far) {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        parts.push(translate(sphere(0.09, icing, 5, 3), Math.sin(a) * r, y + h - 0.12, Math.cos(a) * r));
      }
    }
    y += h;
  }
  const bands = 4;
  const lh = 1.6;
  const tower = Array.from({ length: bands }, (_, i) => {
    const r0 = 0.36 - (0.1 * i) / bands;
    const r1 = 0.36 - (0.1 * (i + 1)) / bands;
    return translate(cyl(r0, r1, lh / bands, i % 2 === 0 ? 'coral' : 'ivory', sg(q, 12, 6)), 0, y + (lh * i) / bands, 0);
  });
  const top = y + lh;
  return merge(
    parts,
    tower,
    translate(cyl(0.38, 0.38, 0.06, 'ivoryDeep', sg(q, 12, 6)), 0, top, 0),
    translate(cyl(0.2, 0.2, 0.35, 'butterLight', sg(q, 10, 5)), 0, top + 0.06, 0),
    translate(cone(0.3, 0.4, 'coral', sg(q, 10, 5)), 0, top + 0.41, 0),
    nearOnly(q, () => [
      ...Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        return translate(cyl(0.03, 0.03, 0.3, i % 2 ? 'blue' : 'sage', 5), Math.sin(a) * 0.82, FLOAT_DECK + 1.3, Math.cos(a) * 0.82);
      }),
      ...Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        return translate(sphere(0.04, 'butter', 5, 3), Math.sin(a) * 0.82, FLOAT_DECK + 1.64, Math.cos(a) * 0.82);
      }),
      translate(cone(0.04, 0.4, 'coral', 4), 0, top + 0.8, 0),
      ...[0, 1, 2, 3].map((i) => boxAt(0.05, 0.08, 0.02, 'blueDeep', Math.sin(i * 1.57) * 0.33, y + 0.6, Math.cos(i * 1.57) * 0.33)),
    ]),
  );
}

function flowerArch(q: Q): Geo {
  const R = 1.0;
  const n = q.far ? 6 : 14;
  const arcPts = (k: number): V3[] =>
    Array.from({ length: k + 1 }, (_, i): V3 => {
      const a = Math.PI * (i / k);
      return [-Math.cos(a) * R, FLOAT_DECK + 0.25 + Math.sin(a) * 2.4, 0];
    });
  const flowers: readonly Col[] = ['coral', 'butter', 'ivory', 'blue', 'coralLight'];
  const blooms = arcPts(n).map((p, i) => {
    const c = flowers[i % flowers.length] ?? 'coral';
    const r = q.far ? 0.28 : 0.2 + (i % 3) * 0.04;
    return translate(scale(sphere(r, c, sg(q, 6, 5), sg(q, 4, 3)), 1, 1, 0.7), p[0], p[1], p[2] + (i % 2 === 0 ? 0.08 : -0.08));
  });
  const crownY = FLOAT_DECK + 0.25 + 2.4 + 0.15;
  return merge(
    [-1, 1].map((sx) => translate(cyl(0.35, 0.3, 0.45, 'coral', sg(q, 10, 6)), sx * R, FLOAT_DECK, 0)),
    tube(arcPts(q.far ? 4 : 6), 0.11, 'sageDeep', sg(q, 6, 4), !q.far),
    blooms,
    translate(cyl(0.45, 0.5, 0.25, 'butter', sg(q, 12, 6)), 0, crownY, 0),
    Array.from({ length: q.far ? 4 : 6 }, (_, i) => {
      const a = (i / (q.far ? 4 : 6)) * Math.PI * 2;
      return translate(cone(0.11, 0.35, 'butter', sg(q, 6, 4)), Math.sin(a) * 0.42, crownY + 0.22, Math.cos(a) * 0.42);
    }),
    nearOnly(q, () => [
      ...Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return translate(sphere(0.06, i % 2 ? 'coral' : 'blue', 6, 4), Math.sin(a) * 0.48, crownY + 0.12, Math.cos(a) * 0.48);
      }),
      ...[-1, 1].map((sx) => translate(sphere(0.32, 'sage', 8, 5), sx * R, FLOAT_DECK + 0.6, 0)),
      ...[-1, 1].flatMap((sx) => [0, 1, 2].map((i) => translate(sphere(0.09, flowers[i] ?? 'coral', 6, 4), sx * R + (i - 1) * 0.2, FLOAT_DECK + 0.95, 0.15))),
    ]),
  );
}

const FIGURES: Readonly<Record<FloatFigure, { readonly build: (q: Q) => Geo; readonly peak: V3 }>> = {
  fish: { build: fish, peak: [0, 3.3, 0] },
  swan: { build: swan, peak: [0, 4.6, 1.6] },
  lighthouseCake: { build: lighthouseCake, peak: [0, 5.0, 0] },
  flowerArch: { build: flowerArch, peak: [0, 3.7, 0] },
};

/** Parametric parade float carrying one of the four giant figures. */
export function paradeFloat(q: Q, figure: FloatFigure): Geo {
  const f = FIGURES[figure];
  return merge(floatBase(q, f.peak), f.build(q));
}

export const FLOAT_FIGURES: readonly FloatFigure[] = ['fish', 'swan', 'lighthouseCake', 'flowerArch'];
