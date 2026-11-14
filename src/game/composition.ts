/**
 * Screen composition for the fixed view. Pure math (no THREE, no DOM) so it is unit-testable.
 *
 * The camera scale comes from a readable character size, not from the size of the town: larger
 * viewports simply show more of the continuous world. The view centre is derived from the hero's
 * position and a seeded on-screen slot, then clamped so the whole viewport (plus overscan) stays
 * over populated town — never beyond the built edges or far out to sea.
 */
import { BEACH_WATERLINE, QUAY_Z, WORLD, polylineZAt } from '../world/layout';

export interface ViewSpec {
  readonly x: number;
  readonly z: number;
  readonly azimuth: number;
  readonly elevation: number;
  readonly ppm: number;
}

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export const VIEW_ELEVATION = 0.72;
/** metres of generated world kept beyond every viewport edge */
export const OVERSCAN = 3;
/** how far beyond the quay / waterline the view may reach (occupied water only) */
const SEA_REACH_HARBOUR = 24;
const SEA_REACH_BEACH = 20;
const EDGE = 2;

/**
 * Pixels per metre giving a readable figure. Heights are foreshortened by cos(elevation), so 34 px/m
 * shows a 1.7 m adult about 43 px tall on desktop; phones get a slightly smaller scale.
 */
export function basePpm(width: number, height: number): number {
  const minDim = Math.min(width, height);
  return Math.max(26, Math.min(34, 20 + minDim / 64));
}

/** On-screen height in CSS px of something `metres` tall standing on the ground. */
export function screenHeight(ppm: number, metres: number): number {
  return metres * ppm * Math.cos(VIEW_ELEVATION);
}

/** Southern limit of occupied world at a given x (quay basin in the west, beach shallows in the east). */
export function southLimit(x: number): number {
  if (x < -8) return QUAY_Z + SEA_REACH_HARBOUR;
  return polylineZAt(BEACH_WATERLINE, x) + SEA_REACH_BEACH;
}

export interface Footprint {
  readonly minX: number;
  readonly maxX: number;
  readonly minZ: number;
  readonly maxZ: number;
  /** the four ground corners: near-left, near-right, far-right, far-left */
  readonly corners: ReadonlyArray<readonly [number, number]>;
}

/** Ground area covered by the viewport (with overscan) for a view. */
export function footprint(view: ViewSpec, width: number, height: number, overscan = OVERSCAN): Footprint {
  const ca = Math.cos(view.azimuth);
  const sa = Math.sin(view.azimuth);
  const hw = width / (2 * view.ppm) + overscan;
  const hh = height / (2 * view.ppm * Math.sin(view.elevation)) + overscan;
  /* screen-right on the ground = (ca, -sa); screen-up on the ground = (-sa, -ca) */
  const corner = (sx: number, sy: number): [number, number] => [view.x + ca * hw * sx - sa * hh * sy, view.z - sa * hw * sx - ca * hh * sy];
  const corners = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)];
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const [x, z] of corners) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
  }
  return { minX, maxX, minZ, maxZ, corners };
}

/** Shift (and if the viewport is larger than the world, tighten) a view until it only shows world. */
export function clampView(view: ViewSpec, width: number, height: number): ViewSpec {
  let v = view;
  for (let pass = 0; pass < 24; pass++) {
    const f = footprint(v, width, height);
    const spanX = f.maxX - f.minX;
    const spanZ = f.maxZ - f.minZ;
    const availX = WORLD.maxX - WORLD.minX - EDGE * 2;
    let south = Infinity;
    for (let i = 0; i <= 8; i++) south = Math.min(south, southLimit(f.minX + (spanX * i) / 8));
    const availZ = south - (WORLD.minZ + EDGE);
    if (spanX > availX || spanZ > availZ) {
      v = { ...v, ppm: v.ppm * Math.max(1.03, Math.max(spanX / availX, spanZ / availZ)) };
      continue;
    }
    let dx = 0;
    let dz = 0;
    if (f.minX < WORLD.minX + EDGE) dx = WORLD.minX + EDGE - f.minX;
    else if (f.maxX > WORLD.maxX - EDGE) dx = WORLD.maxX - EDGE - f.maxX;
    if (f.minZ < WORLD.minZ + EDGE) dz = WORLD.minZ + EDGE - f.minZ;
    else if (f.maxZ > south) dz = south - f.maxZ;
    if (Math.abs(dx) < 1e-3 && Math.abs(dz) < 1e-3) return v;
    v = { ...v, x: v.x + dx, z: v.z + dz };
  }
  return v;
}

/**
 * World point -> canvas CSS pixel. Exact for the orthographic game camera (the same mapping the
 * renderer uses), including height above the ground.
 */
export function projectPoint(view: ViewSpec, width: number, height: number, x: number, y: number, z: number): { x: number; y: number } {
  const ca = Math.cos(view.azimuth);
  const sa = Math.sin(view.azimuth);
  const dx = x - view.x;
  const dz = z - view.z;
  const right = dx * ca - dz * sa;
  const up = -dx * sa - dz * ca;
  return {
    x: width / 2 + right * view.ppm,
    y: height / 2 - up * view.ppm * Math.sin(view.elevation) - y * view.ppm * Math.cos(view.elevation),
  };
}

/** True when a standing figure at (x, y, z) is wholly inside the safe area of the canvas. */
export function figureInSafeArea(view: ViewSpec, width: number, height: number, x: number, y: number, z: number, blocks: readonly Rect[]): boolean {
  const feet = projectPoint(view, width, height, x, y, z);
  const head = projectPoint(view, width, height, x, y + 2.05, z);
  const half = view.ppm * 0.5;
  return (
    inSafeArea(feet.x - half, feet.y, width, height, blocks) &&
    inSafeArea(feet.x + half, feet.y, width, height, blocks) &&
    inSafeArea(head.x - half, head.y, width, height, blocks) &&
    inSafeArea(head.x + half, head.y, width, height, blocks)
  );
}

/** Area of the canvas where the hero may stand: inset from the edges and clear of HUD blocks. */
export function inSafeArea(px: number, py: number, width: number, height: number, blocks: readonly Rect[]): boolean {
  const mx = Math.max(34, width * 0.07);
  const top = Math.max(96, height * 0.13);
  const bottom = Math.max(54, height * 0.08);
  if (px < mx || px > width - mx || py < top || py > height - bottom) return false;
  for (const b of blocks) {
    if (px > b.x - 26 && px < b.x + b.w + 26 && py > b.y - 20 && py < b.y + b.h + 76) return false;
  }
  return true;
}

/**
 * The view that puts a world point at a seeded slot (u, v in 0..1 of the safe area) of the screen,
 * clamped to the world. The slot is fixed per puzzle, so resizes recompute the same composition.
 */
export function composeView(target: { x: number; y?: number; z: number }, slot: { u: number; v: number }, azimuth: number, width: number, height: number): ViewSpec {
  const ppm = basePpm(width, height);
  const mx = Math.max(34, width * 0.07);
  const top = Math.max(96, height * 0.13);
  const bottom = Math.max(54, height * 0.08);
  const px = mx + slot.u * (width - mx * 2);
  const py = top + slot.v * (height - top - bottom);
  const right = (px - width / 2) / ppm;
  /* the slot positions the figure's waist; solve the ground offset including its height */
  const lift = ((target.y ?? 0) + 1) * ppm * Math.cos(VIEW_ELEVATION);
  const up = (-(py - height / 2) - lift) / (ppm * Math.sin(VIEW_ELEVATION));
  const ca = Math.cos(azimuth);
  const sa = Math.sin(azimuth);
  /* target = centre + right * (ca, -sa) + up * (-sa, -ca) */
  const x = target.x - (right * ca - up * sa);
  const z = target.z - (-right * sa - up * ca);
  return clampView({ x, z, azimuth, elevation: VIEW_ELEVATION, ppm }, width, height);
}
