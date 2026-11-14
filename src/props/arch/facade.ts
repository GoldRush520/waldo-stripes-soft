/**
 * One house façade in façade-local space: u along the wall (centred, width W), y up from the
 * ground, wall plane z = 0, street toward +z. Builds openings (windows, doors, shopfront,
 * balconies) and wall trims (plinth, string course, cornice, quoins, half-timbering, downpipe).
 */
import { type Col, type Geo, EMPTY, detail, merge, translate } from '../../core/geo';
import type { Rng } from '../../core/rng';
import { balconyUnit } from './balcony';
import { columnsOf, trimsOf } from './facadeTrims';
import { doorUnit } from './doors';
import { ball, bx, clamp, slots } from './kit';
import { shopfront } from './shopfront';
import type { FacadeOpts, WindowStyle } from './types';
import { windowUnit } from './windows';

export interface FacadeSpec {
  readonly W: number;
  readonly floors: number;
  readonly floorH: number;
  readonly wall: Col;
  readonly trim: Col;
  readonly accent: Col;
  readonly petal: Col;
  readonly opts: FacadeOpts;
  /** façade wraps trims round its ends (front / back façades) */
  readonly wraps: boolean;
  /** the corner at -u / +u is exposed (neighbouring façade is not a party wall) */
  readonly endL: boolean;
  readonly endR: boolean;
  readonly plinth: boolean;
  readonly quoins: boolean;
  readonly halfTimber: boolean;
  readonly cornice: boolean;
  readonly downpipe: boolean;
  /** façade faces away from the default camera and is plain: skip its wall trims */
  readonly hidden?: boolean;
}

export interface FacadeBalcony {
  readonly u: number;
  readonly y: number;
  readonly w: number;
  readonly depth: number;
}

export interface FacadeResult {
  readonly geo: Geo;
  readonly doors: readonly number[];
  readonly balconies: readonly FacadeBalcony[];
  /** a shopfront was built (the house body must be recessed behind it) */
  readonly shop: boolean;
}

const BALC_DEPTH = 0.85;

export function hasShop(o: FacadeOpts, W: number): boolean {
  return Boolean(o.shop) && !o.party && !o.blank && W >= 3.2;
}

function balconyFloors(o: FacadeOpts, floors: number): readonly number[] {
  if (o.balconies === 'all') return Array.from({ length: floors - 1 }, (_, i) => i + 1);
  return (o.balconies ?? []).filter((f) => f >= 1 && f < floors);
}

function styleAt(style: WindowStyle, col: number, n: number, floor: number): WindowStyle {
  if (style !== 'bay') return style;
  return floor >= 1 && col === Math.floor(n / 2) ? 'bay' : 'square';
}

interface FloorCtx {
  readonly spec: FacadeSpec;
  readonly us: readonly number[];
  readonly rng: Rng;
}

function windowAt(ctx: FloorCtx, i: number, floor: number): Geo {
  const { spec, us, rng } = ctx;
  const o = spec.opts;
  const style = styleAt(o.style ?? 'square', i, us.length, floor);
  const u = us[i] ?? 0;
  const base = floor * spec.floorH + (floor === 0 ? 0.95 : 0.9);
  const shut = o.shutters && style !== 'shuttered' ? (rng.chance(0.7) ? 'open' : 'closed') : undefined;
  const g = windowUnit(
    {
      style,
      w: style === 'round' ? 0.8 : 0.85,
      trim: spec.trim,
      shutters: shut,
      shutterCol: spec.accent,
      windowBox: Boolean(o.windowBoxes) && floor <= 2 && rng.chance(0.8),
      petal: spec.petal,
      simple: o.simple,
    },
    rng,
  );
  return translate(g, u, base, 0);
}

function balconyAt(ctx: FloorCtx, u: number, w: number, floor: number, out: FacadeBalcony[]): Geo {
  const { spec, rng } = ctx;
  const y = floor * spec.floorH;
  out.push({ u, y, w, depth: BALC_DEPTH });
  const bal = balconyUnit({ w, depth: BALC_DEPTH, flowers: spec.opts.balconyFlowers, petal: spec.petal }, rng);
  return translate(bal, u, y, 0);
}

function frenchDoor(ctx: FloorCtx, u: number, floor: number): Geo {
  const g = doorUnit({ kind: 'glazed', w: 0.85, h: 2.15, col: ctx.spec.accent, trim: ctx.spec.trim, step: false });
  return translate(g, u, floor * ctx.spec.floorH + 0.02, 0);
}

function upperFloor(ctx: FloorCtx, floor: number, balconies: FacadeBalcony[]): Geo[] {
  const { spec, us } = ctx;
  const o = spec.opts;
  const hasBalc = balconyFloors(o, spec.floors).includes(floor);
  const mid = Math.floor(us.length / 2);
  const parts: Geo[] = [];
  if (hasBalc && o.wideBalcony) {
    parts.push(balconyAt(ctx, 0, clamp(spec.W - 0.8, 1.2, spec.W), floor, balconies));
  }
  us.forEach((u, i) => {
    const french = hasBalc && (o.wideBalcony || i === mid);
    if (!french) {
      parts.push(windowAt(ctx, i, floor));
      return;
    }
    parts.push(frenchDoor(ctx, u, floor));
    if (!o.wideBalcony) {
      const bw = clamp(spec.W / us.length - 0.2, 1.1, 2.2);
      parts.push(balconyAt(ctx, u, bw, floor, balconies));
    }
  });
  return parts;
}

function groundFloor(ctx: FloorCtx, doors: number[], rng: Rng): Geo[] {
  const { spec, us } = ctx;
  const o = spec.opts;
  if (hasShop(o, spec.W)) {
    const shopOpts = typeof o.shop === 'object' ? o.shop : {};
    const r = shopfront(
      { W: spec.W, G: spec.floorH, wall: spec.wall, trim: spec.trim, accent: spec.accent, opts: shopOpts, doorRight: rng.chance(0.5) },
      rng,
    );
    doors.push(r.doorU);
    return [r.geo];
  }
  const doorCol = o.door ? clamp(o.doorAt ?? Math.floor(us.length / 2), 0, us.length - 1) : -1;
  return us.map((u, i) => {
    if (i !== doorCol) return windowAt(ctx, i, 0);
    doors.push(u);
    const kind = typeof o.door === 'string' ? o.door : 'panelled';
    return merge(translate(doorUnit({ kind, col: spec.accent, trim: spec.trim }), u, 0, 0), doorLamp(u + 0.8, rng));
  });
}

/** Wall lantern and house-number plate beside a front door (near-only). */
function doorLamp(u: number, rng: Rng): Geo {
  const plate = bx(0.16, 0.12, 0.03, 'ivory', u - 1.6, 1.75, 0.015);
  const digit = bx(0.05, 0.08, 0.01, 'blueDeep', u - 1.6 + rng.range(-0.03, 0.03), 1.77, 0.035);
  return detail(
    merge(bx(0.06, 0.06, 0.24, 'ink', u, 2.25, 0.12), ball([0.08, 0.11, 0.08], 'butterLight', [u, 2.12, 0.22], 5, 3), plate, digit),
  );
}

/** Build a façade. Party walls return nothing; blank walls get trims only. */
export function buildFacade(spec: FacadeSpec, rng: Rng): FacadeResult {
  const o = spec.opts;
  if (o.party) return { geo: EMPTY, doors: [], balconies: [], shop: false };
  const doors: number[] = [];
  const balconies: FacadeBalcony[] = [];
  const parts: Geo[] = [trimsOf(spec, hasShop(o, spec.W))];
  if (!o.blank) {
    const n = columnsOf(spec);
    const ctx: FloorCtx = { spec, us: slots(n, spec.W - 0.4), rng };
    parts.push(...groundFloor(ctx, doors, rng));
    for (let f = 1; f < spec.floors; f++) parts.push(...upperFloor(ctx, f, balconies));
  }
  return { geo: merge(parts), doors, balconies, shop: hasShop(o, spec.W) };
}

