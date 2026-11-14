/**
 * Things worn on the back (Cat.Back), authored on the Torso part; the back surface is at z ≈ -0.12.
 */
import { C } from '../../../core/palette';
import {
  type Geo,
  blob,
  box,
  cone,
  cyl,
  dome,
  merge,
  profile,
  rotateX,
  rotateY,
  rotateZ,
  scale,
  sphere,
  sway,
} from '../../../core/geo';
import { Cat, Part, Slot } from '../../skeleton';
import type { RigOption } from '../../rig';
import { type Build, type Q, T, type V3, at, fine, lathe2, option, path, s, spec } from './kit';
import { frontZ } from './torso';

const back = (key: string, build: Build): RigOption => option(key, Cat.Back, [spec(Part.Torso, Slot.Vertex, build)]);

/** Diagonal strap from the left shoulder across the chest to the right hip. */
export const chestStrap = (col = C.cocoa): Geo =>
  path([[0.12, 0.47, 0], [0, 0.28, frontZ(0, 0.28) + 0.012], [-0.16, 0.06, frontZ(-0.16, 0.06) + 0.03]], 0.02, col);

/** Two shoulder straps on the chest. */
const shoulderStraps = (): Geo =>
  merge([-1, 1].map((sx) => path([[sx * 0.1, 0.47, 0.0], [sx * 0.11, 0.1, frontZ(0.11, 0.1) + 0.01]], 0.022, C.cocoa)));

const flatCyl = (r: number, h: number, col: Parameters<typeof cyl>[3], seg: number): Geo =>
  rotateX(at(cyl(r, r, h, col, seg), 0, -h / 2, 0), Math.PI / 2);

/** Guitar centred on its lower bout, neck along +y, top facing +z (shared with carry.guitar). */
export function guitarShape(q: Q): Geo {
  const parts =
    q === 'near'
      ? [
          T(flatCyl(0.16, 0.08, C.timber, 8)),
          T(at(flatCyl(0.12, 0.08, C.timber, 8), 0, 0.2, 0)),
          at(flatCyl(0.045, 0.084, C.ink, 6), 0, 0.12, 0),
          at(box(0.05, 0.45, 0.03, C.timberDeep), 0, 0.28, 0),
          at(box(0.07, 0.12, 0.035, C.cocoa), 0, 0.72, 0),
        ]
      : [T(flatCyl(0.16, 0.08, C.timber, 6)), at(box(0.05, 0.6, 0.03, C.timberDeep), 0, 0.15, 0)];
  return merge(parts);
}

const guitar = (q: Q): Geo => merge(at(rotateZ(guitarShape(q), 0.5), 0.06, 0.08, -0.2), ...fine(q, chestStrap()));

const cello = (q: Q): Geo =>
  at(
    scale(
      T(
        lathe2(
          q,
          [
            [0.001, -0.35],
            [0.19, -0.3],
            [0.21, -0.05],
            [0.14, 0.2],
            [0.16, 0.35],
            [0.06, 0.55],
            [0.05, 0.85],
            [0.001, 0.9],
          ],
          C.blue,
          8,
          5,
          [
            [0.001, -0.35],
            [0.2, -0.2],
            [0.15, 0.3],
            [0.05, 0.85],
            [0.001, 0.9],
          ],
        ),
      ),
      1,
      1,
      0.55,
    ),
    0,
    0,
    -0.25,
  );

function wings(q: Q): Geo {
  const lobe = (sx: number, upper: boolean): Geo => {
    const g = upper
      ? blob(0.16, 0.2, 0.012, C.blueLight, s(q, 6, 4), s(q, 3, 2))
      : blob(0.1, 0.13, 0.012, C.blueLight, s(q, 6, 4), s(q, 3, 2));
    const placed = upper
      ? at(rotateZ(g, sx * -0.6), sx * 0.16, 0.38, -0.17)
      : at(rotateZ(g, sx * 0.5), sx * 0.11, 0.12, -0.17);
    return T(placed);
  };
  const all = merge(lobe(-1, true), lobe(1, true), lobe(-1, false), lobe(1, false), ...fine(q, at(sphere(0.035, C.ivory, 5, 3), 0, 0.27, -0.15)));
  return sway(all, (x) => Math.min(1, Math.abs(x) * 3));
}

function cape(q: Q): Geo {
  const panel = (x: number, ry: number, rz: number, w: number, z: number): Geo =>
    at(rotateZ(rotateY(box(w, 0.95, 0.02, C.coral), ry), rz), x, -0.5, z);
  const cloth = T(merge(panel(0, 0, 0, 0.22, -0.155), panel(0.15, -0.6, 0.08, 0.14, -0.115), panel(-0.15, 0.6, -0.08, 0.14, -0.115)));
  return merge(
    sway(cloth, (_x, y) => Math.min(1, Math.max(0, (0.45 - y) / 0.9))),
    ...fine(q, at(cyl(0.09, 0.08, 0.04, C.coral, 8, false), 0, 0.44, -0.02), ...[-1, 1].map((sx) => at(sphere(0.016, C.butter, 4, 2), sx * 0.07, 0.45, 0.07))),
  );
}

function baguetteBasket(q: Q): Geo {
  const loaf = (x: number, tilt: number, seg: number): Geo =>
    at(rotateZ(cyl(0.025, 0.02, 0.42, C.butterDeep, seg), tilt), x, 0.2, -0.26);
  return merge(
    at(cyl(0.15, 0.17, 0.32, C.timber, s(q, 8, 5)), 0, 0.02, -0.26),
    q === 'near' ? [loaf(-0.05, 0.25, 5), loaf(0.02, -0.1, 5), loaf(0.07, -0.35, 5)] : [loaf(0, 0, 4)],
    ...fine(q, at(cyl(0.165, 0.165, 0.03, C.timberDeep, 8, false), 0, 0.22, -0.26), shoulderStraps()),
  );
}

const creel = (q: Q): Geo =>
  merge(
    at(box(0.3, 0.2, 0.16, C.timber), -0.2, -0.12, -0.1),
    at(box(0.31, 0.03, 0.17, C.timberDeep), -0.2, 0.08, -0.1),
    q === 'near' ? chestStrap(C.cocoa) : path([[0.12, 0.47, 0], [-0.18, 0.1, 0.0]], 0.02, C.cocoa),
    ...fine(q, at(box(0.04, 0.05, 0.02, C.butterDeep), -0.2, 0.05, -0.01)),
  );

const rucksack = (q: Q): Geo =>
  merge(
    T(at(box(0.32, 0.55, 0.2, C.sage), 0, -0.02, -0.23)),
    at(rotateZ(cyl(0.07, 0.07, 0.42, C.butterDeep, s(q, 8, 5)), Math.PI / 2), 0.21, 0.6, -0.23),
    ...fine(
      q,
      T(at(box(0.33, 0.06, 0.21, C.sageDeep), 0, 0.47, -0.23)),
      ...[-1, 1].map((sx) => at(box(0.05, 0.2, 0.14, C.sageDeep), sx * 0.185, 0.05, -0.23)),
      shoulderStraps(),
    ),
  );

function kite(q: Q): Geo {
  const sail = T(
    at(
      profile(
        [
          [0, 0.4],
          [-0.25, 0.1],
          [0, -0.35],
          [0.25, 0.1],
        ],
        0.014,
        C.coral,
      ),
      0,
      0.25,
      -0.2,
    ),
  );
  const tail: readonly V3[] = [
    [0, -0.1, -0.21],
    [0.08, -0.3, -0.23],
    [-0.04, -0.5, -0.24],
    [0.05, -0.7, -0.25],
  ];
  const tailGeo = (pts: readonly V3[]): Geo => sway(path(pts, 0.008, C.ivoryDeep), (_x, y) => Math.min(1, -y));
  if (q === 'far') return merge(sail, at(box(0.03, 0.75, 0.016, C.timber), 0, -0.1, -0.215));
  return merge(
    sail,
    at(box(0.02, 0.75, 0.016, C.timber), 0, -0.1, -0.215),
    at(box(0.5, 0.02, 0.016, C.timber), 0, 0.34, -0.215),
    tailGeo(tail),
    tail.slice(1).map(([x, y, z]) => sway(T(at(rotateZ(box(0.06, 0.025, 0.012, C.ivory), 0.4), x, y, z)), Math.min(1, -y))),
  );
}

const rocketPack = (q: Q): Geo =>
  merge(
    [-1, 1].map((sx) => T(at(cyl(0.07, 0.07, 0.35, C.blue, s(q, 7, 4)), sx * 0.08, 0.0, -0.21))),
    [-1, 1].map((sx) => at(cone(0.07, 0.11, C.coral, s(q, 7, 3)), sx * 0.08, 0.35, -0.21)),
    ...fine(q, ...[-1, 1].map((sx) => at(rotateZ(box(0.1, 0.12, 0.016, C.coral), sx * 0.5), sx * 0.15, -0.02, -0.21))),
  );

function sandwichBoard(q: Q): Geo {
  const board = (z: number): Geo => T(at(box(0.5, 0.7, 0.02, C.butter), 0, -0.35, z));
  const panel = (z: number): Geo => at(box(0.42, 0.42, 0.02, C.ivory), 0, -0.2, z);
  return merge(
    board(0.24),
    board(-0.22),
    panel(0.252),
    ...fine(
      q,
      panel(-0.232),
      ...[-0.12, 0, 0.12].map((x) => at(box(0.07, 0.16, 0.012, C.ink), x, -0.05, 0.264)),
      ...[-1, 1].map((sx) => path([[sx * 0.15, 0.35, 0.24], [sx * 0.12, 0.475, 0], [sx * 0.15, 0.35, -0.22]], 0.02, C.cocoa)),
    ),
  );
}

const carrierFrame = (q: Q): Geo =>
  merge(
    T(at(box(0.26, 0.24, 0.16, C.coral), 0, 0.1, -0.22)),
    T(at(dome(0.09, C.coral, s(q, 6, 4), s(q, 2, 1)), 0, 0.52, -0.24)),
    ...fine(q, ...[-1, 1].map((sx) => at(box(0.02, 0.4, 0.02, C.slate), sx * 0.13, 0.0, -0.3)), shoulderStraps()),
  );

const carrierBaby = (q: Q): Geo =>
  merge(
    at(sphere(0.085, C.clayLight, s(q, 7, 5), s(q, 4, 3)), 0, 0.47, -0.24),
    ...fine(q, ...[-1, 1].map((sx) => at(sphere(0.025, C.clayLight, 4, 2), sx * 0.12, 0.33, -0.2))),
  );

export const BACK_OPTIONS: readonly RigOption[] = [
  back('back.guitar', guitar),
  back('back.cello', cello),
  back('back.wings', wings),
  back('back.cape', cape),
  back('back.basket.baguettes', baguetteBasket),
  back('back.creel', creel),
  back('back.rucksack', rucksack),
  back('back.kite', kite),
  back('back.rocketpack', rocketPack),
  back('back.sandwichboard', sandwichBoard),
  option('back.babycarrier', Cat.Back, [spec(Part.Torso, Slot.Vertex, carrierFrame), spec(Part.Torso, Slot.Skin, carrierBaby)]),
];
