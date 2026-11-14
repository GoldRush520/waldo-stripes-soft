/**
 * Café lanes master plan, in DISTRICT-LOCAL metres (the frame is rotated -0.16 rad from the world,
 * so the north and south edges of the polygon run slightly "uphill" toward +x here).
 *
 * Perimeter terraces follow the polygon edges: they are placed with `edge(u, v)`, where (u, v) are
 * world-aligned offsets from the anchor (u east, v south) and EDGE_ROT re-aligns a placement with
 * the world axes. Interior blocks sit square to the local frame, which makes the lanes between the
 * two systems taper — the irregular, hand-drawn lane pattern of the district.
 *
 *   north edge (v = -24) ─ NW terrace ─ bakery yard + chimney ─ bakery ─ NE terraces ─ bookshop
 *            Lane 1 (tapers)                Bakery Piazza                  NE lane       Book Square
 *        C1 block (back to back)         (cafés, fountain)          C2 block (back to back)
 *            Lane 2 ─────────────── corner café (roof terrace) ─────────────── south lane
 *   south edge: florist garden & café garden           chess & proposal terrace
 */

export type P2 = readonly [number, number];

export const EDGE_ROT = 0.16;
const EC = Math.cos(EDGE_ROT);
const ES = Math.sin(EDGE_ROT);

/** World-aligned offset (u east, v south of the anchor) -> district-local {x, z}. */
export function edge(u: number, v: number): { x: number; z: number } {
  return { x: u * EC + v * ES, z: -u * ES + v * EC };
}

/** Local polygon of the district (world polygon converted to the local frame). */
export const POLY: readonly P2[] = [edge(-43, -24), edge(52, -24), edge(41, 23), edge(-43, 23)].map((p) => [p.x, p.z] as const);

/** Distance of a local point inside the polygon (negative outside). */
export function insideBy(x: number, z: number): number {
  let best = Infinity;
  let inside = false;
  for (let i = 0, j = POLY.length - 1; i < POLY.length; j = i++) {
    const a = POLY[i] as P2;
    const b = POLY[j] as P2;
    if (a[1] > z !== b[1] > z && x < ((b[0] - a[0]) * (z - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz || 1)));
    best = Math.min(best, Math.hypot(x - (a[0] + dx * t), z - (a[1] + dz * t)));
  }
  return inside ? best : -best;
}

/** Row of houses: origin is the row centre (houses run along the origin's local +x, fronts face +z). */
export interface RowFrame {
  readonly x: number;
  readonly z: number;
  readonly rot: number;
}

const NORTH_V = -17.75;
export const ROW_NW: RowFrame = { ...edge(-24.5, NORTH_V), rot: EDGE_ROT };
export const BAKERY: RowFrame = { ...edge(0, NORTH_V), rot: EDGE_ROT };
export const ROW_NEA: RowFrame = { ...edge(12.75, NORTH_V), rot: EDGE_ROT };
export const ROW_NEB: RowFrame = { ...edge(35.6, NORTH_V), rot: EDGE_ROT };
/** chimney + bake-oven yard between the NW terrace and the bakery */
export const CHIMNEY: RowFrame = { ...edge(-6.3, -19.7), rot: EDGE_ROT };
export const BAKE_YARD: RowFrame = { ...edge(-6.2, -15.6), rot: EDGE_ROT };

/** Interior blocks: back-to-back rows around a centre (C1 square to the frame, C2 slightly turned). */
export const C1: RowFrame = { x: -26, z: 3.0, rot: 0 };
export const C2: RowFrame = { x: 19, z: -3.0, rot: -0.06 };
export const ROW_D = 6.5;

/** The corner café with its roof terrace, facing the camera. */
export const CORNER_CAFE: RowFrame = { x: -4, z: 14.6, rot: 0.05 };

/** Open spaces */
export const PIAZZA = { x: -4, z: -2.5 } as const;
export const BOOK_SQUARE = { x: 37, z: -9 } as const;

/** Lane centrelines (local [x, y, z]) */
export type V3 = readonly [number, number, number];

export const LANE1: readonly V3[] = [
  [-39, 0, -6.2],
  [-30, 0, -6.4],
  [-20, 0, -7.0],
  [-12, 0, -9.0],
];
export const LANE_NE: readonly V3[] = [
  [4, 0, -12.8],
  [14, 0, -12.9],
  [24, 0, -13.6],
  [33, 0, -15.6],
];
export const LANE2: readonly V3[] = [
  [-38, 0, 12.0],
  [-26, 0, 11.9],
  [-14, 0, 10.6],
  [2, 0, 8.6],
  [16, 0, 7.0],
  [30, 0, 6.6],
  [40, 0, 6.0],
];
const passTop = edge(23.7, -22.6);
const passMouth = edge(23.7, -13);
export const PASSAGE: readonly V3[] = [
  [passTop.x, 0, passTop.z],
  [passMouth.x, 0, passMouth.z],
  [32, 0, -8],
  [33.5, 0, 4],
];

/** Loop round the C1 block followed by the runaway bread cart (clockwise seen from above). */
export const CART_LOOP: readonly V3[] = [
  [-14.4, 0, -5.8],
  [-14.4, 0, 11.2],
  [-37.6, 0, 11.2],
  [-37.6, 0, -5.4],
];
