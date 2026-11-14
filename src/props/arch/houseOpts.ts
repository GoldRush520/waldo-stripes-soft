/** Resolves `HouseOpts` into a complete, seeded house description. */
import type { Col } from '../../core/geo';
import type { Rng } from '../../core/rng';
import { ACCENTS, ROOFS, WALLS, trimFor } from './colors';
import { clamp } from './kit';
import type { FacadeOpts, FacadeSide, HouseOpts, RoofKind } from './types';

export interface Resolved {
  readonly w: number;
  readonly d: number;
  readonly floors: number;
  readonly floorH: number;
  readonly wall: Col;
  readonly trim: Col;
  readonly accent: Col;
  readonly petal: Col;
  readonly roof: RoofKind;
  readonly roofColor: Col;
  readonly ridge: 'x' | 'z';
  readonly facades: Readonly<Record<FacadeSide, FacadeOpts>>;
  readonly chimneys: number;
  readonly dormers: number;
  readonly downpipes: boolean;
  readonly halfTimber: boolean;
  readonly quoins: boolean;
  readonly plinth: boolean;
  readonly cornice: boolean;
  readonly terrace: boolean;
  readonly terraceGarden: boolean;
  readonly rng: Rng;
}

function defaultDormers(roof: RoofKind, w: number, d: number, floors: number, front: FacadeOpts, rng: Rng): number {
  if (roof === 'mansard') return front.party || front.blank ? 0 : Math.max(1, front.windows ?? Math.floor(w / 1.9));
  if ((roof === 'gable' || roof === 'hip') && d >= 6.5 && floors >= 2 && w >= 4) return rng.int(0, 2);
  return 0;
}

export function resolveHouse(o: HouseOpts, rng: Rng): Resolved {
  const pick = rng.fork('look');
  const w = clamp(o.w ?? 6, 2.6, 24);
  const d = clamp(o.d ?? 7, 3, 24);
  const floors = clamp(Math.round(o.floors ?? 2), 1, 5);
  const floorH = Math.max(2.7, o.floorH ?? 2.9);
  const wall = o.wall ?? pick.pick(WALLS);
  const accent = o.accent ?? pick.pick(ACCENTS.filter((c) => c !== wall));
  const roof = o.roof ?? 'gable';
  const front: FacadeOpts = { door: true, ...o.front };
  const back: FacadeOpts = o.back ?? { simple: true, windows: Math.max(1, Math.floor(w / 3.2)) };
  const facades = { front, back, left: o.left ?? { blank: true }, right: o.right ?? { blank: true } };
  const counts = rng.fork('counts');
  return {
    w,
    d,
    floors,
    floorH,
    wall,
    trim: o.trim ?? trimFor(wall),
    accent,
    petal: o.tint ?? 'coral',
    roof,
    roofColor: o.roofColor ?? pick.pick(ROOFS),
    ridge: o.ridge ?? 'x',
    facades,
    chimneys: Math.max(0, Math.round(o.chimneys ?? (roof === 'flat' ? counts.int(0, 1) : counts.int(0, 2)))),
    dormers: Math.max(0, Math.round(o.dormers ?? defaultDormers(roof, w, d, floors, front, counts))),
    downpipes: o.downpipes ?? true,
    halfTimber: o.halfTimber ?? false,
    quoins: o.quoins ?? false,
    plinth: o.plinth ?? true,
    cornice: o.cornice ?? roof === 'flat',
    terrace: roof === 'flat' && (o.terrace ?? true),
    terraceGarden: roof === 'flat' && (o.terraceGarden ?? false),
    rng,
  };
}
