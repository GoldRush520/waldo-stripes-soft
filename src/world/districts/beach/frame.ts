/**
 * Beach district frame: district-local helpers for the three height bands.
 *
 * Local (0,0) is the district anchor (world 78, 58; rotation 0), so local = world - anchor.
 * - promenade: land north of EAST_SHORE at y = 0
 * - sand: between EAST_SHORE and BEACH_WATERLINE at y = SAND_Y
 * - sea: beyond the waterline, water surface WATER_Y
 */
import { BEACH_WATERLINE, EAST_SHORE, WATER_Y, districtById, polylineZAt } from '../../layout';

const ANCHOR = districtById('beach').anchor;
const AX = ANCHOR[0];
const AZ = ANCHOR[1];

export const SAND_Y = -0.7;
export const SEA_Y = WATER_Y;
/** feet of people wading in the shallows */
export const WADE_Y = -1.05;
/** feet of swimmers: the swim clips sit the body at the surface from here */
export const SWIM_Y = -1.75;
/** north limit of authored promenade content (2.5 m inside the district edge at world z = 44) */
export const PROM_NORTH = 44 + 2.5 - AZ;
/** easternmost authored x (2.5 m inside world x = 135) */
export const EAST_X = 135 - 2.5 - AX;
/** southern limit for sea content (2.5 m inside world z = 100) */
export const SEA_SOUTH = 100 - 2.5 - AZ;

export type P2 = readonly [number, number];
export type P3 = readonly [number, number, number];

/** Local z of the promenade edge (sea wall) at local x. */
export function shoreZ(x: number): number {
  return polylineZAt(EAST_SHORE, x + AX) - AZ;
}

/** Local z of the waterline at local x. */
export function waterZ(x: number): number {
  return polylineZAt(BEACH_WATERLINE, x + AX) - AZ;
}

/** A point on the sand: t = 0 at the sea wall, 1 at the waterline. */
export function sandZ(x: number, t: number): number {
  const a = shoreZ(x);
  return a + (waterZ(x) - a) * t;
}

/** Local z of the north edge of the district polygon (the shared street) at local x. */
export function northEdgeZ(x: number): number {
  const wx = x + AX;
  if (wx >= 30) return 44 - AZ;
  if (wx <= 16) return 38 - AZ;
  return 38 + ((wx - 16) / 14) * 6 - AZ;
}

/** Usable promenade band [north, south] at local x (inside the 2.5 m margin, short of the railing). */
export function promBand(x: number): readonly [number, number] {
  return [Math.max(PROM_NORTH, northEdgeZ(x) + 2.5), shoreZ(x) - 0.45];
}

/** Rotation that aligns a prop's +x with the sea wall at local x (its +z then faces the sea). */
export function shoreRot(x: number): number {
  const dz = shoreZ(x + 0.5) - shoreZ(x - 0.5);
  return Math.atan2(-dz, 1);
}

/** Sampled polyline helper: points along the sea wall between two local x values. */
export function alongShore(x0: number, x1: number, step: number, offset: number, y = 0): P3[] {
  const n = Math.max(1, Math.round(Math.abs(x1 - x0) / step));
  return Array.from({ length: n + 1 }, (_, i) => {
    const x = x0 + ((x1 - x0) * i) / n;
    return [x, y, shoreZ(x) + offset] as const;
  });
}

/** Sampled polyline at a fixed fraction across the sand. */
export function acrossSand(x0: number, x1: number, step: number, t: number): P3[] {
  const n = Math.max(1, Math.round(Math.abs(x1 - x0) / step));
  return Array.from({ length: n + 1 }, (_, i) => {
    const x = x0 + ((x1 - x0) * i) / n;
    return [x, SAND_Y, sandZ(x, t)] as const;
  });
}

/** Closed sand polygon between two x values and two sand fractions. */
export function sandPatch(x0: number, x1: number, t0: number, t1: number, step = 4): P2[] {
  const top = acrossSand(x0, x1, step, t0).map(([x, , z]) => [x, z] as const);
  const bottom = acrossSand(x1, x0, step, t1).map(([x, , z]) => [x, z] as const);
  return [...top, ...bottom];
}

/** The whole walkable sand inside the district (local polygon). */
export function sandPolygon(): P2[] {
  const north = alongShore(-76, EAST_X + 2.5, 4, 0).map(([x, , z]) => [x, z] as const);
  const south: P2[] = [];
  for (let x = EAST_X + 2.5; x >= -84; x -= 4) south.push([x, waterZ(x)]);
  return [...north, ...south];
}

/** Pier geometry constants (local). Deck top is flush with the promenade at y = 0. */
export const PIER = {
  x: 17,
  width: 6,
  z0: shoreZ(17),
  z1: 28,
  head: { x0: 10, x1: 24, z0: 28, z1: 40 },
  pavilion: { x: 17, z: 33, half: 3.2 },
  deckY: 0,
} as const;

/** Sand x-range kept clear because the pier passes overhead. */
export const UNDER_PIER: readonly [number, number] = [PIER.x - PIER.width / 2 - 1.2, PIER.x + PIER.width / 2 + 1.2];
