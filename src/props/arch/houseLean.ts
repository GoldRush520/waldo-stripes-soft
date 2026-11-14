/**
 * Budget governor for `house()`: progressively leaner variants of the options, used when a
 * requested combination would exceed the house triangle budget (3000 near / 700 far).
 */
import type { FacadeOpts, FacadeSide, HouseOpts } from './types';

export const HOUSE_BUDGET = { near: 3000, far: 700 } as const;
export const MAX_LEAN = 4;

const SIDES: readonly FacadeSide[] = ['front', 'back', 'left', 'right'];

function leanFacade(f: FacadeOpts, side: FacadeSide, level: number, W: number): FacadeOpts {
  if (f.party) return f;
  const front = side === 'front';
  const firstOnly = Array.isArray(f.balconies) ? f.balconies.slice(0, 1) : f.balconies === 'all' ? [1] : f.balconies;
  const shop = typeof f.shop === 'object' ? f.shop : f.shop ? {} : undefined;
  return {
    ...f,
    windowBoxes: f.windowBoxes && front && level < 2,
    simple: f.simple || (!front && level >= 1) || level >= 4,
    balconyFlowers: f.balconyFlowers && level < 2,
    balconies: level >= 3 ? [] : level >= 2 ? firstOnly : f.balconies,
    shutters: f.shutters && level < 3,
    style: level >= 3 && f.style === 'shuttered' ? 'square' : f.style,
    shop: shop ? { ...shop, display: level >= 3 ? false : shop.display, sign: level >= 4 ? false : shop.sign } : f.shop,
    blank: f.blank || (side !== 'front' && level >= 4),
    windows: level >= 4 ? Math.max(1, Math.floor(W / 2.8)) : f.windows,
  };
}

/** Options for lean level `level` (0 = as requested). */
export function leanOpts(o: HouseOpts, level: number, w: number, d: number): HouseOpts {
  if (level <= 0) return o;
  const back: FacadeOpts = o.back ?? { simple: true, windows: Math.max(1, Math.floor(w / 3.2)) };
  const sides = Object.fromEntries(
    SIDES.map((s) => {
      const f = s === 'back' ? back : (o[s] ?? (s === 'front' ? { door: true } : { blank: true }));
      return [s, leanFacade(f, s, level, s === 'front' || s === 'back' ? w : d)];
    }),
  ) as Record<FacadeSide, FacadeOpts>;
  return {
    ...o,
    ...sides,
    dormers: level >= 2 ? 0 : Math.min(o.dormers ?? 1, 1),
    chimneys: level >= 3 ? Math.min(o.chimneys ?? 1, 1) : o.chimneys,
    quoins: o.quoins && level < 3,
    halfTimber: o.halfTimber && level < 4,
    terraceGarden: o.terraceGarden && level < 3,
  };
}
