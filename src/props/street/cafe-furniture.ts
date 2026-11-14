/** Café furniture: tables, bistro chairs, stools, bench seat, parasols, bar counter, menu easel, tray stand. */
import {
  type Geo,
  beam,
  box,
  cone,
  cyl,
  detail,
  lathe,
  merge,
  rotateX,
  rotateY,
  sphere,
  tintable,
  translate,
} from '../../core/geo';
import type { ColorName } from '../../core/palette';
import type { PropDef } from '../registry';
import { gores } from './awning';
import { type Seat, prop, topCyl } from './kit';

export const TABLE_TOP_Y = 0.75;

export function roundTable(r = 0.38): Geo {
  const top = translate(topCyl(r, r, 0.035, 'ivory', 8), 0, TABLE_TOP_Y - 0.035, 0);
  const pedestal = beam([0, 0.03, 0], [0, TABLE_TOP_Y - 0.035, 0], 0.06, 'ink');
  const base = cyl(0.22, 0.25, 0.03, 'ink', 6);
  const rim = translate(cyl(r + 0.004, r + 0.004, 0.012, 'slate', 8, false), 0, TABLE_TOP_Y - 0.03, 0);
  return merge(top, pedestal, base, detail(rim));
}

function squareTable(): Geo {
  const cloth = tintable(translate(box(0.84, 0.13, 0.84, 'coral'), 0, TABLE_TOP_Y - 0.125, 0));
  const legs = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => translate(box(0.045, TABLE_TOP_Y - 0.125, 0.045, 'timberDeep'), sx * 0.34, 0, sz * 0.34)));
  const check = detail(
    merge(
      [-0.2, 0.2].map((x) => translate(box(0.1, 0.004, 0.845, 'ivory'), x, TABLE_TOP_Y + 0.005, 0)),
      [-0.2, 0.2].map((z) => translate(box(0.845, 0.004, 0.1, 'ivory'), 0, TABLE_TOP_Y + 0.006, z)),
    ),
  );
  return merge(cloth, legs, check);
}

/** Bistro chair facing +z: seat at 0.45 m, woven tint-masked seat and back bands. */
export function bistroChair(): Geo {
  const seat = translate(box(0.4, 0.03, 0.38, 'timber'), 0, 0.42, 0);
  const legs = [-0.17, 0.17].flatMap((x) => [beam([x, 0, 0.17], [x, 0.42, 0.15], 0.03, 'ink'), beam([x, 0, -0.2], [x, 0.88, -0.17], 0.03, 'ink')]);
  const back = translate(rotateX(box(0.38, 0.2, 0.03, 'timber'), -0.08), 0, 0.64, -0.18);
  const weave = detail(
    merge(
      [-0.12, 0, 0.12].map((x, i) => {
        const band = translate(box(0.06, 0.006, 0.36, i === 1 ? 'ivory' : 'coral'), x, 0.45, 0);
        return i === 1 ? band : tintable(band);
      }),
      [0, 1].map((i) => translate(rotateX(tintable(box(0.39, 0.05, 0.04, 'coral')), -0.08), 0, 0.66 + i * 0.1, -0.18)),
    ),
  );
  return merge(seat, legs, back, weave);
}

function stool(h: number): Geo {
  const seat = translate(topCyl(0.17, 0.17, 0.05, 'timber', 8), 0, h - 0.05, 0);
  const legs = [0, 1, 2].map((i) => {
    const a = (i / 3) * Math.PI * 2;
    return beam([Math.sin(a) * 0.2, 0, Math.cos(a) * 0.2], [Math.sin(a) * 0.1, h - 0.05, Math.cos(a) * 0.1], 0.035, 'timberDeep');
  });
  const ring = detail(translate(cyl(0.16, 0.16, 0.02, 'timberDeep', 6, false), 0, h * 0.35, 0));
  return merge(seat, legs, ring);
}

function benchSeat(): Geo {
  const seat = translate(box(1.4, 0.05, 0.42, 'timber'), 0, 0.4, 0);
  const back = translate(box(1.4, 0.36, 0.04, 'timber'), 0, 0.5, -0.2);
  const legs = [-0.62, 0.62].flatMap((x) => [translate(box(0.05, 0.4, 0.05, 'timberDeep'), x, 0, 0.16), translate(box(0.05, 0.4, 0.05, 'timberDeep'), x, 0, -0.18)]);
  const cushion = detail(merge([-0.35, 0.35].map((x) => tintable(translate(box(0.62, 0.05, 0.38, 'blue'), x, 0.45, 0.01)))));
  return merge(seat, back, legs, cushion);
}

/** Open café parasol: gored canopy (tint-masked gores alternate with ivory), pole and weighted base. */
export function parasol(radius = 1.3, tint: ColorName = 'coral'): Geo {
  const pole = beam([0, 0.05, 0], [0, 2.5, 0], 0.045, 'ivoryDeep');
  const base = cyl(0.26, 0.28, 0.08, 'slate', 6);
  const canopy = translate(gores(radius, 0.42, 8, tint), 0, 2.05, 0);
  const finial = detail(merge(translate(sphere(0.04, 'ivory', 5, 3), 0, 2.52, 0), translate(cyl(0.05, 0.05, 0.08, 'ivoryDeep', 6), 0, 1.9, 0)));
  return merge(pole, base, canopy, finial);
}

function parasolClosed(tint: ColorName = 'coral'): Geo {
  const pole = beam([0, 0.05, 0], [0, 2.5, 0], 0.045, 'ivoryDeep');
  const base = cyl(0.26, 0.28, 0.08, 'slate', 6);
  const furl = tintable(translate(lathe([[0.02, 0], [0.12, 0.25], [0.1, 0.8], [0.02, 0.95]], tint, 6), 0, 1.45, 0));
  const ties = detail(merge([1.75, 2.05].map((y) => translate(cyl(0.118, 0.118, 0.04, 'ivory', 6, false), 0, y, 0))));
  return merge(pole, base, furl, ties);
}

function barCounter(): Geo {
  const body = box(2.4, 1.0, 0.6, 'timber');
  const top = translate(box(2.5, 0.05, 0.72, 'timberDeep'), 0, 1.0, 0.02);
  const panels = [-0.8, 0, 0.8].map((x) => translate(tintable(box(0.42, 0.7, 0.02, 'coral')), x, 0.15, 0.31));
  const rail = beam([-1.2, 0.18, 0.42], [1.2, 0.18, 0.42], 0.035, 'butterDeep');
  const taps = [-0.3, -0.12].map((x) => merge(translate(cyl(0.02, 0.02, 0.25, 'butterDeep', 5), x, 1.05, -0.15), translate(box(0.03, 0.08, 0.03, 'ink'), x, 1.3, -0.12)));
  const glasses = [0.45, 0.62].map((x) => translate(cyl(0.035, 0.04, 0.12, 'blueLight', 5), x, 1.05, 0.1));
  const bottles = [-0.9, -0.78, -0.66].map((x, i) => translate(lathe([[0.04, 0], [0.04, 0.18], [0.015, 0.26], [0.015, 0.3]], i === 1 ? 'coralDeep' : 'sageDeep', 5), x, 1.05, -0.12));
  return merge(body, top, panels, detail(merge(rail, taps, glasses, bottles)));
}

function menuEasel(): Geo {
  const legs = merge(beam([-0.28, 0, 0.12], [0, 1.45, 0], 0.035, 'timber'), beam([0.28, 0, 0.12], [0, 1.45, 0], 0.035, 'timber'), beam([0, 0, -0.38], [0, 1.4, 0], 0.035, 'timber'));
  const board = translate(rotateX(box(0.55, 0.75, 0.03, 'ink'), -0.08), 0, 0.5, 0.12);
  const ledge = translate(box(0.6, 0.03, 0.08, 'timber'), 0, 0.47, 0.14);
  const lines = detail(
    merge(
      Array.from({ length: 5 }, (_, i) =>
        translate(rotateX(box(i === 0 ? 0.36 : 0.26 + (i % 2) * 0.1, 0.03, 0.005, i === 0 ? 'butter' : 'ivory'), -0.08), 0, 1.1 - i * 0.12, 0.13 + i * 0.01),
      ),
    ),
  );
  return merge(legs, board, detail(ledge), lines);
}

function trayStand(): Geo {
  const legs = [-1, 1].flatMap((s) => [beam([-0.25, 0, s * 0.2], [0.25, 0.72, -s * 0.2], 0.03, 'timberDeep'), beam([0.25, 0, s * 0.2], [-0.25, 0.72, -s * 0.2], 0.03, 'timberDeep')]);
  const tray = translate(box(0.6, 0.03, 0.42, 'slate'), 0, 0.72, 0);
  const glasses = detail(merge([-0.18, -0.06, 0.06, 0.18].map((x, i) => translate(cone(0.035, 0.1, i % 2 ? 'blueLight' : 'butterLight', 5), x, 0.75, (i % 2 ? 1 : -1) * 0.08))));
  const straps = detail(merge([-0.2, 0.2].map((x) => translate(box(0.03, 0.005, 0.4, 'clayDeep'), x, 0.62, 0))));
  return merge(legs, tray, glasses, straps);
}

function tableSet(): Geo {
  const chairA = translate(bistroChair(), 0, 0, -0.62);
  const chairB = translate(rotateY(bistroChair(), Math.PI), 0, 0, 0.62);
  return merge(roundTable(), chairA, chairB);
}

const CHAIR_SEAT: readonly Seat[] = [{ x: 0, y: 0.45, z: 0.02, heading: 0 }];
const SET_SEATS: readonly Seat[] = [
  { x: 0, y: 0.45, z: -0.6, heading: 0 },
  { x: 0, y: 0.45, z: 0.6, heading: Math.PI },
];

export const CAFE_FURNITURE_PROPS: readonly PropDef[] = [
  prop('cafe.table.round', [0.76, 0.76], 'furniture', () => roundTable(), { tags: ['cafe', 'table', `top:${TABLE_TOP_Y}`] }),
  prop('cafe.table.square', [0.84, 0.84], 'furniture', squareTable, { tint: 'coral', tags: ['cafe', 'table', `top:${TABLE_TOP_Y}`] }),
  prop('cafe.chair.bistro', [0.42, 0.42], 'furniture', bistroChair, { tint: 'coral', seats: CHAIR_SEAT, tags: ['cafe', 'seat', 'seat:hip'] }),
  prop('cafe.stool', [0.4, 0.4], 'furniture', () => stool(0.45), { seats: [{ x: 0, y: 0.45, z: 0, heading: 0 }], tags: ['cafe', 'seat', 'seat:hip'] }),
  prop('cafe.stool.bar', [0.4, 0.4], 'furniture', () => stool(0.75), { seats: [{ x: 0, y: 0.75, z: 0, heading: 0 }], tags: ['cafe', 'seat', 'seat:hip'] }),
  prop('cafe.bench', [1.4, 0.45], 'furniture', benchSeat, {
    tint: 'blue',
    seats: [-0.35, 0.35].map((x) => ({ x, y: 0.45, z: 0.04, heading: 0 })),
    tags: ['cafe', 'seat', 'seat:hip'],
  }),
  prop('parasol.open', [0.5, 0.5], 'furniture', () => parasol(), { tint: 'coral', tags: ['cafe', 'beach', 'shade', 'overhang'] }),
  prop('parasol.closed', [0.5, 0.5], 'furniture', () => parasolClosed(), { tint: 'coral', tags: ['cafe', 'beach'] }),
  prop('cafe.bar', [2.5, 0.72], 'furniture', barCounter, { tint: 'coral', tags: ['cafe', 'counter', 'top:1.05'] }),
  prop('cafe.easel.menu', [0.6, 0.5], 'furniture', menuEasel, { tags: ['cafe', 'sign'] }),
  prop('cafe.traystand', [0.55, 0.45], 'furniture', trayStand, { tags: ['cafe'] }),
  prop('cafe.set.round2', [0.8, 1.6], 'stall', tableSet, { tint: 'coral', seats: SET_SEATS, tags: ['cafe', 'seat', 'seat:hip'] }),
];
