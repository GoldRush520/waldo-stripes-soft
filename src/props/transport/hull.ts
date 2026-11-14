/**
 * Lofted boat hulls. y = 0 is the waterline, the bow points +z, the stern sits at z = -length/2.
 *
 * A hull is lofted through cross-section stations from stern (t = 0) to bow (t = 1). The outer
 * skin is split into colour bands (antifouling bottom, tintable topsides, contrasting gunwale
 * trim); an inner skin, a top rim, a transom and a stem close it into a real open shell. Decked
 * hulls simply raise the inner floor to deck height so the inner skin becomes deck + bulwarks.
 */
import { type Col, type Geo, merge, tintable } from '../../core/geo';
import { type Q, type V3, UP, mesh } from './kit';

export interface HullSpec {
  readonly length: number;
  readonly beam: number;
  /** keel depth below the waterline amidships (positive) */
  readonly draft: number;
  /** sheer height above the waterline amidships */
  readonly freeboard: number;
  readonly bowRise?: number;
  readonly sternRise?: number;
  /** stern half-width as a fraction of the beam (0 = double-ended) */
  readonly transom?: number;
  /** fraction of the length over which the bow tapers */
  readonly bowLen?: number;
  readonly bowPow?: number;
  readonly shell?: number;
  /** inner floor (or deck) height */
  readonly floor?: number;
  /** section fullness exponent: 2 = round bilge, 4+ = flat-bottomed barge */
  readonly round?: number;
  readonly trimH?: number;
  readonly hullCol?: Col;
  readonly trimCol?: Col;
  readonly bottomCol?: Col;
  readonly innerCol?: Col;
  readonly floorCol?: Col;
  /** topsides take the placement tint (default true) */
  readonly tint?: boolean;
}

interface Station {
  readonly z: number;
  readonly w: number;
  readonly top: number;
  readonly d: number;
  readonly floorY: number;
}

const NEAR_T = [0, 0.1, 0.25, 0.42, 0.58, 0.72, 0.84, 0.93, 1];
const FAR_T = [0, 0.4, 0.75, 0.92, 1];
const BAND_A = 0.85;
const BAND_B = 0.5;

function taper(s: HullSpec, t: number): { f: number; bow: number; stern: number } {
  const bowLen = s.bowLen ?? 0.45;
  const sternLen = 0.3;
  const t0 = 1 - bowLen;
  if (t > t0) {
    const u = (t - t0) / bowLen;
    return { f: 1 - Math.pow(u, s.bowPow ?? 1.8), bow: u * u, stern: 0 };
  }
  if (t < sternLen) {
    const u = (sternLen - t) / sternLen;
    return { f: 1 - (1 - (s.transom ?? 0.6)) * u * u, bow: 0, stern: u * u };
  }
  return { f: 1, bow: 0, stern: 0 };
}

export function station(s: HullSpec, t: number): Station {
  const { f, bow, stern } = taper(s, t);
  const w = Math.max(s.beam * 0.02, (s.beam / 2) * f);
  const top = s.freeboard + (s.bowRise ?? 0.1) * bow + (s.sternRise ?? 0.04) * stern;
  const d = s.draft * (0.3 + 0.7 * f);
  const shell = s.shell ?? 0.05;
  const floorY = Math.min(top - 0.04, Math.max(s.floor ?? -s.draft * 0.4, -d + shell * 1.2));
  return { z: (t - 0.5) * s.length, w, top, d, floorY };
}

function g(v: number, n: number): number {
  const c = Math.min(1, Math.max(0, v));
  return Math.pow(1 - Math.pow(1 - c, n), 1 / n);
}

function outerX(s: HullSpec, st: Station, y: number): number {
  return st.w * g((y + st.d) / (st.top + st.d), s.round ?? 2.2);
}

function outerPt(s: HullSpec, st: Station, sigma: number): V3 {
  const span = st.top + st.d;
  const vb = Math.min(0.9, st.d / span);
  const vt = Math.max(vb + 0.02, 1 - (s.trimH ?? Math.min(0.12, s.freeboard * 0.22)) / span);
  const a = Math.abs(sigma);
  let v: number;
  if (a <= BAND_B) v = (a / BAND_B) * vb;
  else if (a <= BAND_A) v = vb + ((a - BAND_B) / (BAND_A - BAND_B)) * (vt - vb);
  else v = vt + ((a - BAND_A) / (1 - BAND_A)) * (1 - vt);
  const y = -st.d + v * span;
  return [Math.sign(sigma) * st.w * g(v, s.round ?? 2.2), y, st.z];
}

function innerPt(s: HullSpec, st: Station, sigma: number): V3 {
  const shell = s.shell ?? 0.05;
  const vi = Math.pow(Math.abs(sigma), 3);
  const y = st.floorY + vi * (st.top - st.floorY);
  const x = Math.max(0.004, Math.min((st.w - shell) * g(vi, 5), outerX(s, st, y) - shell));
  return [Math.sign(sigma) * (vi === 0 ? 0 : x), y, st.z];
}

interface Band {
  readonly from: number;
  readonly to: number;
  readonly n: number;
  readonly kind: 'trim' | 'side' | 'bottom';
}

function bands(q: Q): Band[] {
  const side = q.far ? 1 : 2;
  const bottom = q.far ? 2 : 4;
  return [
    { from: -1, to: -BAND_A, n: 1, kind: 'trim' },
    { from: -BAND_A, to: -BAND_B, n: side, kind: 'side' },
    { from: -BAND_B, to: BAND_B, n: bottom, kind: 'bottom' },
    { from: BAND_B, to: BAND_A, n: side, kind: 'side' },
    { from: BAND_A, to: 1, n: 1, kind: 'trim' },
  ];
}

function samples(b: Band): number[] {
  return Array.from({ length: b.n + 1 }, (_, i) => b.from + ((b.to - b.from) * i) / b.n);
}

function allSigmas(q: Q): number[] {
  const out: number[] = [];
  bands(q).forEach((b, i) => samples(b).forEach((v, j) => (i > 0 && j === 0 ? undefined : out.push(v))));
  return out;
}

/** A complete open (or decked) hull shell. */
export function hull(q: Q, s: HullSpec): Geo {
  const sts = (q.far ? FAR_T : NEAR_T).map((t) => station(s, t));
  const hullCol = s.hullCol ?? 'coral';
  const outerCol = (k: Band['kind']): Col =>
    k === 'trim' ? (s.trimCol ?? 'ivory') : k === 'side' ? hullCol : (s.bottomCol ?? 'clayDeep');
  const outer = bands(q).map((b) => {
    const m = mesh(
      sts.map((st) => samples(b).map((sg) => outerPt(s, st, sg))),
      outerCol(b.kind),
      true,
    );
    return b.kind === 'side' && s.tint !== false ? tintable(m) : m;
  });
  const inner = bands(q).map((b) =>
    mesh(
      sts.map((st) => samples(b).map((sg) => innerPt(s, st, sg))),
      b.kind === 'bottom' ? (s.floorCol ?? 'timber') : (s.innerCol ?? 'ivoryShade'),
      false,
    ),
  );
  const rim = [-1, 1].map((side) =>
    mesh(
      sts.map((st) => [outerPt(s, st, side), innerPt(s, st, side)]),
      s.trimCol ?? 'ivory',
      UP,
    ),
  );
  const sig = allSigmas(q);
  const end = (st: Station, dir: number): Geo =>
    mesh(
      [sig.map((v) => outerPt(s, st, v)), sig.map((v) => innerPt(s, st, v))],
      outerCol('side'),
      () => [0, 0, dir],
    );
  const stern = sts[0];
  const bow = sts[sts.length - 1];
  const ends = stern && bow ? [end(stern, -1), end(bow, 1)] : [];
  const transom = ends[0] && s.tint !== false ? [tintable(ends[0])] : ends.slice(0, 1);
  return merge(outer, inner, rim, transom, ends.slice(1));
}

/** Half-width of the outer skin at prop-space z and height y. */
export function beamAt(s: HullSpec, z: number, y: number): number {
  const st = station(s, z / s.length + 0.5);
  return outerX(s, st, y);
}

/** Sheer (gunwale top) height at prop-space z. */
export function sheerAt(s: HullSpec, z: number): number {
  return station(s, z / s.length + 0.5).top;
}

/** Inner floor / deck height at prop-space z. */
export function floorAt(s: HullSpec, z: number): number {
  return station(s, z / s.length + 0.5).floorY;
}

/** Flat deck plate between two stations at height y, filling the inside of the hull. */
export function hullDeck(q: Q, s: HullSpec, t0: number, t1: number, y: number, col: Col): Geo {
  const n = q.far ? 2 : 5;
  const shell = s.shell ?? 0.05;
  const rows = Array.from({ length: n + 1 }, (_, i) => {
    const st = station(s, t0 + ((t1 - t0) * i) / n);
    const x = Math.max(0.01, outerX(s, st, y) - shell * 0.5);
    const p: V3[] = [
      [-x, y, st.z],
      [x, y, st.z],
    ];
    return p;
  });
  return mesh(rows, col, UP);
}
