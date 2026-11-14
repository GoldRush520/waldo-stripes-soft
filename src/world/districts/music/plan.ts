/**
 * Music square master plan (district-local metres, anchor at world (34,-18), rotation 0).
 *
 * The octagonal bandstand sits in the middle with its steps toward the camera (+z); curved rows of
 * chairs and benches face it from the south. An elliptical parade ring of pale paving circles the
 * bandstand and its audience; the clock tower stands just north of the ring. House rows close the
 * north (one slanted row + a short flat row) and the east (two rows split by a lane). The southern
 * band holds the fountain, maypole, tightrope and dance floor; the west strip by the canal holds the
 * puppet theatre, the busker and the street organ.
 */
import type { Kit } from '../../kit';

export type P2 = readonly [number, number];

export const BAND = { x: -2, z: 1 } as const;
export const DECK_Y = 0.9;

export const RING = { x: -2, z: 4, rx: 13, rz: 11 } as const;

export const TOWER = { x: 2, z: -12 } as const;
export const FOUNTAIN = { x: -12.5, z: 24 } as const;
export const MAYPOLE = { x: -4.5, z: 23.5 } as const;
export const DANCE = { x: 9.5, z: 22.5 } as const;
export const ROPE = { x: 3, z: 31.5 } as const;
export const PUPPET = { x: -18.5, z: -4 } as const;
export const STATUE = { x: 7.5, z: -10 } as const;
export const ORGAN = { x: -14, z: -14 } as const;
export const BUSKER = { x: -18.2, z: 9 } as const;
export const ICECREAM = { x: 12.5, z: 30.5 } as const;

/** Point on an ellipse at angle t (t = 0 is +z / south). */
export function ellipsePoint(cx: number, cz: number, rx: number, rz: number, t: number): [number, number] {
  return [cx + Math.sin(t) * rx, cz + Math.cos(t) * rz];
}

export function ellipse(cx: number, cz: number, rx: number, rz: number, n: number): [number, number][] {
  return Array.from({ length: n }, (_, i) => ellipsePoint(cx, cz, rx, rz, (i / n) * Math.PI * 2));
}

export function circle(cx: number, cz: number, r: number, n: number, phase = 0): [number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const a = phase + (i / n) * Math.PI * 2;
    return [cx + Math.sin(a) * r, cz + Math.cos(a) * r] as [number, number];
  });
}

export function rect(cx: number, cz: number, hw: number, hd: number): [number, number][] {
  return [
    [cx - hw, cz - hd],
    [cx + hw, cz - hd],
    [cx + hw, cz + hd],
    [cx - hw, cz + hd],
  ];
}

/** Heading that faces from (x, z) toward (tx, tz). */
export function facing(x: number, z: number, tx: number, tz: number): number {
  return Math.atan2(tx - x, tz - z);
}

/** Speed multiplier that keeps a locomotion clip's feet in step with a route speed. */
export function stepRate(speed: number, duration: number, stride: number): number {
  return (speed * duration) / stride;
}

/** Declare a small rectangular walkable patch (balconies, plinths, podium) at height y. */
export function patch(k: Kit, x: number, z: number, hw: number, hd: number, y: number, kind: 'deck' | 'roof' = 'deck'): void {
  k.surface(kind, rect(x, z, hw, hd), y);
}
