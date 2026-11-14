/**
 * Kitchen and serving props: jugs, trays, plates, boxes, pans and utensils.
 */
import { C } from '../../../core/palette';
import { type Geo, beam, blob, box, cone, cyl, merge, rotateX, sphere } from '../../../core/geo';
import { type Q, T, at, fine, lathe2, s } from '../wardrobe/kit';
import { type HeldDef, forward, held, pole, zCyl } from './grip';

/** Pitcher hanging from its handle; the body sits forward of the fist. */
const jug = (q: Q): Geo =>
  merge(
    at(
      lathe2(
        q,
        [
          [0.001, -0.2],
          [0.06, -0.2],
          [0.075, -0.1],
          [0.055, 0.0],
          [0.001, 0.0],
        ],
        C.ivory,
        8,
        6,
        [
          [0.001, -0.2],
          [0.075, -0.1],
          [0.001, 0.0],
        ],
      ),
      0,
      -0.02,
      0.085,
    ),
    beam([0, 0.0, 0.0], [0, -0.14, 0.01], 0.018, C.ivory),
    ...fine(
      q,
      at(rotateX(cone(0.022, 0.04, C.ivory, 4), 0.9), 0, -0.04, 0.16),
      T(at(cyl(0.078, 0.078, 0.025, C.blue, 8, false), 0, -0.12, 0.085)),
    ),
  );

/** Flat serving tray centred 0.02 above the fist with three glasses. */
const trayGlasses = (q: Q): Geo =>
  merge(
    at(cyl(0.2, 0.2, 0.02, C.slate, s(q, 10, 6)), 0, 0.01, 0),
    q === 'near'
      ? [
          [0.08, 0.0],
          [-0.06, 0.07],
          [-0.04, -0.08],
        ].map(([x, z]) => at(cyl(0.025, 0.03, 0.09, C.blueLight, 6), x ?? 0, 0.03, z ?? 0))
      : [at(cyl(0.05, 0.05, 0.08, C.blueLight, 4), 0, 0.03, 0)],
  );

function trayPastries(q: Q): Geo {
  const tray = at(box(0.4, 0.02, 0.28, C.timber), 0, 0.01, 0);
  if (q === 'far') return merge(tray, at(blob(0.15, 0.03, 0.1, C.butterDeep, 5, 2), 0, 0.03, 0));
  const pastries = [-0.12, 0, 0.12].flatMap((x, i) =>
    [-0.06, 0.06].map((z, j) => at(blob(0.04, 0.025, 0.03, (i + j) % 2 ? C.coralLight : C.butterDeep, 5, 2), x, 0.045, z)),
  );
  const rims = [
    at(box(0.4, 0.02, 0.014, C.timberDeep), 0, 0.03, 0.133),
    at(box(0.4, 0.02, 0.014, C.timberDeep), 0, 0.03, -0.133),
    at(box(0.014, 0.02, 0.28, C.timberDeep), 0.193, 0.03, 0),
    at(box(0.014, 0.02, 0.28, C.timberDeep), -0.193, 0.03, 0),
  ];
  return merge(tray, pastries, rims);
}

const pizzaBox = (q: Q): Geo =>
  merge(
    at(box(0.36, 0.05, 0.36, C.ivory), 0, 0.0, 0.0),
    at(box(0.36, 0.05, 0.36, C.ivoryShade), 0.01, 0.052, 0.005),
    ...fine(q, T(at(box(0.14, 0.006, 0.14, C.coral), 0.01, 0.103, 0.005))),
  );

const cake = (q: Q): Geo =>
  merge(
    at(cyl(0.16, 0.15, 0.015, C.ivory, s(q, 10, 6)), 0, 0.01, 0),
    T(at(cyl(0.11, 0.11, 0.09, C.coralLight, s(q, 8, 5)), 0, 0.025, 0)),
    ...fine(
      q,
      at(cyl(0.116, 0.116, 0.02, C.white, 8), 0, 0.105, 0),
      ...[0, 2.1, 4.2].map((a) => at(sphere(0.014, C.coralDeep, 4, 2), Math.sin(a) * 0.07, 0.13, Math.cos(a) * 0.07)),
    ),
  );

/** Pan hangs from its handle with the cooking face toward +z (pitch the grip to cook). */
const fryingPan = (q: Q): Geo =>
  merge(
    pole(q, -0.2, 0.06, 0.012, C.ink),
    at(
      forward(
        lathe2(
          q,
          [
            [0.001, 0],
            [0.12, 0],
            [0.13, 0.04],
            [0.115, 0.04],
            [0.105, 0.012],
            [0.001, 0.012],
          ],
          C.ink,
          8,
          5,
          [
            [0.001, 0],
            [0.125, 0],
            [0.13, 0.04],
            [0.001, 0.02],
          ],
        ),
      ),
      0,
      -0.33,
      -0.02,
    ),
    ...fine(q, T(at(zCyl(0.085, 0.012, C.butterDeep, 8), 0, -0.33, 0.0))),
  );

const rollingPin = (q: Q): Geo =>
  merge(
    pole(q, -0.04, 0.05, 0.014, C.timberDeep),
    at(cyl(0.03, 0.03, 0.26, C.timber, s(q, 6, 5)), 0, -0.3, 0),
    ...fine(q, pole(q, -0.37, -0.3, 0.014, C.timberDeep)),
  );

/** Ladle hangs bowl-down with the bowl opening toward +z. */
const ladle = (q: Q): Geo =>
  merge(
    pole(q, -0.24, 0.1, 0.008, C.slate),
    at(
      forward(
        lathe2(
          q,
          [
            [0.001, -0.05],
            [0.035, -0.045],
            [0.05, 0],
            [0.045, 0],
            [0.03, -0.04],
            [0.001, -0.044],
          ],
          C.slate,
          7,
          5,
          [
            [0.001, -0.05],
            [0.05, 0],
            [0.001, -0.01],
          ],
        ),
      ),
      0,
      -0.28,
      0.01,
    ),
    ...fine(q, beam([0, 0.1, 0], [0, 0.13, -0.025], 0.012, C.slate)),
  );

export const KITCHEN_PROPS: readonly HeldDef[] = [
  held('jug', jug),
  held('tray.glasses', trayGlasses),
  held('tray.pastries', trayPastries),
  held('pizzabox', pizzaBox),
  held('cake', cake),
  held('fryingpan', fryingPan),
  held('rollingpin', rollingPin),
  held('ladle', ladle),
];
