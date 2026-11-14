/**
 * GPU data stores for the crowd: palette, baked poses, motion records, route points and per-person
 * records. All of it is written once at build time into float textures; nothing here runs per frame.
 */
import * as THREE from 'three';
import { C, HAIR_TONES, SKIN_TONES, type ColorName, type RGB } from '../core/palette';
import { type BakedClip, type ClipDef, POSE_ROW_FLOATS, bakeClip } from './pose';
import {
  CAT_COUNT,
  MOTIONS_PER_ROW,
  MOTION_TEXELS,
  MOTION_TEX_WIDTH,
  MotionKind,
  PERSONS_PER_ROW,
  PERSON_TEXELS,
  PERSON_TEX_WIDTH,
  POSE_ROWS_PER_LINE,
  POSE_TEX_WIDTH,
  ROUTE_TEX_WIDTH,
} from './skeleton';

function floatTexture(data: Float32Array, width: number, height: number): THREE.DataTexture {
  const tex = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

/* ------------------------------------------------------------------ palette */

const PALETTE_SIZE = 128;

export class PaletteStore {
  private readonly data = new Float32Array(PALETTE_SIZE * 4);
  private readonly byKey = new Map<string, number>();
  private count = 0;
  /** actual palette slots of the skin / hair tones (index() deduplicates, so these need not be contiguous) */
  private readonly skinSlots: number[];
  private readonly hairSlots: number[];
  private tex: THREE.DataTexture | null = null;

  constructor() {
    for (const name of Object.keys(C) as ColorName[]) this.index(name);
    this.skinSlots = SKIN_TONES.map((c) => this.index(c));
    this.hairSlots = HAIR_TONES.map((c) => this.index(c));
  }

  /** Palette slot for a colour token or raw linear RGB (deduplicated). */
  index(color: ColorName | RGB): number {
    const rgb = typeof color === 'string' ? C[color] : color;
    const key = `${rgb[0].toFixed(4)},${rgb[1].toFixed(4)},${rgb[2].toFixed(4)}`;
    const hit = this.byKey.get(key);
    if (hit !== undefined) return hit;
    if (this.count >= PALETTE_SIZE) throw new Error('Crowd palette is full');
    const i = this.count++;
    this.data.set([rgb[0], rgb[1], rgb[2], 1], i * 4);
    this.byKey.set(key, i);
    if (this.tex) this.tex.needsUpdate = true;
    return i;
  }

  skin(i: number): number {
    const n = this.skinSlots.length;
    return this.skinSlots[((i % n) + n) % n] as number;
  }

  hair(i: number): number {
    const n = this.hairSlots.length;
    return this.hairSlots[((i % n) + n) % n] as number;
  }

  dispose(): void {
    this.tex?.dispose();
    this.tex = null;
  }

  texture(): THREE.DataTexture {
    if (!this.tex) this.tex = floatTexture(this.data, PALETTE_SIZE, 1);
    return this.tex;
  }
}

/* ------------------------------------------------------------------ poses */

export interface ClipRef {
  readonly id: string;
  readonly row: number;
  readonly rows: number;
  readonly duration: number;
  readonly stride: number;
}

export class PoseLibrary {
  private readonly clips = new Map<string, ClipRef>();
  private readonly baked: BakedClip[] = [];
  private rows = 0;
  private tex: THREE.DataTexture | null = null;

  constructor(defs: readonly ClipDef[]) {
    for (const def of defs) this.add(def);
  }

  add(def: ClipDef): void {
    if (this.clips.has(def.id)) throw new Error(`Duplicate clip: ${def.id}`);
    if (this.tex) throw new Error('Pose texture already built');
    const b = bakeClip(def);
    this.clips.set(def.id, { id: def.id, row: this.rows, rows: b.rows, duration: b.duration, stride: b.stride });
    this.baked.push(b);
    this.rows += b.rows;
  }

  has(id: string): boolean {
    return this.clips.has(id);
  }

  clip(id: string): ClipRef {
    const c = this.clips.get(id);
    if (!c) throw new Error(`Unknown clip: ${id}`);
    return c;
  }

  ids(): string[] {
    return [...this.clips.keys()];
  }

  get totalRows(): number {
    return this.rows;
  }

  dispose(): void {
    this.tex?.dispose();
    this.tex = null;
  }

  texture(): THREE.DataTexture {
    if (this.tex) return this.tex;
    const height = Math.max(1, Math.ceil(this.rows / POSE_ROWS_PER_LINE));
    const data = new Float32Array(POSE_TEX_WIDTH * height * 4);
    let row = 0;
    for (const b of this.baked) {
      data.set(b.data, row * POSE_ROW_FLOATS);
      row += b.rows;
    }
    this.tex = floatTexture(data, POSE_TEX_WIDTH, height);
    return this.tex;
  }
}

/* ------------------------------------------------------------------ motion + routes */

export type Vec3 = readonly [number, number, number];

export interface RouteRef {
  readonly start: number;
  readonly count: number;
  readonly length: number;
  readonly min: Vec3;
  readonly max: Vec3;
}

export interface MotionBounds {
  readonly min: Vec3;
  readonly max: Vec3;
}

const ROUTE_SPACING = 0.6;

function catmull(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number): Vec3 {
  const t2 = t * t;
  const t3 = t2 * t;
  const f = (a: number, b: number, c: number, d: number): number =>
    0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
  return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1]), f(p0[2], p1[2], p2[2], p3[2])];
}

export class MotionStore {
  private routeData = new Float32Array(ROUTE_TEX_WIDTH * 4 * 4);
  private routeCount = 0;
  private motionData = new Float32Array(MOTION_TEX_WIDTH * 4 * 4);
  private motionCount = 0;
  private readonly bounds: MotionBounds[] = [];
  /** per motion: route start index, point count, length, s0, speed, lateral, yOffset (route motions only) */
  private readonly routeParams: (readonly [number, number, number, number, number, number, number] | null)[] = [];
  private routeTex: THREE.DataTexture | null = null;
  private motionTex: THREE.DataTexture | null = null;

  /**
   * Register a closed loop through the given control points ([x, y, z]). Corners are rounded with a
   * Catmull-Rom spline and the loop is resampled at even spacing so the shader can index it directly.
   */
  addLoop(points: readonly Vec3[]): RouteRef {
    if (points.length < 2) throw new Error('A route needs at least two points');
    if (this.routeTex) throw new Error('MotionStore is finalised: add routes before textures() is called');
    const n = points.length;
    const dense: Vec3[] = [];
    for (let i = 0; i < n; i++) {
      const p0 = points[(i - 1 + n) % n] as Vec3;
      const p1 = points[i] as Vec3;
      const p2 = points[(i + 1) % n] as Vec3;
      const p3 = points[(i + 2) % n] as Vec3;
      const segLen = Math.hypot(p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]);
      const steps = Math.max(2, Math.ceil(segLen / 0.25));
      for (let s = 0; s < steps; s++) dense.push(catmull(p0, p1, p2, p3, s / steps));
    }
    const cum: number[] = [0];
    for (let i = 0; i < dense.length; i++) {
      const a = dense[i] as Vec3;
      const b = dense[(i + 1) % dense.length] as Vec3;
      cum.push((cum[i] as number) + Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
    }
    const length = cum[dense.length] as number;
    const count = Math.max(4, Math.round(length / ROUTE_SPACING));
    this.reserveRoute(count);
    const start = this.routeCount;
    const min: [number, number, number] = [Infinity, Infinity, Infinity];
    const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
    let seg = 0;
    for (let k = 0; k < count; k++) {
      const d = (k / count) * length;
      while (seg < dense.length - 1 && (cum[seg + 1] as number) < d) seg++;
      const a = dense[seg] as Vec3;
      const b = dense[(seg + 1) % dense.length] as Vec3;
      const span = (cum[seg + 1] as number) - (cum[seg] as number) || 1;
      const t = (d - (cum[seg] as number)) / span;
      const o = (start + k) * 4;
      for (let c = 0; c < 3; c++) {
        const v = (a[c] as number) + ((b[c] as number) - (a[c] as number)) * t;
        this.routeData[o + c] = v;
        if (v < (min[c] as number)) min[c] = v;
        if (v > (max[c] as number)) max[c] = v;
      }
    }
    this.routeCount += count;
    return { start, count, length, min, max };
  }

  /**
   * A there-and-back street route: walk the polyline keeping `lane` metres to the right, turn at
   * the end, and return on the other side. Produces a closed loop.
   */
  addStreet(points: readonly Vec3[], lane = 0.9): RouteRef {
    const side = (dir: 1 | -1): Vec3[] => {
      const out: Vec3[] = [];
      for (let i = 0; i < points.length; i++) {
        const a = points[Math.max(0, i - 1)] as Vec3;
        const b = points[Math.min(points.length - 1, i + 1)] as Vec3;
        const dx = b[0] - a[0];
        const dz = b[2] - a[2];
        const len = Math.hypot(dx, dz) || 1;
        const p = points[i] as Vec3;
        out.push([p[0] - (dz / len) * lane * dir, p[1], p[2] + (dx / len) * lane * dir]);
      }
      return out;
    };
    return this.addLoop([...side(1), ...side(-1).reverse()]);
  }

  private reserveRoute(extra: number): void {
    const need = (this.routeCount + extra) * 4;
    if (need <= this.routeData.length) return;
    let rows = this.routeData.length / (ROUTE_TEX_WIDTH * 4);
    while (rows * ROUTE_TEX_WIDTH * 4 < need) rows *= 2;
    const grown = new Float32Array(rows * ROUTE_TEX_WIDTH * 4);
    grown.set(this.routeData);
    this.routeData = grown;
  }

  private push(values: readonly number[], bounds: MotionBounds): number {
    if (this.motionTex) throw new Error('MotionStore is finalised: add motions before textures() is called');
    const id = this.motionCount++;
    const need = this.motionCount * MOTION_TEXELS * 4;
    if (need > this.motionData.length) {
      const grown = new Float32Array(this.motionData.length * 2);
      grown.set(this.motionData);
      this.motionData = grown;
    }
    this.motionData.set(values, id * MOTION_TEXELS * 4);
    this.bounds.push(bounds);
    this.routeParams.push(
      values[0] === MotionKind.Route
        ? [values[2] as number, values[3] as number, values[4] as number, values[5] as number, values[6] as number, values[7] as number, values[8] as number]
        : null,
    );
    return id;
  }

  /** Follow a route. `s0` start distance, `speed` m/s (negative reverses), `lateral` metres left. */
  route(r: RouteRef, s0: number, speed: number, lateral = 0, yOffset = 0, bob = 0): number {
    const pad = Math.abs(lateral) + 1;
    return this.push(
      [MotionKind.Route, 0, r.start, r.count, r.length, s0, speed, lateral, yOffset, bob, 0, 0],
      { min: [r.min[0] - pad, r.min[1] + yOffset - bob, r.min[2] - pad], max: [r.max[0] + pad, r.max[1] + yOffset + bob, r.max[2] + pad] },
    );
  }

  private around(kind: number, c: Vec3, yaw: number, speed: number, phase: number, a: number, b: number, reach: number): number {
    return this.push([kind, yaw, 0, 0, c[0], c[1], c[2], speed, phase, a, b, 0], {
      min: [c[0] - reach, c[1] - reach, c[2] - reach],
      max: [c[0] + reach, c[1] + reach, c[2] + reach],
    });
  }

  spin(center: Vec3, speed: number, phase = 0, reach = 6): number {
    return this.around(MotionKind.Spin, center, 0, speed, phase, 0, 0, reach);
  }

  wheel(hub: Vec3, yaw: number, speed: number, phase: number, radius: number): number {
    return this.around(MotionKind.Wheel, hub, yaw, speed, phase, radius, 0, radius + 3);
  }

  axle(hub: Vec3, yaw: number, speed: number, phase = 0, reach = 16): number {
    return this.around(MotionKind.Axle, hub, yaw, speed, phase, 0, 0, reach);
  }

  swing(pivot: Vec3, yaw: number, freq: number, phase: number, amplitude: number, reach = 4): number {
    return this.around(MotionKind.Swing, pivot, yaw, freq, phase, amplitude, 0, reach);
  }

  bob(base: Vec3, yaw: number, freq: number, phase: number, heave: number, roll: number, reach = 6): number {
    return this.around(MotionKind.Bob, base, yaw, freq, phase, heave, roll, reach);
  }

  rock(pivot: Vec3, yaw: number, freq: number, phase: number, amplitude: number, reach = 3): number {
    return this.around(MotionKind.Rock, pivot, yaw, freq, phase, amplitude, 0, reach);
  }

  toss(base: Vec3, yaw: number, freq: number, phase: number, width: number, height: number): number {
    return this.around(MotionKind.Toss, base, yaw, freq, phase, width, height, Math.max(width, height) + 1);
  }

  /**
   * Where a route-following motion frame is at movement time `t` (the same formula the vertex
   * shader evaluates). Writes [x, y, z] into `out` and returns true; returns false for other
   * motion kinds, whose small fixed bounds should be used instead.
   */
  routePosition(id: number, t: number, out: Float32Array): boolean {
    const p = this.routeParams[id];
    if (!p) return false;
    const [start, count, length, s0, speed, lateral, yOffset] = p;
    let s = (s0 + speed * t) % length;
    if (s < 0) s += length;
    const fi = (s / length) * count;
    const i0 = Math.floor(fi) % count;
    const fr = fi - Math.floor(fi);
    const a = (start + i0) * 4;
    const b = (start + ((i0 + 1) % count)) * 4;
    const d = this.routeData;
    const ax = d[a] as number;
    const az = d[a + 2] as number;
    const bx = d[b] as number;
    const bz = d[b + 2] as number;
    const tx = bx - ax;
    const tz = bz - az;
    const len = Math.hypot(tx, tz) || 1;
    /* local +x (left of travel) for heading atan2(tx, tz) is (tz, -tx) / len */
    out[0] = ax + tx * fr + (tz / len) * lateral;
    out[1] = (d[a + 1] as number) + ((d[b + 1] as number) - (d[a + 1] as number)) * fr + yOffset;
    out[2] = az + tz * fr - (tx / len) * lateral;
    return true;
  }

  boundsOf(id: number): MotionBounds {
    const b = this.bounds[id];
    if (!b) throw new Error(`Unknown motion ${id}`);
    return b;
  }

  get motions(): number {
    return this.motionCount;
  }

  dispose(): void {
    this.motionTex?.dispose();
    this.routeTex?.dispose();
    this.motionTex = null;
    this.routeTex = null;
  }

  textures(): { motion: THREE.DataTexture; route: THREE.DataTexture } {
    if (!this.motionTex || !this.routeTex) {
      const mRows = Math.max(1, Math.ceil(this.motionCount / MOTIONS_PER_ROW));
      const m = new Float32Array(MOTION_TEX_WIDTH * mRows * 4);
      m.set(this.motionData.subarray(0, Math.min(this.motionData.length, m.length)));
      const rRows = Math.max(1, Math.ceil(this.routeCount / ROUTE_TEX_WIDTH));
      const r = new Float32Array(ROUTE_TEX_WIDTH * rRows * 4);
      r.set(this.routeData.subarray(0, Math.min(this.routeData.length, r.length)));
      this.motionTex = floatTexture(m, MOTION_TEX_WIDTH, mRows);
      this.routeTex = floatTexture(r, ROUTE_TEX_WIDTH, rRows);
    }
    return { motion: this.motionTex, route: this.routeTex };
  }
}

/* ------------------------------------------------------------------ people */

export interface PersonRecord {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly heading: number;
  /** motion record id, or -1 for a person standing in world space */
  readonly motion: number;
  readonly clip: ClipRef;
  /** loops per second; negative values follow the movement clock (locomotion) */
  readonly rate: number;
  readonly phase: number;
  readonly scale: number;
  readonly build: number;
  readonly headScale: number;
  readonly longSleeves: boolean;
  readonly longLegs: boolean;
  readonly pattern: number;
  readonly patternScale: number;
  readonly face: number;
  /** palette indices */
  readonly shirt: number;
  readonly shirt2: number;
  readonly pants: number;
  readonly skin: number;
  readonly hair: number;
  readonly shoes: number;
  /** palette index per option category (index = category id) */
  readonly tints: readonly number[];
  /** selected option keys (hair, hat, held props...) */
  readonly options: readonly string[];
  /** contact-shadow radius multiplier (0 hides it, e.g. swimmers) */
  readonly blob: number;
  /**
   * true for the few people whose record may be rewritten after the build (the hero): they are
   * drawn in an unculled group so relocating them never needs a geometry rebuild.
   */
  readonly roaming?: boolean;
}

export class PersonStore {
  readonly capacity: number;
  private readonly data: Float32Array;
  private readonly height: number;
  private readonly records: PersonRecord[] = [];
  private tex: THREE.DataTexture | null = null;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.height = Math.ceil(capacity / PERSONS_PER_ROW);
    this.data = new Float32Array(PERSON_TEX_WIDTH * this.height * 4);
  }

  get count(): number {
    return this.records.length;
  }

  get(i: number): PersonRecord {
    const r = this.records[i];
    if (!r) throw new Error(`Unknown person ${i}`);
    return r;
  }

  all(): readonly PersonRecord[] {
    return this.records;
  }

  dispose(): void {
    this.tex?.dispose();
    this.tex = null;
  }

  add(r: PersonRecord): number {
    const i = this.records.length;
    if (i >= this.capacity) throw new Error('Person store is full');
    this.records.push(r);
    this.write(i, r);
    return i;
  }

  /** Rewrite an existing record in place (one small texture upload). Options must stay the same. */
  update(i: number, r: PersonRecord): void {
    if (!this.records[i]) throw new Error(`Unknown person ${i}`);
    this.records[i] = r;
    this.write(i, r);
  }

  private write(i: number, r: PersonRecord): void {
    const o = i * PERSON_TEXELS * 4;
    const d = this.data;
    d[o] = r.x;
    d[o + 1] = r.y;
    d[o + 2] = r.z;
    d[o + 3] = r.heading;
    d[o + 4] = r.motion;
    d[o + 5] = r.clip.row;
    d[o + 6] = r.clip.rows;
    d[o + 7] = r.rate;
    d[o + 8] = r.phase;
    d[o + 9] = r.scale;
    d[o + 10] = r.build;
    d[o + 11] = r.headScale;
    d[o + 12] = (r.longSleeves ? 1 : 0) + (r.longLegs ? 2 : 0);
    d[o + 13] = r.pattern;
    d[o + 14] = r.patternScale;
    d[o + 15] = r.face;
    d[o + 16] = r.shirt;
    d[o + 17] = r.shirt2;
    d[o + 18] = r.pants;
    d[o + 19] = r.skin;
    d[o + 20] = r.hair;
    d[o + 21] = r.shoes;
    d[o + 22] = 0;
    d[o + 23] = r.blob;
    for (let c = 1; c < CAT_COUNT; c++) d[o + 24 + (c - 1)] = r.tints[c] ?? 0;
    if (this.tex) this.tex.needsUpdate = true;
  }

  texture(): THREE.DataTexture {
    if (!this.tex) this.tex = floatTexture(this.data, PERSON_TEX_WIDTH, this.height);
    return this.tex;
  }
}
