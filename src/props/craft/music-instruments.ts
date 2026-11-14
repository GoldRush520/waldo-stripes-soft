/** Music square: instruments on stands, played in place (people are animated separately). */
import {
  type Geo,
  blob,
  box,
  cone,
  cyl,
  detail,
  farOnly,
  lathe,
  merge,
  prism,
  rotateX,
  rotateZ,
  sphere,
  tintable,
  torus,
  translate,
} from '../../core/geo';
import type { PropDef } from '../registry';
import { PI, at, legs, lodPair, lyingX, lyingZ, prop, rod } from './kit';

/** Upright drum: tint-masked shell with an ivory rim/head on top. */
function drum(r: number, h: number, seg: number): Geo {
  return merge(
    tintable(cyl(r, r, h, 'coral', seg)),
    translate(cyl(r + 0.008, r + 0.008, 0.035, 'ivory', seg), 0, h - 0.025, 0),
  );
}

function drumKit(): Geo {
  const bass = translate(rotateX(drum(0.27, 0.36, 12), PI / 2), 0, 0.28, -0.18);
  const bassFar = tintable(translate(lyingZ(0.28, 0.38, 'coral', 6), 0, 0.28, 0));
  const tom = (x: number): Geo => at(rotateX(drum(0.13, 0.15, 8), 0.3), x, 0.62, -0.05);
  const snare = at(drum(0.17, 0.12, 10), -0.42, 0.5, 0.25);
  const floorTom = at(drum(0.2, 0.3, 10), 0.48, 0.18, 0.22);
  const cymbal = (x: number, y: number, z: number, r: number): Geo =>
    at(cone(r, 0.04, 'butter', 10), x, y, z);
  const near = merge(
    bass,
    tom(-0.15),
    tom(0.15),
    snare,
    floorTom,
    rod([-0.42, 0, 0.25], [-0.42, 0.5, 0.25], 0.025, 'cocoa'),
    rod([0, 0.5, 0], [0, 0.66, -0.05], 0.03, 'cocoa'),
    rod([0.48, 0, 0.22], [0.48, 0.18, 0.22], 0.025, 'cocoa'),
    rod([-0.72, 0, 0.05], [-0.72, 0.92, 0.05], 0.025, 'cocoa'),
    cymbal(-0.72, 0.88, 0.05, 0.18),
    cymbal(-0.72, 0.92, 0.05, 0.18),
    rod([0.68, 0, -0.25], [0.68, 1.22, -0.25], 0.025, 'cocoa'),
    cymbal(0.68, 1.2, -0.25, 0.22),
    at(cyl(0.17, 0.17, 0.05, 'cocoa', 8), 0, 0.48, 0.55),
    rod([0, 0, 0.55], [0, 0.48, 0.55], 0.04, 'cocoa'),
  );
  const far = merge(
    bassFar,
    tintable(at(cyl(0.2, 0.2, 0.32, 'coral', 6), 0.48, 0.16, 0.22)),
    tintable(at(cyl(0.3, 0.3, 0.14, 'coral', 6), 0, 0.6, -0.05)),
    at(box(0.4, 0.03, 0.04, 'butter'), -0.72, 0.9, 0.05),
  );
  return lodPair(near, far);
}

function pianoStool(z: number): Geo {
  return merge(at(box(0.55, 0.08, 0.35, 'clayDeep'), 0, 0.4, z), at(legs(0.48, 0.3, 0.4, 0.04, 'timberDeep'), 0, 0, z));
}

function pianoUpright(): Geo {
  const body = tintable(box(1.48, 1.22, 0.58, 'sage'));
  const top = at(box(1.54, 0.05, 0.64, 'ivory'), 0, 1.22, 0);
  const shelf = tintable(at(box(1.4, 0.1, 0.28, 'sage'), 0, 0.66, 0.42));
  const keys = detail(at(box(1.3, 0.03, 0.16, 'ivory'), 0, 0.76, 0.46));
  const blackKeys: Geo[] = [];
  for (let i = 0; i < 9; i++) blackKeys.push(at(box(0.04, 0.03, 0.09, 'ink'), -0.56 + i * 0.14, 0.78, 0.43));
  const pedals = detail(merge(at(box(0.05, 0.03, 0.1, 'butter'), -0.08, 0.04, 0.33), at(box(0.05, 0.03, 0.1, 'butter'), 0.08, 0.04, 0.33)));
  const toes = detail(merge(at(box(0.08, 0.66, 0.08, 'sageDeep'), -0.66, 0, 0.42), at(box(0.08, 0.66, 0.08, 'sageDeep'), 0.66, 0, 0.42)));
  const candles = detail(merge(at(cyl(0.04, 0.04, 0.03, 'butter', 6), -0.5, 1.27, 0.1), at(cyl(0.015, 0.015, 0.16, 'ivory', 5), -0.5, 1.3, 0.1)));
  const music = detail(at(rotateX(box(0.5, 0.32, 0.015, 'ivory'), -0.2), 0, 0.9, 0.31));
  return merge(body, top, shelf, keys, detail(merge(blackKeys)), pedals, toes, candles, music, pianoStool(0.72));
}

function grandPiano(): Geo {
  const plan: ReadonlyArray<readonly [number, number]> = [
    [-0.75, 0.75], [0.75, 0.75], [0.75, 0.1], [0.55, -0.45], [0.3, -0.85], [0, -1.05], [-0.75, -1.1],
  ];
  const body = tintable(at(prism(plan, 0.32, 'blue'), 0, 0.66, 0));
  const lidFlat = prism(plan, 0.03, 'blueDeep');
  const lid = tintable(translate(rotateZ(translate(lidFlat, 0.75, 0, 0), 0.62), -0.75, 0.98, 0));
  const legAt = (g: Geo): Geo => merge(at(g, -0.6, 0, 0.55), at(g, 0.6, 0, 0.55), at(g, -0.55, 0, -0.9));
  const legsG = tintable(lodPair(legAt(cyl(0.05, 0.07, 0.66, 'blueDeep', 8)), legAt(box(0.12, 0.66, 0.12, 'blueDeep'))));
  const bench = merge(at(box(0.8, 0.07, 0.36, 'clayDeep'), 0, 0.42, 1.35), at(legs(0.74, 0.3, 0.42, 0.05, 'timberDeep'), 0, 0, 1.35));
  const keybed = at(box(1.4, 0.1, 0.24, 'blueDeep'), 0, 0.82, 0.86);
  const keys = detail(at(box(1.3, 0.03, 0.16, 'ivory'), 0, 0.92, 0.88));
  const blacks: Geo[] = [];
  for (let i = 0; i < 9; i++) blacks.push(at(box(0.04, 0.03, 0.09, 'ink'), -0.56 + i * 0.14, 0.94, 0.85));
  const stick = rod([0.6, 0.98, -0.1], [0.3, 1.62, -0.1], 0.025, 'ivory');
  const strings = detail(at(box(1.1, 0.02, 1.2, 'butter'), -0.05, 0.96, -0.1));
  const lyre = detail(merge(at(box(0.2, 0.5, 0.06, 'blueDeep'), 0, 0.12, 0.7), at(box(0.24, 0.03, 0.14, 'butter'), 0, 0.03, 0.74)));
  return merge(body, lid, legsG, tintable(keybed), keys, detail(merge(blacks)), stick, strings, lyre, bench);
}

/** Violin-family body (double bass / cello), standing on its endpin, front +z. */
function stringBody(s: number): Geo {
  const lower = blob(0.31 * s, 0.36 * s, 0.11 * s, 'butterDeep', 8, 6);
  const upper = blob(0.24 * s, 0.26 * s, 0.1 * s, 'butterDeep', 8, 6);
  const near = merge(
    tintable(translate(lower, 0, 0.5 * s, 0)),
    tintable(translate(upper, 0, 0.98 * s, 0)),
    at(box(0.06 * s, 0.75 * s, 0.05 * s, 'cocoa'), 0, 1.15 * s, 0.03 * s),
    translate(sphere(0.06 * s, 'cocoa', 6, 4), 0, 1.92 * s, 0.03 * s),
    at(box(0.04 * s, 0.9 * s, 0.03 * s, 'ivory'), 0, 0.45 * s, 0.12 * s),
    at(box(0.12 * s, 0.05 * s, 0.04 * s, 'cocoa'), 0, 0.32 * s, 0.11 * s),
    at(cyl(0.012, 0.012, 0.16 * s, 'slate', 5), 0, 0, 0),
  );
  const far = merge(
    tintable(at(box(0.6 * s, 1.1 * s, 0.2 * s, 'butterDeep'), 0, 0.15 * s, 0)),
    at(box(0.07 * s, 0.75 * s, 0.06 * s, 'cocoa'), 0, 1.2 * s, 0),
  );
  return lodPair(near, far);
}

function doubleBass(): Geo {
  const inst = translate(rotateX(stringBody(1), -0.12), 0, 0.02, 0.05);
  const stand = detail(
    merge(
      at(box(0.6, 0.04, 0.5, 'cocoa'), 0, 0, -0.05),
      rod([0, 0.04, -0.25], [0, 1.0, -0.2], 0.04, 'cocoa'),
      rod([-0.2, 1.0, -0.18], [0.2, 1.0, -0.18], 0.035, 'cocoa'),
    ),
  );
  return merge(inst, stand);
}

function tuba(): Geo {
  const bell = lathe([[0.05, 0], [0.07, 0.3], [0.12, 0.5], [0.22, 0.62], [0.25, 0.64]], 'butter', 10);
  const near = merge(
    at(bell, 0, 0.42, 0),
    translate(rotateX(torus(0.2, 0.06, 'butter', 5, 12), PI / 2), 0, 0.62, 0.05),
    at(cyl(0.012, 0.012, 0.2, 'butterDeep', 5), 0.18, 0.62, 0.12),
    at(box(0.08, 0.04, 0.04, 'butterDeep'), 0.18, 0.8, 0.12),
  );
  const far = merge(at(cone(0.24, 0.62, 'butter', 6), 0, 0.44, 0), at(box(0.46, 0.4, 0.12, 'butter'), 0, 0.42, 0.05));
  const stand = merge(
    rod([0, 0, 0], [0, 0.44, 0], 0.035, 'cocoa'),
    rod([0, 0.02, 0], [0.26, 0.0, 0.15], 0.03, 'cocoa'),
    rod([0, 0.02, 0], [-0.26, 0.0, 0.15], 0.03, 'cocoa'),
    rod([0, 0.02, 0], [0, 0.0, -0.3], 0.03, 'cocoa'),
  );
  return merge(lodPair(near, far), stand);
}

function harp(): Geo {
  const base = at(box(0.36, 0.1, 0.42, 'butterDeep'), 0, 0, 0);
  const pillar = tintable(at(cyl(0.05, 0.05, 1.62, 'butter', 8), -0.18, 0.08, 0.12));
  const neck = detail(
    merge(
      rod([-0.18, 1.7, 0.12], [0.05, 1.62, 0.1], 0.08, 'butterDeep'),
      rod([0.05, 1.62, 0.1], [0.32, 1.28, 0.08], 0.08, 'butterDeep'),
    ),
  );
  const neckFar = farOnly(at(box(0.5, 0.12, 0.08, 'butterDeep'), 0.08, 1.5, 0.1));
  const board = tintable(rod([0.2, 0.1, 0.0], [0.32, 1.28, 0.08], 0.12, 'butter'));
  const strings: Geo[] = [];
  for (let i = 0; i < 9; i++) {
    const t = (i + 1) / 10;
    const bx = 0.2 + 0.12 * t;
    const by = 0.1 + 1.18 * t;
    strings.push(rod([bx - 0.02, by, 0.04], [-0.16 + 0.48 * t, 1.66 - 0.36 * t, 0.1], 0.008, 'ivory'));
  }
  const crown = detail(translate(sphere(0.07, 'butter', 6, 4), -0.18, 1.74, 0.12));
  const boardFar = farOnly(tintable(at(box(0.12, 1.2, 0.12, 'butter'), 0.26, 0.1, 0.04)));
  return merge(base, pillar, neck, neckFar, board, boardFar, merge(strings), crown);
}

function celloWithChair(): Geo {
  const seat = at(box(0.46, 0.05, 0.44, 'clay'), 0, 0.42, 0);
  const back = at(box(0.46, 0.5, 0.05, 'clay'), 0, 0.47, -0.2);
  const chair = merge(seat, back, legs(0.42, 0.4, 0.42, 0.04, 'timberDeep'));
  const cello = translate(rotateZ(rotateX(stringBody(0.62), -0.08), 0.18), 0.32, 0.0, 0.32);
  return merge(chair, cello);
}

const BAR_COLS = ['coral', 'butter', 'sage', 'blue', 'clay', 'coralLight', 'butterLight', 'sageLight', 'blueLight', 'clayLight'] as const;

function xylophone(): Geo {
  const bars: Geo[] = [];
  BAR_COLS.forEach((c, i) => {
    const len = 0.42 - i * 0.025;
    bars.push(at(box(0.07, 0.03, len, c), -0.36 + i * 0.08, 0.78, 0));
  });
  const frame = merge(
    at(box(0.86, 0.06, 0.06, 'timberDeep'), 0, 0.72, 0.17),
    at(box(0.86, 0.06, 0.06, 'timberDeep'), 0, 0.72, -0.17),
  );
  const standLegs = merge(
    rod([-0.38, 0, 0.2], [-0.38, 0.72, 0.15], 0.04, 'cocoa'),
    rod([-0.38, 0, -0.2], [-0.38, 0.72, -0.15], 0.04, 'cocoa'),
    rod([0.38, 0, 0.2], [0.38, 0.72, 0.15], 0.04, 'cocoa'),
    rod([0.38, 0, -0.2], [0.38, 0.72, -0.15], 0.04, 'cocoa'),
  );
  const mallets = detail(
    merge(
      rod([0.1, 0.82, 0.24], [0.4, 0.82, 0.34], 0.012, 'timber'),
      translate(sphere(0.025, 'coral', 6, 4), 0.1, 0.83, 0.24),
    ),
  );
  const far = farOnly(merge(tintable(at(box(0.84, 0.03, 0.4, 'butter'), 0, 0.78, 0)), at(box(0.8, 0.72, 0.3, 'timberDeep'), 0, 0, 0)));
  return merge(detail(merge(bars, frame)), standLegs, mallets, far);
}

function bassDrumStand(): Geo {
  const body = translate(rotateX(drum(0.45, 0.34, 14), PI / 2), 0, 0.72, -0.17);
  const bodyFar = tintable(translate(lyingZ(0.46, 0.36, 'coral', 8), 0, 0.72, 0));
  const frame = merge(
    rod([-0.4, 0, 0.25], [-0.3, 0.75, 0], 0.04, 'cocoa'),
    rod([-0.4, 0, -0.25], [-0.3, 0.75, 0], 0.04, 'cocoa'),
    rod([0.4, 0, 0.25], [0.3, 0.75, 0], 0.04, 'cocoa'),
    rod([0.4, 0, -0.25], [0.3, 0.75, 0], 0.04, 'cocoa'),
    rod([-0.38, 1.12, 0], [0.38, 1.12, 0], 0.03, 'ivory'),
  );
  const beaters = detail(merge(rod([0.4, 0.3, 0.3], [0.55, 0.9, 0.3], 0.02, 'timber'), translate(sphere(0.05, 'ivory', 6, 4), 0.55, 0.92, 0.3)));
  return merge(lodPair(body, bodyFar), frame, beaters);
}

function streetOrgan(): Geo {
  const cab = merge(
    tintable(at(box(1.0, 0.9, 0.6, 'coral'), 0, 0.35, 0)),
    at(box(1.02, 0.08, 0.62, 'ivory'), 0, 0.6, 0),
    at(box(1.06, 0.08, 0.66, 'ivory'), 0, 1.25, 0),
    tintable(at(box(0.7, 0.28, 0.5, 'coral'), 0, 1.33, 0)),
  );
  const pipes: Geo[] = [];
  for (let i = 0; i < 7; i++) {
    const h = 0.3 + 0.2 * (1 - Math.abs(i - 3) / 3);
    pipes.push(at(cyl(0.035, 0.035, h, 'butter', 6), -0.3 + i * 0.1, 0.72, 0.31));
  }
  const wheel = lyingX(0.3, 0.06, 'cocoa', 10);
  const wheelPair = detail(merge(at(wheel, -0.55, 0.3, 0), at(wheel, 0.55, 0.3, 0)));
  const wheelFar = farOnly(merge(at(box(0.06, 0.6, 0.6, 'cocoa'), -0.55, 0, 0), at(box(0.06, 0.6, 0.6, 'cocoa'), 0.55, 0, 0)));
  const crank = detail(merge(rod([0.5, 0.9, 0.1], [0.64, 0.9, 0.1], 0.03, 'butter'), rod([0.64, 0.9, 0.1], [0.64, 1.05, 0.1], 0.03, 'cocoa')));
  const handles = detail(merge(rod([-0.5, 0.75, -0.3], [-0.5, 0.8, -0.65], 0.04, 'timber'), rod([0.5, 0.75, -0.3], [0.5, 0.8, -0.65], 0.04, 'timber')));
  const leg = detail(at(box(0.06, 0.35, 0.06, 'timberDeep'), 0, 0, -0.22));
  return merge(cab, detail(merge(pipes)), wheelPair, wheelFar, crank, handles, leg);
}

function gramophone(): Geo {
  const top = at(cyl(0.35, 0.35, 0.04, 'clay', 12), 0, 0.68, 0);
  const tableLegs = merge(
    rod([-0.2, 0, -0.2], [-0.2, 0.68, -0.2], 0.04, 'timberDeep'),
    rod([0.2, 0, -0.2], [0.2, 0.68, -0.2], 0.04, 'timberDeep'),
    rod([-0.2, 0, 0.2], [-0.2, 0.68, 0.2], 0.04, 'timberDeep'),
    rod([0.2, 0, 0.2], [0.2, 0.68, 0.2], 0.04, 'timberDeep'),
  );
  const base = at(box(0.32, 0.12, 0.32, 'butterDeep'), 0, 0.72, 0);
  const record = detail(at(cyl(0.13, 0.13, 0.012, 'ink', 10), 0, 0.84, 0));
  const hornShape = lathe([[0.015, 0], [0.03, 0.2], [0.07, 0.32], [0.18, 0.4], [0.2, 0.41]], 'butter', 10);
  const horn = detail(translate(rotateX(hornShape, 0.9), 0.08, 0.86, -0.06));
  const hornFar = farOnly(translate(rotateX(cone(0.18, 0.4, 'butter', 6), 0.9 + PI), 0.08, 1.2, 0.22));
  const crank = rod([0.16, 0.78, 0], [0.26, 0.78, 0], 0.015, 'cocoa');
  return merge(top, tableLegs, base, record, horn, hornFar, crank);
}

export const MUSIC_INSTRUMENTS: readonly PropDef[] = [
  prop('music.drumKit', [1.6, 1.3], { budget: 'stall', tint: 'coral', tags: ['music', 'instrument'] }, drumKit),
  prop('music.pianoUpright', [1.55, 1.3], {
    budget: 'stall',
    tint: 'sage',
    tags: ['music', 'instrument'],
    seats: [{ x: 0, y: 0.48, z: 0.72, heading: PI }],
  }, pianoUpright),
  prop('music.pianoGrand', [1.5, 2.6], {
    budget: 'stall',
    tint: 'blue',
    tags: ['music', 'instrument'],
    seats: [{ x: 0, y: 0.49, z: 1.35, heading: PI }],
  }, grandPiano),
  prop('music.doubleBass', [0.65, 0.6], { budget: 'furniture', tint: 'butterDeep', tags: ['music', 'instrument'] }, doubleBass),
  prop('music.tuba', [0.55, 0.45], { budget: 'furniture', tags: ['music', 'instrument'] }, tuba),
  prop('music.harp', [0.6, 0.45], { budget: 'furniture', tint: 'butter', tags: ['music', 'instrument'] }, harp),
  prop('music.celloChair', [0.75, 0.6], {
    budget: 'stall',
    tint: 'butterDeep',
    tags: ['music', 'instrument'],
    seats: [{ x: 0, y: 0.47, z: 0.02, heading: 0 }],
  }, celloWithChair),
  prop('music.xylophone', [0.9, 0.45], { budget: 'furniture', tint: 'butter', tags: ['music', 'instrument'] }, xylophone),
  prop('music.bassDrum', [0.9, 0.6], { budget: 'furniture', tint: 'blue', tags: ['music', 'instrument'] }, bassDrumStand),
  prop('music.streetOrgan', [1.2, 1.0], { budget: 'stall', tint: 'coral', tags: ['music', 'instrument', 'cart'] }, streetOrgan),
  prop('music.gramophone', [0.7, 0.7], { budget: 'furniture', tags: ['music'] }, gramophone),
];
