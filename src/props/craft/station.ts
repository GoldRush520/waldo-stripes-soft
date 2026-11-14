/** Tram-station furniture: lost property, left luggage, bench, ticket machine, boards and clock. */
import {
  type Col,
  type Geo,
  blob,
  box,
  cone,
  cyl,
  detail,
  farOnly,
  gable,
  lathe,
  merge,
  rotateX,
  rotateY,
  sphere,
  tintable,
  translate,
} from '../../core/geo';
import { createRng } from '../../core/rng';
import type { PropDef } from '../registry';
import { PI, at, lodPair, lyingZ, prop, rod, stretch, stripedBox } from './kit';

function lostPropertyShelf(): Geo {
  const w = 2.0;
  const frame = merge(
    at(box(0.06, 2.0, 0.5, 'timberDeep'), -w / 2, 0, 0),
    at(box(0.06, 2.0, 0.5, 'timberDeep'), w / 2, 0, 0),
    at(box(0.06, 2.0, 0.5, 'timberDeep'), 0, 0, 0),
    at(box(w + 0.06, 1.94, 0.04, 'clay'), 0, 0.06, -0.23),
    [0.06, 0.65, 1.3, 1.96].map((y) => at(box(w, 0.04, 0.5, 'timber'), 0, y, 0)),
  );
  const sign = merge(tintable(at(box(1.2, 0.3, 0.06, 'blue'), 0, 2.0, 0.1)), detail(merge([0, 1, 2, 3, 4].map((i) => at(box(0.12, 0.14, 0.03, 'ivory'), -0.4 + i * 0.2, 2.08, 0.14)))));
  const rng = createRng('craft.lostProperty');
  const items: Geo[] = [];
  const cols: readonly Col[] = ['coral', 'blue', 'butter', 'sage', 'clay'];
  [0.1, 0.69, 1.34].forEach((y) => {
    for (let i = 0; i < 4; i++) {
      const x = -0.8 + i * 0.45 + rng.range(-0.05, 0.05);
      const kind = rng.int(0, 2);
      const c = rng.pick(cols);
      if (kind === 0) items.push(at(box(0.3, 0.22, 0.3, c), x, y, 0));
      else if (kind === 1) items.push(merge(at(cyl(0.14, 0.14, 0.015, c, 8), x, y, 0), at(cyl(0.09, 0.09, 0.1, c, 8), x, y, 0)));
      else items.push(at(rotateX(cyl(0.03, 0.03, 0.5, c, 6), -1.3), x, y + 0.03, 0.15));
    }
  });
  const umbrella = merge(rod([0.9, 0.0, 0.32], [0.9, 0.9, 0.32], 0.02, 'cocoa'), at(cone(0.06, 0.5, 'coral', 6), 0.9, 0.35, 0.32));
  const fill = farOnly(merge([0.1, 0.69, 1.34].map((y) => at(box(1.8, 0.22, 0.3, 'clayDeep'), 0, y, 0))));
  return merge(frame, sign, detail(merge(items, umbrella)), fill);
}

function leftLuggageCounter(): Geo {
  const stripes = (n: number): Geo => at(stripedBox(2.4, 0.95, 0.12, n), 0, 0, 0.29);
  const front = merge(lodPair(stripes(9), stripes(3)), at(box(2.4, 0.95, 0.5, 'ivoryShade'), 0, 0, -0.02));
  const top = at(box(2.5, 0.06, 0.74, 'ivory'), 0, 0.95, 0);
  const rack = detail(merge(at(box(2.4, 0.04, 0.4, 'timber'), 0, 1.2, -0.9), at(box(0.06, 1.8, 0.4, 'timberDeep'), -1.2, 0, -0.9), at(box(0.06, 1.8, 0.4, 'timberDeep'), 1.2, 0, -0.9), at(box(2.4, 0.04, 0.4, 'timber'), 0, 0.5, -0.9)));
  const rackFar = farOnly(at(box(2.4, 1.8, 0.06, 'timber'), 0, 0, -1.07));
  const cases = detail(merge(
    at(box(0.5, 0.3, 0.3, 'coral'), -0.8, 0.54, -0.9), at(box(0.4, 0.4, 0.28, 'sage'), -0.2, 0.54, -0.9), at(box(0.6, 0.26, 0.32, 'butter'), 0.6, 0.54, -0.9),
    at(box(0.6, 0.3, 0.3, 'blue'), -0.6, 1.24, -0.9), at(box(0.36, 0.36, 0.3, 'clay'), 0.4, 1.24, -0.9),
  ));
  const casesFar = farOnly(merge(at(box(2.0, 0.34, 0.3, 'coral'), 0, 0.54, -0.9), at(box(1.6, 0.34, 0.3, 'blue'), 0, 1.24, -0.9)));
  const tags = detail(merge([0, 1, 2, 3, 4, 5].map((i) => at(box(0.06, 0.1, 0.01, 'butterLight'), -0.9 + i * 0.12, 1.4, -0.68))));
  const bell = detail(merge(at(lathe([[0.06, 0], [0.045, 0.04], [0.0001, 0.06]], 'butter', 8), 0.8, 1.01, 0.1), at(cyl(0.07, 0.07, 0.01, 'cocoa', 8), 0.8, 1.0, 0.1)));
  const ledger = detail(at(box(0.36, 0.03, 0.26, 'ivoryDeep'), -0.4, 1.01, 0.05, 0.2));
  return merge(front, top, rack, rackFar, cases, casesFar, tags, bell, ledger);
}

function stationBench(): Geo {
  const slat = (y: number, z: number): Geo => at(box(1.8, 0.035, 0.1, 'timber'), 0, y, z);
  const seat = merge(slat(0.42, -0.14), slat(0.42, 0), slat(0.42, 0.14));
  const back = merge(at(rotateX(box(1.8, 0.1, 0.035, 'timber'), -0.15), 0, 0.6, -0.22), at(rotateX(box(1.8, 0.1, 0.035, 'timber'), -0.15), 0, 0.76, -0.24));
  const end = (x: number): Geo => tintable(merge(
    at(box(0.06, 0.42, 0.06, 'blueDeep'), x, 0, 0.14), at(box(0.06, 0.9, 0.06, 'blueDeep'), x, 0, -0.2),
    at(box(0.06, 0.06, 0.4, 'blueDeep'), x, 0.36, -0.02), at(box(0.06, 0.06, 0.24, 'blueDeep'), x, 0.6, 0.02),
  ));
  const endsFar = tintable(merge(at(box(0.06, 0.9, 0.4, 'blueDeep'), -0.8, 0, -0.03), at(box(0.06, 0.9, 0.4, 'blueDeep'), 0.8, 0, -0.03)));
  const seatFar = merge(at(box(1.8, 0.04, 0.4, 'timber'), 0, 0.42, 0), at(rotateX(box(1.8, 0.28, 0.035, 'timber'), -0.15), 0, 0.56, -0.22));
  return lodPair(merge(seat, back, end(-0.8), end(0.8)), merge(endsFar, seatFar));
}

function ticketMachine(): Geo {
  const cab = tintable(box(0.6, 1.5, 0.45, 'coral'));
  const crown = merge(at(box(0.66, 0.08, 0.5, 'ivory'), 0, 1.5, 0), tintable(at(rotateY(gable(0.5, 0.18, 0.66, 'coral'), PI / 2), 0, 1.58, 0)));
  const screen = at(box(0.4, 0.3, 0.03, 'blueLight'), 0, 1.0, 0.23);
  const buttons = detail(merge([0, 1, 2, 3, 4, 5].map((i) => at(box(0.06, 0.05, 0.03, i % 2 === 0 ? 'butter' : 'ivory'), -0.1 + (i % 3) * 0.1, 0.75 + Math.floor(i / 3) * 0.08, 0.24))));
  const slot = detail(merge(at(box(0.2, 0.08, 0.06, 'cocoa'), 0, 0.45, 0.24), at(box(0.12, 0.02, 0.04, 'ink'), 0.15, 0.92, 0.24)));
  const stripe = at(box(0.62, 0.08, 0.47, 'ivory'), 0, 0.3, 0);
  const plinth = detail(at(box(0.66, 0.06, 0.5, 'slate'), 0, 0, 0));
  return merge(cab, crown, screen, buttons, slot, stripe, plinth);
}

function departuresBoard(): Geo {
  const w = 2.8;
  const posts = merge(at(box(0.12, 3.2, 0.12, 'blueDeep'), -w / 2 + 0.1, 0, 0), at(box(0.12, 3.2, 0.12, 'blueDeep'), w / 2 - 0.1, 0, 0));
  const panel = merge(at(box(w, 1.3, 0.14, 'ink'), 0, 1.9, 0), tintable(at(box(w + 0.1, 0.3, 0.18, 'blue'), 0, 3.15, 0)), at(box(w + 0.1, 0.06, 0.18, 'ivory'), 0, 3.12, 0));
  const flaps: Geo[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 10; c++) {
      const col: Col = c < 2 ? 'butter' : c === 9 ? 'coral' : 'ivory';
      flaps.push(at(box(0.2, 0.2, 0.03, col), -1.17 + c * 0.26, 2.0 + r * 0.28, 0.08));
    }
  }
  const rows = farOnly(merge([0, 1, 2, 3].map((r) => at(box(2.5, 0.14, 0.03, 'ivoryDeep'), 0, 2.03 + r * 0.28, 0.08))));
  const letters = detail(merge([0, 1, 2, 3, 4, 5, 6].map((i) => at(box(0.14, 0.14, 0.03, 'ivory'), -0.6 + i * 0.2, 3.23, 0.1))));
  return merge(posts, panel, detail(merge(flaps)), rows, letters);
}

function platformClock(): Geo {
  const post = lodPair(cyl(0.07, 0.09, 2.9, 'blueDeep', 8), box(0.14, 2.9, 0.14, 'blueDeep'));
  const base = lodPair(cyl(0.2, 0.22, 0.3, 'blueDeep', 8), cyl(0.2, 0.22, 0.3, 'blueDeep', 5));
  const face = merge(tintable(at(lyingZ(0.36, 0.16, 'blue', 14), 0, 3.25, 0)), at(lyingZ(0.31, 0.18, 'ivory', 14), 0, 3.25, 0));
  const faceFar = merge(tintable(at(lyingZ(0.36, 0.16, 'blue', 6), 0, 3.25, 0)), at(lyingZ(0.3, 0.18, 'ivory', 5), 0, 3.25, 0));
  const hands = detail(merge(
    at(box(0.025, 0.2, 0.01, 'ink'), 0, 3.25, 0.095), at(box(0.025, 0.26, 0.01, 'ink'), 0, 3.25, -0.095),
    at(box(0.15, 0.02, 0.01, 'ink'), 0.07, 3.24, 0.095), at(box(0.15, 0.02, 0.01, 'ink'), -0.07, 3.24, -0.095),
  ));
  const finial = detail(translate(sphere(0.06, 'butter', 6, 4), 0, 3.66, 0));
  return merge(post, base, lodPair(face, faceFar), hands, finial);
}

function portersBell(): Geo {
  const post = lodPair(cyl(0.03, 0.03, 1.7, 'blueDeep', 6), box(0.05, 1.7, 0.05, 'blueDeep'));
  const arm = rod([0, 1.6, 0], [0.3, 1.6, 0], 0.03, 'blueDeep');
  const bell = lodPair(lathe([[0.1, 0], [0.08, 0.06], [0.06, 0.14], [0.0001, 0.16]], 'butter', 8), cone(0.1, 0.16, 'butter', 5));
  const rope = rod([0.3, 1.3, 0], [0.3, 0.9, 0], 0.015, 'coral');
  const foot = detail(cyl(0.16, 0.16, 0.04, 'blueDeep', 8));
  return merge(post, arm, at(bell, 0.3, 1.36, 0), rope, foot);
}

function mailSacks(): Geo {
  const rng = createRng('craft.mailSacks');
  const near: Geo[] = [];
  const spots: ReadonlyArray<readonly [number, number, number]> = [[-0.45, 0, 0], [0.05, 0, 0.1], [0.5, 0, -0.05], [-0.2, 0.32, 0.02], [0.28, 0.32, 0.04], [0.0, 0.0, -0.4]];
  spots.forEach(([x, y, z], i) => {
    const c: Col = i % 2 === 0 ? 'clay' : 'ivoryShade';
    const r = rng.range(0.22, 0.27);
    near.push(translate(blob(r, 0.2, r * 0.85, c, 7, 4), x, y + 0.18, z));
    near.push(at(cyl(0.05, 0.03, 0.1, c, 5), x, y + 0.34, z));
    near.push(tintable(at(cyl(r * 0.95, r * 0.95, 0.04, 'coral', 7, false), x, y + 0.14, z)));
  });
  const far = tintable(stretch(cyl(1, 0.6, 1, 'clay', 6), 0.75, 0.6, 0.5, 0, 0, -0.1));
  return merge(detail(merge(near)), farOnly(far));
}

function newspaperStack(): Geo {
  const near: Geo[] = [];
  for (let i = 0; i < 5; i++) {
    const rot = (i % 2 === 0 ? 0.08 : -0.1) * i;
    near.push(at(box(0.42, 0.11, 0.3, i % 2 === 0 ? 'ivory' : 'ivoryShade'), 0, i * 0.11, 0, rot));
    near.push(at(box(0.44, 0.012, 0.02, 'timber'), 0, i * 0.11 + 0.105, 0, rot));
  }
  const top = at(box(0.3, 0.01, 0.22, 'clay'), 0.02, 0.55, 0.0, 0.3);
  return merge(detail(merge(near, top)), farOnly(merge(box(0.44, 0.55, 0.32, 'ivory'), at(box(0.46, 0.04, 0.34, 'timber'), 0, 0.3, 0))));
}

export const STATION_PROPS: readonly PropDef[] = [
  prop('station.lostProperty', [2.1, 0.5], { budget: 'stall', tint: 'blue', tags: ['station', 'shelf'] }, lostPropertyShelf),
  prop('station.leftLuggage', [2.5, 1.5], { budget: 'stall', tint: 'coral', tags: ['station', 'counter'] }, leftLuggageCounter),
  prop('station.bench', [1.8, 0.5], {
    budget: 'furniture',
    tint: 'blueDeep',
    tags: ['station', 'seat'],
    seats: [-0.55, 0, 0.55].map((x) => ({ x, y: 0.46, z: 0.02, heading: 0 })),
  }, stationBench),
  prop('station.ticketMachine', [0.65, 0.5], { budget: 'furniture', tint: 'coral', tags: ['station'] }, ticketMachine),
  prop('station.departures', [2.9, 0.2], { budget: 'stall', tint: 'blue', tags: ['station', 'sign'] }, departuresBoard),
  prop('station.clock', [0.45, 0.45], { budget: 'furniture', tint: 'blue', tags: ['station', 'clock'] }, platformClock),
  prop('station.portersBell', [0.4, 0.3], { budget: 'clutter', tags: ['station'] }, portersBell),
  prop('station.mailSacks', [1.4, 1.0], { budget: 'stall', tint: 'coral', tags: ['station', 'heap'] }, mailSacks),
  prop('station.newspapers', [0.45, 0.35], { budget: 'clutter', tags: ['station', 'clutter'] }, newspaperStack),
];
