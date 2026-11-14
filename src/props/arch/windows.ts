/**
 * Window units. Local frame: opening centred on x = 0, sill top at y = 0, wall plane at z = 0
 * (wall behind, street toward +z). The far tier is only the recessed pane block (and shutter /
 * bay volumes); frames, sills, glazing bars, slats and window boxes are near-only detail.
 */
import { type Col, type Geo, detail, farOnly, merge, torus, translate } from '../../core/geo';
import type { Rng } from '../../core/rng';
import { windowBox } from './flowers';
import { HALF_PI, PI, arc, bx, cyz, fit, slab, unit } from './kit';
import { deepOf } from './colors';
import type { WindowStyle } from './types';

export interface WindowOpts {
  readonly w?: number;
  /** opening height (arched: including the arch) */
  readonly h?: number;
  readonly style?: WindowStyle;
  readonly trim?: Col;
  readonly pane?: Col;
  readonly shutters?: 'open' | 'closed' | false;
  readonly shutterCol?: Col;
  readonly windowBox?: boolean;
  readonly petal?: Col;
  /** frame-less: pane block + sill only (cheap back facades) */
  readonly simple?: boolean;
}

const PANE_D = 0.06;

function keyOf(...parts: ReadonlyArray<string | number | Col | boolean>): string {
  return parts.map((p) => (typeof p === 'object' ? p.join(',') : String(p))).join(':');
}

function squareCore(w: number, h: number, trim: Col, pane: Col, simple: boolean): Geo {
  const paneG = bx(w, h, PANE_D, pane, 0, 0, 0);
  if (simple) return paneG;
  const sill = bx(w + 0.22, 0.07, 0.16, trim, 0, -0.07, 0.06);
  const frame = [
    bx(w + 0.16, 0.08, 0.1, trim, 0, h, 0.02),
    bx(0.08, h, 0.1, trim, -(w / 2 + 0.04), 0, 0.02),
    bx(0.08, h, 0.1, trim, w / 2 + 0.04, 0, 0.02),
  ];
  const bars = [bx(0.035, h, 0.025, trim, 0, 0, 0.045), bx(w, 0.035, 0.025, trim, 0, h * 0.62, 0.045)];
  return merge(paneG, detail(merge(frame, sill, bars)));
}

function archCore(w: number, h: number, trim: Col, pane: Col): Geo {
  const r = w / 2;
  const hr = Math.max(0.2, h - r);
  const outline = [[-r, 0] as const, [r, 0] as const, ...arc([0, hr], r, 0, PI, 5)];
  const paneG = slab(outline, PANE_D, pane);
  // arch moulding: a crescent band (outer arc out, inner arc back) extruded as one slab
  const band = [...arc([0, hr], r + 0.09, 0, PI, 5), ...arc([0, hr], r, PI, 0, 5)];
  const frame = [
    translate(slab(band, 0.1, trim), 0, 0, 0.02),
    bx(0.08, hr, 0.1, trim, -(r + 0.04), 0, 0.02),
    bx(0.08, hr, 0.1, trim, r + 0.04, 0, 0.02),
    bx(w + 0.22, 0.07, 0.16, trim, 0, -0.07, 0.06),
    bx(w, 0.035, 0.025, trim, 0, hr, 0.045),
  ];
  return merge(paneG, detail(merge(frame)));
}

function roundCore(w: number, trim: Col, pane: Col): Geo {
  const r = w / 2;
  const paneFar = farOnly(cyz(r, PANE_D, pane, 6, [0, r, -PANE_D / 2]));
  const paneNear = cyz(r, PANE_D, pane, 12, [0, r, -PANE_D / 2]);
  const ring = fit(torus(1, 0.045 / (r + 0.03), trim, 3, 10), [r + 0.03, r + 0.03, r + 0.03], [0, r, 0.03], HALF_PI);
  const bars = [bx(0.03, w, 0.025, trim, 0, 0, 0.045), bx(w, 0.03, 0.025, trim, 0, r - 0.015, 0.045)];
  return merge(paneFar, detail(merge(paneNear, ring, bars)));
}

function bayCore(w: number, h: number, trim: Col, pane: Col): Geo {
  const bw = w + 0.5;
  const bd = 0.55;
  const body = [
    bx(bw, 0.32, bd, trim, 0, -0.32, bd / 2),
    bx(bw - 0.08, h, bd - 0.04, pane, 0, 0, (bd - 0.04) / 2),
    bx(bw + 0.12, 0.14, bd + 0.08, trim, 0, h, (bd + 0.08) / 2),
  ];
  const posts = [-1, -0.33, 0.33, 1].map((t) =>
    bx(0.07, h, 0.06, trim, t * (bw / 2 - 0.04), 0, bd - 0.03),
  );
  const sides = [-1, 1].map((s) => bx(0.06, h, 0.06, trim, s * (bw / 2 - 0.03), 0, bd / 2));
  const transom = bx(bw - 0.06, 0.05, 0.05, trim, 0, h * 0.7, bd - 0.02);
  return merge(body, detail(merge(posts, sides, transom)));
}

function core(style: WindowStyle, w: number, h: number, trim: Col, pane: Col, simple: boolean): Geo {
  const key = keyOf('win', style, w.toFixed(2), h.toFixed(2), trim, simple);
  return unit(key, pane, () => {
    if (simple) return squareCore(w, h, trim, pane, true);
    if (style === 'arched') return archCore(w, h, trim, pane);
    if (style === 'round') return roundCore(w, trim, pane);
    if (style === 'bay') return bayCore(w, h, trim, pane);
    return squareCore(w, h, trim, pane, false);
  });
}

/** Pair of shutters, open (flat against the wall beside the window) or closed (over the pane). */
export function shutterPair(w: number, h: number, col: Col, open: boolean): Geo {
  return unit(keyOf('shut', w.toFixed(2), h.toFixed(2), open), col, () => {
    const pw = w / 2;
    const xs = open ? [-(w / 2 + 0.11 + pw / 2), w / 2 + 0.11 + pw / 2] : [-pw / 2, pw / 2];
    const z = open ? 0.0 : 0.07;
    const deep = deepOf(col);
    const near = xs.flatMap((x) => [
      bx(pw - 0.01, h, 0.04, col, x, 0, z),
      bx(pw - 0.1, h * 0.5, 0.02, deep, x, h * 0.25, z + 0.025),
    ]);
    // far stand-in: one board behind (open) or over (closed) the pane
    const far = open ? bx(w * 2 + 0.22, h, 0.03, col, 0, 0, 0) : bx(w, h, 0.04, col, 0, 0, z);
    return merge(detail(merge(near)), farOnly(far));
  });
}

/** A complete window: pane recess, frame, sill, bars, optional shutters and window box. */
export function windowUnit(opts: WindowOpts, rng: Rng): Geo {
  const style = opts.style ?? 'square';
  const w = opts.w ?? 0.85;
  const h = opts.h ?? (style === 'arched' ? 1.6 : 1.35);
  const trim = opts.trim ?? 'ivory';
  const pane = opts.pane ?? 'blueDeep';
  const simple = opts.simple ?? false;
  const parts: Geo[] = [core(style, w, h, trim, pane, simple)];
  const shutters = opts.shutters ?? (style === 'shuttered' ? (rng.chance(0.75) ? 'open' : 'closed') : false);
  if (shutters && !simple && style !== 'round' && style !== 'bay') {
    parts.push(shutterPair(w, h, opts.shutterCol ?? 'sage', shutters === 'open'));
  }
  if (opts.windowBox && !simple && style !== 'round' && style !== 'bay') {
    parts.push(windowBoxAt(w, rng, opts.petal));
  }
  return merge(parts);
}

function windowBoxAt(w: number, rng: Rng, petal: Col | undefined): Geo {
  return translate(windowBox({ w: w + 0.1, petal }, rng), 0, 0, 0.06);
}
