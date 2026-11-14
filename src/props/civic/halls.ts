/**
 * Walk-through halls: open-sided market hall and the tram station hall (solid frame + separate glass).
 * Both run along x and return walkable metadata.
 */
import { type Col, type Geo, cone, cyl, gable, merge, profile, rotateX, rotateY, tintable, translate } from '../../core/geo';
import { clockFace, lampPost } from './fixtures';
import { type Floor, type P2, type P3, type Rect, alongZ, boxAt, lod, range, segBox, steps } from './util';

/* ------------------------------------------------------------------ market hall */

export interface MarketHallOpts {
  readonly length?: number;
  readonly depth?: number;
  /** tintable roof stripe colour */
  readonly a?: Col;
  readonly b?: Col;
  readonly frame?: Col;
}

export interface MarketHallResult {
  readonly geo: Geo;
  /** column centres [x, z] */
  readonly columns: readonly P2[];
  /** clear walkable interior between the column rows */
  readonly interior: Rect;
  readonly eaveY: number;
}

function stripedGableX(length: number, width: number, h: number, n: number, a: Col, b: Col): Geo {
  const slice = length / n;
  return merge(
    range(n).map((i) => {
      const g = translate(rotateY(gable(width, h, slice, i % 2 ? b : a), Math.PI / 2), -length / 2 + (i + 0.5) * slice, 0, 0);
      return i % 2 ? g : tintable(g);
    }),
  );
}

function column(h: number, c: Col): { near: Geo; far: Geo } {
  return {
    near: merge(boxAt(0.42, 0.3, 0.42, 'stone', 0, 0, 0), cyl(0.17, 0.14, h, c, 8), boxAt(0.4, 0.22, 0.4, c, 0, h - 0.22, 0)),
    far: boxAt(0.3, h, 0.3, c, 0, 0, 0),
  };
}

export function marketHall(o: MarketHallOpts = {}): MarketHallResult {
  const L = o.length ?? 26;
  const D = o.depth ?? 12;
  const frame = o.frame ?? 'ivory';
  const eave = 4.2;
  const n = Math.max(2, Math.round(L / 3.7));
  const xs = steps(-L / 2 + 0.4, L / 2 - 0.4, n);
  const zs = [D / 2 - 0.4, -(D / 2 - 0.4)];
  const columns: P2[] = zs.flatMap((z) => xs.map((x): P2 => [x, z]));
  const col = column(eave, frame);
  const always = [
    ...zs.map((z) => boxAt(L, 0.4, 0.32, frame, 0, eave, z)),
    ...[-1, 1].map((s) => boxAt(0.32, 0.4, D - 0.8, frame, s * (L / 2 - 0.4), eave, 0)),
    translate(stripedGableX(L + 1, D + 1.4, 2.8, 13, o.a ?? 'coral', o.b ?? 'ivory'), 0, eave + 0.4, 0),
  ];
  const trusses = xs.flatMap((x) => [
    boxAt(0.14, 0.18, D - 0.8, 'timberDeep', x, eave + 0.3, 0),
    boxAt(0.12, 2.3, 0.12, 'timberDeep', x, eave + 0.45, 0),
    translate(rotateY(segBox(-(D / 2 - 0.4), eave + 0.45, 0, eave + 2.7, 0.12, 0.12, 'timberDeep'), Math.PI / 2), x, 0, 0),
    translate(rotateY(segBox(0, eave + 2.7, D / 2 - 0.4, eave + 0.45, 0.12, 0.12, 'timberDeep'), Math.PI / 2), x, 0, 0),
  ]);
  const lamps = range(n).map((i) => {
    const x = ((xs[i] ?? 0) + (xs[i + 1] ?? 0)) / 2;
    return merge(boxAt(0.03, 1.0, 0.03, 'ink', x, eave - 0.4, 0), translate(rotateX(cone(0.3, 0.3, 'butter', 8), Math.PI), x, eave - 0.1, 0));
  });
  const sign = [boxAt(4.2, 0.8, 0.12, 'butter', 0, eave + 0.45, D / 2 + 0.75), ...range(6).map((i) => boxAt(0.36, 0.44, 0.06, 'coralDeep', -1.5 + i * 0.6, eave + 0.63, D / 2 + 0.82))];
  const near = [...columns.map(([x, z]) => translate(col.near, x, 0, z)), ...trusses, ...lamps, ...sign];
  const far = [...columns.map(([x, z]) => translate(col.far, x, 0, z)), boxAt(4.2, 0.8, 0.12, 'butter', 0, eave + 0.45, D / 2 + 0.75)];
  return {
    geo: merge(always, lod(near, far)),
    columns,
    interior: { x0: -L / 2 + 0.7, z0: -D / 2 + 0.7, x1: L / 2 - 0.7, z1: D / 2 - 0.7 },
    eaveY: eave,
  };
}

/* ------------------------------------------------------------------ station hall */

export interface StationResult {
  /** solid frame, platforms, canopies, clock (opaque) */
  readonly geo: Geo;
  /** roof glazing, register as material 'glass' */
  readonly glass: Geo;
  /** walkable platforms (top surface y) */
  readonly platforms: readonly Floor[];
  /** track centre lines z (tracks run along x at y = 0) */
  readonly trackZ: readonly number[];
  /** big clock face centre */
  readonly clock: P3;
}

const ST = { L: 34, D: 14, hallL: 22, spring: 5.5, rise: 4, platY: 0.3 } as const;

function arc(a: number, b: number, n: number): P2[] {
  return steps(0, Math.PI, n).map((t): P2 => [a * Math.cos(t), ST.spring + b * Math.sin(t)]);
}

/** Barrel rib in the zy plane at x. */
function rib(x: number, n: number, c: Col): Geo {
  const half = ST.D / 2;
  const outer = arc(half, ST.rise, n);
  const inner = arc(half - 0.35, ST.rise - 0.3, n).reverse();
  return translate(alongZ(profile([...outer, ...inner], 0.25, c)), x, 0, 0);
}

function platformCanopy(x: number, z: number, c: Col): Geo {
  const roof = merge(
    translate(rotateX(boxAt(5.6, 0.12, 1.5, c, 0, 0, 0.72), -0.14), 0, 0, 0),
    translate(rotateX(boxAt(5.6, 0.12, 1.5, 'ivory', 0, 0, -0.72), 0.14), 0, 0, 0),
  );
  const near = [
    ...[-1.8, 1.8].map((dx) => merge(boxAt(0.16, 3.2, 0.16, 'blueDeep', dx, 0, 0), segBox(dx - 0.7, 2.6, dx, 3.2, 0.08, 0.08, 'blueDeep'))),
    ...range(8).map((i) => boxAt(0.6, 0.18, 0.04, i % 2 ? 'ivory' : 'coral', -2.45 + i * 0.7, -0.05, 1.45)),
  ];
  const far = [-1.8, 1.8].map((dx) => boxAt(0.16, 3.2, 0.16, 'blueDeep', dx, 0, 0));
  return translate(merge(translate(tintable(roof), 0, 3.2, 0), lod(near, far)), x, ST.platY, z);
}

function stationFront(c: Col, trim: Col): Geo {
  const z = ST.D / 2 + 0.1;
  const top = ST.rise + 1.8;
  const front = profile([[-3.4, 0], [3.4, 0], [3.4, top - 1.4], [0, top], [-3.4, top - 1.4]], 0.6, c);
  return merge(
    translate(front, 0, ST.spring - 0.6, z),
    translate(clockFace(1.35, 4, 50, 'coral'), 0, ST.spring + 2.6, z + 0.3),
    boxAt(7.2, 0.35, 0.8, trim, 0, ST.spring - 0.6, z),
    boxAt(7.0, 0.6, 0.12, 'butter', 0, ST.spring - 0.25, z + 0.34),
  );
}

export function stationHall(c: Col = 'blueDeep', trim: Col = 'ivory'): StationResult {
  const half = ST.D / 2;
  const ribXs = steps(-ST.hallL / 2, ST.hallL / 2, 6);
  const platZ = [half - 2.4, -(half - 2.4)];
  const always = [
    ...platZ.map((z) => boxAt(ST.L, ST.platY, 2.8, 'stone', 0, 0, z)),
    ...ribXs.flatMap((x) => [-1, 1].map((s) => boxAt(0.4, ST.spring, 0.4, c, x, 0, s * (half - 0.2)))),
    ...[-1, 1].map((s) => boxAt(ST.hallL + 0.4, 0.4, 0.4, c, 0, ST.spring - 0.4, s * (half - 0.2))),
    boxAt(ST.hallL, 0.3, 0.3, c, 0, ST.spring + ST.rise - 0.1, 0),
    stationFront(trim, 'coral'),
    ...[-1, 1].flatMap((s) => platZ.map((z) => platformCanopy(s * (ST.hallL / 2 + 3), z, 'coral'))),
  ];
  const purlins = arc(half - 0.2, ST.rise - 0.15, 8)
    .slice(1, -1)
    .map(([z, y]) => boxAt(ST.hallL, 0.12, 0.12, c, 0, y, z));
  const near = [
    ...ribXs.map((x) => rib(x, 14, c)),
    ...purlins,
    ...platZ.flatMap((z) => [-1, 1].map((s) => boxAt(ST.L, 0.04, 0.3, 'butter', 0, ST.platY, z - s * 1.25))),
    ...ribXs.flatMap((x) => [-1, 1].map((s) => boxAt(0.6, 0.3, 0.6, trim, x, 0, s * (half - 0.2)))),
    ...[-1, 1].flatMap((s) => platZ.map((z) => translate(lampPost(3.4), s * (ST.L / 2 - 0.6), ST.platY, z))),
  ];
  const far = ribXs.map((x) => rib(x, 6, c));
  return {
    geo: merge(always, lod(near, far)),
    glass: stationGlass(),
    platforms: platZ.map((z) => ({ x0: -ST.L / 2, x1: ST.L / 2, z0: z - 1.4, z1: z + 1.4, y: ST.platY })),
    trackZ: [-1.6, 1.6],
    clock: [0, ST.spring + 2.6, half + 0.4],
  };
}

function stationGlass(): Geo {
  const half = ST.D / 2;
  const pts = arc(half - 0.15, ST.rise - 0.1, 8);
  const bayW = ST.hallL / 6;
  const pane = (i: number, len: number, x: number): Geo => {
    const [z0, y0] = pts[i] ?? [0, 0];
    const [z1, y1] = pts[i + 1] ?? [0, 0];
    return translate(alongZ(segBox(z0, y0, z1, y1, 0.04, len, 'blueLight')), x, 0, 0);
  };
  const end = (n: number, s: number): Geo =>
    translate(alongZ(profile(arc(half - 0.3, ST.rise - 0.35, n), 0.05, 'blueLight')), s * (ST.hallL / 2), 0, 0);
  const near = [
    ...range(6).flatMap((b) => range(8).map((i) => pane(i, bayW - 0.25, -ST.hallL / 2 + (b + 0.5) * bayW))),
    end(12, -1),
    end(12, 1),
  ];
  const far = [...range(8).map((i) => pane(i, ST.hallL, 0)), end(6, -1), end(6, 1)];
  return lod(near, far);
}
