/**
 * Master plan of the festival town. Pure data + 2D helpers (no THREE imports) so it can be
 * unit-tested and shared by terrain, districts, navigation, hints and dev overlays.
 *
 * Axes: +x east (screen right), +z south (toward the default camera), +y up. Units are metres;
 * an adult is ~1.7 m tall. Land surface is y = 0, sea/canal water surface is y = WATER_Y.
 */
export type Pt = readonly [number, number];

export const WORLD = { minX: -135, maxX: 135, minZ: -100, maxZ: 100 } as const;
export const WATER_Y = -1.0;
export const QUAY_Z = 38;
export const CANAL_WIDTH = 10;

/** Canal centreline from the harbour mouth (south) to the northern edge. */
export const CANAL_CENTER: readonly Pt[] = [
  [-24, 44],
  [-23, 38],
  [-16, 20],
  [-6, 2],
  [-2, -26],
  [9, -54],
  [27, -100],
  [29, -106],
];

/** Sea wall / promenade edge of the east bank, west -> east. South of this is beach + sea. */
export const EAST_SHORE: readonly Pt[] = [
  [4, 38],
  [16, 42],
  [28, 50],
  [60, 53],
  [100, 52],
  [135, 49],
  [141, 49],
];

/** Where sand meets water, west -> east (beach district). */
export const BEACH_WATERLINE: readonly Pt[] = [
  [2, 50],
  [14, 58],
  [30, 67],
  [60, 72],
  [95, 71],
  [120, 67],
  [141, 63],
];

export type DistrictId =
  | 'harbor'
  | 'market'
  | 'cafe'
  | 'music'
  | 'funfair'
  | 'gardens'
  | 'sports'
  | 'tram'
  | 'canal'
  | 'rooftops'
  | 'craft'
  | 'beach';

export interface DistrictDef {
  readonly id: DistrictId;
  readonly name: string;
  /** world-space outline (used for hints, dev overlay, crowd ownership) */
  readonly polygon: readonly Pt[];
  /** authoring anchor: district-local (0,0) maps here */
  readonly anchor: Pt;
  /** authoring frame rotation in radians (local +x rotated about y) */
  readonly rotation: number;
  /** short visual brief used in hints */
  readonly blurb: string;
}

export const DISTRICTS: readonly DistrictDef[] = [
  {
    id: 'canal',
    name: 'Canal Bridges',
    polygon: [
      [-36, 38], [-29, 20], [-19, 2], [-15, -26], [-4, -54], [22, -54], [11, -26], [7, 2], [-3, 20], [-10, 38],
    ],
    anchor: [-6, 2],
    rotation: 0,
    blurb: 'the canal and its five bridges',
  },
  {
    id: 'harbor',
    name: 'Harbour & Boat Parade',
    polygon: [[-135, 24], [-33, 24], [-22, 38], [-8, 56], [-8, 100], [-135, 100]],
    anchor: [-78, 38],
    rotation: 0,
    blurb: 'the harbour quay, piers and boat parade',
  },
  {
    id: 'market',
    name: 'Fish & Produce Market',
    polygon: [[-108, -9], [-24, -9], [-33, 24], [-108, 24]],
    anchor: [-70, 8],
    rotation: 0.1,
    blurb: 'the striped stalls of the fish and produce market',
  },
  {
    id: 'craft',
    name: 'Craft & Construction Yard',
    polygon: [[-135, -56], [-101, -56], [-101, -9], [-108, -9], [-108, 24], [-135, 24]],
    anchor: [-119, -16],
    rotation: 0,
    blurb: 'the scaffolds, kilns and timber of the craft yard',
  },
  {
    id: 'cafe',
    name: 'Café Lanes & Bakery',
    polygon: [[-101, -56], [-6, -56], [-17, -9], [-101, -9]],
    anchor: [-58, -32],
    rotation: -0.16,
    blurb: 'the café lanes around the bakery',
  },
  {
    id: 'rooftops',
    name: 'Rooftop Terraces',
    polygon: [[-135, -100], [-52, -100], [-52, -56], [-135, -56]],
    anchor: [-94, -78],
    rotation: 0,
    blurb: 'the hillside rooftops and laundry terraces',
  },
  {
    id: 'tram',
    name: 'Tram Station',
    polygon: [[-52, -100], [44, -100], [44, -60], [22, -54], [-4, -54], [-52, -56]],
    anchor: [-6, -78],
    rotation: 0,
    blurb: 'the tram station and its luggage chaos',
  },
  {
    id: 'music',
    name: 'Music Square',
    polygon: [[22, -54], [44, -60], [58, -60], [58, 20], [22, 20], [7, 2], [11, -26]],
    anchor: [34, -18],
    rotation: 0,
    blurb: 'the bandstand and fountain of the music square',
  },
  {
    id: 'gardens',
    name: 'Botanical Gardens',
    polygon: [[44, -100], [135, -100], [135, -38], [58, -38], [58, -60], [44, -60]],
    anchor: [92, -70],
    rotation: 0,
    blurb: 'the greenhouse and hedges of the botanical gardens',
  },
  {
    id: 'funfair',
    name: 'Funfair',
    polygon: [[58, -38], [135, -38], [135, 20], [58, 20]],
    anchor: [96, -9],
    rotation: 0,
    blurb: 'the big wheel and tents of the funfair',
  },
  {
    id: 'sports',
    name: 'Sports & Playground',
    polygon: [[22, 20], [135, 20], [135, 44], [30, 44], [16, 38], [4, 38], [-3, 20]],
    anchor: [80, 32],
    rotation: 0,
    blurb: 'the pitches and playground',
  },
  {
    id: 'beach',
    name: 'Beach Promenade',
    polygon: [[4, 38], [16, 38], [30, 44], [135, 44], [135, 100], [-8, 100], [-8, 56]],
    anchor: [78, 58],
    rotation: 0,
    blurb: 'the beach promenade and pleasure pier',
  },
];

export function districtById(id: DistrictId): DistrictDef {
  const d = DISTRICTS.find((x) => x.id === id);
  if (!d) throw new Error(`Unknown district: ${id}`);
  return d;
}

export function pointInPolygon(x: number, z: number, poly: readonly Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i] as Pt;
    const b = poly[j] as Pt;
    if (a[1] > z !== b[1] > z && x < ((b[0] - a[0]) * (z - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

/** District containing a world point (first match in priority order), or nearest by anchor. */
export function districtAt(x: number, z: number): DistrictDef {
  for (const d of DISTRICTS) if (pointInPolygon(x, z, d.polygon)) return d;
  let best = DISTRICTS[0] as DistrictDef;
  let bestD = Infinity;
  for (const d of DISTRICTS) {
    const dx = d.anchor[0] - x;
    const dz = d.anchor[1] - z;
    const dist = dx * dx + dz * dz;
    if (dist < bestD) {
      bestD = dist;
      best = d;
    }
  }
  return best;
}

/**
 * Offset a polyline sideways. Positive = left of the travel direction; the canal centreline runs
 * south -> north (decreasing z), so its left is west (decreasing x).
 */
export function offsetPolyline(points: readonly Pt[], offset: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < points.length; i++) {
    const prev = points[Math.max(0, i - 1)] as Pt;
    const next = points[Math.min(points.length - 1, i + 1)] as Pt;
    const dx = next[0] - prev[0];
    const dz = next[1] - prev[1];
    const len = Math.hypot(dx, dz) || 1;
    const p = points[i] as Pt;
    out.push([p[0] + (dz / len) * offset, p[1] - (dx / len) * offset]);
  }
  return out;
}

/** Canal banks. West bank edge / east bank edge, ordered south -> north. */
export const CANAL_WEST: readonly Pt[] = offsetPolyline(CANAL_CENTER, CANAL_WIDTH / 2);
export const CANAL_EAST: readonly Pt[] = offsetPolyline(CANAL_CENTER, -CANAL_WIDTH / 2);

/** x where a canal bank polyline (ordered south -> north) crosses the quay line z = QUAY_Z. */
function bankAtQuay(line: readonly Pt[]): number {
  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i] as Pt;
    const b = line[i + 1] as Pt;
    if ((a[1] - QUAY_Z) * (b[1] - QUAY_Z) <= 0 && a[1] !== b[1]) {
      return a[0] + ((b[0] - a[0]) * (QUAY_Z - a[1])) / (b[1] - a[1]);
    }
  }
  return (line[0] as Pt)[0];
}

/** Bank vertices strictly north of the quay line, ordered south -> north. */
function bankInland(line: readonly Pt[]): Pt[] {
  return line.filter((p) => p[1] < QUAY_Z - 1e-6);
}

/** Land outline west of the canal (counter-clockwise in x/z). */
export function westLandOutline(): Pt[] {
  return [[WORLD.minX - 6, QUAY_Z], [bankAtQuay(CANAL_WEST), QUAY_Z], ...bankInland(CANAL_WEST), [WORLD.minX - 6, WORLD.minZ - 6]];
}

/** Land outline east of the canal. */
export function eastLandOutline(): Pt[] {
  return [...bankInland(CANAL_EAST).reverse(), [bankAtQuay(CANAL_EAST), QUAY_Z], ...EAST_SHORE, [WORLD.maxX + 6, WORLD.minZ - 6]];
}

export function distToSegment(px: number, pz: number, a: Pt, b: Pt): number {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const l2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (pz - a[1]) * dz) / l2));
  return Math.hypot(px - (a[0] + dx * t), pz - (a[1] + dz * t));
}

export function distToPolyline(px: number, pz: number, line: readonly Pt[]): number {
  let best = Infinity;
  for (let i = 0; i < line.length - 1; i++) {
    best = Math.min(best, distToSegment(px, pz, line[i] as Pt, line[i + 1] as Pt));
  }
  return best;
}

/** True when a point is on walkable land (not sea, canal or beyond the world edge). */
export function isLand(x: number, z: number): boolean {
  if (x < WORLD.minX || x > WORLD.maxX || z < WORLD.minZ) return false;
  return pointInPolygon(x, z, westLandOutline()) || pointInPolygon(x, z, eastLandOutline());
}

/** True when a point is over open water (sea, harbour basin or canal). */
export function isWater(x: number, z: number): boolean {
  if (isLand(x, z)) return false;
  if (x > 0 && z < polylineZAt(BEACH_WATERLINE, x) && z > polylineZAt(EAST_SHORE, x)) return false;
  return true;
}

/** z of a west->east polyline at a given x (clamped). */
export function polylineZAt(line: readonly Pt[], x: number): number {
  const first = line[0] as Pt;
  const last = line[line.length - 1] as Pt;
  if (x <= first[0]) return first[1];
  if (x >= last[0]) return last[1];
  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i] as Pt;
    const b = line[i + 1] as Pt;
    if (x >= a[0] && x <= b[0]) return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0] || 1);
  }
  return last[1];
}
