/**
 * Depth separation for static scenery. Surfaces from different placements that were authored at
 * exactly the same height (neighbouring roofs, a rug on a deck, a tray on a table) z-fight: the
 * depth buffer cannot decide which one is in front and the winner flickers as the camera pans.
 *
 * The allocator hands every placement a level that differs from the level of every earlier
 * placement whose bounding box touches it. The level becomes a tiny offset (one millimetre up and
 * two millimetres sideways per level), so no two touching placements share a depth. Offsets stay
 * far below what can be seen at game scale; a placement that touches nothing is not moved.
 */

/** height step between touching placements, in metres (well above depth-buffer precision here) */
export const LIFT_STEP = 0.001;
/** sideways step along each of the placement's own axes, for flush vertical faces */
export const HORIZONTAL_STEP = 0.002;
/** number of distinct levels; the largest offset is (LIFT_LEVELS - 1) steps = 15 mm up, 30 mm sideways */
export const LIFT_LEVELS = 16;

const CELL = 8;
/** boxes closer than this count as touching */
const MARGIN = 0.02;
/** boxes larger than this in plan are indexed in one shared list instead of per cell */
const LARGE = 96;

interface Box {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
  readonly minZ: number;
  readonly maxZ: number;
  readonly level: number;
}

export interface Bounds3 {
  readonly min: readonly [number, number, number];
  readonly max: readonly [number, number, number];
}

function touches(a: Box, b: Omit<Box, 'level'>): boolean {
  return (
    a.minX <= b.maxX + MARGIN &&
    a.maxX >= b.minX - MARGIN &&
    a.minY <= b.maxY + MARGIN &&
    a.maxY >= b.minY - MARGIN &&
    a.minZ <= b.maxZ + MARGIN &&
    a.maxZ >= b.minZ - MARGIN
  );
}

/** World-space bounding box of local bounds after scale, rotation about y and translation. */
export function placedBounds(local: Bounds3, x: number, y: number, z: number, cos: number, sin: number, scale: number): Omit<Box, 'level'> {
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const lx of [local.min[0], local.max[0]]) {
    for (const lz of [local.min[2], local.max[2]]) {
      const wx = lx * scale * cos + lz * scale * sin + x;
      const wz = -lx * scale * sin + lz * scale * cos + z;
      if (wx < minX) minX = wx;
      if (wx > maxX) maxX = wx;
      if (wz < minZ) minZ = wz;
      if (wz > maxZ) maxZ = wz;
    }
  }
  return { minX, maxX, minY: local.min[1] * scale + y, maxY: local.max[1] * scale + y, minZ, maxZ };
}

export class LiftAllocator {
  private readonly cells = new Map<string, Box[]>();
  private readonly large: Box[] = [];
  private fallback = 0;

  /** Register a placement's world bounds and return its level (0 = unmoved; multiply by the steps above). */
  assign(box: Omit<Box, 'level'>): number {
    let used = 0;
    for (const other of this.large) if (touches(other, box)) used |= 1 << other.level;
    const big = box.maxX - box.minX > LARGE || box.maxZ - box.minZ > LARGE;
    const x0 = Math.floor((box.minX - MARGIN) / CELL);
    const x1 = Math.floor((box.maxX + MARGIN) / CELL);
    const z0 = Math.floor((box.minZ - MARGIN) / CELL);
    const z1 = Math.floor((box.maxZ + MARGIN) / CELL);
    for (const list of big ? this.cells.values() : this.cellLists(x0, x1, z0, z1)) {
      for (const other of list) if (touches(other, box)) used |= 1 << other.level;
    }
    let level = 0;
    while (level < LIFT_LEVELS && (used & (1 << level)) !== 0) level++;
    if (level === LIFT_LEVELS) level = this.fallback++ % LIFT_LEVELS;
    const entry: Box = { ...box, level };
    if (big) {
      this.large.push(entry);
    } else {
      for (let gx = x0; gx <= x1; gx++) {
        for (let gz = z0; gz <= z1; gz++) {
          const key = `${gx},${gz}`;
          const list = this.cells.get(key);
          if (list) list.push(entry);
          else this.cells.set(key, [entry]);
        }
      }
    }
    return level;
  }

  private *cellLists(x0: number, x1: number, z0: number, z1: number): Generator<Box[]> {
    for (let gx = x0; gx <= x1; gx++) {
      for (let gz = z0; gz <= z1; gz++) {
        const list = this.cells.get(`${gx},${gz}`);
        if (list) yield list;
      }
    }
  }
}
