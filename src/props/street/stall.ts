/**
 * Parametric market stall: timber frame, striped awning (four styles), counter with a tiered
 * display filled with heaps of goods, plus vendor / customer standing spots.
 */
import {
  type Geo,
  beam,
  box,
  detail,
  merge,
  shadeY,
  sphere,
  tintable,
  translate,
  triangleCount,
} from '../../core/geo';
import type { ColorName } from '../../core/palette';
import { createRng } from '../../core/rng';
import { type AwningStyle, stallRoof } from './awning';
import { type GoodsKind, GOODS } from './goods';
import { buildHeap } from './goods-kit';
import type { GroundSpot } from './kit';

export type { AwningStyle } from './awning';

export interface StallOptions {
  /** stall width along x, clamped to 1.8 - 4 m (default 2.4) */
  readonly width?: number;
  readonly awning?: AwningStyle;
  /** awning / skirt cloth colour baked for galleries (placements may re-tint) */
  readonly tint?: ColorName;
  /** goods kinds cycled over the display slots (front row first); empty = bare counter */
  readonly goods?: readonly GoodsKind[];
  readonly seed?: number | string;
}

export interface StallResult {
  readonly geo: Geo;
  readonly footprint: readonly [number, number];
  readonly vendorSpot: GroundSpot;
  readonly customerSpots: readonly GroundSpot[];
}

export const STALL_DEPTH = 1.4;
export const STALL_COUNTER_Y = 0.95;
const TIER_Y = 1.09;
const FULL_BUDGET = 1150;

function counter(w: number, tint: ColorName): Geo {
  const body = translate(shadeY(box(w - 0.12, 0.91, 0.62, 'timber'), 0.78, 1), 0, 0, 0.38);
  const top = translate(box(w - 0.04, 0.04, 0.7, 'timberDeep'), 0, 0.91, 0.36);
  const skirt = translate(tintable(box(w - 0.1, 0.58, 0.02, tint)), 0, 0.26, 0.7);
  const tier = translate(box(w - 0.2, TIER_Y - STALL_COUNTER_Y, 0.32, 'timber'), 0, STALL_COUNTER_Y, 0.22);
  const sign = translate(box(Math.min(1.1, w * 0.38), 0.2, 0.03, 'ivory'), 0, 0.5, 0.725);
  return merge(body, detail(merge(top, sign)), skirt, tier);
}

function decorations(w: number): Geo {
  const signW = Math.min(1.1, w * 0.38);
  const letters = Array.from({ length: 5 }, (_, i) =>
    translate(box(signW / 8, 0.08, 0.01, 'cocoa'), (i - 2) * (signW / 5.5), 0.56, 0.745),
  );
  const lamp = merge(beam([0, 1.95, 0.2], [0, 2.22, 0.2], 0.012, 'ink'), translate(sphere(0.06, 'butterLight', 5, 3), 0, 1.92, 0.2));
  const tags = [-1, 1].map((s) =>
    merge(
      beam([s * (w / 2 - 0.35), STALL_COUNTER_Y, 0.66], [s * (w / 2 - 0.35), STALL_COUNTER_Y + 0.14, 0.66], 0.012, 'timberDeep'),
      translate(box(0.12, 0.08, 0.012, 'ink'), s * (w / 2 - 0.35), STALL_COUNTER_Y + 0.12, 0.66),
    ),
  );
  const sx = -(w / 2 - 0.3);
  const stock = [translate(box(0.42, 0.26, 0.32, 'timber'), sx, 0, -0.45), translate(box(0.36, 0.22, 0.28, 'timberDeep'), sx, 0.26, -0.45)];
  return detail(merge(letters, lamp, tags, stock));
}

interface Slot {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly w: number;
  readonly d: number;
}

function displaySlots(w: number): Slot[] {
  const rowW = w - 0.26;
  const n = Math.max(2, Math.min(3, Math.round(rowW / 0.8)));
  const slotW = rowW / n;
  const rows = [
    { y: STALL_COUNTER_Y, z: 0.545, d: 0.27 },
    { y: TIER_Y, z: 0.22, d: 0.28 },
  ];
  return rows.flatMap((r) =>
    Array.from({ length: n }, (_, i) => ({ x: -rowW / 2 + (i + 0.5) * slotW, y: r.y, z: r.z, w: slotW - 0.05, d: r.d })),
  );
}

function standingSpots(w: number, style: AwningStyle): { vendor: GroundSpot; customers: GroundSpot[] } {
  const n = Math.max(2, Math.round(w / 0.9));
  const customers = Array.from({ length: n }, (_, i) => ({
    x: (i - (n - 1) / 2) * Math.min(0.85, (w - 0.3) / Math.max(1, n - 1)),
    z: STALL_DEPTH / 2 + 0.4,
    heading: Math.PI,
  }));
  return { vendor: { x: style === 'umbrella' ? 0.35 : 0.1, z: -0.3, heading: 0 }, customers };
}

/** Solid ground rectangle of a stall of the given width. */
export function stallFootprint(width: number): readonly [number, number] {
  return [Math.max(1.8, Math.min(4, width)) + 0.05, STALL_DEPTH + 0.05];
}

/** Build a market stall. Origin at ground centre, front (customer side, counter) faces +z. */
export function stall(opts: StallOptions = {}): StallResult {
  const w = Math.max(1.8, Math.min(4, opts.width ?? 2.4));
  const tint = opts.tint ?? 'coral';
  const style = opts.awning ?? 'flat';
  const rng = createRng(opts.seed ?? `stall.${w}.${style}`);
  const frame = merge(stallRoof(style, w, tint), counter(w, tint), decorations(w));
  const kinds = opts.goods ?? [];
  const slots = kinds.length > 0 ? displaySlots(w) : [];
  const perHeap = slots.length > 0 ? Math.floor((FULL_BUDGET - triangleCount(frame)) / slots.length) : 0;
  const heaps = slots.map((s, i) => {
    const kind = kinds[i % kinds.length] ?? 'oranges';
    const heap = buildHeap(GOODS[kind], { w: s.w, d: s.d, budget: perHeap, rng: rng.fork(i) });
    return translate(heap, s.x, s.y, s.z);
  });
  const spots = standingSpots(w, style);
  return {
    geo: merge(frame, heaps),
    footprint: stallFootprint(w),
    vendorSpot: spots.vendor,
    customerSpots: spots.customers,
  };
}
