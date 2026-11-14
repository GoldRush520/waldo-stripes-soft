/**
 * Shared helpers for the civic library: LOD pairing, side-view strips that follow a deck profile,
 * segment-aligned boxes and striped cone roofs.
 */
import * as THREE from 'three';
import {
  type Col,
  type Geo,
  box,
  detail,
  disc,
  farOnly,
  fromThree,
  merge,
  profile,
  rotateX,
  rotateY,
  rotateZ,
  tintable,
  translate,
} from '../../core/geo';

export type P2 = readonly [number, number];
export type P3 = readonly [number, number, number];

/** One sample of a walkable height profile: `t` runs 0..1 along the length, `y` is the surface height. */
export interface DeckPoint {
  readonly t: number;
  readonly y: number;
}

/** Axis-aligned ground rectangle in prop space. */
export interface Rect {
  readonly x0: number;
  readonly z0: number;
  readonly x1: number;
  readonly z1: number;
}

/** Walkable rectangle at a height. */
export interface Floor extends Rect {
  readonly y: number;
}

/** Near-only detail plus its far-only stand-in. */
export function lod(near: readonly Geo[], far: readonly Geo[]): Geo {
  return merge(detail(merge(near)), farOnly(merge(far)));
}

export function boxAt(w: number, h: number, d: number, c: Col, x: number, y: number, z: number): Geo {
  return translate(box(w, h, d, c), x, y, z);
}

/** Integers 0..n-1. */
export function range(n: number): number[] {
  return Array.from({ length: Math.max(0, Math.floor(n)) }, (_, i) => i);
}

/** n+1 evenly spaced values from a to b inclusive. */
export function steps(a: number, b: number, n: number): number[] {
  return Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
}

/** Box whose base runs along the xy segment (x0,y0)-(x1,y1), centred on depth z. */
export function segBox(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  h: number,
  d: number,
  c: Col,
  z = 0,
): Geo {
  const len = Math.max(0.01, Math.hypot(x1 - x0, y1 - y0));
  const ang = Math.atan2(y1 - y0, x1 - x0);
  return translate(rotateZ(box(len, h, d, c), ang), (x0 + x1) / 2, (y0 + y1) / 2, z);
}

/** Smooth hump profile: 0 at both ends, `rise` at mid-span, flat tangents at ends and crown. */
export function hump(rise: number): (t: number) => number {
  return (t) => (rise * (1 - Math.cos(2 * Math.PI * t))) / 2;
}

/** Ramp-up / flat / ramp-down profile reaching `h` after fraction `ramp` of the length. */
export function plateau(h: number, ramp: number): (t: number) => number {
  return (t) => {
    const e = Math.min(t, 1 - t) / Math.max(1e-4, ramp);
    const k = Math.min(1, e);
    return h * (k * k * (3 - 2 * k));
  };
}

export function sampleDeck(fn: (t: number) => number, n: number): DeckPoint[] {
  return steps(0, 1, n).map((t) => ({ t, y: fn(t) }));
}

/** Linear interpolation of a deck profile at t. */
export function deckY(deck: readonly DeckPoint[], t: number): number {
  for (let i = 0; i < deck.length - 1; i++) {
    const a = deck[i];
    const b = deck[i + 1];
    if (a && b && t >= a.t && t <= b.t) {
      const k = b.t > a.t ? (t - a.t) / (b.t - a.t) : 0;
      return a.y + (b.y - a.y) * k;
    }
  }
  return deck[deck.length - 1]?.y ?? 0;
}

/** Side-view band between lo(x) and hi(x) at sample xs, extruded `depth` along z and centred at z. */
export function strip(
  xs: readonly number[],
  lo: readonly number[],
  hi: readonly number[],
  depth: number,
  c: Col,
  z = 0,
): Geo {
  const top: P2[] = xs.map((x, i) => [x, hi[i] ?? 0]);
  const bottom: P2[] = xs.map((x, i): P2 => [x, lo[i] ?? 0]).reverse();
  return translate(profile(jitter([...top, ...bottom]), depth, c), 0, 0, z);
}

/**
 * Nudge every other outline point by 1 mm in y so runs of collinear samples cannot triangulate into
 * zero-area faces (which would get zero-length normals).
 */
export function jitter(points: readonly P2[]): P2[] {
  return points.map(([x, y], i): P2 => [x, i % 2 ? y + 0.001 : y]);
}

/** Deck sample x positions for a profile spanning `length` along x. */
export function deckXs(deck: readonly DeckPoint[], length: number): number[] {
  return deck.map((p) => (p.t - 0.5) * length);
}

/** Open cone sector (roof facet), apex up, resting on y = 0. */
export function coneWedge(r: number, h: number, c: Col, theta0: number, dTheta: number, seg = 1): Geo {
  const g = new THREE.ConeGeometry(r, h, seg, 1, true, theta0, dTheta);
  g.translate(0, h / 2, 0);
  return fromThree(g, c, true);
}

/**
 * Tented / conical roof with alternating stripes. `a` stripes are tintable; a downward ceiling disc
 * closes the underside.
 */
export function stripedCone(r: number, h: number, n: number, a: Col, b: Col, ceiling: Col = 'ivoryShade'): Geo {
  const d = (Math.PI * 2) / n;
  const facets = range(n).map((i) => {
    const w = coneWedge(r, h, i % 2 === 0 ? a : b, i * d, d);
    return i % 2 === 0 ? tintable(w) : w;
  });
  return merge(facets, translate(rotateX(disc(r * 0.98, ceiling, n), Math.PI), 0, 0.02, 0));
}

/** Run a builder made along +x so it runs along +z instead (rotation by -90 deg about y). */
export function alongZ(g: Geo): Geo {
  return rotateY(g, -Math.PI / 2);
}

/** Bounds-safe array read. */
export function at<T>(list: readonly T[], i: number, fallback: T): T {
  return list[i] ?? fallback;
}

/** Open cylinder with vertical stripes (one flat facet per stripe); `a` stripes are tintable. */
export function stripedCyl(r: number, h: number, n: number, a: Col, b: Col): Geo {
  const d = (Math.PI * 2) / n;
  return merge(
    range(n).map((i) => {
      const g = new THREE.CylinderGeometry(r, r, h, 1, 1, true, i * d, d);
      g.translate(0, h / 2, 0);
      const w = fromThree(g, i % 2 === 0 ? a : b, true);
      return i % 2 === 0 ? tintable(w) : w;
    }),
  );
}
