/**
 * Roof shells in a canonical frame: ridge along x, length L (x) by span D (z), walls topping out
 * at y = H, front slope toward +z. Each builder returns the shell plus a surface-height function
 * (used to seat chimneys and dormers). Slopes are thin slabs; roof tiling is hinted by a few
 * near-only stepped bands.
 */
import { type Col, type Geo, detail, merge } from '../../core/geo';
import { HALF_PI, PI, type V2, bxc, cyx, fit, slab, unit } from './kit';
import { deepOf } from './colors';

export interface Canon {
  readonly L: number;
  readonly D: number;
  readonly H: number;
  readonly col: Col;
  readonly wall: Col;
  /** overhang beyond the -x / +x ends (0 at party walls) */
  readonly ohL: number;
  readonly ohR: number;
  /** eave overhang of the +z / -z slopes (0 where the slope meets a party wall) */
  readonly ohF: number;
  readonly ohB: number;
  readonly floorH: number;
}

export interface Shell {
  readonly geo: Geo;
  readonly top: number;
  readonly surface: (x: number, z: number) => number;
}

export const T = 0.12;
const PITCH = 0.62;

/** Unit triangular prism (span 1, height 1, length 1 along z), cached per colour. */
export function triPrism(col: Col, right = false): Geo {
  const pts: V2[] = right ? [[-0.5, 0], [0.5, 0], [0.5, 1]] : [[-0.5, 0], [0.5, 0], [0, 1]];
  return unit(right ? 'tri-r' : 'tri', col, () => slab(pts, 1, col));
}

interface SlopeArgs {
  readonly len: number;
  readonly cx: number;
  /** eave point (z, y) and the slope angle; dir = +1 slope rises toward -z, -1 toward +z */
  readonly z0: number;
  readonly y0: number;
  readonly a: number;
  readonly dir: 1 | -1;
  /** extent along the slope from the eave point: below (overhang) and above */
  readonly below: number;
  readonly above: number;
  readonly col: Col;
}

/** A slab lying on a slope plus near-only tiling bands. */
function slope(s: SlopeArgs): Geo {
  const c = Math.cos(s.a);
  const n = Math.sin(s.a);
  const at = (p: number, off: number): readonly [number, number, number] => [
    s.cx,
    s.y0 + p * n + off * c,
    s.z0 - s.dir * (p * c - off * n),
  ];
  const mid = (s.above - s.below) / 2;
  const body = bxc(s.len, T, s.above + s.below, s.col, at(mid, T / 2 + 0.01), s.dir * s.a);
  const deep = deepOf(s.col);
  const bands = [0.28, 0.52, 0.76].map((t) =>
    bxc(s.len, 0.04, 0.08, deep, at(-s.below + t * (s.above + s.below), T + 0.03), s.dir * s.a),
  );
  const eave = at(-s.below, 0);
  const gutter = s.below > 0.1 ? [cyx(0.06, s.len, 'slate', 5, [s.cx - s.len / 2, eave[1] - 0.04, eave[2]])] : [];
  return merge(body, detail(merge(bands, gutter)));
}

export function gableShell(c: Canon): Shell {
  const h = Math.min(3.2, Math.max(1.2, (c.D / 2) * PITCH * 1.25));
  const a = Math.atan2(h, c.D / 2);
  const run = Math.hypot(h, c.D / 2);
  const len = c.L + c.ohL + c.ohR;
  const cx = (c.ohR - c.ohL) / 2;
  const wedge = fit(triPrism(c.wall), [c.D, h, c.L], [0, c.H, 0], 0, HALF_PI);
  const slopes = ([1, -1] as const).map((dir) =>
    slope({ len, cx, z0: (dir * c.D) / 2, y0: c.H, a, dir, below: dir === 1 ? c.ohF : c.ohB, above: run + 0.06, col: c.col }),
  );
  const ridge = bxc(len, 0.16, 0.16, deepOf(c.col), [cx, c.H + h + T, 0], PI / 4);
  return {
    geo: merge(wedge, slopes, ridge),
    top: c.H + h + T + 0.12,
    surface: (_x, z) => c.H + T + h * Math.max(0, 1 - Math.abs(z) / (c.D / 2)),
  };
}

export function shedShell(c: Canon): Shell {
  const h = Math.min(2.2, Math.max(0.8, c.D * 0.28));
  const a = Math.atan2(h, c.D);
  const run = Math.hypot(h, c.D);
  const len = c.L + c.ohL + c.ohR;
  const cx = (c.ohR - c.ohL) / 2;
  const wedge = fit(triPrism(c.wall, true), [c.D, h, c.L], [0, c.H, 0], 0, HALF_PI);
  const body = slope({ len, cx, z0: c.D / 2, y0: c.H, a, dir: 1, below: c.ohF, above: run + Math.min(0.2, c.ohB), col: c.col });
  return {
    geo: merge(wedge, body),
    top: c.H + h + T + 0.1,
    surface: (_x, z) => c.H + T + h * Math.min(1, Math.max(0, (c.D / 2 - z) / c.D)),
  };
}

interface HipArgs {
  readonly L: number;
  readonly D: number;
  readonly cx: number;
  readonly base: number;
  readonly a: number;
  readonly col: Col;
}

/** Hip shell over an L x D rectangle (eaves at `base`), equal pitch `a` on all four sides. */
function hipPieces(p: HipArgs): { geo: Geo; rise: number } {
  const longX = p.L >= p.D;
  const Lx = longX ? p.L : p.D;
  const Dz = longX ? p.D : p.L;
  const rise = (Dz / 2) * Math.tan(p.a);
  const s = Math.hypot(rise, Dz / 2);
  const r = Math.max(0, Lx - Dz);
  const tilt = p.a - HALF_PI;
  const side: V2[] = r > 0.05 ? [[-Lx / 2, 0], [Lx / 2, 0], [r / 2, s], [-r / 2, s]] : [[-Lx / 2, 0], [Lx / 2, 0], [0, s]];
  const end: V2[] = [[-Dz / 2, 0], [Dz / 2, 0], [0, s]];
  const sideG = slab(side, T, p.col);
  const endG = slab(end, T, p.col);
  const parts = [
    fit(sideG, [1, 1, 1], [0, 0, Dz / 2], tilt, 0),
    fit(sideG, [1, 1, 1], [0, 0, -Dz / 2], tilt, PI),
    fit(endG, [1, 1, 1], [Lx / 2, 0, 0], tilt, HALF_PI),
    fit(endG, [1, 1, 1], [-Lx / 2, 0, 0], tilt, -HALF_PI),
  ];
  if (r > 0.1) parts.push(bxc(r + 0.1, 0.14, 0.14, deepOf(p.col), [0, rise + T * 0.6, 0], PI / 4));
  const local = merge(parts);
  return { geo: fit(local, [1, 1, 1], [p.cx, p.base, 0], 0, longX ? 0 : HALF_PI), rise };
}

export function hipShell(c: Canon): Shell {
  const oh = 0.3;
  const a = Math.atan(PITCH * 1.1);
  const Lp = c.L + c.ohL + c.ohR;
  const Dp = c.D + 2 * oh;
  const cx = (c.ohR - c.ohL) / 2;
  const base = c.H - oh * Math.tan(a) + 0.03;
  const { geo, rise } = hipPieces({ L: Lp, D: Dp, cx, base, a, col: c.col });
  const tan = Math.tan(a);
  return {
    geo,
    top: base + rise + T,
    surface: (x, z) => base + T + tan * Math.max(0, Math.min(Dp / 2 - Math.abs(z), Lp / 2 - Math.abs(x - cx))),
  };
}

function trapezoid(bottom: number, run: number, s: number, cutL: boolean, cutR: boolean): V2[] {
  const l = cutL ? 0 : run;
  const r = cutR ? 0 : run;
  return [[-bottom / 2, 0], [bottom / 2, 0], [bottom / 2 - r, s], [-bottom / 2 + l, s]];
}

/** Mansard: steep lower slopes enclosing an attic storey, shallow hip cap. */
export function mansardShell(c: Canon, partyL: boolean, partyR: boolean): Shell & { readonly m: number; readonly run: number; readonly Dp: number } {
  const oh = 0.12;
  const a1 = 1.25;
  const a2 = 0.36;
  const m = c.floorH * 0.92;
  const run = m / Math.tan(a1);
  const s1 = m / Math.sin(a1);
  const Lp = c.L + (partyL ? 0 : oh) + (partyR ? 0 : oh);
  const Dp = c.D + 2 * oh;
  const cx = ((partyR ? 0 : oh) - (partyL ? 0 : oh)) / 2;
  const base = c.H - 0.02;
  const tilt = a1 - HALF_PI;
  const front = slab(trapezoid(Lp, run, s1, partyL, partyR), T, c.col);
  const end = slab(trapezoid(Dp, run, s1, false, false), T, c.col);
  const runL = partyL ? 0 : run;
  const runR = partyR ? 0 : run;
  const parts = [
    fit(front, [1, 1, 1], [cx, base, Dp / 2], tilt, 0),
    fit(slab(trapezoid(Lp, run, s1, partyR, partyL), T, c.col), [1, 1, 1], [cx, base, -Dp / 2], tilt, PI),
    ...(partyR ? [] : [fit(end, [1, 1, 1], [cx + Lp / 2, base, 0], tilt, HALF_PI)]),
    ...(partyL ? [] : [fit(end, [1, 1, 1], [cx - Lp / 2, base, 0], tilt, -HALF_PI)]),
  ];
  const coreL = Lp - runL - runR;
  const coreCx = cx + (runL - runR) / 2;
  const core = bxc(coreL, m, Dp - 2 * run, c.wall, [coreCx, base + m / 2, 0]);
  const cap = hipPieces({ L: coreL + 0.16, D: Dp - 2 * run + 0.16, cx: coreCx, base: base + m - 0.02, a: a2, col: c.col });
  const tan1 = Math.tan(a1);
  const tan2 = Math.tan(a2);
  return {
    geo: merge(parts, core, cap.geo),
    top: base + m + cap.rise + T,
    m,
    run,
    Dp,
    surface: (x, z) => {
      const endDist = Lp / 2 - Math.abs(x - cx);
      const dist = Math.min(Dp / 2 - Math.abs(z), (x < cx ? partyL : partyR) ? Infinity : endDist);
      return base + T + Math.min(dist, run) * tan1 + Math.max(0, dist - run) * tan2;
    },
  };
}
