/** Tall landmarks, part 2: water tower, harbour-master lookout, steeple, obelisk and statue column. */
import {
  type Col,
  type Geo,
  beam,
  blob,
  capsule,
  cone,
  cyl,
  merge,
  place,
  pyramid,
  rotateY,
  shadeY,
  sphere,
  tintable,
  translate,
} from '../../core/geo';
import { ironRailing } from './fences';
import { type P2, boxAt, coneWedge, lod, range, segBox } from './util';

const CORNERS: readonly P2[] = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
];

/* ------------------------------------------------------------------ water tower */

export interface WaterTowerOpts {
  readonly tank?: Col;
  readonly stripe?: Col;
  readonly legs?: Col;
}

export function waterTower(o: WaterTowerOpts = {}): Geo {
  const legs = o.legs ?? 'blueDeep';
  const tank = o.tank ?? 'ivory';
  const stripe = o.stripe ?? 'coral';
  const H = 8;
  const legPos = (y: number): [number, number, number][] =>
    CORNERS.map(([x, z]): [number, number, number] => [x * (1.7 - (y / H) * 0.45), y, z * (1.7 - (y / H) * 0.45)]);
  const base = legPos(0);
  const tops = legPos(H);
  const always = [
    ...base.map((p, i) => beam(p, tops[i] ?? p, 0.24, legs)),
    ...base.map((p) => boxAt(0.5, 0.3, 0.5, 'stone', p[0], 0, p[2])),
    translate(cyl(1.6, 1.6, 0.3, legs, 8), 0, H, 0),
    translate(tintable(cone(2.15, 1.1, stripe, 10)), 0, H + 2.9, 0),
  ];
  const tankParts = (seg: number): Geo[] => [
    translate(cyl(1.9, 1.9, 2.6, tank, seg), 0, H + 0.3, 0),
    translate(tintable(cyl(1.93, 1.93, 0.4, stripe, seg, false)), 0, H + 0.7, 0),
    translate(tintable(cyl(1.93, 1.93, 0.4, stripe, seg, false)), 0, H + 1.9, 0),
  ];
  const braces = [2.6, 5.4].flatMap((y) => {
    const a = legPos(y - 2.4);
    const b = legPos(y);
    return range(4).flatMap((i) => {
      const j = (i + 1) % 4;
      const ai = a[i] ?? [0, 0, 0];
      const aj = a[j] ?? [0, 0, 0];
      const bi = b[i] ?? [0, 0, 0];
      const bj = b[j] ?? [0, 0, 0];
      return [beam(ai, bj, 0.06, legs), beam(aj, bi, 0.06, legs), beam(bi, bj, 0.08, legs)];
    });
  });
  const ladder = [
    ...[-0.22, 0.22].map((x) => boxAt(0.05, H + 2.6, 0.05, 'slate', x, 0.3, 2.0)),
    ...range(Math.floor((H + 2.4) / 0.4)).map((i) => boxAt(0.44, 0.04, 0.04, 'slate', 0, 0.5 + i * 0.4, 2.0)),
  ];
  const near = [...tankParts(16), ...braces, ...ladder, translate(sphere(0.18, 'butter', 6, 4), 0, H + 4.05, 0)];
  return merge(always, lod(near, tankParts(8)));
}

/* ------------------------------------------------------------------ harbour lookout */

export interface LookoutResult {
  readonly geo: Geo;
  /** walkable platform height and rectangle */
  readonly platformY: number;
  readonly platform: { readonly x0: number; readonly z0: number; readonly x1: number; readonly z1: number };
  /** foot of the exterior stair [x, z] */
  readonly stairFoot: P2;
}

function lookoutStair(platY: number, x0: number, z: number): Geo {
  const run = platY * 1.05;
  const n = Math.round(platY / 0.2);
  const stringers = [z - 0.45, z + 0.45].map((sz) => segBox(x0 + run, 0, x0, platY, 0.18, 0.06, 'timberDeep', sz));
  const treads = range(n).map((i) => boxAt(0.3, 0.05, 0.86, 'timber', x0 + run - ((i + 0.5) * run) / n, ((i + 1) * platY) / n - 0.05, z));
  const rail = segBox(x0 + run, 0.95, x0, platY + 0.95, 0.05, 0.05, 'ivory', z + 0.47);
  return merge(stringers, lod([...treads, rail], [segBox(x0 + run, 0, x0, platY, 0.05, 0.86, 'timber', z)]));
}

export function harbourLookout(): LookoutResult {
  const platY = 4.2;
  const hw = 1.8;
  const cabin = 1.25;
  const always = [
    ...CORNERS.map(([x, z]) => boxAt(0.26, platY, 0.26, 'timberDeep', x * (hw - 0.2), 0, z * (hw - 0.2))),
    boxAt(hw * 2, 0.22, hw * 2, 'timber', 0, platY - 0.22, 0),
    shadeY(boxAt(cabin * 2, 2.2, cabin * 2, 'ivory', 0, platY, 0), 0.9, 1),
    boxAt(cabin * 2 + 0.1, 0.3, cabin * 2 + 0.1, 'blue', 0, platY + 0.9, 0),
    translate(tintable(pyramid(cabin * 2 + 0.7, 1.3, cabin * 2 + 0.7, 'coral')), 0, platY + 2.2, 0),
    lookoutStair(platY, hw, -0.9),
  ];
  const win = merge(boxAt(1.6, 0.7, 0.06, 'blueDeep', 0, 0, 0), boxAt(0.06, 0.7, 0.08, 'ivory', 0, 0, 0.01));
  const near = [
    ...[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((a) => place(win, Math.sin(a) * cabin, platY + 1.25, Math.cos(a) * cabin, a)),
    boxAt(0.8, 1.9, 0.06, 'timberDeep', 0.6, platY, cabin + 0.01),
    ...range(4).flatMap((i) => {
      const [x, z] = CORNERS[i] ?? [0, 0];
      return [beam([x * 1.6, 0.3, z * 1.6], [x * 1.6, platY - 0.4, -z * 1.6], 0.08, 'timber')];
    }),
    translate(ironRailing(hw * 2, { color: 'ivory' }), 0, platY, hw - 0.05),
    translate(rotateY(ironRailing(hw * 2, { color: 'ivory' }), Math.PI / 2), -hw + 0.05, platY, 0),
    translate(ironRailing(hw * 2, { color: 'ivory' }), 0, platY, -hw + 0.05),
    translate(rotateY(ironRailing(1.6, { color: 'ivory' }), Math.PI / 2), hw - 0.05, platY, 0.8),
    boxAt(0.05, 1.4, 0.05, 'ink', 0, platY + 3.5, 0),
    translate(rotateY(boxAt(0.6, 0.35, 0.02, 'coral', 0.3, 0, 0), 0.3), 0, platY + 4.5, 0),
  ];
  const dx = -(platY * 1.05) / 2;
  return {
    geo: translate(merge(always, lod(near, [])), dx, 0, 0),
    platformY: platY,
    platform: { x0: -hw + dx, z0: -hw, x1: hw + dx, z1: hw },
    stairFoot: [hw + platY * 1.05 + dx, -0.9],
  };
}

/* ------------------------------------------------------------------ steeple */

export interface SteepleOpts {
  readonly body?: Col;
  readonly a?: Col;
  readonly b?: Col;
}

export function steeple(o: SteepleOpts = {}): Geo {
  const body = o.body ?? 'ivory';
  const a = o.a ?? 'coral';
  const b = o.b ?? 'ivory';
  const spire = range(8).map((i) => coneWedge(1.3, 8.5, i % 2 ? b : a, (i * Math.PI) / 4, Math.PI / 4));
  const always = [
    shadeY(boxAt(3, 6, 3, body, 0, 0, 0), 0.85, 1),
    boxAt(3.2, 0.3, 3.2, a, 0, 6, 0),
    translate(cyl(1.3, 1.3, 2.4, body, 8), 0, 6.3, 0),
    translate(cyl(1.45, 1.45, 0.2, a, 8), 0, 8.7, 0),
    translate(merge(spire), 0, 8.9, 0),
  ];
  const near = [
    ...range(8).map((i) => {
      const t = ((i + 0.5) / 8) * Math.PI * 2;
      return place(boxAt(0.36, 1.3, 0.06, 'blueDeep', 0, 0, 0), Math.sin(t) * 1.27, 6.8, Math.cos(t) * 1.27, t);
    }),
    boxAt(1.0, 2.1, 0.06, 'timberDeep', 0, 0, 1.52),
    translate(cone(0.7, 0.5, a, 8), 0, 2.1, 1.3),
    boxAt(0.5, 1.0, 0.06, 'blueDeep', 0, 3.6, 1.52),
    translate(sphere(0.18, 'butter', 6, 4), 0, 17.5, 0),
    boxAt(0.06, 1.0, 0.06, 'butterDeep', 0, 17.5, 0),
    boxAt(0.45, 0.06, 0.06, 'butterDeep', 0, 18.1, 0),
    ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => boxAt(0.3, 6, 0.3, 'ivoryShade', sx * 1.45, 0, sz * 1.45))),
  ];
  return merge(always, lod(near, [boxAt(0.12, 1.0, 0.12, 'butterDeep', 0, 17.4, 0)]));
}

/* ------------------------------------------------------------------ obelisk & statue column */

function steppedBase(w: number, c: Col): Geo[] {
  return [0, 1, 2].map((i) => boxAt(w - i * 0.5, 0.3, w - i * 0.5, i % 2 ? 'ivory' : c, 0, i * 0.3, 0));
}

export function obelisk(c: Col = 'clay', cap: Col = 'butter'): Geo {
  const always = [
    ...steppedBase(3.0, 'stone'),
    boxAt(1.5, 1.2, 1.5, 'ivory', 0, 0.9, 0),
    translate(rotateY(cyl(0.85, 0.55, 7.5, c, 4), Math.PI / 4), 0, 2.1, 0),
    translate(rotateY(cone(0.58, 0.8, cap, 4), Math.PI / 4), 0, 9.6, 0),
  ];
  const near = [
    ...[0, Math.PI / 2, Math.PI, -Math.PI / 2].flatMap((a) => [
      place(boxAt(0.8, 0.5, 0.04, 'butterDeep', 0, 0, 0), Math.sin(a) * 0.76, 1.25, Math.cos(a) * 0.76, a),
      place(boxAt(0.3, 0.3, 0.05, 'coral', 0, 0, 0), Math.sin(a) * 0.58, 7.3, Math.cos(a) * 0.58, a),
      place(boxAt(1.6, 0.1, 0.06, 'ivoryShade', 0, 0, 0), Math.sin(a) * 0.76, 2.0, Math.cos(a) * 0.76, a),
    ]),
    ...CORNERS.map(([x, z]) => translate(sphere(0.12, 'butter', 6, 4), x * 0.72, 2.2, z * 0.72)),
  ];
  return merge(always, lod(near, []));
}

function statue(c: Col): Geo {
  return merge(
    capsule(0.32, 1.6, c, 8),
    translate(sphere(0.2, c, 8, 6), 0, 1.75, 0),
    beam([0.25, 1.35, 0], [0.55, 2.2, 0.15], 0.12, c),
    beam([-0.25, 1.35, 0], [-0.35, 0.8, 0.2], 0.12, c),
    translate(blob(0.42, 0.75, 0.2, c, 8, 5), 0, 0.9, -0.2),
    translate(sphere(0.11, 'butter', 6, 4), 0.58, 2.3, 0.16),
  );
}

export function statueColumn(c: Col = 'ivory', bronze: Col = 'sageDeep'): Geo {
  const always = [
    ...steppedBase(3.0, 'stone'),
    boxAt(1.6, 1.4, 1.6, c, 0, 0.9, 0),
    boxAt(1.4, 0.4, 1.4, 'ivoryShade', 0, 9.0, 0),
  ];
  const shaft = (seg: number): Geo => translate(cyl(0.6, 0.5, 6.7, c, seg), 0, 2.3, 0);
  const near = [
    shaft(14),
    translate(statue(bronze), 0, 9.4, 0),
    ...range(14).map((i) => {
      const t = (i / 14) * Math.PI * 2;
      return boxAt(0.05, 6.4, 0.05, 'ivoryShade', Math.sin(t) * 0.55, 2.45, Math.cos(t) * 0.55);
    }),
    translate(cyl(0.65, 0.65, 0.2, 'coral', 14), 0, 2.3, 0),
    translate(cyl(0.55, 0.75, 0.3, c, 14), 0, 8.7, 0),
    boxAt(0.9, 0.5, 0.04, 'butterDeep', 0, 1.4, 0.81),
  ];
  const farStatue = merge(cyl(0.38, 0.26, 1.6, bronze, 5), translate(sphere(0.22, bronze, 5, 3), 0, 1.75, 0));
  return merge(always, lod(near, [shaft(6), translate(cyl(0.55, 0.75, 0.3, c, 6), 0, 8.7, 0), translate(farStatue, 0, 9.4, 0)]));
}
