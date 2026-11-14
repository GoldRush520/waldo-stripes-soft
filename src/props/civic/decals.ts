/**
 * Paving decals (0.02 m raised pieces), the arcade / colonnade and the festival entrance arch.
 */
import { type Col, type Geo, box, cyl, disc, lathe, merge, prism, profile, quad, rotateY, sphere, sway, tintable, translate } from '../../core/geo';
import { archPlate } from './towers';
import { type P2, type Rect, boxAt, lod, range, segBox, steps, stripedCyl } from './util';

const T = 0.02;

/** Zebra crossing: stripes run along z (crossing direction), repeated across a road `width` along x. */
export function crosswalk(width: number, length = 3, c: Col = 'ivory'): Geo {
  const n = Math.max(2, Math.round(width / 0.9));
  const xs = range(n).map((i) => -width / 2 + ((i + 0.5) * width) / n);
  return lod(
    xs.map((x) => boxAt(0.5, T, length, c, x, 0, 0)),
    xs.map((x) => translate(quad(0.5, length, c), x, T, 0)),
  );
}

function flatRing(r0: number, r1: number, c: Col, seg: number): Geo {
  return lathe([[r1, 0], [r1, T], [r0, T]], c, seg);
}

/** Concentric paving rings (alternating colours) around a centre disc. */
export function plazaRings(r: number, rings = 3, a: Col = 'coralLight', b: Col = 'ivory'): Geo {
  const w = r / (rings + 0.5);
  const ring = (i: number, seg: number): Geo => flatRing(w * (i + 0.5), w * (i + 1.5) - 0.06, i % 2 ? b : a, seg);
  const centre = (seg: number): Geo => cyl(w * 0.5 - 0.04, w * 0.5 - 0.04, T, 'butter', seg, false);
  const spokes = range(16).map((k) =>
    rotateY(boxAt(0.04, 0.008, r - w * 0.5, 'clayDeep', 0, T, w * 0.25 + r / 2), (k / 16) * Math.PI * 2),
  );
  return lod(
    [...range(rings).map((i) => ring(i, 40)), centre(16), translate(disc(w * 0.5 - 0.05, 'butter', 16), 0, T, 0), ...spokes],
    [...range(rings).map((i) => ring(i, 12)), translate(disc(w * 0.5, 'butter', 8), 0, T, 0)],
  );
}

function starPoint(len: number, half: number, ang: number, c: Col, shade: Col): Geo {
  const left = prism([[0, 0], [-half, 0], [0, -len]], T, c);
  const right = prism([[0, 0], [0, -len], [half, 0]], T, shade);
  return rotateY(merge(left, right), ang);
}

/** Inlaid compass rose: eight-point star in a ring with tick marks. */
export function compassRose(r: number): Geo {
  const always = [
    translate(cyl(r, r, T * 0.5, 'clayLight', 16, false), 0, 0, 0),
    translate(disc(r, 'clayLight', 16), 0, T * 0.5, 0),
    ...range(8).map((k) =>
      translate(starPoint(k % 2 ? r * 0.55 : r * 0.82, r * 0.12, (k / 8) * Math.PI * 2, k % 2 ? 'ivory' : 'coral', k % 2 ? 'ivoryShade' : 'coralDeep'), 0, T * 0.5, 0),
    ),
  ];
  const ringNear = flatRing(r * 0.86, r * 0.95, 'blueDeep', 24);
  const ringFar = flatRing(r * 0.86, r * 0.95, 'blueDeep', 8);
  const ticks = range(32).map((k) => rotateY(boxAt(0.03, 0.01, r * 0.06, 'ivory', 0, T, r * 0.905), (k / 32) * Math.PI * 2));
  const letterN = [
    boxAt(0.05, 0.012, 0.3, 'ink', -0.1, T * 1.5, -r * 0.6),
    boxAt(0.05, 0.012, 0.3, 'ink', 0.1, T * 1.5, -r * 0.6),
    translate(rotateY(box(0.05, 0.012, 0.36, 'ink'), 0.55), 0, T * 1.5, -r * 0.6),
  ];
  return merge(always, lod([ringNear, ...ticks, ...letterN, translate(cyl(0.12, 0.12, 0.03, 'butter', 8), 0, T, 0)], [ringFar]));
}

/** Round manhole cover. */
export function manhole(r = 0.35): Geo {
  const bars = [-2, -1, 0, 1, 2].map((i) => boxAt(r * 1.5, 0.008, 0.04, 'ink', 0, T, i * r * 0.3));
  const cross = [-1, 0, 1].map((i) => boxAt(0.04, 0.008, r * 1.5, 'ink', i * r * 0.45, T, 0));
  return merge(cyl(r, r, T, 'slate', 8), lod([...bars, ...cross, lathe([[r, T], [r * 0.85, T + 0.008]], 'ink', 8)], []));
}

/* ------------------------------------------------------------------ arcade */

export interface ArcadeOpts {
  readonly bay?: number;
  readonly depth?: number;
  readonly height?: number;
  readonly color?: Col;
  readonly trim?: Col;
  /** tintable stripe colour on the frieze */
  readonly stripe?: Col;
}

export interface ArcadeResult {
  readonly geo: Geo;
  /** walkable covered walk */
  readonly walk: Rect;
  readonly length: number;
}

/** Arcaded colonnade along x: open arches on the +z front, back wall at -z, flat roof. */
export function arcade(bays: number, o: ArcadeOpts = {}): ArcadeResult {
  const bay = o.bay ?? 3;
  const D = o.depth ?? 3;
  const H = o.height ?? 4;
  const c = o.color ?? 'ivory';
  const trim = o.trim ?? 'clay';
  const L = bays * bay;
  const xs = range(bays).map((i) => -L / 2 + (i + 0.5) * bay);
  const always = [
    boxAt(L, H, 0.3, trim, 0, 0, -D / 2 + 0.15),
    boxAt(L + 0.3, 0.3, D + 0.3, c, 0, H, 0),
    ...xs.map((x, i) => (i % 2 ? boxAt(bay, 0.5, 0.06, o.stripe ?? 'ivory', x, H - 0.75, D / 2 + 0.02) : tintable(boxAt(bay, 0.5, 0.06, o.stripe ?? 'coral', x, H - 0.75, D / 2 + 0.02)))),
  ];
  const near = [
    ...steps(-L / 2, L / 2, bays).map((x) => merge(boxAt(0.62, 0.3, 0.62, 'stone', x, 0, D / 2 - 0.25), boxAt(0.66, 0.2, 0.66, trim, x, H - 1.25, D / 2 - 0.25))),
    ...xs.map((x) => translate(archPlate(bay, H, bay - 0.7, H - 0.9, 0.5, c), x, 0, D / 2 - 0.25)),
    ...xs.map((x) => boxAt(0.36, 0.5, 0.08, 'coral', x, H - 1.15, D / 2 + 0.02)),
    ...xs.map((x, i) => (i % 2 ? boxAt(1.0, 2.2, 0.06, 'timberDeep', x, 0, -D / 2 + 0.32) : boxAt(1.2, 1.3, 0.06, 'blueDeep', x, 0.9, -D / 2 + 0.32))),
    ...xs.map((x) => merge(boxAt(0.02, 0.6, 0.02, 'ink', x, H - 0.6, 0), translate(cyl(0.12, 0.16, 0.3, 'butterLight', 6), x, H - 0.9, 0))),
    boxAt(L + 0.4, 0.12, 0.12, trim, 0, H + 0.3, D / 2 + 0.12),
  ];
  const far = xs.map((x) => translate(archPlate(bay, H, bay - 0.7, H - 0.9, 0.5, c, 2), x, 0, D / 2 - 0.25));
  return { geo: merge(always, lod(near, far)), walk: { x0: -L / 2 + 0.2, z0: -D / 2 + 0.4, x1: L / 2 - 0.2, z1: D / 2 - 0.6 }, length: L };
}

/* ------------------------------------------------------------------ festival arch */

export function festivalArch(width = 6, height = 5, a: Col = 'coral', b: Col = 'ivory'): Geo {
  const half = width / 2;
  const banner: P2[] = [
    ...steps(-half - 0.3, half + 0.3, 8).map((x): P2 => [x, height + 0.9 * (1 - (x / (half + 0.3)) ** 2)]),
    ...steps(half + 0.3, -half - 0.3, 8).map((x): P2 => [x, height - 0.9 + 0.9 * (1 - (x / (half + 0.3)) ** 2)]),
  ];
  const pillar = (x: number): Geo =>
    merge(boxAt(1.0, 0.5, 1.0, 'stone', x, 0, 0), translate(stripedCyl(0.4, height - 0.5, 12, a, b), x, 0.5, 0));
  const capital = (x: number, seg: number): Geo => translate(cyl(0.48, 0.48, 0.2, 'butter', seg), x, height - 0.2, 0);
  const bulbs = steps(-half, half, 12).map((x) =>
    translate(sphere(0.06, 'butterLight', 5, 3), x, height + 0.95 * (1 - (x / (half + 0.3)) ** 2) + 0.02, 0.05),
  );
  const always = [pillar(-half), pillar(half), tintable(profile(banner, 0.25, a))];
  const pennants = steps(-half + 0.4, half - 0.4, 10).map((x, i) => {
    const y = height - 1.1 + 0.6 * (1 - (x / half) ** 2) - 0.25;
    const tri = profile([[-0.15, 0.25], [0.15, 0.25], [0, -0.1]], 0.02, i % 3 === 0 ? 'butter' : i % 3 === 1 ? 'blue' : 'sage');
    return sway(translate(tri, x, y, 0.2), 0.6);
  });
  const near = [
    capital(-half, 10),
    capital(half, 10),
    ...bulbs,
    ...range(9).map((i) => boxAt(0.3, 0.42, 0.04, 'ivory', (i - 4) * 0.45, height + 0.15 + 0.9 * (1 - (((i - 4) * 0.45) / (half + 0.3)) ** 2) - 0.6, 0.14)),
    ...pennants,
    ...steps(-half + 0.4, half - 0.4, 10).slice(0, -1).map((x, i, all) => {
      const x1 = all[i + 1] ?? x + 0.7;
      const y = (v: number): number => height - 0.85 + 0.6 * (1 - (v / half) ** 2);
      return segBox(x, y(x), x1, y(x1), 0.015, 0.015, 'cocoa', 0.2);
    }),
    ...[-half, half].map((x) => merge(boxAt(0.04, 1.4, 0.04, 'cocoa', x, height, 0), sway(tintable(boxAt(0.6, 0.35, 0.02, a, x + 0.32, height + 0.95, 0)), 0.8))),
  ];
  return merge(always, lod(near, [capital(-half, 5), capital(half, 5)]));
}
