/**
 * Parametric festival lines strung between two 3D points: bunting, string lights, paper lanterns,
 * a street banner and a laundry line. Each returns the geometry plus the sagging curve it follows.
 */
import {
  type Geo,
  beam,
  blob,
  box,
  cone,
  cyl,
  detail,
  merge,
  rotateX,
  rotateY,
  scale,
  sphere,
  sway,
  tintable,
  translate,
} from '../../core/geo';
import type { ColorName } from '../../core/palette';
import { createRng } from '../../core/rng';
import { type V3, clamp01, lerp3, memo, sagCurve, yawAlong } from './kit';

export interface LineResult {
  readonly geo: Geo;
  /** the line's polyline: first point = a, last point = b, sagging in between */
  readonly curve: readonly V3[];
}

export interface LineOptions {
  /** mid-span dip in metres (default: 4 % of the span plus 0.15) */
  readonly sag?: number;
  readonly seed?: number | string;
}

export interface BuntingOptions extends LineOptions {
  /** pennant pitch along the line (default 0.38 m) */
  readonly spacing?: number;
  readonly colors?: readonly ColorName[];
}

const BUNTING_COLORS: readonly ColorName[] = ['coral', 'butter', 'blue', 'sage', 'ivory'];

function span(a: V3, b: V3): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
}

function defaultSag(a: V3, b: V3, opts: LineOptions): number {
  return opts.sag ?? span(a, b) * 0.04 + 0.15;
}

/** Point on the sagging line at parameter t (same curve as `sagCurve`). */
function at(a: V3, b: V3, sag: number, t: number): V3 {
  const p = lerp3(a, b, t);
  return [p[0], p[1] - sag * 4 * t * (1 - t), p[2]];
}

/** The rope itself: near-only straight segments through the curve. */
function rope(curve: readonly V3[], color: ColorName = 'ivoryDeep', thick = 0.016): Geo {
  const segs: Geo[] = [];
  for (let i = 0; i < curve.length - 1; i++) {
    const p = curve[i];
    const q = curve[i + 1];
    if (p && q) segs.push(beam(p, q, thick, color));
  }
  return detail(merge(segs));
}

function lineCurve(a: V3, b: V3, sag: number): V3[] {
  return sagCurve(a, b, sag, Math.max(4, Math.ceil(span(a, b) / 0.8)));
}

/** Pennant template: ~6 triangles, top edge at y = 0, tip hanging below; sway grows toward the tip. */
function pennant(color: ColorName): Geo {
  return memo(`pennant.${color}`, () => {
    const g = scale(rotateX(cone(0.12, 0.24, color, 3), Math.PI), 1, 1, 0.12);
    return sway(g, (_x, y) => clamp01(-y / 0.24) * 0.9);
  });
}

/** Festival bunting: sagging line with alternating palette pennants. */
export function bunting(a: V3, b: V3, opts: BuntingOptions = {}): LineResult {
  const sag = defaultSag(a, b, opts);
  const curve = lineCurve(a, b, sag);
  const colors = opts.colors ?? BUNTING_COLORS;
  const yaw = yawAlong(a, b);
  const n = Math.max(1, Math.floor(span(a, b) / (opts.spacing ?? 0.38)) - 1);
  const flags = Array.from({ length: n }, (_, i) => {
    const p = at(a, b, sag, (i + 1) / (n + 1));
    return translate(rotateY(pennant(colors[i % colors.length] ?? 'coral'), yaw), p[0], p[1] - 0.01, p[2]);
  });
  return { geo: merge(rope(curve), flags), curve };
}

/** String of festoon bulbs (bulbs are always drawn, the cord is near-only). */
export function stringLights(a: V3, b: V3, opts: LineOptions & { readonly spacing?: number } = {}): LineResult {
  const sag = defaultSag(a, b, opts);
  const curve = lineCurve(a, b, sag);
  const n = Math.max(1, Math.floor(span(a, b) / (opts.spacing ?? 0.5)) - 1);
  const colors: readonly ColorName[] = ['butterLight', 'butterLight', 'coralLight', 'blueLight'];
  const bulbs = Array.from({ length: n }, (_, i) => {
    const p = at(a, b, sag, (i + 1) / (n + 1));
    const bulb = memo(`bulb.${i % 4}`, () => sphere(0.045, colors[i % 4] ?? 'butterLight', 4, 2));
    return translate(bulb, p[0], p[1] - 0.06, p[2]);
  });
  const sockets = detail(merge(bulbs.map((_b, i) => {
    const p = at(a, b, sag, (i + 1) / (n + 1));
    return translate(cyl(0.015, 0.015, 0.03, 'ink', 4), p[0], p[1] - 0.025, p[2]);
  })));
  return { geo: merge(rope(curve, 'ink', 0.012), bulbs, sockets), curve };
}

/** Paper lanterns hanging from a sagging cord (swaying). */
export function lanternString(a: V3, b: V3, opts: LineOptions & { readonly spacing?: number } = {}): LineResult {
  const sag = defaultSag(a, b, opts);
  const curve = lineCurve(a, b, sag);
  const n = Math.max(1, Math.floor(span(a, b) / (opts.spacing ?? 0.9)) - 1);
  const colors: readonly ColorName[] = ['coral', 'butter', 'ivory', 'blue'];
  const lanterns = Array.from({ length: n }, (_, i) => {
    const p = at(a, b, sag, (i + 1) / (n + 1));
    const c = colors[i % colors.length] ?? 'coral';
    const tpl = memo(`lantern.${c}`, () => {
      const body = translate(blob(0.13, 0.16, 0.13, c, 6, 3), 0, -0.26, 0);
      const caps = detail(merge([-0.11, -0.41].map((y) => translate(cyl(0.06, 0.06, 0.03, 'ink', 5), 0, y, 0)), beam([0, 0, 0], [0, -0.1, 0], 0.01, 'ink')));
      const tassel = detail(translate(cone(0.025, 0.08, 'coralDeep', 4), 0, -0.5, 0));
      return sway(merge(body, caps, tassel), (_x, y) => clamp01(-y / 0.5) * 0.5);
    });
    return translate(tpl, p[0], p[1], p[2]);
  });
  return { geo: merge(rope(curve, 'ink', 0.012), lanterns), curve };
}

export interface BannerOptions extends LineOptions {
  /** cloth width (default half the span, max 5 m) and height */
  readonly width?: number;
  readonly height?: number;
  readonly tint?: ColorName;
}

/** Cloth banner slung across a street on two ropes; tint-masked field, ivory border, lettering blocks. */
export function banner(a: V3, b: V3, opts: BannerOptions = {}): LineResult {
  const len = span(a, b);
  const w = opts.width ?? Math.min(5, len * 0.5);
  const h = opts.height ?? 0.9;
  const sag = opts.sag ?? 0.35;
  const mid = at(a, b, 0, 0.5);
  const top = mid[1] - sag;
  const yaw = yawAlong(a, b);
  const t0 = 0.5 - w / (2 * len);
  const left = lerp3(a, b, t0);
  const right = lerp3(a, b, 1 - t0);
  const leftTop: V3 = [left[0], top, left[2]];
  const rightTop: V3 = [right[0], top, right[2]];
  const field = tintable(translate(box(w, h, 0.03, opts.tint ?? 'coral'), 0, -h, 0));
  const border = merge(translate(box(w + 0.04, 0.08, 0.035, 'ivory'), 0, -0.08, 0), translate(box(w + 0.04, 0.08, 0.035, 'ivory'), 0, -h, 0));
  const letters = detail(merge(Array.from({ length: 7 }, (_, i) => translate(box(w * 0.08, h * 0.38, 0.04, i % 3 === 1 ? 'butter' : 'ivory'), (i - 3) * w * 0.12, -h * 0.72, 0))));
  const cloth = sway(merge(field, border, letters), (_x, y) => clamp01(-y / h) * 0.5);
  const placed = translate(rotateY(cloth, yaw), mid[0], top, mid[2]);
  const ropes = merge(rope(sagCurve(a, leftTop, 0.08, 4)), rope(sagCurve(rightTop, b, 0.08, 4)));
  return { geo: merge(placed, ropes), curve: [a, leftTop, rightTop, b] };
}

export interface LaundryOptions extends LineOptions {
  readonly seed?: number | string;
}

type Garment = 'shirt' | 'sheet' | 'socks' | 'trousers';

const GARMENT_W: Readonly<Record<Garment, number>> = { shirt: 0.6, sheet: 1.0, socks: 0.24, trousers: 0.46 };

function garment(kind: Garment, color: ColorName): Geo {
  return memo(`laundry.${kind}.${color}`, () => {
    const peg = (x: number): Geo => detail(translate(box(0.02, 0.07, 0.03, 'timber'), x, -0.04, 0));
    const tint = (g: Geo): Geo => (color === 'ivory' ? g : tintable(g));
    let g: Geo;
    if (kind === 'shirt') {
      g = merge(tint(translate(box(0.4, 0.55, 0.03, color), 0, -0.58, 0)), tint(translate(box(0.56, 0.18, 0.03, color), 0, -0.2, 0)), peg(-0.15), peg(0.15));
    } else if (kind === 'sheet') {
      g = merge(translate(box(0.95, 1.1, 0.025, 'ivory'), 0, -1.1, 0), tint(translate(box(0.95, 0.12, 0.03, color), 0, -0.9, 0)), peg(-0.4), peg(0), peg(0.4));
    } else if (kind === 'socks') {
      g = merge([-0.06, 0.06].map((x) => merge(tint(translate(box(0.07, 0.22, 0.03, color), x, -0.22, 0)), tint(translate(box(0.12, 0.06, 0.03, color), x + 0.03, -0.26, 0)))), peg(-0.06), peg(0.06));
    } else {
      g = merge(tint(translate(box(0.42, 0.14, 0.03, color), 0, -0.14, 0)), [-0.11, 0.11].map((x) => tint(translate(box(0.18, 0.62, 0.03, color), x, -0.74, 0))), peg(-0.17), peg(0.17));
    }
    return sway(g, (_x, y) => clamp01(-y / 1.1) * 0.8);
  });
}

/** Washing line with pegged shirts, sheets, socks and trousers (tint-masked garments, swaying). */
export function laundryLine(a: V3, b: V3, opts: LaundryOptions = {}): LineResult {
  const len = span(a, b);
  const sag = opts.sag ?? len * 0.05 + 0.1;
  const curve = lineCurve(a, b, sag);
  const rng = createRng(opts.seed ?? `laundry.${len.toFixed(2)}`);
  const kinds: readonly Garment[] = ['shirt', 'sheet', 'socks', 'trousers', 'shirt'];
  const colors: readonly ColorName[] = ['blue', 'coral', 'butter', 'sage', 'ivory'];
  const yaw = yawAlong(a, b);
  const items: Geo[] = [];
  let x = 0.3;
  while (x < len - 0.3) {
    const kind = rng.pick(kinds);
    const w = GARMENT_W[kind];
    if (x + w > len - 0.3) break;
    const p = at(a, b, sag, (x + w / 2) / len);
    items.push(translate(rotateY(garment(kind, rng.pick(colors)), yaw), p[0], p[1], p[2]));
    x += w + 0.08 + rng.next() * 0.25;
  }
  return { geo: merge(rope(curve, 'ivoryDeep', 0.014), items), curve };
}
