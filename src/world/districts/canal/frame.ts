/**
 * Canal frame: arc-length parametrisation of the canal centreline so the district can be authored
 * in "canal coordinates" (s = metres along the centreline from the harbour mouth northward,
 * d = metres across, positive toward the east bank). Banks are at d = ±CANAL_WIDTH / 2.
 */
import type { Kit } from '../../kit';
import { CANAL_CENTER, CANAL_WIDTH, type Pt, isLand } from '../../layout';

export const HALF = CANAL_WIDTH / 2;

interface Seg {
  readonly a: Pt;
  readonly tx: number;
  readonly tz: number;
  readonly len: number;
  readonly s0: number;
}

const SEGS: readonly Seg[] = (() => {
  const out: Seg[] = [];
  let s0 = 0;
  for (let i = 0; i < CANAL_CENTER.length - 1; i++) {
    const a = CANAL_CENTER[i] as Pt;
    const b = CANAL_CENTER[i + 1] as Pt;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    out.push({ a, tx: (b[0] - a[0]) / len, tz: (b[1] - a[1]) / len, len, s0 });
    s0 += len;
  }
  return out;
})();

/** Arc lengths of the centreline vertices (where the canal bends). */
export const VERTEX_S: readonly number[] = [...SEGS.map((g) => g.s0), (SEGS[SEGS.length - 1]?.s0 ?? 0) + (SEGS[SEGS.length - 1]?.len ?? 0)];

export interface CanalFrame {
  /** world point on the centreline */
  readonly wx: number;
  readonly wz: number;
  /** unit tangent pointing north (up-canal) */
  readonly tx: number;
  readonly tz: number;
  /** unit normal pointing to the east bank */
  readonly nx: number;
  readonly nz: number;
  /** rotation that maps a prop's local +x onto the east normal (bridges span along x) */
  readonly rot: number;
}

function segAt(s: number): Seg {
  for (const g of SEGS) if (s <= g.s0 + g.len) return g;
  return SEGS[SEGS.length - 1] as Seg;
}

export function frameAt(s: number): CanalFrame {
  const g = segAt(s);
  const u = s - g.s0;
  return {
    wx: g.a[0] + g.tx * u,
    wz: g.a[1] + g.tz * u,
    tx: g.tx,
    tz: g.tz,
    nx: -g.tz,
    nz: g.tx,
    rot: Math.atan2(-g.tx, -g.tz),
  };
}

/** Arc length at which the centreline reaches world z (the canal runs monotonically north). */
export function sAtZ(z: number): number {
  for (const g of SEGS) {
    const zEnd = g.a[1] + g.tz * g.len;
    if (z >= zEnd) return g.s0 + (z - g.a[1]) / g.tz;
  }
  const last = SEGS[SEGS.length - 1] as Seg;
  return last.s0 + last.len;
}

export interface Spot {
  readonly x: number;
  readonly z: number;
}

/** District-local point at canal coordinates (s along, d across, + = east). */
export function at(k: Kit, s: number, d: number): Spot {
  const f = frameAt(s);
  const [x, z] = k.local(f.wx + f.nx * d, f.wz + f.nz * d);
  return { x, z };
}

/** Heading (local) that faces the water from a bank point at signed offset d. */
export function faceWater(s: number, d: number): number {
  const f = frameAt(s);
  const sgn = d > 0 ? -1 : 1;
  return Math.atan2(f.nx * sgn, f.nz * sgn);
}

/** Heading that walks up-canal (north) or down-canal (south). */
export function alongHeading(s: number, north = true): number {
  const f = frameAt(s);
  return north ? Math.atan2(f.tx, f.tz) : Math.atan2(-f.tx, -f.tz);
}

/** Local polygon of a bank strip between offsets d0..d1 (same sign; d0 may follow s) and arc lengths s0..s1. */
export function strip(k: Kit, s0: number, s1: number, d0: number | ((s: number) => number), d1: number, step = 4): [number, number][] {
  const n = Math.max(1, Math.ceil((s1 - s0) / step));
  const outer: [number, number][] = [];
  const inner: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const s = s0 + ((s1 - s0) * i) / n;
    const a = at(k, s, typeof d0 === 'number' ? d0 : d0(s));
    const b = at(k, s, d1);
    inner.push([a.x, a.z]);
    outer.push([b.x, b.z]);
  }
  return [...inner, ...outer.reverse()];
}

/** Canal arc length at the north edge of the district (world z = -54). */
export const S_NORTH = sAtZ(-53.5);
/** Arc length where the bank land begins (quay line, world z = 38). */
export const S_SOUTH = sAtZ(37.5);

/** True when canal coordinates (s, d) lie on terrain land. */
export function landAt(s: number, d: number): boolean {
  const f = frameAt(s);
  return isLand(f.wx + f.nx * d, f.wz + f.nz * d);
}

const edges = new Map<string, number>();

/**
 * |d| of the terrain's real bank edge at s (normally HALF; the terrain outline can sit slightly
 * inland of the offset centreline near bends). Returns Infinity when there is no land within 3 m.
 */
export function edgeAt(sAt: number, side: -1 | 1): number {
  const s = Math.round(sAt * 4) / 4;
  const key = `${side}:${s}`;
  const hit = edges.get(key);
  if (hit !== undefined) return hit;
  let e = Infinity;
  for (let x = HALF - 0.05; x < HALF + 3; x += 0.05) {
    if (landAt(s, side * (x + 0.02))) {
      e = Math.max(HALF, x);
      break;
    }
  }
  edges.set(key, e);
  return e;
}

/** Bank point `e` metres inland of the real bank edge. */
export function bank(k: Kit, s: number, side: -1 | 1, e: number): Spot {
  return at(k, s, side * (edgeAt(s, side) + e));
}

/** First arc length (from the harbour end) where a bank is land across its full width. */
export function sStart(side: -1 | 1): number {
  for (let s = S_SOUTH; s < S_SOUTH + 12; s += 0.25) if (landAt(s, side * 11.3) && landAt(s, side * 5.6)) return s;
  return S_SOUTH + 12;
}
