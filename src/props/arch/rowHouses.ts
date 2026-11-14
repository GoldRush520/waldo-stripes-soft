/**
 * `rowHouses()` — a continuous terrace of varied houses sharing party walls. Row space: the row
 * runs along x centred on 0, fronts on z = +d/2 facing +z, resting on y = 0. Neighbours never
 * repeat wall colour; widths, storeys, roofs, façade features and awning tints vary by seed.
 */
import { type Geo, merge, translate } from '../../core/geo';
import { type Rng, createRng } from '../../core/rng';
import { ROOFS, TINTS, WALLS } from './colors';
import { house } from './house';
import type {
  BalconyAnchor,
  DisplayKind,
  DoorAnchor,
  FacadeOpts,
  HouseOpts,
  HouseResult,
  RoofKind,
  SignKind,
  TerraceInfo,
  WindowStyle,
} from './types';
import { SIGN_KINDS } from './types';

export interface RowHousesOpts {
  readonly count?: number;
  /** explicit widths (overrides count / minW / maxW) */
  readonly widths?: readonly number[];
  readonly minW?: number;
  readonly maxW?: number;
  readonly d?: number;
  /** storey range [min, max] */
  readonly floors?: readonly [number, number];
  readonly roofs?: readonly RoofKind[];
  /** probability of a ground-floor shop */
  readonly shops?: number;
  /** façade at the two ends of the row: blank gable walls (default) or windowed */
  readonly ends?: 'blank' | 'windows';
  /** bake a different tint into each house's awning / petals (default true) */
  readonly bakeTints?: boolean;
  /** options applied to every house (e.g. floorH) */
  readonly common?: Partial<HouseOpts>;
  readonly seed?: number;
}

export interface RowTerrace extends TerraceInfo {
  readonly x: number;
  readonly z: number;
}

export interface RowHouseInfo {
  /** centre x of this house in row space */
  readonly x: number;
  readonly w: number;
  readonly floors: number;
  readonly roof: RoofKind;
  readonly roofY: number;
  readonly topY: number;
  readonly doors: readonly DoorAnchor[];
  readonly balconies: readonly BalconyAnchor[];
  readonly terrace?: RowTerrace;
}

export interface RowHousesResult {
  readonly geo: Geo;
  readonly houses: readonly RowHouseInfo[];
  readonly doors: readonly DoorAnchor[];
  readonly balconies: readonly BalconyAnchor[];
  readonly terraces: readonly RowTerrace[];
  readonly footprint: readonly [number, number];
}

const STYLES: readonly WindowStyle[] = ['square', 'square', 'shuttered', 'arched', 'shuttered', 'bay'];
const DISPLAYS: readonly DisplayKind[] = ['bread', 'books', 'hats', 'cakes'];

function widthsOf(o: RowHousesOpts, rng: Rng): number[] {
  if (o.widths && o.widths.length > 0) return [...o.widths];
  const n = Math.max(1, Math.round(o.count ?? 4));
  const lo = o.minW ?? 4.4;
  const hi = Math.max(lo, o.maxW ?? 7);
  return Array.from({ length: n }, () => Math.round(rng.range(lo, hi) * 10) / 10);
}

function frontOf(rng: Rng, shop: boolean, floors: number): FacadeOpts {
  const style = rng.pick(STYLES);
  const balc = floors >= 3 && rng.chance(0.45) ? [rng.int(1, floors - 1)] : floors === 2 && rng.chance(0.25) ? [1] : [];
  const sign: SignKind | false = rng.chance(0.6) ? rng.pick(SIGN_KINDS) : false;
  return {
    door: true,
    style,
    shutters: style !== 'shuttered' && rng.chance(0.25),
    windowBoxes: rng.chance(0.45),
    balconies: balc,
    wideBalcony: rng.chance(0.2),
    balconyFlowers: rng.chance(0.6),
    shop: shop
      ? { awning: rng.pick(['straight', 'straight', 'scalloped', 'dome', false] as const), display: rng.pick(DISPLAYS), sign }
      : false,
  };
}

interface Pick {
  readonly opts: HouseOpts;
  readonly wall: string;
}

function houseOpts(o: RowHousesOpts, i: number, n: number, w: number, prevWall: string, rng: Rng): Pick {
  const [fMin, fMax] = o.floors ?? [2, 4];
  const floors = rng.int(Math.max(1, fMin), Math.max(fMin, fMax));
  const roofs = o.roofs ?? (['gable', 'gable', 'gable', 'mansard', 'flat', 'shed'] as const);
  const roof = rng.pick(roofs);
  const wall = rng.pick(WALLS.filter((c) => c !== prevWall));
  const end: FacadeOpts = o.ends === 'windows' ? { windows: 2, simple: true } : { blank: true };
  const shop = w >= 3.6 && rng.chance(o.shops ?? 0.5);
  const opts: HouseOpts = {
    w,
    d: o.d ?? 7,
    floors,
    roof,
    ridge: roof === 'gable' && rng.chance(0.3) ? 'z' : 'x',
    wall,
    roofColor: rng.pick(ROOFS),
    front: frontOf(rng, shop, floors),
    left: i === 0 ? end : { party: true },
    right: i === n - 1 ? end : { party: true },
    halfTimber: roof === 'gable' && floors >= 2 && rng.chance(0.15),
    quoins: rng.chance(0.25),
    terraceGarden: roof === 'flat' && rng.chance(0.5),
    tint: o.bakeTints === false ? undefined : rng.pick(TINTS),
    seed: rng.int(1, 1e9),
    ...o.common,
  };
  return { opts, wall };
}

function shift(h: HouseResult, x: number, o: HouseOpts): RowHouseInfo & { readonly geo: Geo } {
  return {
    geo: translate(h.geo, x, 0, 0),
    x,
    w: h.footprint[0],
    floors: o.floors ?? 2,
    roof: o.roof ?? 'gable',
    roofY: h.roofY,
    topY: h.topY,
    doors: h.doors.map((dd) => ({ ...dd, x: dd.x + x })),
    balconies: h.balconies.map((b) => ({ ...b, x: b.x + x })),
    terrace: h.terrace ? { ...h.terrace, x, z: 0 } : undefined,
  };
}

/** Build a continuous terrace of varied houses. Deterministic per `seed`. */
export function rowHouses(o: RowHousesOpts = {}): RowHousesResult {
  const rng = createRng(o.seed ?? 1);
  const widths = widthsOf(o, rng.fork('widths'));
  const total = widths.reduce((a, b) => a + b, 0);
  const pickRng = rng.fork('houses');
  let cursor = -total / 2;
  let prevWall = '';
  const built = widths.map((w, i) => {
    const pick = houseOpts(o, i, widths.length, w, prevWall, pickRng);
    prevWall = pick.wall;
    const x = cursor + w / 2;
    cursor += w;
    return shift(house(pick.opts), x, pick.opts);
  });
  const houses: RowHouseInfo[] = built.map(({ geo: _g, ...info }) => info);
  return {
    geo: merge(built.map((b) => b.geo)),
    houses,
    doors: houses.flatMap((h) => h.doors),
    balconies: houses.flatMap((h) => h.balconies),
    terraces: houses.flatMap((h) => (h.terrace ? [h.terrace] : [])),
    footprint: [total, o.d ?? 7],
  };
}
