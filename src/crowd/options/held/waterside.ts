/**
 * Harbour and beach props: catch, rods, nets, oars, buckets, toy boats, kite reels and dog leads.
 */
import { C } from '../../../core/palette';
import { type Geo, beam, blob, box, cone, cyl, merge, prism, profile, rotateX, rotateY, rotateZ, sphere, torus } from '../../../core/geo';
import { type Q, T, type V3, at, fine, lathe2, path, s } from '../wardrobe/kit';
import { type HeldDef, bail, held, pole, xCyl, zCyl } from './grip';

/** Fish held by the tail, hanging head-down; laterally flat (thin along x). */
const fishBy = (len: number) => (q: Q): Geo =>
  merge(
    T(at(blob(0.024, len, 0.06, C.blue, s(q, 8, 5), s(q, 5, 3)), 0, -0.05 - len, 0)),
    at(
      rotateY(
        profile(
          [
            [-0.05, 0.04],
            [0, -0.035],
            [0.05, 0.04],
          ],
          0.012,
          C.blueDeep,
        ),
        Math.PI / 2,
      ),
      0,
      -0.03,
      0,
    ),
    ...fine(
      q,
      ...[-1, 1].map((sx) => at(sphere(0.008, C.ink, 4, 2), sx * 0.02, -0.05 - len * 1.7, 0.03)),
      at(box(0.01, 0.06, 0.04, C.blueDeep), 0, -0.05 - len, -0.07),
    ),
  );

const lobster = (q: Q): Geo =>
  merge(
    at(blob(0.04, 0.08, 0.035, C.coral, s(q, 6, 5), s(q, 4, 2)), 0, -0.1, 0),
    at(blob(0.035, 0.07, 0.025, C.coral, s(q, 5, 4), s(q, 3, 2)), 0, 0.03, 0),
    [-1, 1].map((sx) => at(blob(0.03, 0.05, 0.02, C.coralDeep, s(q, 5, 4), s(q, 3, 2)), sx * 0.06, -0.25, 0.02)),
    ...fine(q, ...[-1, 1].map((sx) => beam([sx * 0.03, -0.14, 0], [sx * 0.06, -0.21, 0.02], 0.014, C.coralDeep))),
  );

/** Rod angled forward-up from the fist, line hanging from the tip. */
function fishingRod(q: Q): Geo {
  const tilt = 0.5;
  const dir: V3 = [0, Math.cos(tilt), Math.sin(tilt)];
  const along = (d: number): V3 => [0, dir[1] * d, dir[2] * d];
  const tip = along(2.3);
  if (q === 'far') return merge(beam(along(-0.2), tip, 0.02, C.timberDeep));
  return merge(
    at(rotateX(cyl(0.012, 0.004, 2.5, C.timberDeep, 5), tilt), ...along(-0.2)),
    at(rotateX(cyl(0.02, 0.02, 0.26, C.clay, 5), tilt), ...along(-0.2)),
    at(xCyl(0.03, 0.02, C.slate, 6), 0.03, 0.0, 0.0),
    beam(tip, [0, tip[1] - 2.6, tip[2]], 0.004, C.ivoryDeep),
    at(sphere(0.02, C.coral, 4, 2), 0, tip[1] - 2.6, tip[2]),
  );
}

const landingNet = (q: Q): Geo =>
  merge(
    pole(q, -0.2, 0.85, 0.012, C.timber),
    at(rotateX(torus(0.16, 0.009, C.slate, 3, s(q, 10, 5)), Math.PI / 2), 0, 1.0, 0),
    ...fine(q, at(rotateX(cone(0.15, 0.25, C.ivoryShade, 6), -Math.PI / 2), 0, 1.0, 0)),
  );

const kidNet = (q: Q): Geo =>
  merge(
    pole(q, -0.15, 0.85, 0.008, C.butterLight),
    T(at(rotateX(torus(0.1, 0.008, C.coral, 3, s(q, 8, 5)), Math.PI / 2), 0, 0.95, 0)),
    ...fine(q, at(rotateX(cone(0.095, 0.16, C.ivory, 6), -Math.PI / 2), 0, 0.95, 0)),
  );

const oar = (q: Q): Geo =>
  merge(
    pole(q, -0.45, 0.85, 0.018, C.timber),
    at(box(0.15, 0.36, 0.02, C.timber), 0, 0.85, 0),
    T(at(box(0.152, 0.12, 0.022, C.coral), 0, 1.2, 0)),
  );

const paddle = (q: Q): Geo =>
  merge(
    at(box(0.1, 0.03, 0.03, C.timberDeep), 0, -0.015, 0),
    pole(q, -0.48, 0.0, 0.015, C.timber),
    T(at(blob(0.08, 0.17, 0.012, C.blue, s(q, 6, 4), s(q, 4, 2)), 0, -0.62, 0)),
  );

const boatHook = (q: Q): Geo =>
  merge(
    pole(q, -0.5, 1.55, 0.015, C.timber),
    path(
      [
        [0, 1.5, 0],
        [0, 1.65, 0],
      ],
      0.02,
      C.butterDeep,
    ),
    ...fine(
      q,
      path(
        [
          [0, 1.56, 0],
          [0, 1.6, 0.06],
          [0, 1.54, 0.08],
        ],
        0.016,
        C.butterDeep,
      ),
    ),
  );

/** Open pail hanging from its bail. */
const pail = (q: Q, k: number): Geo =>
  merge(
    T(
      lathe2(
        q,
        [
          [0.001, -0.42 * k],
          [0.1 * k, -0.42 * k],
          [0.13 * k, -0.18 * k],
          [0.12 * k, -0.18 * k],
          [0.09 * k, -0.4 * k],
          [0.001, -0.4 * k],
        ],
        C.coral,
        s(q, 8, 5),
        5,
        [
          [0.001, -0.42 * k],
          [0.1 * k, -0.42 * k],
          [0.13 * k, -0.18 * k],
          [0.001, -0.2 * k],
        ],
      ),
    ),
    bail(q, -0.18 * k, 0.125 * k, C.slate, 0.01),
  );

const bucket = (q: Q): Geo => pail(q, 1);

const bucketSpade = (q: Q): Geo =>
  merge(
    pail(q, 0.62),
    ...fine(
      q,
      beam([0.03, -0.05, 0.02], [0.05, -0.32, 0.03], 0.014, C.butter),
      T(at(rotateZ(box(0.06, 0.08, 0.012, C.blue), 0.08), 0.03, -0.12, 0.03)),
    ),
  );

const sailboat = (q: Q): Geo =>
  merge(
    T(
      at(
        prism(
          [
            [0, 0.16],
            [0.05, 0.07],
            [0.045, -0.12],
            [-0.045, -0.12],
            [-0.05, 0.07],
          ],
          0.06,
          C.coral,
        ),
        0,
        -0.02,
        0,
      ),
    ),
    beam([0, 0.04, 0.0], [0, 0.4, 0.0], 0.012, C.timber),
    at(
      rotateY(
        profile(
          [
            [0.01, 0.06],
            [0.15, 0.06],
            [0.01, 0.37],
          ],
          0.012,
          C.ivory,
        ),
        Math.PI / 2,
      ),
      0,
      0,
      0,
    ),
    ...fine(q, at(box(0.006, 0.03, 0.05, C.blue), 0, 0.39, -0.03)),
  );

const kiteReel = (q: Q): Geo =>
  merge(
    q === 'near'
      ? [-1, 1].map((sz) => at(zCyl(0.05, 0.01, C.butter, 8), 0, 0.03, sz * 0.025))
      : [at(zCyl(0.05, 0.06, C.butter, 6), 0, 0.03, 0)],
    ...fine(
      q,
      at(zCyl(0.025, 0.05, C.ivoryShade, 6), 0, 0.03, 0),
      beam([0, 0.07, 0.0], [0, 1.25, 0.95], 0.004, C.ivoryDeep),
    ),
  );

/** Lead pulled taut 1.2 m forward-down toward the dog's collar. */
const dogLead = (q: Q): Geo =>
  q === 'far'
    ? T(beam([0, 0, 0], [0, -0.58, 1.05], 0.014, C.coral))
    : merge(
        T(at(torus(0.035, 0.008, C.coral, 3, 6), 0, 0.0, 0)),
        T(beam([0, -0.02, 0.02], [0, -0.58, 1.05], 0.008, C.coral)),
        at(box(0.02, 0.04, 0.02, C.slate), 0, -0.6, 1.06),
      );

export const WATERSIDE_PROPS: readonly HeldDef[] = [
  held('fish', fishBy(0.15), 'RL'),
  held('fish.long', fishBy(0.28)),
  held('lobster', lobster),
  held('fishingrod', fishingRod, 'R', { reach: 2.6 }),
  held('landingnet', landingNet, 'R', { reach: 0.3 }),
  held('kidnet', kidNet, 'R', { reach: 0.2 }),
  held('oar', oar, 'R', { reach: 0.4 }),
  held('paddle', paddle),
  held('boathook', boatHook, 'R', { reach: 0.6 }),
  held('bucket', bucket, 'RL'),
  held('bucketspade', bucketSpade, 'RL'),
  held('sailboat', sailboat),
  held('kitereel', kiteReel, 'R', { reach: 0.6 }),
  held('doglead', dogLead, 'RL', { reach: 1.2 }),
];
