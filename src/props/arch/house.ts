/**
 * `house()` — the parametric town house. House space: centred on x/z, resting on y = 0, front
 * façade on z = +d/2 facing +z. Called hundreds of times by district authors, so it only places
 * cached unit parts (see kit.ts) and merges once per façade.
 */
import { type Col, type Geo, bakeTint, bounds, merge, place, shadeY } from '../../core/geo';
import { createRng } from '../../core/rng';
import { bx, tierTris } from './kit';
import { HOUSE_BUDGET, MAX_LEAN, leanOpts } from './houseLean';
import { buildFacade, hasShop } from './facade';
import { buildRoof } from './roof';
import { SHOP_RECESS } from './shopfront';
import type { BalconyAnchor, DoorAnchor, FacadeOpts, FacadeSide, HouseOpts, HouseResult } from './types';
import { type Resolved, resolveHouse } from './houseOpts';

interface SideFrame {
  readonly side: FacadeSide;
  readonly W: number;
  readonly ox: number;
  readonly oz: number;
  readonly rot: number;
  readonly wraps: boolean;
  readonly endL: boolean;
  readonly endR: boolean;
}

function frames(r: Resolved): SideFrame[] {
  const p = (s: FacadeSide): boolean => Boolean(r.facades[s].party);
  return [
    { side: 'front', W: r.w, ox: 0, oz: r.d / 2, rot: 0, wraps: true, endL: !p('left'), endR: !p('right') },
    { side: 'back', W: r.w, ox: 0, oz: -r.d / 2, rot: Math.PI, wraps: true, endL: !p('right'), endR: !p('left') },
    { side: 'right', W: r.d, ox: r.w / 2, oz: 0, rot: Math.PI / 2, wraps: false, endL: !p('front'), endR: !p('back') },
    { side: 'left', W: r.d, ox: -r.w / 2, oz: 0, rot: -Math.PI / 2, wraps: false, endL: !p('back'), endR: !p('front') },
  ];
}

/** Façade-local (u, y, zl) to house space. */
function toHouse(f: SideFrame, u: number, zl: number): { x: number; z: number } {
  const c = Math.cos(f.rot);
  const s = Math.sin(f.rot);
  return { x: f.ox + u * c + zl * s, z: f.oz - u * s + zl * c };
}

function body(r: Resolved): Geo {
  const H = r.floors * r.floorH;
  const inset = (s: FacadeSide): number => (hasShop(r.facades[s], s === 'front' || s === 'back' ? r.w : r.d) ? SHOP_RECESS : 0);
  const iF = inset('front');
  const iB = inset('back');
  const iL = inset('left');
  const iR = inset('right');
  if (iF + iB + iL + iR === 0) return shadeY(bx(r.w, H, r.d, r.wall), 0.82, 1);
  const gw = r.w - iL - iR;
  const gd = r.d - iF - iB;
  const ground = bx(gw, r.floorH, gd, r.wall, (iL - iR) / 2, 0, (iB - iF) / 2);
  const upper = r.floors > 1 ? [bx(r.w, H - r.floorH, r.d, r.wall, 0, r.floorH, 0)] : [];
  return shadeY(merge(ground, upper), 0.82, 1);
}

interface FacadeOut {
  readonly geo: Geo[];
  readonly doors: DoorAnchor[];
  readonly balconies: BalconyAnchor[];
}

function facades(r: Resolved): FacadeOut {
  const out: FacadeOut = { geo: [], doors: [], balconies: [] };
  for (const f of frames(r)) {
    const opts: FacadeOpts = r.facades[f.side];
    const res = buildFacade(
      {
        W: f.W,
        floors: r.floors,
        floorH: r.floorH,
        wall: r.wall,
        trim: r.trim,
        accent: r.accent,
        petal: r.petal,
        opts,
        wraps: f.wraps,
        endL: f.endL,
        endR: f.endR,
        plinth: r.plinth,
        quoins: r.quoins && f.side === 'front',
        halfTimber: r.halfTimber,
        cornice: r.cornice,
        downpipe: r.downpipes && f.side === 'front',
        hidden: f.side === 'back' && Boolean(opts.simple || opts.blank),
      },
      r.rng.fork(f.side),
    );
    if (res.geo.pos.length > 0) out.geo.push(place(res.geo, f.ox, 0, f.oz, f.rot));
    for (const u of res.doors) out.doors.push({ ...toHouse(f, u, 0), heading: f.rot });
    for (const b of res.balconies) {
      const p = toHouse(f, b.u, b.depth / 2);
      out.balconies.push({ x: p.x, y: b.y, z: p.z, heading: f.rot, w: b.w, depth: b.depth });
    }
  }
  return out;
}

function roofOf(r: Resolved): ReturnType<typeof buildRoof> {
  const party = (s: FacadeSide): boolean => Boolean(r.facades[s].party);
  const open = (s: FacadeSide): boolean => !r.facades[s].party && !r.facades[s].blank;
  return buildRoof(
    {
      kind: r.roof,
      w: r.w,
      d: r.d,
      H: r.floors * r.floorH,
      floorH: r.floorH,
      ridge: r.ridge,
      col: r.roofColor,
      wall: r.wall,
      trim: r.trim,
      party: { front: party('front'), back: party('back'), left: party('left'), right: party('right') },
      open: { front: open('front'), back: open('back'), left: open('left'), right: open('right') },
      dormers: r.dormers,
      chimneys: r.chimneys,
      terrace: r.terrace,
      terraceGarden: r.terraceGarden,
    },
    r.rng.fork('roof'),
  );
}

function buildOnce(opts: HouseOpts, lean: number): HouseResult {
  const r = resolveHouse(opts, createRng(opts.seed ?? 1));
  const f = facades(r);
  const roof = roofOf(r);
  const merged = merge(body(r), f.geo, roof.geo);
  const tint: Col | undefined = opts.tint;
  return {
    geo: tint ? bakeTint(merged, tint) : merged,
    roofY: r.floors * r.floorH,
    topY: bounds(merged).max[1],
    terrace: roof.terrace,
    doors: f.doors,
    balconies: f.balconies,
    footprint: [r.w, r.d],
    lean,
  };
}

/** Build exactly as requested, bypassing the budget governor (for tooling and tests). */
export function houseExact(opts: HouseOpts = {}): HouseResult {
  return buildOnce(opts, 0);
}

/**
 * Build a parametric town house. Deterministic per `seed`. If the requested features would
 * exceed the house budget (3000 near / 700 far triangles) the governor drops the least visible
 * extras first (back-facade detail, window boxes, dormers, upper balconies, shutters ...).
 */
export function house(opts: HouseOpts = {}): HouseResult {
  let result = buildOnce(opts, 0);
  for (let level = 1; level <= MAX_LEAN; level++) {
    const t = tierTris(result.geo);
    if (t.near <= HOUSE_BUDGET.near && t.far <= HOUSE_BUDGET.far) break;
    result = buildOnce(leanOpts(opts, level, result.footprint[0], result.footprint[1]), level);
  }
  return result;
}
