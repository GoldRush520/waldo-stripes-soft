/**
 * Botanical gardens master plan (district-local metres, anchor 92,-70, rotation 0).
 *
 * The district polygon is local x ∈ [-48, 43], z ∈ [-30, 32] minus the south-west notch
 * (x < -34 only reaches z = 10). Everything authored stays 2.5 m inside that edge.
 *
 *   north   raised terrace (y 2.4) carrying the glass palm-house, central + west stairs
 *   middle  east-west promenade: vine pergola walk (west) and rose arches (east)
 *   west    beehives, kitchen garden beds and a wildflower picnic meadow
 *   east    the hedge maze (north) and the topiary lawn (south)
 *   centre  the lily pond with toy boats
 *   south   picnic and kite lawns, the gazebo and the tethered hot-air balloon
 */
import type { Col } from '../../../core/geo';
import type { Kit } from '../../kit';

export type P2 = readonly [number, number];

export const TERRACE = { x0: -22, x1: 22, z0: -28, z1: -12, y: 2.4 } as const;
export const GREENHOUSE = { x: 0, z: -21.5 } as const;
export const STAIRS = { main: { x: 0, w: 4 }, west: { x: -19.5, w: 2.2 }, rise: 2.4, steps: 14, run: 0.32 } as const;
/** z of the foot of both flights (the top edge is the terrace front at TERRACE.z1) */
export const STAIRS_FOOT = TERRACE.z1 + STAIRS.steps * STAIRS.run;
export const PROMENADE = { z: -6, half: 1.6, x0: -45, x1: 40 } as const;
export const POND = { x: 0, z: 8, rx: 8.5, rz: 5, waterY: 0.2 } as const;
export const MAZE = { x0: 25.5, x1: 39.5, z0: -26.5, z1: -9.5 } as const;
export const TOPIARY = { x0: 13, x1: 39, z0: -2, z1: 13 } as const;
export const MEADOW = { x0: -44, x1: -27, z0: -11, z1: 6 } as const;
export const KITCHEN = { x0: -45, x1: -24, z0: -27, z1: -13 } as const;
export const GAZEBO = { x: -22, z: 19 } as const;
export const BALLOON = { x: 33, z: 22 } as const;

export function ellipse(cx: number, cz: number, rx: number, rz: number, n = 24): P2[] {
  return Array.from({ length: n }, (_, i): P2 => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * rx, cz + Math.sin(a) * rz];
  });
}

export function rect(x0: number, z0: number, x1: number, z1: number): P2[] {
  return [
    [x0, z0],
    [x1, z0],
    [x1, z1],
    [x0, z1],
  ];
}

/** Place a seat-bearing prop without a solid footprint (its seats sit inside it) and fill its seats. */
export function seatedOn(k: Kit, key: string, at: { x: number; z: number; y?: number; rot?: number; tint?: Col }, opts: Parameters<Kit['seated']>[2] = {}): number[] {
  k.prop(key, at, { walkThrough: true });
  return k.seated(key, at, { ...opts, place: false });
}

/** Solid footprints along a ground polyline (hedges, walls) so people and fills keep clear. */
export function blockLine(k: Kit, pts: readonly P2[], width: number): void {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i] as P2;
    const b = pts[i + 1] as P2;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const rot = -Math.atan2(b[1] - a[1], b[0] - a[0]);
    k.block((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, len + width, width, rot);
  }
}
