/**
 * Jackets, capes, scarves and garlands (Cat.Upper) on the Torso part.
 */
import { C } from '../../../core/palette';
import { type Geo, beam, blob, box, cyl, lathe, merge, rotateX, scale, sphere, sway, torus } from '../../../core/geo';
import { Cat, Part, Slot } from '../../skeleton';
import type { RigOption } from '../../rig';
import { type Q, T, type V3, at, fine, lathe2, option, s, spec, tintWhere } from './kit';
import { frontZ, shell, shellFront, slab } from './torso';
import { upper } from './upper-vests';

const overallsCloth = (q: Q): Geo => {
  const strap = (sx: number): readonly Geo[] => {
    const top: V3 = [sx * 0.095, 0.48, 0.0];
    const front: V3 = [sx * 0.09, 0.27, 0.126];
    const back: V3 = [sx * 0.07, 0.02, -frontZ(0.07, 0.02) - 0.01];
    return q === 'near' ? [beam(front, top, 0.024, C.blue), beam(top, back, 0.024, C.blue)] : [beam(front, top, 0.024, C.blue)];
  };
  return merge(
    at(box(0.24, 0.25, 0.02, C.blue), 0, 0.03, 0.125),
    strap(-1),
    strap(1),
    ...fine(q, at(box(0.11, 0.08, 0.012, C.blue), 0, 0.14, 0.139)),
  );
};

const overallsButtons = (q: Q): Geo =>
  merge(...fine(q, ...[-1, 1].map((sx) => at(sphere(0.013, C.butter, 4, 2), sx * 0.09, 0.26, 0.137))));

const poncho = (q: Q): Geo =>
  scale(
    merge(
      T(
        lathe2(
          q,
          [
            [0.32, 0.06],
            [0.34, 0.09],
            [0.28, 0.32],
            [0.1, 0.47],
            [0.07, 0.49],
          ],
          C.sage,
          12,
          6,
          [
            [0.33, 0.06],
            [0.28, 0.32],
            [0.1, 0.47],
            [0.07, 0.49],
          ],
        ),
      ),
      ...fine(
        q,
        lathe(
          [
            [0.333, 0.14],
            [0.322, 0.18],
          ],
          C.ivory,
          12,
        ),
      ),
    ),
    1,
    1,
    0.8,
  );

const rainCape = (q: Q): Geo =>
  merge(
    T(
      scale(
        lathe2(
          q,
          [
            [0.36, -0.35],
            [0.38, -0.32],
            [0.3, 0.2],
            [0.12, 0.46],
            [0.07, 0.49],
          ],
          C.butter,
          12,
          6,
          [
            [0.37, -0.35],
            [0.3, 0.2],
            [0.1, 0.47],
            [0.07, 0.49],
          ],
        ),
        1,
        1,
        0.8,
      ),
    ),
    T(at(blob(0.12, 0.1, 0.08, C.butter, s(q, 6, 4), s(q, 4, 2)), 0, 0.5, -0.12)),
  );

const chefJacket = (q: Q): Geo =>
  merge(
    shell(q, 0.0, 0.44, 0.015, C.white),
    at(cyl(0.066, 0.062, 0.045, C.white, s(q, 10, 6), false), 0, 0.45, 0.0),
    ...fine(
      q,
      ...[-0.05, 0.05].flatMap((x) =>
        [0.18, 0.3].map((y) => at(sphere(0.012, C.ivoryDeep, 4, 2), x, y, shellFront(x, y, 0.015, 0.004)[2])),
      ),
    ),
  );

const bandJacket = (q: Q): Geo =>
  q === 'far'
    ? merge(T(shell(q, 0.0, 0.44, 0.015, C.coral)), at(box(0.14, 0.2, 0.012, C.butter), 0, 0.15, shellFront(0, 0.3, 0.015, 0.002)[2]))
    : merge(
        T(shell(q, 0.0, 0.44, 0.015, C.coral)),
        [0.18, 0.25, 0.32].map((y) => at(box(0.14, 0.014, 0.014, C.butter), 0, y, shellFront(0, y, 0.015, 0.003)[2])),
        [-1, 1].map((sx) => at(box(0.09, 0.025, 0.11, C.butter), sx * 0.19, 0.44, 0)),
      );

function smock(q: Q): Geo {
  const splats: ReadonlyArray<readonly [number, number, Parameters<typeof blob>[3]]> = [
    [0.06, 0.25, C.coral],
    [-0.08, 0.1, C.blue],
    [0.03, -0.1, C.butterDeep],
    [-0.04, 0.33, C.sageDeep],
    [0.09, -0.02, C.coral],
  ];
  const dabs = splats.map(([x, y, col], i) => {
    const g = at(blob(0.032, 0.026, 0.008, col, 4, 2), x, y, shellFront(x, y, 0.03, 0.002)[2]);
    return i === 0 ? T(g) : g;
  });
  return merge(shell(q, -0.25, 0.43, 0.03, C.ivoryShade), q === 'near' ? dabs : dabs.slice(0, 1));
}

function longScarf(q: Q): Geo {
  const hang = (g: Geo, top: number, bottom: number): Geo => sway(g, (_x, y) => Math.min(1, Math.max(0, (top - y) / (top - bottom))));
  const front = hang(T(slab([0.05, 0.46, 0.115], [0.06, 0.08, 0.135], 0.075, 0.02, C.coral)), 0.46, 0.08);
  const back = hang(T(slab([-0.04, 0.47, -0.1], [-0.07, -0.05, -0.16], 0.07, 0.02, C.coral)), 0.47, -0.05);
  return merge(
    T(at(scale(torus(0.085, 0.03, C.coral, s(q, 4, 3), s(q, 10, 5)), 1, 1, 0.95), 0, 0.475, 0.0)),
    front,
    ...fine(q, back, at(box(0.075, 0.03, 0.022, C.ivory), 0.06, 0.06, 0.135)),
  );
}

const cardiganShell = (q: Q): Geo =>
  merge(
    T(shell(q, 0.0, 0.43, 0.014, C.sage)),
    ...fine(q, ...[-1, 1].map((sx) => T(at(box(0.08, 0.07, 0.012, C.sage), sx * 0.09, 0.07, shellFront(sx * 0.09, 0.1, 0.014, 0.004)[2])))),
  );

const cardiganOpening = (q: Q): Geo =>
  q === 'near'
    ? merge(
        slab(shellFront(0, 0.0, 0.014, 0.004), shellFront(0, 0.3, 0.014, 0.004), 0.065, 0.012, C.ivory),
        slab(shellFront(0, 0.3, 0.014, 0.004), shellFront(0, 0.43, 0.014, 0.004), 0.065, 0.012, C.ivory),
      )
    : slab(shellFront(0, 0.0, 0.014, 0.012), shellFront(0, 0.43, 0.014, 0.012), 0.065, 0.012, C.ivory);

const lei = (q: Q): Geo => {
  const ring = at(rotateX(torus(0.12, 0.03, C.ivory, s(q, 4, 3), s(q, 14, 7)), 0.6), 0, 0.46, 0.03);
  return tintWhere(ring, (x, _y, z) => Math.cos(Math.atan2(x, z - 0.03) * 7) > -0.3);
};

export const COAT_OPTIONS: readonly RigOption[] = [
  option('upper.overalls', Cat.Upper, [spec(Part.Torso, Slot.Pants, overallsCloth), spec(Part.Torso, Slot.Vertex, overallsButtons)]),
  upper('upper.poncho', poncho),
  upper('upper.raincape', rainCape),
  upper('upper.chefjacket', chefJacket),
  upper('upper.bandjacket', bandJacket),
  upper('upper.smock', smock),
  upper('upper.scarf.long', longScarf),
  option('upper.cardigan', Cat.Upper, [spec(Part.Torso, Slot.Vertex, cardiganShell), spec(Part.Torso, Slot.Shirt, cardiganOpening)]),
  upper('upper.lei', lei),
];
