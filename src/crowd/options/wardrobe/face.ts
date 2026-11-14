/**
 * Face accessories (Cat.Face, Slot.Vertex) and beards (Cat.Beard, Slot.Hair), all on the Head part.
 * The face front sits at z ≈ 0.126; eyes at y = HY + 0.012, x = ±0.049 (+x is the person's left).
 */
import { C } from '../../../core/palette';
import { type Geo, blob, box, cone, cyl, merge, rotateX, rotateY, rotateZ, scale, sphere, torus } from '../../../core/geo';
import { Cat, Part, Slot } from '../../skeleton';
import type { RigOption } from '../../rig';
import { type Build, HR, HY, type Meta, type Q, T, at, fine, path, s, single } from './kit';

const EYE_Y = HY + 0.012;
const FACE_Z = HR * 0.97;

const face = (key: string, build: Build, meta: Meta = {}): RigOption =>
  single(key, Cat.Face, Part.Head, Slot.Vertex, build, meta);
const beard = (key: string, build: Build, meta: Meta = {}): RigOption =>
  single(key, Cat.Beard, Part.Head, Slot.Hair, build, meta);

/** Square frame facing forward. */
const squareRim = (sx: number): Geo =>
  at(scale(rotateZ(rotateX(torus(0.036, 0.0065, C.ink, 4, 4), Math.PI / 2), Math.PI / 4), 1.15, 0.85, 1), sx * 0.05, EYE_Y, FACE_Z);

const temples = (): Geo[] =>
  [-1, 1].map((sx) => at(box(0.006, 0.008, 0.13, C.ink), sx * 0.09, EYE_Y, FACE_Z - 0.07));

const squareGlasses = (): Geo =>
  merge(squareRim(-1), squareRim(1), at(box(0.026, 0.008, 0.008, C.ink), 0, EYE_Y + 0.008, FACE_Z), temples());

const monocle = (): Geo =>
  merge(
    at(rotateX(torus(0.03, 0.005, C.butterDeep, 3, 10), Math.PI / 2), -0.049, EYE_Y, FACE_Z + 0.004),
    path(
      [
        [-0.07, EYE_Y - 0.02, FACE_Z],
        [-0.1, EYE_Y - 0.1, FACE_Z - 0.03],
        [-0.11, EYE_Y - 0.17, FACE_Z - 0.06],
      ],
      0.004,
      C.butterDeep,
    ),
  );

const clownNose = (): Geo => at(sphere(0.032, C.coral, 6, 4), 0, HY - 0.012, FACE_Z + 0.012);

const eyePatch = (): Geo =>
  merge(
    at(blob(0.035, 0.03, 0.012, C.ink, 5, 3), 0.049, EYE_Y, FACE_Z + 0.004),
    at(rotateZ(torus(HR + 0.004, 0.004, C.ink, 3, 10), 0.3), 0, EYE_Y + 0.02, 0),
  );

const snorkel = (q: Q): Geo =>
  merge(
    T(at(box(0.17, 0.075, 0.03, C.butter), 0, EYE_Y - 0.03, FACE_Z - 0.003)),
    path(
      [
        [-0.05, HY - 0.07, FACE_Z],
        [-0.135, HY - 0.04, 0.06],
        [-0.14, HY + 0.22, 0.03],
      ],
      0.02,
      C.coral,
    ),
    ...fine(
      q,
      at(box(0.15, 0.06, 0.012, C.blueLight), 0, EYE_Y - 0.023, FACE_Z + 0.015),
      at(rotateX(torus(HR + 0.006, 0.006, C.ink, 3, 10), -0.25), 0, EYE_Y + 0.0, -0.01),
    ),
  );

const halfMask = (q: Q): Geo =>
  merge(
    T(at(box(0.08, 0.05, 0.016, C.coral), 0, EYE_Y, FACE_Z + 0.004)),
    [-1, 1].map((sx) => T(at(rotateY(box(0.07, 0.055, 0.016, C.coral), sx * 0.6), sx * 0.07, EYE_Y + 0.004, FACE_Z - 0.02))),
    ...fine(q, at(rotateZ(blob(0.018, 0.08, 0.008, C.butter, 4, 3), -0.5), 0.12, EYE_Y + 0.08, FACE_Z - 0.03)),
  );

function goggles(q: Q): Geo {
  const cup = (sx: number): Geo =>
    T(at(rotateX(cyl(0.032, 0.03, 0.03, C.butterDeep, s(q, 6, 5)), Math.PI / 2), sx * 0.046, EYE_Y, FACE_Z - 0.012));
  const lens = (sx: number): Geo =>
    at(rotateX(cyl(0.026, 0.026, 0.01, C.blueLight, 6), Math.PI / 2), sx * 0.046, EYE_Y, FACE_Z + 0.016);
  return merge(
    cup(-1),
    cup(1),
    ...fine(
      q,
      lens(-1),
      lens(1),
      at(box(0.03, 0.01, 0.01, C.ink), 0, EYE_Y, FACE_Z + 0.004),
      ...[-1, 1].map((sx) => at(rotateY(box(0.008, 0.016, 0.12, C.ink), sx * 0.25), sx * 0.1, EYE_Y, FACE_Z - 0.07)),
    ),
  );
}

/* ------------------------------------------------------------------ beards */

const tache = (q: Q, w = 0.055): Geo =>
  at(blob(w, 0.018, 0.024, C.cocoa, s(q, 6, 4), s(q, 3, 2)), 0, HY - 0.045, FACE_Z - 0.006);

const fullBeard = (q: Q): Geo =>
  merge(at(blob(0.115, 0.085, 0.085, C.cocoa, s(q, 8, 6), s(q, 5, 3)), 0, HY - 0.075, 0.045), tache(q));

const goatee = (q: Q): Geo => merge(at(blob(0.03, 0.04, 0.028, C.cocoa, 6, 3), 0, HY - 0.118, 0.098), tache(q, 0.045));

const handlebar = (q: Q): Geo =>
  merge(
    tache(q, 0.06),
    [-1, 1].map((sx) => at(rotateZ(blob(0.012, 0.03, 0.012, C.cocoa, 5, 3), sx * 0.5), sx * 0.068, HY - 0.025, FACE_Z - 0.012)),
  );

const wizard = (q: Q): Geo =>
  merge(
    at(blob(0.112, 0.08, 0.08, C.cocoa, s(q, 8, 5), s(q, 4, 3)), 0, HY - 0.08, 0.045),
    at(rotateX(cone(0.09, 0.3, C.cocoa, s(q, 6, 4)), Math.PI - 0.2), 0, HY - 0.1, 0.075),
    ...fine(q, tache(q, 0.06)),
  );

const sideburns = (): Geo =>
  merge([-1, 1].map((sx) => at(blob(0.012, 0.045, 0.03, C.cocoa, 5, 3), sx * 0.124, HY - 0.02, 0.03)));

const boxed = (q: Q): Geo =>
  merge(at(blob(0.11, 0.06, 0.078, C.cocoa, s(q, 8, 5), s(q, 4, 2)), 0, HY - 0.09, 0.048), tache(q));

export const FACE_OPTIONS: readonly RigOption[] = [
  face('face.glasses.square', squareGlasses, { nearOnly: true }),
  face('face.monocle', monocle, { nearOnly: true }),
  face('face.clownnose', clownNose, { nearOnly: true }),
  face('face.eyepatch', eyePatch, { nearOnly: true }),
  face('face.snorkel', snorkel),
  face('face.mask.half', halfMask),
  face('face.goggles', goggles),
  beard('beard.full', fullBeard),
  beard('beard.goatee', goatee, { nearOnly: true }),
  beard('beard.handlebar', handlebar, { nearOnly: true }),
  beard('beard.wizard', wizard),
  beard('beard.sideburns', sideburns, { nearOnly: true }),
  beard('beard.boxed', boxed),
];
