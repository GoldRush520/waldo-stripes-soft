/**
 * Doors. Local frame: doorway centred on x = 0, street level y = 0, wall plane z = 0 (street +z).
 * Far tier: leaf block + step. Frames, panels, glazing bars and handles are near-only.
 */
import { type Col, type Geo, detail, merge, tube } from '../../core/geo';
import { PI, arc, bx, slab, unit } from './kit';
import { deepOf } from './colors';
import type { DoorKind } from './types';

export interface DoorOpts {
  readonly kind?: DoorKind;
  readonly w?: number;
  /** leaf height (arched: including the arch) */
  readonly h?: number;
  readonly col?: Col;
  readonly trim?: Col;
  /** stone step in front (raises the threshold 0.12 m) */
  readonly step?: boolean;
}

const STEP_H = 0.12;

function leafOf(kind: DoorKind, w: number, h: number, col: Col, y0: number): Geo {
  if (kind !== 'arched') return bx(w, h, 0.08, col, 0, y0, 0);
  const r = w / 2;
  const hr = h - r;
  const outline = [[-r, y0] as const, [r, y0] as const, ...arc([0, y0 + hr], r, 0, PI, 5)];
  return slab(outline, 0.08, col);
}

function frameOf(kind: DoorKind, w: number, h: number, trim: Col, y0: number): Geo[] {
  if (kind === 'arched') {
    const r = w / 2;
    const hr = h - r;
    const a = arc([0, y0 + hr], r + 0.05, 0, PI, 5).map(([x, y]) => [x, y, 0.03] as const);
    return [
      tube(a, 0.055, trim, 4),
      bx(0.1, hr, 0.12, trim, -(r + 0.05), y0, 0.02),
      bx(0.1, hr, 0.12, trim, r + 0.05, y0, 0.02),
    ];
  }
  return [
    bx(w + 0.24, 0.12, 0.13, trim, 0, y0 + h, 0.02),
    bx(0.1, h, 0.12, trim, -(w / 2 + 0.05), y0, 0.02),
    bx(0.1, h, 0.12, trim, w / 2 + 0.05, y0, 0.02),
  ];
}

function panelsOf(kind: DoorKind, w: number, h: number, col: Col, y0: number): Geo[] {
  const deep = deepOf(col);
  const leaves = kind === 'double' ? [-w / 4, w / 4] : [0];
  const lw = kind === 'double' ? w / 2 : w;
  return leaves.flatMap((cx) => {
    const hx = kind === 'double' ? cx - Math.sign(cx) * lw * 0.35 : lw * 0.35;
    const handle = bx(0.04, 0.12, 0.05, 'butterDeep', hx, y0 + 0.94, 0.06);
    if (kind === 'glazed' || kind === 'double') {
      const glassH = h * 0.42;
      return [
        bx(lw * 0.66, glassH, 0.02, 'blueDeep', cx, y0 + h * 0.5, 0.045),
        bx(0.03, glassH, 0.02, deep, cx, y0 + h * 0.5, 0.06),
        bx(lw * 0.62, h * 0.26, 0.02, deep, cx, y0 + h * 0.12, 0.045),
        handle,
      ];
    }
    return [
      ...[-1, 1].flatMap((s) => [
        bx(lw * 0.34, h * 0.3, 0.02, deep, cx + s * lw * 0.21, y0 + h * 0.1, 0.045),
        bx(lw * 0.34, h * 0.36, 0.02, deep, cx + s * lw * 0.21, y0 + h * 0.48, 0.045),
      ]),
      handle,
    ];
  });
}

/** A complete doorway: leaf, step, frame, panels or glazing, handle. */
export function doorUnit(opts: DoorOpts = {}): Geo {
  const kind = opts.kind ?? 'panelled';
  const w = opts.w ?? (kind === 'double' ? 1.5 : 0.95);
  const h = opts.h ?? (kind === 'arched' ? 2.4 : 2.1);
  const col = opts.col ?? 'sage';
  const trim = opts.trim ?? 'ivory';
  const step = opts.step ?? true;
  const key = `door:${kind}:${w.toFixed(2)}:${h.toFixed(2)}:${typeof trim === 'string' ? trim : trim.join(',')}:${step}`;
  return unit(key, col, () => {
    const y0 = step ? STEP_H : 0;
    const stepG = step ? [bx(w + 0.36, STEP_H, 0.42, 'stone', 0, 0, 0.17)] : [];
    const always = [leafOf(kind, w, h, col, y0), ...stepG];
    const near = [...frameOf(kind, w, h, trim, y0), ...panelsOf(kind, w, h, col, y0)];
    return merge(always, detail(merge(near)));
  });
}
