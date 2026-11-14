/**
 * Master plan of the tram station district (district-local metres, anchor = world (-6, -78)).
 * The camera looks north, so the station hall and the double track hug the NORTH edge and all the
 * life spreads south of them toward the camera:
 *
 *   z = -18 … -4    station hall (x -25 … -3) with its two platforms; double track at z = -12.6 / -9.4
 *   z =  -4 …  9    the forecourt: ticket kiosk, departures board, clock, luggage chaos, queues
 *   z =   9 … 13    pedicab road and the forecourt promenade
 *   z =  13 … 22    the luggage yard and a low row of shops along the south edge
 *
 * The canal crosses the district diagonally east of the hall; the double track crosses it on two
 * side-by-side tram viaducts. East of the canal lies the small east terminus.
 */
import type { Kit } from '../../kit';
import { isLand } from '../../layout';

export const LINE_Z = -11;
/** The double track (z of each track centre line). */
export const TRACKS = [LINE_Z - 1.6, LINE_Z + 1.6] as const;
export const TRACK_Y = 0.03;
export const TRACK_X0 = -43;
export const TRACK_X1 = 47;
/** route height of the trams (paving top / viaduct deck) */
export const RIDE_Y = 0.04;

export const HALL = { x: -14, z: LINE_Z } as const;
/** south platform top surface (z range, y) */
export const SOUTH_PLATFORM = { x0: -31, x1: 3, z0: LINE_Z + 3.2, z1: LINE_Z + 6, y: 0.3 } as const;
export const NORTH_PLATFORM = { x0: -31, x1: 3, z0: LINE_Z - 6, z1: LINE_Z - 3.2, y: 0.3 } as const;

/** Canal centre line x at a local z (the straight canal reach through this district). */
export function canalX(z: number): number {
  return 15 + ((24 - z) * 18) / 46;
}

/** Half the canal width measured along x (10 m wide water crossing at an angle). */
export const CANAL_HALF_X = 5.37;

export const VIADUCT = { x: canalX(LINE_Z), length: 24, width: 3.6 } as const;
export const CROSSING_X = 9;

/** Lanes used by moving people; keep static staging off these. */
export const LANES = {
  forecourt: 9.6,
  draggers: 11.3,
  pedicabs: 13,
  yard: 17.2,
} as const;

/** Local point on dry land with `pad` metres of land around it. */
export function dry(k: Kit, x: number, z: number, pad = 0.8): boolean {
  const pts: ReadonlyArray<readonly [number, number]> = [
    [x, z],
    [x + pad, z],
    [x - pad, z],
    [x, z + pad],
    [x, z - pad],
  ];
  return pts.every(([px, pz]) => {
    const [wx, wz] = k.world(px, pz);
    return isLand(wx, wz);
  });
}

/** West-bank land polygon (inside the district, 0.8 m clear of the water). */
export const WEST_LAND: ReadonlyArray<readonly [number, number]> = [
  [-46, -22],
  [26.8, -22],
  [9.4, 22.5],
  [2, 24],
  [-46, 22],
];

/** East-bank land polygon. */
export const EAST_LAND: ReadonlyArray<readonly [number, number]> = [
  [39.2, -22],
  [50, -22],
  [50, 18],
  [28, 24],
  [21.3, 24],
];

/** Axis-aligned local rectangle as a polygon. */
export function rect(x0: number, z0: number, x1: number, z1: number): Array<[number, number]> {
  return [
    [x0, z0],
    [x1, z0],
    [x1, z1],
    [x0, z1],
  ];
}

/** Clip a west-side rectangle against the west canal bank (keeps `pad` metres from the water). */
export function westRect(x0: number, z0: number, x1: number, z1: number, pad = 1.5): Array<[number, number]> {
  const edge = (z: number): number => Math.min(x1, canalX(z) - CANAL_HALF_X - pad);
  return [
    [x0, z0],
    [edge(z0), z0],
    [edge(z1), z1],
    [x0, z1],
  ];
}

/** East-bank polygon between two z values (keeps `pad` metres from the water). */
export function eastRect(z0: number, z1: number, x1: number, pad = 1.5): Array<[number, number]> {
  const edge = (z: number): number => canalX(z) + CANAL_HALF_X + pad;
  return [
    [edge(z0), z0],
    [x1, z0],
    [x1, z1],
    [edge(z1), z1],
  ];
}
