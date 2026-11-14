/** Rooftop life: chimneys, coops, deck chairs, tin bath, tomatoes, telescope and other roof clutter. */
import {
  type Geo,
  beam,
  blob,
  box,
  cone,
  cyl,
  detail,
  dome,
  farOnly,
  gable,
  lathe,
  merge,
  profile,
  pyramid,
  rotateX,
  rotateY,
  shadeY,
  sphere,
  tintable,
  translate,
} from '../../core/geo';
import { createRng } from '../../core/rng';
import type { PropDef } from '../registry';
import { PI, at, legs, lodPair, lyingZ, prop, rod, stretch, stripedBox } from './kit';

const POT_SHAPE: ReadonlyArray<readonly [number, number]> = [[0.1, 0], [0.12, 0.25], [0.09, 0.35], [0.11, 0.38]];

function chimneyPots(): Geo {
  const stack = merge(shadeY(box(1.0, 1.1, 0.5, 'clay'), 0.85, 1), at(box(1.08, 0.08, 0.58, 'ivory'), 0, 1.1, 0));
  const xs = [-0.3, 0, 0.3];
  const pots = detail(merge(xs.map((x) => at(lathe(POT_SHAPE, 'coralDeep', 8), x, 1.18, 0))));
  const potsFar = farOnly(merge(xs.map((x) => at(cyl(0.11, 0.1, 0.38, 'coralDeep', 4), x, 1.18, 0))));
  const courses = detail(merge([0.25, 0.5, 0.75, 1.0].map((y) => at(box(1.04, 0.025, 0.54, 'clayLight'), 0, y, 0))));
  return merge(stack, pots, potsFar, courses);
}

function roofLadder(): Geo {
  const len = 3.0;
  const rails = merge(at(box(0.05, 0.05, len, 'timber'), -0.2, 0, 0), at(box(0.05, 0.05, len, 'timber'), 0.2, 0, 0));
  const rungs = merge([0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => at(box(0.36, 0.035, 0.04, 'timberDeep'), 0, 0.05, -1.3 + i * 0.32)));
  const hooks = merge(rod([-0.2, 0.0, -len / 2], [-0.2, 0.22, -len / 2 - 0.12], 0.04, 'slate'), rod([0.2, 0.0, -len / 2], [0.2, 0.22, -len / 2 - 0.12], 0.04, 'slate'));
  return merge(detail(merge(rails, rungs, hooks)), farOnly(box(0.45, 0.05, len, 'timber')));
}

function pigeonCoop(): Geo {
  const body = merge(at(box(1.2, 0.75, 0.7, 'timber'), 0, 0.6, 0), tintable(at(rotateY(gable(0.86, 0.35, 1.32, 'coral'), PI / 2), 0, 1.35, 0)));
  const coopLegs = legs(1.1, 0.6, 0.6, 0.07, 'timberDeep');
  const legsFar = farOnly(at(box(1.0, 0.6, 0.5, 'timberDeep'), 0, 0, 0));
  const mesh = detail(merge([0, 1, 2, 3, 4, 5].map((i) => at(box(0.015, 0.6, 0.015, 'slate'), -0.45 + i * 0.18, 0.68, 0.36))));
  const board = at(box(1.0, 0.04, 0.24, 'timberDeep'), 0, 0.62, 0.45);
  const pigeon = (x: number, z: number, y: number, r: number): Geo =>
    at(merge(translate(blob(0.07, 0.06, 0.1, 'stone', 6, 4), 0, 0.06, 0), translate(sphere(0.04, 'stone', 6, 4), 0, 0.13, 0.07)), x, y, z, r);
  const birds = detail(merge(pigeon(-0.3, 0.45, 0.66, 0.2), pigeon(0.15, 0.48, 0.66, -0.4), pigeon(0.3, 0.0, 1.65, 1.2)));
  return merge(body, coopLegs, legsFar, mesh, board, birds);
}

function deckChair(x: number): Geo {
  const slingAt = (g: Geo): Geo => translate(rotateX(g, 0.75), x, 0.55, -0.05);
  const sling = lodPair(slingAt(stripedBox(0.5, 0.02, 0.95, 5)), slingAt(stripedBox(0.5, 0.02, 0.95, 3)));
  const frame = merge(
    rod([x - 0.27, 0.22, 0.35], [x - 0.27, 0.92, -0.4], 0.035, 'timber'),
    rod([x + 0.27, 0.22, 0.35], [x + 0.27, 0.92, -0.4], 0.035, 'timber'),
    rod([x - 0.27, 0, -0.45], [x - 0.27, 0.6, -0.15], 0.035, 'timber'),
    rod([x + 0.27, 0, -0.45], [x + 0.27, 0.6, -0.15], 0.035, 'timber'),
    rod([x - 0.27, 0, 0.45], [x - 0.27, 0.22, 0.35], 0.035, 'timber'),
    rod([x + 0.27, 0, 0.45], [x + 0.27, 0.22, 0.35], 0.035, 'timber'),
  );
  return merge(sling, frame);
}

function deckChairPair(): Geo {
  return merge(deckChair(-0.42), deckChair(0.42));
}

function tinBath(): Geo {
  const tub = lathe([[0.32, 0.06], [0.38, 0.2], [0.42, 0.42], [0.44, 0.46]], 'blueLight', 10);
  const shaped = (g: Geo): Geo => stretch(g, 1.6, 1, 1.0);
  const near = shaped(tub);
  const far = shaped(cyl(0.34, 0.43, 0.46, 'blueLight', 6));
  const bubble = (x: number, z: number, r: number): Geo => translate(sphere(r, 'ivory', 6, 4), x, 0.44, z);
  const bubbles = tintable(merge(bubble(-0.3, 0, 0.14), bubble(0, 0.05, 0.17), bubble(0.3, -0.05, 0.13), bubble(0.12, -0.15, 0.1), bubble(-0.1, 0.18, 0.1)));
  const bubblesFar = tintable(stretch(dome(0.3, 'ivory', 6, 2), 1.6, 1, 0.9, 0, 0.4, 0));
  const feet = detail(merge([[-0.45, -0.2], [0.45, -0.2], [-0.45, 0.2], [0.45, 0.2]].map(([fx, fz]) => at(box(0.06, 0.08, 0.06, 'slate'), fx ?? 0, 0, fz ?? 0))));
  return merge(lodPair(merge(near, bubbles), merge(far, bubblesFar)), feet);
}

function tomatoRow(): Geo {
  const trough = merge(box(2.0, 0.35, 0.4, 'clayDeep'), at(box(1.92, 0.03, 0.32, 'cocoa'), 0, 0.34, 0));
  const plants: Geo[] = [];
  const far: Geo[] = [];
  const rng = createRng('craft.tomatoRow');
  for (let i = 0; i < 4; i++) {
    const x = -0.72 + i * 0.48;
    plants.push(
      rod([x, 0.35, 0], [x, 1.25, 0], 0.025, 'timber'),
      translate(blob(0.17, 0.2, 0.14, 'sage', 6, 4), x, 0.62, 0.02),
      translate(blob(0.13, 0.17, 0.12, 'sageDeep', 6, 4), x, 0.95, -0.02),
    );
    for (let k = 0; k < 3; k++) plants.push(translate(sphere(0.04, 'coral', 5, 3), x + rng.range(-0.12, 0.12), rng.range(0.55, 1.0), 0.13));
    far.push(at(box(0.3, 0.75, 0.24, 'sage'), x, 0.35, 0));
  }
  return merge(trough, detail(merge(plants)), farOnly(merge(far)));
}

function washTable(): Geo {
  const top = at(box(1.0, 0.04, 0.55, 'clay'), 0, 0.8, 0);
  const basin = at(lathe([[0.16, 0], [0.2, 0.06], [0.24, 0.14]], 'ivory', 10), -0.2, 0.84, 0);
  const water = detail(at(cyl(0.21, 0.21, 0.01, 'blueLight', 10), -0.2, 0.92, 0));
  const plates = detail(merge([0, 1].map((i) => at(rotateX(cyl(0.1, 0.1, 0.015, i % 2 === 0 ? 'ivory' : 'blueLight', 8), PI / 2 - 0.2), 0.25 + i * 0.05, 0.94, 0))));
  const jug = detail(at(lathe([[0.06, 0], [0.08, 0.1], [0.05, 0.2], [0.06, 0.22]], 'butter', 8), 0.4, 0.84, -0.15));
  const towel = detail(tintable(at(box(0.3, 0.3, 0.02, 'coral'), 0.15, 0.5, 0.29)));
  return merge(top, legs(0.92, 0.48, 0.8, 0.05, 'timberDeep'), basin, water, plates, jug, towel, farOnly(at(box(0.9, 0.6, 0.04, 'timberDeep'), 0, 0.15, 0)));
}

function telescope(): Geo {
  const tube = merge(tintable(at(lyingZ(0.07, 0.9, 'butter', 10), 0, 0, 0)), at(lyingZ(0.085, 0.1, 'ivory', 10), 0, 0, -0.4));
  const tubeFar = tintable(lyingZ(0.075, 0.9, 'butter', 5));
  const aim = (g: Geo): Geo => translate(rotateX(g, -0.5), 0, 1.25, 0);
  const tripod = merge(
    rod([0, 1.2, 0], [0.38, 0, 0.2], 0.03, 'timberDeep'),
    rod([0, 1.2, 0], [-0.38, 0, 0.2], 0.03, 'timberDeep'),
    rod([0, 1.2, 0], [0, 0, -0.42], 0.03, 'timberDeep'),
  );
  const eyepiece = detail(at(cyl(0.025, 0.025, 0.12, 'cocoa', 6), 0, 1.03, 0.4));
  const tripodFar = farOnly(at(cone(0.3, 1.2, 'timberDeep', 3), 0, 0, 0));
  return merge(lodPair(aim(tube), aim(tubeFar)), tripod, eyepiece, tripodFar);
}

function stool(): Geo {
  return merge(
    at(cyl(0.17, 0.17, 0.05, 'clay', 8), 0, 0.45, 0),
    rod([0.12, 0, 0.07], [0.08, 0.45, 0.04], 0.03, 'timberDeep'),
    rod([-0.12, 0, 0.07], [-0.08, 0.45, 0.04], 0.03, 'timberDeep'),
    rod([0, 0, -0.14], [0, 0.45, -0.09], 0.03, 'timberDeep'),
  );
}

const STOOL_SPOTS: ReadonlyArray<readonly [number, number, number]> = [[-0.9, 0.2, 0.5], [-0.3, -0.1, 0.15], [0.3, -0.1, -0.15], [0.9, 0.2, -0.5]];

function stoolSet(): Geo {
  const one = stool();
  const near = merge(STOOL_SPOTS.map(([x, z]) => at(one, x, 0, z)));
  const far = merge(STOOL_SPOTS.map(([x, z]) => at(cyl(0.15, 0.17, 0.5, 'clay', 4), x, 0, z)));
  return merge(detail(near), farOnly(far));
}

function waterBarrel(): Geo {
  const body = tintable(lathe([[0.3, 0], [0.34, 0.4], [0.3, 0.8]], 'blue', 10));
  const lid = at(cyl(0.31, 0.31, 0.04, 'timber', 10), 0, 0.79, 0);
  const hoops = merge(at(cyl(0.325, 0.325, 0.04, 'slate', 10, false), 0, 0.15, 0), at(cyl(0.325, 0.325, 0.04, 'slate', 10, false), 0, 0.62, 0));
  const tap = at(rotateX(cyl(0.02, 0.02, 0.1, 'butter', 5), PI / 2), 0, 0.1, 0.3);
  const far = merge(tintable(cyl(0.32, 0.31, 0.8, 'blue', 5)), at(cyl(0.31, 0.31, 0.04, 'timber', 5), 0, 0.8, 0));
  return lodPair(merge(body, lid, hoops, tap), far);
}

function weathercock(): Geo {
  const plate = box(0.3, 0.04, 0.3, 'slate');
  const pole = lodPair(cyl(0.02, 0.025, 1.4, 'slate', 6), box(0.04, 1.4, 0.04, 'slate'));
  const arms = detail(merge(rod([-0.3, 1.0, 0], [0.3, 1.0, 0], 0.015, 'slate'), rod([0, 1.0, -0.3], [0, 1.0, 0.3], 0.015, 'slate')));
  const letters = detail(merge([[0.32, 0], [-0.32, 0], [0, 0.32], [0, -0.32]].map(([x, z]) => at(box(0.06, 0.08, 0.02, 'butter'), x ?? 0, 0.96, z ?? 0))));
  const roosterAt = (g: Geo): Geo => at(g, 0, 1.4, 0);
  const rooster = lodPair(
    roosterAt(profile([[-0.22, 0], [0.12, 0], [0.18, 0.1], [0.2, 0.22], [0.14, 0.26], [0.1, 0.18], [0.02, 0.1], [-0.12, 0.14], [-0.24, 0.3], [-0.26, 0.12]], 0.02, 'butter')),
    roosterAt(profile([[-0.24, 0], [0.16, 0], [0.18, 0.24], [-0.24, 0.28]], 0.02, 'butter')),
  );
  const arrow = merge(at(box(0.6, 0.02, 0.02, 'butter'), 0, 1.36, 0), detail(at(cone(0.05, 0.1, 'butter', 4), 0.33, 1.32, 0)));
  return merge(plate, pole, arms, letters, rooster, arrow);
}

function picnicTable(): Geo {
  const slats = (n: number, w: number, y: number, z: number): Geo =>
    merge(Array.from({ length: n }, (_, i) => at(box(1.8, 0.05, w / n - 0.01, 'timber'), 0, y, z - w / 2 + (w / n) * (i + 0.5))));
  const boards = lodPair(
    merge(slats(4, 0.75, 0.72, 0), slats(2, 0.28, 0.42, -0.6), slats(2, 0.28, 0.42, 0.6)),
    merge(at(box(1.8, 0.05, 0.75, 'timber'), 0, 0.72, 0), at(box(1.8, 0.05, 0.28, 'timber'), 0, 0.42, -0.6), at(box(1.8, 0.05, 0.28, 'timber'), 0, 0.42, 0.6)),
  );
  const frame = (x: number): Geo => merge(
    rod([x, 0, -0.65], [x, 0.72, -0.2], 0.06, 'timberDeep'),
    rod([x, 0, 0.65], [x, 0.72, 0.2], 0.06, 'timberDeep'),
    rod([x, 0.4, -0.75], [x, 0.4, 0.75], 0.06, 'timberDeep'),
  );
  const cloth = detail(merge(tintable(at(box(0.5, 0.012, 0.5, 'coral'), -0.4, 0.77, 0)), at(box(0.5, 0.012, 0.5, 'ivory'), 0.1, 0.77, 0)));
  const framesFar = farOnly(merge(at(box(0.06, 0.72, 1.3, 'timberDeep'), -0.7, 0, 0), at(box(0.06, 0.72, 1.3, 'timberDeep'), 0.7, 0, 0)));
  return merge(boards, frame(-0.7), frame(0.7), cloth, framesFar);
}

function roofHatch(): Geo {
  const curb = merge(at(box(0.9, 0.2, 0.08, 'clay'), 0, 0, 0.41), at(box(0.9, 0.2, 0.08, 'clay'), 0, 0, -0.41), at(box(0.08, 0.2, 0.74, 'clay'), 0.41, 0, 0), at(box(0.08, 0.2, 0.74, 'clay'), -0.41, 0, 0));
  const hole = at(box(0.74, 0.16, 0.74, 'ink'), 0, 0, 0);
  const lid = at(rotateX(translate(box(0.9, 0.05, 0.9, 'blue'), 0, 0, 0.45), -1.75), 0, 0.2, -0.45);
  const rails = merge(rod([-0.2, 0.1, 0.1], [-0.2, 0.7, 0.05], 0.03, 'slate'), rod([0.2, 0.1, 0.1], [0.2, 0.7, 0.05], 0.03, 'slate'));
  const stay = rod([0.4, 0.2, -0.3], [0.4, 0.6, -0.55], 0.02, 'slate');
  return merge(detail(merge(curb, hole)), farOnly(box(0.9, 0.2, 0.9, 'clay')), tintable(lid), detail(merge(rails, stay)), farOnly(at(box(0.6, 0.04, 0.6, 'ink'), 0, 0.2, 0)));
}

function catPlank(): Geo {
  const plank = box(4.0, 0.05, 0.3, 'timber');
  const cleats = detail(merge([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => at(box(0.04, 0.025, 0.28, 'timberDeep'), -1.8 + i * 0.4, 0.05, 0))));
  return merge(plank, cleats);
}

function clothesProp(): Geo {
  const near = merge(rod([0, 0, 0], [0.15, 2.9, 0], 0.05, 'timber'), rod([0.15, 2.9, 0], [0.05, 3.1, 0], 0.035, 'timber'), rod([0.15, 2.9, 0], [0.27, 3.1, 0], 0.035, 'timber'));
  const foot = detail(cyl(0.1, 0.12, 0.08, 'slate', 6));
  return merge(near, foot, farOnly(beam([0, 0, 0], [0.15, 3.0, 0], 0.06, 'timber')));
}

function dovecote(): Geo {
  const post = lodPair(cyl(0.06, 0.07, 1.9, 'timber', 6), box(0.1, 1.9, 0.1, 'timber'));
  const house = merge(at(box(0.7, 0.6, 0.6, 'ivory'), 0, 1.9, 0), tintable(at(pyramid(0.9, 0.45, 0.8, 'blue'), 0, 2.5, 0)));
  const holes = detail(merge([[-0.18, 2.25], [0.18, 2.25], [0, 2.0]].map(([x, y]) => merge(at(lyingZ(0.07, 0.03, 'ink', 6), x ?? 0, y ?? 0, 0.3), at(box(0.18, 0.03, 0.1, 'timber'), x ?? 0, (y ?? 0) - 0.09, 0.34)))));
  const dove = (x: number, y: number, z: number): Geo => merge(translate(blob(0.06, 0.05, 0.09, 'white', 6, 4), x, y + 0.05, z), translate(sphere(0.035, 'white', 6, 4), x, y + 0.11, z + 0.06));
  const doves = detail(dove(-0.18, 2.17, 0.36));
  const brace = detail(merge(rod([0, 1.5, 0], [0.25, 1.9, 0], 0.04, 'timber'), rod([0, 1.5, 0], [-0.25, 1.9, 0], 0.04, 'timber')));
  return merge(post, house, holes, doves, brace);
}

function umbrellaChimney(): Geo {
  const stack = merge(shadeY(box(0.6, 1.1, 0.5, 'clay'), 0.85, 1), at(box(0.66, 0.06, 0.56, 'ivory'), 0, 1.1, 0));
  const pole = lodPair(cyl(0.025, 0.025, 2.4, 'ivory', 6), box(0.04, 2.4, 0.04, 'ivory'));
  const lashings = detail(merge(at(cyl(0.05, 0.05, 0.05, 'cocoa', 6), 0, 0.6, 0), at(cyl(0.05, 0.05, 0.05, 'cocoa', 6), 0, 0.95, 0)));
  const canopy = merge(tintable(lathe([[1.0, 0], [0.7, 0.18], [0.3, 0.32], [0.0001, 0.38]], 'coral', 8)), at(lathe([[1.01, -0.1], [1.01, 0.01]], 'ivory', 8), 0, 0, 0));
  const canopyFar = merge(tintable(cone(1.0, 0.38, 'coral', 6)), at(cyl(1.0, 1.0, 0.1, 'ivory', 6, false), 0, -0.1, 0));
  const ribs = detail(merge([0, 1, 2, 3].map((i) => rotateY(rod([0, 0.38, 0], [0.98, 0.0, 0], 0.015, 'ivory'), (i * PI) / 2 + PI / 8))));
  const top = (g: Geo): Geo => at(g, 0.36, 2.0, 0);
  return merge(stack, at(merge(pole, lashings), 0.36, 0, 0), top(lodPair(canopy, canopyFar)), top(ribs));
}

const roofTags = (...t: string[]): string[] => ['rooftop', ...t];

export const ROOFTOP_PROPS: readonly PropDef[] = [
  prop('roof.chimneyPots', [1.0, 0.5], { budget: 'furniture', tags: roofTags('chimney') }, chimneyPots),
  prop('roof.ladder', [0.45, 3.1], { budget: 'furniture', tags: roofTags('ladder') }, roofLadder),
  prop('roof.pigeonCoop', [1.3, 0.8], { budget: 'stall', tint: 'coral', tags: roofTags('animal') }, pigeonCoop),
  prop('roof.deckChairs', [1.4, 0.9], {
    budget: 'furniture',
    tint: 'blue',
    tags: roofTags('seat'),
    seats: [{ x: -0.42, y: 0.32, z: 0.05, heading: 0 }, { x: 0.42, y: 0.32, z: 0.05, heading: 0 }],
  }, deckChairPair),
  prop('roof.tinBath', [1.4, 0.9], { budget: 'furniture', tint: 'ivory', tags: roofTags('bath') }, tinBath),
  prop('roof.tomatoRow', [2.0, 0.45], { budget: 'stall', tags: roofTags('garden') }, tomatoRow),
  prop('roof.washTable', [1.0, 0.6], { budget: 'furniture', tint: 'coral', tags: roofTags('table') }, washTable),
  prop('roof.telescope', [0.8, 0.65], { budget: 'clutter', tint: 'butter', tags: roofTags('telescope') }, telescope),
  prop('roof.bandStools', [2.1, 0.6], {
    budget: 'furniture',
    tags: roofTags('seat', 'music'),
    seats: STOOL_SPOTS.map(([x, z, heading]) => ({ x, y: 0.5, z, heading })),
  }, stoolSet),
  prop('roof.waterBarrel', [0.7, 0.7], { budget: 'clutter', tint: 'blue', tags: roofTags('barrel') }, waterBarrel),
  prop('roof.weathercock', [0.3, 0.3], { budget: 'furniture', tags: roofTags('weather') }, weathercock),
  prop('roof.picnicTable', [1.8, 1.5], {
    budget: 'furniture',
    tint: 'coral',
    tags: roofTags('seat', 'table'),
    seats: [
      { x: -0.45, y: 0.47, z: 0.6, heading: PI },
      { x: 0.45, y: 0.47, z: 0.6, heading: PI },
      { x: -0.45, y: 0.47, z: -0.6, heading: 0 },
      { x: 0.45, y: 0.47, z: -0.6, heading: 0 },
    ],
  }, picnicTable),
  prop('roof.hatch', [0.9, 0.9], { budget: 'clutter', tint: 'blue', tags: roofTags('hatch') }, roofHatch),
  prop('roof.catPlank', [0, 0], { budget: 'clutter', tags: roofTags('walkway') }, catPlank),
  prop('roof.clothesProp', [0.25, 0.25], { budget: 'clutter', tags: roofTags('laundry') }, clothesProp),
  prop('roof.dovecote', [0.5, 0.5], { budget: 'furniture', tint: 'blue', tags: roofTags('animal') }, dovecote),
  prop('roof.umbrellaChimney', [0.7, 0.5], { budget: 'furniture', tint: 'coral', tags: roofTags('chimney', 'overhang') }, umbrellaChimney),
];
