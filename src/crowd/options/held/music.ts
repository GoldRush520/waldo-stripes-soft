/**
 * Hand-held instruments and sound makers. Brass points its bell toward +z; sticks point up (+y).
 */
import { C } from '../../../core/palette';
import { type Geo, beam, blob, box, cone, cyl, merge, rotateX, rotateZ, scale, sphere } from '../../../core/geo';
import { type Q, T, at, fine, lathe2, s } from '../wardrobe/kit';
import { type HeldDef, forward, held, pole } from './grip';

const BRASS = C.butterDeep;

const megaphone = (q: Q): Geo =>
  merge(
    T(
      at(
        forward(
          lathe2(
            q,
            [
              [0.035, 0],
              [0.12, 0.3],
              [0.11, 0.3],
              [0.03, 0.02],
            ],
            C.coral,
            8,
            5,
            [
              [0.035, 0],
              [0.12, 0.3],
              [0.03, 0.02],
            ],
          ),
        ),
        0,
        0.08,
        -0.08,
      ),
    ),
    at(box(0.025, 0.1, 0.035, C.ink), 0, -0.04, 0.0),
    ...fine(q, at(forward(cyl(0.122, 0.122, 0.02, C.ivory, 8, false)), 0, 0.08, 0.2)),
  );

const microphone = (): Geo =>
  merge(
    at(cyl(0.012, 0.017, 0.16, C.ink, 6), 0, -0.06, 0),
    at(sphere(0.03, C.slate, 6, 4), 0, 0.13, 0),
  );

const baton = (): Geo => merge(beam([0, -0.04, 0], [0, 0.38, 0], 0.006, C.white), at(sphere(0.014, C.timber, 5, 3), 0, -0.04, 0));

const drumstick = (): Geo => merge(at(cyl(0.01, 0.007, 0.4, C.timber, 5), 0, -0.05, 0), at(sphere(0.011, C.timber, 4, 2), 0, 0.355, 0));

function trumpet(q: Q): Geo {
  const bell = lathe2(
    q,
    [
      [0.015, 0],
      [0.03, 0.08],
      [0.07, 0.15],
      [0.06, 0.15],
      [0.02, 0.07],
      [0.008, 0.0],
    ],
    BRASS,
    7,
    5,
    [
      [0.015, 0],
      [0.07, 0.15],
      [0.008, 0.0],
    ],
  );
  return merge(
    beam([0, 0.07, -0.16], [0, 0.07, 0.18], 0.024, BRASS),
    at(forward(bell), 0, 0.07, 0.18),
    ...fine(
      q,
      beam([0, 0.02, -0.08], [0, 0.02, 0.1], 0.02, BRASS),
      beam([0, 0.02, 0.1], [0, 0.07, 0.12], 0.02, BRASS),
      at(box(0.03, 0.07, 0.07, BRASS), 0, 0.02, 0.0),
      at(rotateX(cone(0.012, 0.03, BRASS, 4), -Math.PI / 2), 0, 0.07, -0.16),
    ),
  );
}

function trombone(q: Q): Geo {
  const bell = lathe2(
    q,
    [
      [0.015, 0],
      [0.04, 0.12],
      [0.1, 0.2],
      [0.09, 0.2],
      [0.03, 0.1],
      [0.008, 0.0],
    ],
    BRASS,
    6,
    5,
    [
      [0.015, 0],
      [0.1, 0.2],
      [0.008, 0.0],
    ],
  );
  const slide =
    q === 'near'
      ? [beam([0, 0.0, 0.0], [0, 0.0, -0.6], 0.016, BRASS), beam([0, 0.05, 0.0], [0, 0.05, -0.6], 0.016, BRASS), beam([0, -0.01, 0.0], [0, 0.06, 0.0], 0.02, BRASS)]
      : [at(box(0.02, 0.07, 0.6, BRASS), 0, -0.01, -0.3)];
  return merge(
    slide,
    beam([0, 0.14, -0.72], [0, 0.14, 0.0], 0.02, BRASS),
    at(forward(bell), 0, 0.14, 0.0),
    ...fine(q, beam([0, 0.05, -0.72], [0, 0.14, -0.72], 0.02, BRASS)),
  );
}

const flute = (q: Q): Geo =>
  merge(
    pole(q, -0.42, 0.2, 0.011, C.ivoryDeep),
    ...fine(q, ...[-0.3, -0.18, -0.06].map((y) => at(box(0.016, 0.02, 0.024, C.slate), 0, y, 0.008))),
  );

/** Violin for the LEFT hand: the hand holds the neck; the body lies toward the elbow (+y), top face +z. */
const violin = (q: Q): Geo =>
  merge(
    T(at(blob(0.1, 0.09, 0.03, C.timber, s(q, 6, 5), s(q, 3, 2)), 0, 0.42, 0)),
    T(at(blob(0.08, 0.07, 0.03, C.timber, s(q, 6, 5), s(q, 3, 2)), 0, 0.28, 0)),
    at(box(0.025, 0.25, 0.022, C.timberDeep), 0, -0.05, 0),
    ...fine(
      q,
      at(sphere(0.018, C.timberDeep, 4, 2), 0, -0.07, 0),
      at(box(0.022, 0.22, 0.006, C.ink), 0, 0.12, 0.024),
      at(box(0.05, 0.04, 0.02, C.ink), 0.02, 0.5, 0.02),
      at(box(0.03, 0.07, 0.008, C.ink), 0, 0.38, 0.03),
    ),
  );

/** Bow for the RIGHT hand: the stick runs along +x (across the body when the arm is raised forward). */
const violinBow = (): Geo =>
  merge(
    beam([-0.04, 0, 0.02], [0.7, 0, 0.02], 0.008, C.timberDeep),
    beam([0.0, -0.018, 0.02], [0.68, -0.008, 0.02], 0.006, C.ivory),
    at(box(0.04, 0.03, 0.02, C.ink), 0.0, -0.025, 0.02),
  );

const saxophone = (q: Q): Geo =>
  merge(
    at(cyl(0.045, 0.025, 0.42, BRASS, s(q, 7, 4)), 0, -0.2, 0),
    at(
      lathe2(
        q,
        [
          [0.04, 0],
          [0.06, 0.08],
          [0.055, 0.08],
          [0.03, 0.01],
        ],
        BRASS,
        7,
        4,
        [
          [0.04, 0],
          [0.06, 0.08],
          [0.03, 0.01],
        ],
      ),
      0,
      -0.12,
      0.1,
    ),
    beam([0, -0.2, 0], [0, -0.14, 0.1], 0.05, BRASS),
    ...fine(
      q,
      beam([0, 0.22, 0], [0, 0.29, 0.05], 0.02, BRASS),
      ...[-0.05, 0.08].map((y) => at(sphere(0.014, C.ivory, 4, 2), 0, y, 0.035)),
    ),
  );

const maracas = (q: Q): Geo =>
  merge(
    pole(q, -0.08, 0.1, 0.01, C.timber),
    T(at(sphere(0.05, C.coral, s(q, 6, 5), s(q, 4, 2)), 0, 0.14, 0)),
    ...fine(q, at(cyl(0.051, 0.051, 0.012, C.ivory, 6, false), 0, 0.12, 0)),
  );

/** Tambourine gripped by the rim; the frame's face is ±x (sideways). */
const tambourine = (q: Q): Geo =>
  at(
    rotateZ(
      merge(
        T(
          lathe2(
            q,
            [
              [0.1, -0.025],
              [0.11, -0.025],
              [0.11, 0.025],
              [0.1, 0.025],
              [0.1, -0.025],
            ],
            C.coral,
            8,
            6,
            [
              [0.1, -0.025],
              [0.11, 0.0],
              [0.1, 0.025],
            ],
          ),
        ),
        at(cyl(0.1, 0.1, 0.006, C.ivory, s(q, 8, 5)), 0, 0.012, 0),
        ...fine(q, ...[0.6, 2.2, 3.8].map((a) => at(box(0.03, 0.02, 0.03, BRASS), Math.sin(a) * 0.105, -0.01, Math.cos(a) * 0.105))),
      ),
      Math.PI / 2,
    ),
    0,
    -0.11,
    0,
  );

/** Cymbal disc beside the fist on the inner side, face toward +x (the left hand mirrors to -x). */
const cymbal = (q: Q): Geo =>
  merge(
    at(
      rotateZ(
        lathe2(
          q,
          [
            [0.001, 0.0],
            [0.18, -0.015],
            [0.18, -0.005],
            [0.03, 0.03],
            [0.001, 0.03],
          ],
          BRASS,
          10,
          6,
          [
            [0.001, 0.0],
            [0.18, -0.012],
            [0.001, 0.03],
          ],
        ),
        -Math.PI / 2,
      ),
      0.03,
      0,
      0,
    ),
    ...fine(q, at(box(0.02, 0.05, 0.03, C.cocoa), 0.0, 0, 0)),
  );

/** Hand bell hanging mouth-down below the handle. */
const handBell = (k: number) => (q: Q): Geo =>
  scale(
    merge(
      pole(q, -0.06, 0.08, 0.014, C.timber),
      lathe2(
        q,
        [
          [0.001, -0.1],
          [0.03, -0.12],
          [0.05, -0.2],
          [0.06, -0.2],
          [0.045, -0.14],
          [0.03, -0.07],
          [0.001, -0.06],
        ],
        BRASS,
        7,
        5,
        [
          [0.001, -0.2],
          [0.06, -0.2],
          [0.03, -0.07],
          [0.001, -0.06],
        ],
      ),
      ...fine(q, at(sphere(0.015, C.slate, 4, 2), 0, -0.19, 0)),
    ),
    k,
  );

export const MUSIC_PROPS: readonly HeldDef[] = [
  held('megaphone', megaphone),
  held('microphone', microphone, 'R', { nearOnly: true }),
  held('baton', baton, 'R', { nearOnly: true }),
  held('drumstick', drumstick, 'RL', { nearOnly: true }),
  held('trumpet', trumpet),
  held('trombone', trombone),
  held('flute', flute),
  held('violin', violin, 'L'),
  held('violin.bow', violinBow, 'R', { nearOnly: true }),
  held('saxophone', saxophone),
  held('maracas', maracas, 'RL'),
  held('tambourine', tambourine),
  held('cymbal', cymbal, 'RL'),
  held('bell.hand', handBell(1)),
  held('bell.crier', handBell(1.5)),
];
