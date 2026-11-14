/**
 * Two-handed and torso-mounted instruments (Cat.Special) on the Torso part. Arms are posed by the
 * clip to reach them; nothing here moves with the hands.
 */
import { C } from '../../../core/palette';
import { type Geo, beam, blob, box, cyl, merge, rotateX, rotateZ, scale, sphere, torus } from '../../../core/geo';
import { Cat, Part, Slot } from '../../skeleton';
import type { RigOption } from '../../rig';
import { type Build, type Meta, type Q, T, at, fine, lathe2, option, path, s, spec } from './kit';
import { frontZ } from './torso';
import { guitarShape } from './back';

export const carry = (key: string, build: Build, meta: Meta = {}): RigOption =>
  option(key, Cat.Special, [spec(Part.Torso, Slot.Vertex, build)], meta);

const BRASS = C.butterDeep;

/** Strap from the left shoulder over the back to the right hip. */
const backStrap = (): Geo =>
  path([[0.12, 0.475, 0.0], [0.0, 0.3, -frontZ(0, 0.3) - 0.012], [-0.17, 0.06, -0.06]], 0.02, C.cocoa);

const playedGuitar = (q: Q): Geo =>
  merge(at(rotateZ(guitarShape(q), -1.1), -0.08, 0.12, 0.2), ...fine(q, backStrap()));

function accordion(q: Q): Geo {
  const ends = [-1, 1].map((sx) => T(at(box(0.06, 0.3, 0.2, C.coral), sx * 0.17, 0.05, 0.27)));
  if (q === 'far') return merge(ends, at(box(0.28, 0.27, 0.18, C.ivoryShade), 0, 0.065, 0.27));
  return merge(
    ends,
    [-0.07, 0, 0.07].map((x, i) => at(box(0.07, 0.28, 0.18, i % 2 ? C.coralDeep : C.ivoryShade), x, 0.06, 0.27)),
    at(box(0.03, 0.28, 0.07, C.white), -0.215, 0.06, 0.33),
    [-1, 1].map((sx) => beam([sx * 0.1, 0.47, 0.0], [sx * 0.15, 0.3, 0.2], 0.02, C.cocoa)),
  );
}

const snareDrum = (q: Q): Geo =>
  merge(
    T(at(cyl(0.17, 0.17, 0.14, C.coral, s(q, 8, 6)), 0.08, 0.0, 0.27)),
    q === 'near'
      ? path([[-0.12, 0.475, 0.0], [0.0, 0.3, frontZ(0, 0.3) + 0.012], [0.05, 0.14, 0.2]], 0.02, C.cocoa)
      : beam([-0.12, 0.475, 0.0], [0.05, 0.14, 0.2], 0.02, C.cocoa),
    ...fine(
      q,
      at(cyl(0.172, 0.172, 0.006, C.ivory, 8), 0.08, 0.14, 0.27),
      at(cyl(0.176, 0.176, 0.025, C.slate, 8, false), 0.08, 0.125, 0.27),
    ),
  );

function bassDrum(q: Q): Geo {
  const sideways = (g: Geo): Geo => at(rotateZ(g, Math.PI / 2), 0, 0.18, 0.42);
  const heads = sideways(at(cyl(0.29, 0.29, 0.28, C.ivory, s(q, 10, 6)), 0, -0.14, 0));
  const shell = sideways(T(at(cyl(0.3, 0.3, 0.26, C.coral, s(q, 10, 6), false), 0, -0.13, 0)));
  return merge(
    heads,
    shell,
    ...fine(
      q,
      ...[-0.14, 0.11].map((y) => sideways(at(cyl(0.305, 0.305, 0.03, C.butter, 10, false), 0, y, 0))),
      ...[-1, 1].map((sx) => beam([sx * 0.1, 0.47, 0.0], [sx * 0.08, 0.4, 0.2], 0.02, C.cocoa)),
    ),
  );
}

const tuba = (q: Q): Geo =>
  merge(
    at(rotateZ(torus(0.16, 0.05, BRASS, s(q, 4, 3), s(q, 8, 5)), Math.PI / 2), 0.02, 0.15, 0.28),
    at(
      lathe2(
        q,
        [
          [0.05, 0],
          [0.09, 0.16],
          [0.2, 0.3],
          [0.18, 0.3],
          [0.07, 0.17],
          [0.03, 0.05],
        ],
        BRASS,
        7,
        3,
        [
          [0.05, 0],
          [0.2, 0.3],
          [0.03, 0.05],
        ],
      ),
      0.12,
      0.3,
      0.24,
    ),
  );

const sousaphone = (q: Q): Geo =>
  merge(
    at(scale(rotateZ(torus(0.3, 0.04, BRASS, 3, s(q, 12, 5)), 0.7), 1, 1, 0.75), 0, 0.25, 0.02),
    at(
      rotateX(
        lathe2(
          q,
          [
            [0.04, 0],
            [0.08, 0.2],
            [0.3, 0.4],
            [0.28, 0.41],
            [0.07, 0.22],
            [0.02, 0.03],
          ],
          BRASS,
          6,
          3,
          [
            [0.04, 0],
            [0.3, 0.4],
            [0.02, 0.03],
          ],
        ),
        Math.PI / 2,
      ),
      0.12,
      0.95,
      -0.15,
    ),
  );

const doubleBass = (q: Q): Geo =>
  merge(
    T(at(blob(0.24, 0.3, 0.1, C.timber, s(q, 6, 5), s(q, 4, 2)), 0, -0.45, 0.36)),
    T(at(blob(0.19, 0.22, 0.1, C.timber, s(q, 6, 5), s(q, 4, 2)), 0, -0.05, 0.36)),
    at(box(0.06, 0.62, 0.04, C.timberDeep), 0, 0.15, 0.33),
    ...fine(
      q,
      at(box(0.04, 0.7, 0.012, C.ink), 0, -0.05, 0.37),
      at(sphere(0.035, C.timberDeep, 4, 2), 0, 0.8, 0.33),
      beam([0, -0.75, 0.36], [0, -0.88, 0.36], 0.016, C.slate),
    ),
  );

export const MUSIC_CARRIES: readonly RigOption[] = [
  carry('carry.guitar', playedGuitar),
  carry('carry.accordion', accordion),
  carry('carry.snare', snareDrum),
  carry('carry.bassdrum', bassDrum),
  carry('carry.tuba', tuba),
  carry('carry.sousaphone', sousaphone, { reach: 0.5 }),
  carry('carry.doublebass', doubleBass, { reach: 0.2 }),
];
