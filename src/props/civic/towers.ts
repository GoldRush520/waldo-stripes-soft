/** Tall landmarks, part 1: clock tower, lighthouse and campanile bell tower. */
import {
  type Col,
  type Geo,
  blob,
  cone,
  cyl,
  lathe,
  merge,
  place,
  profile,
  pyramid,
  shadeY,
  sphere,
  tintable,
  torus,
  translate,
} from '../../core/geo';
import { createRng } from '../../core/rng';
import { bell, clockFace } from './fixtures';
import { type P2, boxAt, lod, range, steps } from './util';

const SIDES = [0, Math.PI / 2, Math.PI, -Math.PI / 2];

/** Place `g` (built facing +z at distance d) on all four sides of a square tower. */
function fourSides(g: Geo, y: number, d: number): Geo[] {
  return SIDES.map((a) => place(g, Math.sin(a) * d, y, Math.cos(a) * d, a));
}

/** Corner quoin blocks up a square shaft of half-width hw. */
function quoins(hw: number, y0: number, y1: number, c: Col, c2: Col): Geo[] {
  const n = Math.round((y1 - y0) / 1.25);
  return [-1, 1].flatMap((sx) =>
    [-1, 1].flatMap((sz) =>
      range(n).map((i) => {
        const big = i % 2 === 0;
        return boxAt(big ? 0.5 : 0.36, 0.5, big ? 0.36 : 0.5, big ? c : c2, sx * hw, y0 + i * 1.25 + 0.3, sz * hw);
      }),
    ),
  );
}

/** Inverted-U wall plate with a round-headed opening, facing +z, base on y = 0. */
export function archPlate(w: number, h: number, ow: number, oh: number, depth: number, c: Col, seg = 8): Geo {
  const r = ow / 2;
  const spring = oh - r;
  const arc = steps(0, Math.PI, seg).map((t): P2 => [r * Math.cos(t), spring + r * Math.sin(t)]);
  return profile([[-w / 2, 0], [-r, 0], ...arc.reverse(), [r, 0], [w / 2, 0], [w / 2, h], [-w / 2, h]], depth, c);
}

/* ------------------------------------------------------------------ clock tower */

export interface ClockTowerOpts {
  readonly body?: Col;
  readonly trim?: Col;
  readonly roof?: Col;
  /** clock time shown, hours 0..12 */
  readonly hour?: number;
  readonly minute?: number;
}

export function clockTower(o: ClockTowerOpts = {}): Geo {
  const body = o.body ?? 'clay';
  const trim = o.trim ?? 'ivory';
  const roof = o.roof ?? 'coral';
  const window = merge(boxAt(0.55, 1.3, 0.08, 'blueDeep', 0, 0, 0), boxAt(0.75, 0.1, 0.16, trim, 0, -0.08, 0.02));
  const always = [
    boxAt(5.4, 1.0, 5.4, 'stone', 0, 0, 0),
    shadeY(boxAt(4.2, 15, 4.2, body, 0, 1, 0), 0.82, 1),
    ...[5, 10, 15.4].map((y) => boxAt(4.32, 0.35, 4.32, trim, 0, y, 0)),
    boxAt(4.8, 3.8, 4.8, trim, 0, 16, 0),
    boxAt(5.2, 0.35, 5.2, roof, 0, 19.8, 0),
    ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => boxAt(0.6, 2.6, 0.6, trim, sx * 2.1, 20.15, sz * 2.1))),
    boxAt(4.9, 0.4, 4.9, trim, 0, 22.75, 0),
    translate(tintable(pyramid(5.4, 3.2, 5.4, roof)), 0, 23.15, 0),
    ...fourSides(clockFace(1.5, o.hour ?? 10, o.minute ?? 10), 17.9, 2.4),
  ];
  const near = [
    ...quoins(2.1, 1, 15, 'ivoryShade', 'clayLight'),
    ...[3.2, 7, 11.5].flatMap((y) => fourSides(window, y, 2.12)),
    boxAt(1.2, 2.3, 0.1, 'timberDeep', 0, 1, 2.12),
    boxAt(1.5, 0.25, 0.2, trim, 0, 3.3, 2.15),
    translate(bell(0.75), 0, 22.6, 0),
    boxAt(4.0, 0.12, 0.12, 'timberDeep', 0, 22.6, 0),
    ...fourSides(boxAt(3.4, 0.08, 0.08, 'blueDeep', 0, 21.0, 0), 0, 2.15),
    ...fourSides(boxAt(3.4, 0.9, 0.04, 'blueDeep', 0, 20.15, 0), 0, 2.2),
    translate(sphere(0.25, 'butter', 8, 6), 0, 26.5, 0),
    boxAt(0.08, 1.0, 0.08, 'butterDeep', 0, 26.3, 0),
  ];
  return merge(always, lod(near, [boxAt(0.15, 0.9, 0.15, 'butterDeep', 0, 26.3, 0)]));
}

/* ------------------------------------------------------------------ lighthouse */

export interface LighthouseOpts {
  readonly a?: Col;
  readonly b?: Col;
  readonly seed?: number;
}

function rockBase(seed: number): Geo {
  const rng = createRng(seed);
  const rocks = range(12).map((i) => {
    const a = (i / 12) * Math.PI * 2 + rng.range(-0.2, 0.2);
    const r = rng.range(2.4, 3.3);
    const s = rng.range(0.7, 1.2);
    const g = blob(s * 1.2, s * 0.8, s, i % 3 === 0 ? 'stone' : 'clayDeep', 7, 5);
    return place(g, Math.sin(a) * r, s * 0.4, Math.cos(a) * r, a);
  });
  const mound = lathe([[3.9, -0.3], [3.6, 0.6], [2.6, 1.3], [0.1, 1.4]], 'clayDeep', 8);
  return lod(rocks, [mound]);
}

export function lighthouse(o: LighthouseOpts = {}): Geo {
  const a = o.a ?? 'coral';
  const b = o.b ?? 'ivory';
  const y0 = 1.4;
  const top = 16.5;
  const bandYs = steps(y0, top, 6);
  const rAt = (y: number): number => 1.6 - ((y - y0) / (top - y0)) * 0.55;
  const bands = (seg: number): Geo[] =>
    range(6).map((i) => {
      const ya = bandYs[i] ?? 0;
      const yb = bandYs[i + 1] ?? 0;
      return translate(cyl(rAt(ya), rAt(yb), yb - ya, i % 2 ? b : a, seg, false), 0, ya, 0);
    });
  const always = [
    translate(cyl(2.3, 2.2, 0.8, 'stone', 10), 0, 0.6, 0),
    translate(cyl(1.8, 1.8, 0.25, b, 10), 0, top, 0),
    translate(cyl(0.85, 0.85, 1.7, 'butterLight', 8), 0, top + 0.25, 0),
    translate(cyl(0.95, 0.95, 0.12, a, 8), 0, top + 1.95, 0),
    translate(cone(1.1, 1.1, a, 8), 0, top + 2.07, 0),
  ];
  const posts = range(14).map((i) => {
    const t = (i / 14) * Math.PI * 2;
    return boxAt(0.05, 0.95, 0.05, 'blueDeep', Math.sin(t) * 1.7, top + 0.25, Math.cos(t) * 1.7);
  });
  const mullions = range(8).map((i) => {
    const t = (i / 8) * Math.PI * 2;
    return boxAt(0.07, 1.7, 0.07, 'blueDeep', Math.sin(t) * 0.86, top + 0.25, Math.cos(t) * 0.86);
  });
  const windows = [5, 9, 13].map((y) => boxAt(0.4, 0.7, 0.1, 'blueDeep', 0, y, rAt(y) - 0.02));
  const near = [
    ...bands(16),
    ...posts,
    translate(torus(1.7, 0.035, 'blueDeep', 4, 20), 0, top + 1.2, 0),
    translate(torus(1.7, 0.025, 'blueDeep', 4, 20), 0, top + 0.7, 0),
    ...mullions,
    ...windows,
    boxAt(0.9, 1.9, 0.1, 'timberDeep', 0, y0, rAt(y0) - 0.02),
    translate(sphere(0.2, a, 8, 5), 0, top + 3.3, 0),
    boxAt(0.05, 0.6, 0.05, 'ink', 0, top + 3.4, 0),
    translate(lathe([[0.3, 0], [0.05, 0.45], [0.01, 0.5]], 'butter', 8), 0, top + 0.6, 0),
  ];
  const far = [...bands(8), translate(cyl(1.7, 1.7, 0.95, 'blueDeep', 8, false), 0, top + 0.25, 0)];
  return merge(rockBase(o.seed ?? 7), always, lod(near, far));
}

/* ------------------------------------------------------------------ bell tower */

export interface BellTowerOpts {
  readonly body?: Col;
  readonly stripe?: Col;
  readonly roof?: Col;
}

export function bellTower(o: BellTowerOpts = {}): Geo {
  const body = o.body ?? 'ivory';
  const stripe = o.stripe ?? 'coral';
  const roof = o.roof ?? 'coral';
  const shaftH = 10;
  const plate = archPlate(3.4, 3, 1.6, 2.4, 0.3, body);
  const always = [
    boxAt(3.8, 0.6, 3.8, 'stone', 0, 0, 0),
    shadeY(boxAt(3.2, shaftH, 3.2, body, 0, 0.6, 0), 0.85, 1),
    ...range(5).map((i) => boxAt(3.26, 0.45, 3.26, stripe, 0, 1.6 + i * 1.8, 0)),
    boxAt(3.6, 0.3, 3.6, stripe, 0, shaftH + 0.6, 0),
    ...fourSides(plate, shaftH + 0.9, 1.55),
    boxAt(3.7, 0.3, 3.7, body, 0, shaftH + 3.9, 0),
    translate(tintable(pyramid(3.9, 2.2, 3.9, roof)), 0, shaftH + 4.2, 0),
  ];
  const near = [
    translate(bell(0.6), 0, shaftH + 3.4, 0),
    boxAt(3.0, 0.1, 0.12, 'timberDeep', 0, shaftH + 3.45, 0),
    ...[3, 6.5].flatMap((y) => fourSides(boxAt(0.4, 1.0, 0.08, 'blueDeep', 0, y, 0), 0, 1.62)),
    boxAt(1.0, 2.1, 0.08, 'timberDeep', 0, 0.6, 1.62),
    ...fourSides(boxAt(1.7, 0.45, 0.06, 'blueDeep', 0, shaftH + 0.9, 0), 0, 1.6),
    ...quoins(1.6, 0.6, shaftH, 'ivoryShade', 'clayLight'),
    boxAt(0.07, 1.1, 0.07, 'butterDeep', 0, shaftH + 6.3, 0),
    boxAt(0.5, 0.07, 0.07, 'butterDeep', 0, shaftH + 6.9, 0),
  ];
  return merge(always, lod(near, [boxAt(0.14, 1.1, 0.14, 'butterDeep', 0, shaftH + 6.3, 0)]));
}
