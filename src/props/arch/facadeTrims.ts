/**
 * Wall trims of a façade (façade-local space, see facade.ts): plinth band, string course,
 * cornice, quoins, half-timbering and a downpipe. Front / back façades wrap their bands round
 * exposed corners; side façades stop exactly at the corners so nothing overlaps.
 */
import { type Col, type Geo, detail, merge } from '../../core/geo';
import { bx, cy, slots } from './kit';
import type { FacadeSpec } from './facade';

interface Span {
  readonly cx: number;
  readonly w: number;
}

function span(spec: FacadeSpec, ext: number): Span {
  const l = spec.wraps && spec.endL ? ext : 0;
  const r = spec.wraps && spec.endR ? ext : 0;
  return { cx: (r - l) / 2, w: spec.W + l + r };
}

function plinthCol(wall: Col): Col {
  return wall === 'clay' || wall === 'clayLight' ? 'clayDeep' : 'clay';
}

function bands(spec: FacadeSpec, shop: boolean): Geo[] {
  const H = spec.floors * spec.floorH;
  const out: Geo[] = [];
  if (spec.plinth && !shop) {
    const s = span(spec, 0.06);
    out.push(bx(s.w, 0.45, 0.06, plinthCol(spec.wall), s.cx, 0, 0.03));
  }
  if (spec.floors >= 2 && !spec.halfTimber) {
    const s = span(spec, 0.08);
    out.push(bx(s.w, 0.12, 0.08, spec.trim, s.cx, spec.floorH, 0.04));
  }
  if (spec.cornice) {
    const s = span(spec, 0.2);
    out.push(bx(s.w, 0.22, 0.2, spec.trim, s.cx, H - 0.32, 0.1));
  }
  return out;
}

/** Quoins dress the street-facing corners only (front façade; `quoins` is set by house.ts). */
function quoins(spec: FacadeSpec): Geo[] {
  if (!spec.quoins) return [];
  const ends = [spec.endL ? -1 : 0, spec.endR ? 1 : 0].filter((s) => s !== 0);
  const rows = Math.floor((spec.floors * spec.floorH - 0.5) / 0.7);
  return ends.flatMap((s) =>
    Array.from({ length: rows }, (_, i) => {
      const bw = i % 2 === 0 ? 0.5 : 0.32;
      return bx(bw, 0.55, 0.04, spec.trim, s * (spec.W / 2 - bw / 2), 0.5 + i * 0.7, 0.02);
    }),
  );
}

/** Window column count of a façade (shared with facade.ts). */
export function columnsOf(spec: FacadeSpec): number {
  return Math.max(1, spec.opts.windows ?? Math.max(1, Math.floor(spec.W / 1.9)));
}

function halfTimber(spec: FacadeSpec): { always: Geo[]; near: Geo[] } {
  if (!spec.halfTimber || spec.floors < 2) return { always: [], near: [] };
  const H = spec.floors * spec.floorH;
  const t = 0.14;
  const always: Geo[] = [];
  const near: Geo[] = [];
  const us = spec.opts.blank ? [] : slots(columnsOf(spec), spec.W - 0.4);
  const mids = us.slice(1).map((u, i) => (u + (us[i] ?? u)) / 2);
  const posts = [-(spec.W / 2 - t / 2), spec.W / 2 - t / 2, ...mids];
  for (let f = 1; f < spec.floors; f++) {
    const y0 = f * spec.floorH;
    always.push(bx(spec.W, t, 0.05, 'timberDeep', 0, y0 - t / 2, 0.025));
    posts.forEach((x) => near.push(bx(t, spec.floorH - t, 0.05, 'timberDeep', x, y0 + t / 2, 0.026)));
    near.push(bx(spec.W, 0.1, 0.035, 'timberDeep', 0, y0 + 0.74, 0.0185));
  }
  always.push(bx(spec.W, t, 0.05, 'timberDeep', 0, H - t, 0.025));
  return { always, near };
}

function downpipe(spec: FacadeSpec): Geo[] {
  if (!spec.downpipe) return [];
  const H = spec.floors * spec.floorH;
  const u = spec.W / 2 - 0.14;
  return [cy(0.045, H, 'slate', 4, [u, 0, 0.09], 1, false), bx(0.14, 0.1, 0.14, 'slate', u, H - 0.12, 0.09)];
}

/** All trims of a façade merged; quoins, posts, braces and pipes are near-only. */
export function trimsOf(spec: FacadeSpec, shop: boolean): Geo {
  if (spec.hidden) return merge(downpipe(spec));
  const ht = halfTimber(spec);
  return merge(bands(spec, shop), ht.always, detail(merge(quoins(spec), ht.near, downpipe(spec))));
}
