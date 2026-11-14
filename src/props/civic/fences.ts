/**
 * Railings, balustrades, fences and gates. All run along x, centred on the origin, resting on y = 0.
 * Thin bars are near-only detail; the far tier gets one thin slab stand-in.
 */
import { type Col, type Geo, cyl, lathe, merge, profile, rotateY, translate } from '../../core/geo';
import { boxAt, lod, range, segBox, strip } from './util';

export interface RailOpts {
  readonly h?: number;
  readonly color?: Col;
  readonly post?: Col;
  /** spacing of bars / pickets / balusters */
  readonly spacing?: number;
}

function slots(length: number, spacing: number): number[] {
  const n = Math.max(1, Math.round(length / spacing));
  return range(n).map((i) => -length / 2 + ((i + 0.5) * length) / n);
}

function postXs(length: number, every: number): number[] {
  const n = Math.max(1, Math.ceil(length / every));
  return range(n + 1).map((i) => -length / 2 + (i * length) / n);
}

/** Wrought-iron railing: square bars, top and bottom rails, ball-topped posts. */
export function ironRailing(length: number, opts: RailOpts = {}): Geo {
  const h = opts.h ?? 1.0;
  const c = opts.color ?? 'blueDeep';
  const near = [
    boxAt(length, 0.05, 0.05, c, 0, h - 0.05, 0),
    boxAt(length, 0.04, 0.04, c, 0, 0.1, 0),
    ...slots(length, opts.spacing ?? 0.3).map((x) => boxAt(0.025, h - 0.1, 0.025, c, x, 0.05, 0)),
    ...postXs(length, 2).map((x) =>
      merge(boxAt(0.07, h, 0.07, c, x, 0, 0), boxAt(0.09, 0.09, 0.09, opts.post ?? 'butter', x, h, 0)),
    ),
  ];
  return lod(near, [boxAt(length, h * 0.85, 0.03, c, 0, 0.1, 0)]);
}

/** Stone balustrade: plinth, turned balusters and a coping rail. */
export function balustrade(length: number, opts: RailOpts = {}): Geo {
  const h = opts.h ?? 0.95;
  const c = opts.color ?? 'ivory';
  const baluster = lathe(
    [
      [0.06, 0],
      [0.045, 0.12],
      [0.075, h * 0.45],
      [0.04, h - 0.32],
      [0.06, h - 0.24],
    ],
    c,
    6,
  );
  const near = [
    boxAt(length, 0.16, 0.26, 'ivoryShade', 0, 0, 0),
    boxAt(length + 0.04, 0.1, 0.3, c, 0, h - 0.1, 0),
    ...slots(length, opts.spacing ?? 0.3).map((x) => translate(baluster, x, 0.16, 0)),
    ...postXs(length, 2.4).map((x) => boxAt(0.3, h - 0.1, 0.3, opts.post ?? 'ivoryShade', x, 0, 0)),
  ];
  return lod(near, [boxAt(length, h, 0.24, c, 0, 0, 0)]);
}

/** Timber post-and-rail fence. */
export function railFence(length: number, opts: RailOpts = {}): Geo {
  const h = opts.h ?? 1.1;
  const c = opts.color ?? 'timber';
  const posts = postXs(length, opts.spacing ?? 1.6);
  const near = [
    ...posts.map((x) => merge(boxAt(0.1, h, 0.1, opts.post ?? 'timberDeep', x, 0, 0), boxAt(0.12, 0.03, 0.12, c, x, h, 0))),
    boxAt(length, 0.08, 0.04, c, 0, h * 0.78, 0.06),
    boxAt(length, 0.08, 0.04, c, 0, h * 0.42, 0.06),
    ...posts.slice(0, -1).map((x, i) => {
      const x1 = posts[i + 1] ?? x;
      return segBox(x, h * 0.4, x1, h * 0.8, 0.05, 0.03, c, -0.06);
    }),
  ];
  return lod(near, [boxAt(length, h * 0.5, 0.04, c, 0, h * 0.4, 0)]);
}

/** White picket fence. */
export function picketFence(length: number, opts: RailOpts = {}): Geo {
  const h = opts.h ?? 0.95;
  const c = opts.color ?? 'ivory';
  const picket = profile([[-0.04, 0], [0.04, 0], [0.04, h - 0.1], [0, h], [-0.04, h - 0.1]], 0.02, c);
  const near = [
    boxAt(length, 0.06, 0.03, opts.post ?? 'ivoryShade', 0, h * 0.25, -0.03),
    boxAt(length, 0.06, 0.03, opts.post ?? 'ivoryShade', 0, h * 0.72, -0.03),
    ...slots(length, opts.spacing ?? 0.25).map((x) => translate(picket, x, 0, 0)),
  ];
  return lod(near, [boxAt(length, h * 0.9, 0.02, c, 0, 0, 0)]);
}

export interface GateOpts extends RailOpts {
  /** 0 = closed, 1 = fully open (leaves swing toward +z) */
  readonly open?: number;
}

/** Double iron gate between two stone piers. */
export function gate(width: number, opts: GateOpts = {}): Geo {
  const h = opts.h ?? 1.8;
  const c = opts.color ?? 'blueDeep';
  const leafW = width / 2;
  const swing = (opts.open ?? 0) * 1.3;
  const leaf = ironRailing(leafW - 0.04, { h, color: c, spacing: 0.16 });
  const left = translate(rotateY(translate(leaf, leafW / 2, 0, 0), swing), -width / 2, 0, 0);
  const right = translate(rotateY(translate(leaf, -leafW / 2, 0, 0), -swing), width / 2, 0, 0);
  const pier = (x: number): Geo =>
    merge(
      boxAt(0.42, h + 0.4, 0.42, opts.post ?? 'clay', x, 0, 0),
      boxAt(0.5, 0.1, 0.5, 'ivory', x, h + 0.4, 0),
      translate(cyl(0.12, 0.05, 0.3, 'butter', 6), x, h + 0.5, 0),
    );
  return merge(left, right, pier(-width / 2 - 0.21), pier(width / 2 + 0.21));
}

/**
 * Railing that follows a side-view profile (bridge parapet rail): posts at every sample, top and mid
 * rails per segment. `xs`/`ys` give the walking surface along x; the rail sits at depth z.
 */
export function profileRail(
  xs: readonly number[],
  ys: readonly number[],
  z: number,
  h: number,
  c: Col,
  every = 1,
): Geo {
  const segs = range(xs.length - 1);
  const near = [
    ...xs.filter((_, i) => i % every === 0).map((x, k) => boxAt(0.06, h, 0.06, c, x, ys[k * every] ?? 0, z)),
    ...segs.map((i) => segBox(xs[i] ?? 0, (ys[i] ?? 0) + h - 0.05, xs[i + 1] ?? 0, (ys[i + 1] ?? 0) + h - 0.05, 0.05, 0.06, c, z)),
    ...segs.map((i) => segBox(xs[i] ?? 0, (ys[i] ?? 0) + h * 0.45, xs[i + 1] ?? 0, (ys[i + 1] ?? 0) + h * 0.45, 0.03, 0.03, c, z)),
  ];
  const lo = ys.map((y) => y + h * 0.4);
  const hi = ys.map((y) => y + h);
  return lod(near, [strip(xs, lo, hi, 0.03, c, z)]);
}
