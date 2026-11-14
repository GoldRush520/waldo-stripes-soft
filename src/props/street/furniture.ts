/** Street furniture: benches, street lamps, bollards, litter bins, post box, notice board, newspaper stand. */
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
  sphere,
  sway,
  tintable,
  translate,
} from '../../core/geo';
import type { PropDef } from '../registry';
import { type Seat, prop, topCyl } from './kit';

/* ---------------------------------------------------------------- benches */

function benchEnd(): Geo {
  return rotateY(
    profile(
      [
        [0.2, 0],
        [0.14, 0],
        [0.08, 0.34],
        [-0.16, 0.34],
        [-0.2, 0],
        [-0.27, 0],
        [-0.32, 0.85],
        [-0.27, 0.85],
        [-0.2, 0.42],
        [0.12, 0.42],
      ],
      0.05,
      'ink',
    ),
    -Math.PI / 2,
  );
}

function parkBench(len: number): Geo {
  const ends = detail(merge([-1, 1].map((s) => translate(benchEnd(), s * (len / 2 - 0.08), 0, 0))));
  const farEnds = farOnly(merge([-1, 1].map((s) => translate(box(0.05, 0.8, 0.44, 'ink'), s * (len / 2 - 0.08), 0, -0.04))));
  const seatFar = farOnly(translate(box(len, 0.04, 0.4, 'timber'), 0, 0.41, -0.02));
  const backFar = farOnly(translate(rotateX(box(len, 0.3, 0.03, 'timber'), -0.12), 0, 0.5, -0.24));
  const seatSlats = [0, 1, 2, 3].map((i) => translate(box(len, 0.035, 0.085, 'timber'), 0, 0.41, -0.17 + i * 0.1));
  const backSlats = [0, 1, 2].map((i) => translate(rotateX(box(len, 0.075, 0.03, 'timber'), -0.12), 0, 0.5 + i * 0.1, -0.24 + i * 0.012));
  const arms = [-1, 1].map((s) => beam([s * (len / 2 - 0.05), 0.62, -0.18], [s * (len / 2 - 0.05), 0.6, 0.18], 0.04, 'ink'));
  return merge(ends, farEnds, seatFar, backFar, detail(merge(seatSlats, backSlats, arms)));
}

function stoneBench(len: number): Geo {
  const legs = [-1, 1].map((s) => translate(box(0.22, 0.4, 0.42, 'stone'), s * (len / 2 - 0.2), 0, 0));
  const seat = translate(box(len, 0.06, 0.44, 'timber'), 0, 0.4, 0);
  const gaps = [-0.11, 0, 0.11].map((z) => translate(box(len + 0.002, 0.004, 0.012, 'timberDeep'), 0, 0.458, z));
  return merge(legs, seat, detail(merge(gaps)));
}

function benchSeats(len: number, z: number): Seat[] {
  const n = Math.max(2, Math.floor(len / 0.6));
  return Array.from({ length: n }, (_, i) => ({ x: (i - (n - 1) / 2) * (len / n), y: 0.45, z, heading: 0 }));
}

/* ---------------------------------------------------------------- lamps */

function lanternHead(): Geo {
  const glass = translate(rotateY(rotateX(cone(0.14, 0.26, 'butterLight', 4), Math.PI), Math.PI / 4), 0, 0.26, 0);
  const cap = translate(pyramid(0.3, 0.14, 0.3, 'ink'), 0, 0.26, 0);
  const finial = detail(translate(sphere(0.025, 'ink', 4, 2), 0, 0.42, 0));
  return merge(glass, cap, finial);
}

function classicLamp(): Geo {
  const post = lathe([[0.13, 0], [0.12, 0.28], [0.06, 0.4], [0.045, 3.15], [0.07, 3.22]], 'ink', 6);
  const collar = detail(merge(translate(cyl(0.075, 0.075, 0.04, 'butterDeep', 6, false), 0, 0.42, 0), translate(cyl(0.06, 0.06, 0.03, 'butterDeep', 6, false), 0, 2.4, 0)));
  return merge(post, translate(lanternHead(), 0, 3.2, 0), collar);
}

function swanLamp(): Geo {
  const post = lathe([[0.1, 0], [0.05, 0.4], [0.045, 3.4]], 'blueDeep', 5);
  const arm = merge(beam([0, 3.35, 0], [0, 3.55, 0.25], 0.04, 'blueDeep'), beam([0, 3.55, 0.25], [0, 3.45, 0.55], 0.04, 'blueDeep'));
  const chain = detail(beam([0, 3.45, 0.55], [0, 3.3, 0.55], 0.012, 'ink'));
  const head = translate(merge(translate(box(0.18, 0.24, 0.18, 'butterLight'), 0, -0.04, 0), translate(pyramid(0.26, 0.12, 0.26, 'blueDeep'), 0, 0.2, 0)), 0, 3.0, 0.55);
  const scroll = detail(translate(blob(0.05, 0.08, 0.02, 'blueDeep', 4, 3), 0, 3.25, 0.2));
  return merge(post, arm, chain, head, scroll);
}

/** Hanging flower basket, hook at the origin, hanging below it (tint-masked blooms, swaying trails). */
export function hangingBasket(): Geo {
  const chains = [0, 1].map((i) => {
    const a = i * Math.PI;
    return beam([0, 0, 0], [Math.sin(a) * 0.17, -0.32, Math.cos(a) * 0.17], 0.01, 'ink');
  });
  const bowl = translate(rotateX(dome(0.2, 'timberDeep', 6, 2), Math.PI), 0, -0.32, 0);
  const greens = translate(blob(0.22, 0.1, 0.22, 'sage', 6, 2), 0, -0.3, 0);
  const blooms = [0, 1, 2, 3].map((i) => tintable(translate(sphere(0.05, 'coral', 4, 2), Math.sin(i * 1.57) * 0.15, -0.24, Math.cos(i * 1.57) * 0.15)));
  const trails = [0, 1, 2].map((i) =>
    sway(translate(blob(0.035, 0.12, 0.035, 'sageDeep', 4, 2), Math.sin(i * 2.1 + 0.5) * 0.18, -0.46, Math.cos(i * 2.1 + 0.5) * 0.18), (_x, y) => Math.min(0.6, (-0.34 - y) * 3)),
  );
  return merge(detail(merge(chains, bowl, greens, blooms, trails)), farOnly(tintable(translate(pyramid(0.38, 0.22, 0.38, 'coral'), 0, -0.48, 0))));
}

function basketPost(): Geo {
  const post = merge(box(0.3, 0.06, 0.3, 'ink'), beam([0, 0.06, 0], [0, 2.3, 0], 0.07, 'ink'));
  const arm = merge(beam([0, 2.25, 0], [0, 2.25, 0.55], 0.04, 'ink'), detail(beam([0, 1.95, 0], [0, 2.24, 0.35], 0.025, 'ink')));
  return merge(post, arm, translate(hangingBasket(), 0, 2.23, 0.5));
}

function doubleLamp(): Geo {
  const post = lathe([[0.12, 0], [0.05, 0.45], [0.045, 3.3]], 'ink', 5);
  const bar = beam([-0.62, 3.25, 0], [0.62, 3.25, 0], 0.05, 'ink');
  const heads = [-1, 1].map((s) => translate(merge(translate(rotateX(cone(0.12, 0.22, 'butterLight', 4), Math.PI), 0, 0.22, 0), translate(pyramid(0.26, 0.12, 0.26, 'ink'), 0, 0.22, 0)), s * 0.58, 3.28, 0));
  const baskets = [-1, 1].map((s) => translate(hangingBasket(), s * 0.42, 3.22, 0));
  return merge(post, bar, heads, baskets);
}

/* ---------------------------------------------------------------- bollards, bins, post */

function bollard(): Geo {
  const body = lathe([[0.11, 0], [0.1, 0.55], [0.12, 0.62], [0.03, 0.76]], 'ink', 6);
  const ring = detail(translate(cyl(0.105, 0.105, 0.04, 'butterDeep', 6, false), 0, 0.45, 0));
  return merge(body, ring);
}

function stoneBollard(): Geo {
  return merge(topCyl(0.16, 0.14, 0.45, 'stone', 6), translate(dome(0.14, 'stone', 6, 2), 0, 0.45, 0));
}

function litterBin(): Geo {
  const body = cyl(0.2, 0.22, 0.7, 'sageDeep', 8, false);
  const lid = translate(dome(0.23, 'sageDeep', 8, 2), 0, 0.68, 0);
  const bands = detail(merge([0.12, 0.55].map((y) => translate(cyl(0.225, 0.225, 0.04, 'ink', 8, false), 0, y, 0)), translate(box(0.16, 0.05, 0.02, 'ivory'), 0, 0.42, 0.225)));
  return merge(detail(merge(body, lid)), farOnly(merge(cyl(0.2, 0.22, 0.7, 'sageDeep', 6), translate(cone(0.23, 0.12, 'sageDeep', 6), 0, 0.7, 0))), bands);
}

function postBox(): Geo {
  const body = cyl(0.24, 0.24, 1.25, 'coralDeep', 8, false);
  const cap = translate(dome(0.27, 'coralDeep', 8, 2), 0, 1.25, 0);
  const plinth = cyl(0.27, 0.27, 0.08, 'ink', 8);
  const slot = translate(box(0.18, 0.025, 0.04, 'ink'), 0, 1.02, 0.235);
  const plaque = translate(box(0.12, 0.14, 0.02, 'ivory'), 0, 0.75, 0.24);
  const band = translate(cyl(0.26, 0.26, 0.04, 'coral', 8, false), 0, 1.2, 0);
  return merge(body, cap, plinth, detail(merge(slot, plaque, band)));
}

function noticeBoard(): Geo {
  const posts = [-0.6, 0.6].map((x) => translate(box(0.08, 1.9, 0.08, 'timberDeep'), x, 0, 0));
  const board = translate(box(1.3, 0.9, 0.06, 'clay'), 0, 0.8, 0);
  const roof = translate(rotateY(gable(0.32, 0.14, 1.45, 'sageDeep'), Math.PI / 2), 0, 1.86, 0);
  const papers = ['ivory', 'butterLight', 'coralLight', 'blueLight', 'ivory', 'sageLight'] as const;
  const notes = papers.map((c, i) => translate(rotateY(box(0.24, 0.3, 0.008, c), 0), -0.42 + (i % 3) * 0.42, 1.25 - Math.floor(i / 3) * 0.38, 0.034));
  const pins = papers.map((_c, i) => translate(sphere(0.012, 'coralDeep', 4, 2), -0.42 + (i % 3) * 0.42, 1.52 - Math.floor(i / 3) * 0.38, 0.04));
  return merge(posts, board, roof, detail(merge(notes, pins)));
}

function newspaperStand(): Geo {
  const body = box(0.9, 0.9, 0.5, 'blueDeep');
  const rack = translate(rotateX(box(0.86, 0.45, 0.06, 'blue'), -0.5), 0, 0.85, 0.2);
  const sign = translate(box(0.9, 0.22, 0.04, 'butter'), 0, 1.35, -0.1);
  const signPosts = [-0.4, 0.4].map((x) => beam([x, 0.9, -0.1], [x, 1.35, -0.1], 0.03, 'ink'));
  const papers = [-0.28, 0, 0.28].flatMap((x, i) =>
    [0.06, 0.25].map((y) => translate(rotateX(translate(box(0.24, 0.17, 0.008, i === 1 ? 'butterLight' : 'ivory'), x, y, 0.035), -0.5), 0, 0.85, 0.2)),
  );
  const letters = [0, 1, 2, 3].map((i) => translate(box(0.1, 0.1, 0.01, 'ink'), -0.25 + i * 0.17, 1.41, -0.075));
  return merge(body, rack, sign, signPosts, detail(merge(papers, letters)));
}

const BENCH_TAGS = ['street', 'seat', 'seat:hip'];

export const FURNITURE_PROPS: readonly PropDef[] = [
  prop('bench.park', [1.6, 0.55], 'furniture', () => parkBench(1.6), { seats: benchSeats(1.6, 0.0), tags: BENCH_TAGS }),
  prop('bench.park.long', [2.2, 0.55], 'furniture', () => parkBench(2.2), { seats: benchSeats(2.2, 0.0), tags: BENCH_TAGS }),
  prop('bench.stone', [1.8, 0.44], 'furniture', () => stoneBench(1.8), { seats: benchSeats(1.8, 0.02), tags: [...BENCH_TAGS, 'backless'] }),
  prop('lamp.classic', [0.26, 0.26], 'furniture', classicLamp, { tags: ['street', 'lamp', 'light:3.4'] }),
  prop('lamp.swan', [0.2, 0.2], 'furniture', swanLamp, { tags: ['street', 'lamp', 'light:3.1', 'overhang'] }),
  prop('lamp.double', [0.24, 0.24], 'furniture', doubleLamp, { tint: 'coral', tags: ['street', 'lamp', 'light:3.4', 'overhang'] }),
  prop('basket.hanging.post', [0.3, 0.3], 'furniture', basketPost, { tint: 'coral', tags: ['street', 'flowers', 'overhang'] }),
  prop('bollard', [0.24, 0.24], 'small', bollard, { tags: ['street', 'bollard'] }),
  prop('bollard.stone', [0.32, 0.32], 'small', stoneBollard, { tags: ['street', 'bollard', 'harbour'] }),
  prop('bin.litter', [0.46, 0.46], 'small', litterBin, { tags: ['street'] }),
  prop('postbox', [0.54, 0.54], 'furniture', postBox, { tags: ['street', 'civic'] }),
  prop('board.notice', [1.3, 0.3], 'furniture', noticeBoard, { tags: ['street', 'civic', 'sign'] }),
  prop('stand.newspaper', [0.9, 0.6], 'furniture', newspaperStand, { tags: ['street', 'kiosk'] }),
];
