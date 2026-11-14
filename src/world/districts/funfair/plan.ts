/**
 * Funfair master plan (district-local metres; anchor (96,-9), rotation 0, local x ∈ [-38, 39],
 * z ∈ [-29, 29]). Tall things stand north so they never hide the crowd from the fixed camera.
 * North band: big top, funhouse, helter-skelter, chair-swing, fortune tent,
 * dodgems and the high strikers. Middle: the midway avenue (games row on its north side, the big
 * wheel at (16,-3)). South band (low rides): swing boats, carousel, the balloon plaza and the coaster.
 */
export interface Spot {
  readonly x: number;
  readonly z: number;
  readonly rot?: number;
}

export const WHEEL: Spot = { x: 16, z: -3 };
export const BIGTOP: Spot = { x: -23, z: -16 };
export const BIGTOP_DOOR: Spot = { x: -23, z: -6.7 };
export const HELTER: Spot = { x: -6, z: -12 };
export const CHAIRSWING: Spot = { x: 7, z: -18 };
export const FORTUNE: Spot = { x: 16.5, z: -22 };
export const DODGEMS: Spot = { x: 27, z: -19 };
export const STRIKERS: readonly Spot[] = [
  { x: 31.2, z: -9.5 },
  { x: 34.2, z: -9.5 },
];
export const CAROUSEL: Spot = { x: -12, z: 19.4 };
export const SWINGBOATS: readonly Spot[] = [
  { x: -29.5, z: 10.8, rot: Math.PI / 2 },
  { x: -29.5, z: 18.6, rot: Math.PI / 2 },
];
export const COASTER: Spot = { x: 21, z: 18 };
export const FUNHOUSE: Spot = { x: -6, z: -21 };
export const PLAZA = { x: 3.5, z: 13.2, r: 5.4 } as const;

/** Midway avenue (east-west), z range and centreline. */
export const AVENUE = { z0: 0.6, z1: 8.4, mid: 4.1, x0: -37, x1: 38 } as const;

/** Game booths along the north side of the avenue, facing +z (key, centre x). */
export const BOOTHS: ReadonlyArray<{ readonly key: string; readonly x: number; readonly w: number; readonly d: number }> = [
  { key: 'game.coconutshy', x: -9.8, w: 3.6, d: 2.4 },
  { key: 'game.hookaduck', x: -5.9, w: 3.2, d: 2.2 },
  { key: 'game.ringtoss', x: -2.3, w: 3.2, d: 2.6 },
  { key: 'game.tincan', x: 1.4, w: 3.4, d: 2.4 },
  { key: 'game.balltoss', x: 5.4, w: 3.8, d: 2.6 },
];
export const BOOTH_Z = -3.2;

/** Treat carts on the south side of the avenue (key, x, rot). */
export const CARTS: ReadonlyArray<{ readonly key: string; readonly x: number; readonly z: number; readonly rot: number }> = [
  { key: 'cart.cottoncandy', x: -1.5, z: 9.6, rot: 0 },
  { key: 'cart.popcorn', x: 9.2, z: 9.4, rot: 0 },
  { key: 'stand.toffeeapple', x: -23.5, z: 9.4, rot: 0 },
  { key: 'cart.icecream', x: 27.5, z: 9.6, rot: 0 },
];

/** Whole district ground outline (local), inset slightly from the polygon edge. */
export const GROUND: ReadonlyArray<readonly [number, number]> = [
  [-37.6, -28.6],
  [38.6, -28.6],
  [38.6, 28.6],
  [-37.6, 28.6],
];

export const ellipse = (cx: number, cz: number, rx: number, rz: number, n: number, y = 0, reverse = false): Array<[number, number, number]> => {
  const pts = Array.from({ length: n }, (_, i): [number, number, number] => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * rx, y, cz + Math.sin(a) * rz];
  });
  return reverse ? pts.reverse() : pts;
};

export const ring = (cx: number, cz: number, r: number, n: number): Array<[number, number]> =>
  Array.from({ length: n }, (_, i): [number, number] => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cz + Math.sin(a) * r];
  });
