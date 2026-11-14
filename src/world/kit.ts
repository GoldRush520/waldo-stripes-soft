/**
 * District authoring kit. A district module receives a `Kit` and composes its scenery, people,
 * routes and microstories in DISTRICT-LOCAL coordinates (metres; the district anchor is the origin
 * and the district may be rotated). The kit converts to world space, batches geometry, records
 * footprints / walkable surfaces / vignettes and feeds the GPU crowd stores.
 *
 * Local axes match the world when the district rotation is 0: +x east, +z south (toward the default
 * camera), +y up. Headings: 0 faces +z, forward = [sin h, 0, cos h].
 */
import { type Col, type Geo, prism, translate } from '../core/geo';
import { type Rng, createRng } from '../core/rng';
import { type Age, type Look, lookToRecord, randomLook } from '../crowd/look';
import type { RigOption } from '../crowd/rig';
import type { MotionStore, PaletteStore, PersonStore, PoseLibrary, RouteRef, Vec3 } from '../crowd/stores';
import { hasProp, propDef, propGeo } from '../props/registry';
import type { DynamicProps } from './dynamicProps';
import { type DistrictDef, type DistrictId, isLand, pointInPolygon } from './layout';
import type { StaticWorld } from './staticWorld';

export interface At {
  readonly x: number;
  readonly z: number;
  readonly y?: number;
  /** rotation about y in radians (local) */
  readonly rot?: number;
  readonly scale?: number;
  readonly tint?: Col;
}

export type Hold = string | { readonly key: string; readonly tint?: Col };

export interface PersonSpec {
  readonly x: number;
  readonly z: number;
  readonly y?: number;
  readonly heading?: number;
  /** look toward this local point instead of giving a heading */
  readonly face?: readonly [number, number];
  /** clip id (default "stand") */
  readonly clip?: string;
  /** playback speed multiplier */
  readonly speed?: number;
  readonly phase?: number;
  readonly age?: Age;
  /** overrides on top of the seeded random look */
  readonly look?: Partial<Look>;
  /** extra option keys: held props, backpack, apron... */
  readonly hold?: readonly Hold[];
  /** ride a motion frame: x/y/z/heading are then local to that frame */
  readonly motion?: number;
  /** contact shadow size (0 = none, e.g. swimmers and riders) */
  readonly blob?: number;
}

export interface VignetteRecord {
  readonly id: string;
  readonly district: DistrictId;
  readonly title: string;
  readonly story: string;
  /** world-space focus */
  readonly x: number;
  readonly z: number;
  readonly people: readonly number[];
}

export type SurfaceKind = 'ground' | 'sand' | 'deck' | 'roof' | 'bridge' | 'pier' | 'stairs';

/** A walkable surface patch in world space (polygon in x/z at height y). */
export interface Surface {
  readonly kind: SurfaceKind;
  readonly district: DistrictId;
  readonly polygon: ReadonlyArray<readonly [number, number]>;
  readonly y: number;
}

/** Solid ground footprint in world space (oriented rectangle). */
export interface Block {
  readonly x: number;
  readonly z: number;
  readonly hw: number;
  readonly hd: number;
  readonly cos: number;
  readonly sin: number;
}

export interface TargetSpot {
  readonly district: DistrictId;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly heading: number;
}

export interface Searchable {
  readonly label: string;
  readonly district: DistrictId;
  readonly person: number;
}

/** Everything a town build accumulates. Engine-owned; districts only touch it through a Kit. */
export interface TownBuild {
  readonly statics: StaticWorld;
  readonly dynamics: DynamicProps;
  readonly people: PersonStore;
  readonly motion: MotionStore;
  readonly palette: PaletteStore;
  readonly poses: PoseLibrary;
  readonly options: ReadonlyMap<string, RigOption>;
  readonly vignettes: VignetteRecord[];
  readonly surfaces: Surface[];
  readonly blocks: Block[];
  readonly targetSpots: TargetSpot[];
  readonly searchables: Searchable[];
  /** district of every person, by person index */
  readonly personDistrict: DistrictId[];
  /** warnings collected during the build (unknown clips/props...), shown in the dev overlay */
  readonly warnings: string[];
  readonly occupied: Map<number, number[]>;
  /** plan bounds and top height of every ground overlay laid so far (to keep overlapping ones apart) */
  readonly groundLayers: Array<{ minX: number; maxX: number; minZ: number; maxZ: number; top: number }>;
}

/** minimum height difference between overlapping ground overlays */
const GROUND_GAP = 0.004;
const HASH = 1.0;
const hashKey = (x: number, z: number): number => (Math.floor(x / HASH) + 4096) * 8192 + (Math.floor(z / HASH) + 4096);

export function blockContains(b: Block, x: number, z: number, pad = 0): boolean {
  const dx = x - b.x;
  const dz = z - b.z;
  const lx = dx * b.cos - dz * b.sin;
  const lz = dx * b.sin + dz * b.cos;
  return Math.abs(lx) <= b.hw + pad && Math.abs(lz) <= b.hd + pad;
}

export class Kit {
  readonly rng: Rng;
  private readonly cos: number;
  private readonly sin: number;
  private currentVignette: number[] | null = null;

  constructor(
    private readonly build: TownBuild,
    readonly district: DistrictDef,
    seed: number,
  ) {
    this.rng = createRng(seed).fork(district.id);
    this.cos = Math.cos(district.rotation);
    this.sin = Math.sin(district.rotation);
  }

  /* ---------------------------------------------------------------- frames */

  /** District-local point -> world [x, z]. */
  world(x: number, z: number): [number, number] {
    return [this.district.anchor[0] + x * this.cos + z * this.sin, this.district.anchor[1] - x * this.sin + z * this.cos];
  }

  /** World point -> district-local [x, z]. */
  local(wx: number, wz: number): [number, number] {
    const dx = wx - this.district.anchor[0];
    const dz = wz - this.district.anchor[1];
    return [dx * this.cos - dz * this.sin, dx * this.sin + dz * this.cos];
  }

  /**
   * A point given relative to a placed object (its local x/z and heading) -> district-local
   * position + heading. Use it to put people at a prop's seats, a stall's vendor spot or a door.
   */
  rel(origin: { readonly x: number; readonly z: number; readonly rot?: number }, x: number, z: number, heading = 0): { x: number; z: number; heading: number } {
    const r = origin.rot ?? 0;
    const c = Math.cos(r);
    const s = Math.sin(r);
    return { x: origin.x + x * c + z * s, z: origin.z - x * s + z * c, heading: heading + r };
  }

  private worldVec(p: Vec3): Vec3 {
    const [x, z] = this.world(p[0], p[2]);
    return [x, p[1], z];
  }

  /* ---------------------------------------------------------------- scenery */

  /** Place bespoke static geometry. */
  add(geo: Geo, at: At, opts: { cast?: boolean; kind?: 'solid' | 'glass' | 'water' } = {}): void {
    const [x, z] = this.world(at.x, at.z);
    this.build.statics.add(geo, x, at.y ?? 0, z, (at.rot ?? 0) + this.district.rotation, at.scale ?? 1, at.tint, opts.kind ?? 'solid', opts.cast ?? true, `geo:${this.district.id}`);
  }

  /** Place a registered prop. Its footprint becomes a solid block unless `walkThrough` is set. */
  prop(key: string, at: At, opts: { walkThrough?: boolean } = {}): void {
    if (!hasProp(key)) {
      this.build.warnings.push(`${this.district.id}: unknown prop "${key}"`);
      return;
    }
    const def = propDef(key);
    const [x, z] = this.world(at.x, at.z);
    const rot = (at.rot ?? 0) + this.district.rotation;
    const s = at.scale ?? 1;
    const base = at.y ?? 0;
    const material = def.material ?? 'solid';
    this.build.statics.add(propGeo(key), x, base, z, rot, s, at.tint ?? def.defaultTint, material, true, key);
    if (!opts.walkThrough && base < 0.5 && def.footprint[0] > 0 && def.footprint[1] > 0) {
      this.blockWorld(x, z, def.footprint[0] * s, def.footprint[1] * s, rot);
    }
  }

  /**
   * Flat ground overlay (paving, lawn, sand, court markings). Local polygon; 3 cm thick by default.
   * Overlays that overlap in plan are automatically kept at least 4 mm apart in height (later ones
   * on top), and all overlays are drawn slightly behind anything that rests on them.
   */
  ground(points: ReadonlyArray<readonly [number, number]>, color: Col, y = 0, thickness = 0.03): void {
    const world = points.map(([x, z]) => this.world(x, z));
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const [x, z] of world) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    }
    let top = y + thickness;
    const layers = this.build.groundLayers;
    for (let guard = 0; guard < 64; guard++) {
      let clash = false;
      for (const l of layers) {
        if (l.maxX < minX || l.minX > maxX || l.maxZ < minZ || l.minZ > maxZ) continue;
        if (Math.abs(l.top - top) < GROUND_GAP - 1e-6) {
          top = l.top + GROUND_GAP;
          clash = true;
        }
      }
      if (!clash) break;
    }
    layers.push({ minX, maxX, minZ, maxZ, top });
    this.build.statics.add(translate(prism(world, thickness, color), 0, top - thickness, 0), 0, 0, 0, 0, 1, undefined, 'solid', false, `ground:${this.district.id}`);
  }

  /** Raised solid platform (terrace, quay extension, stage). Registers a walkable surface on top. */
  platform(points: ReadonlyArray<readonly [number, number]>, y0: number, y1: number, color: Col, kind: SurfaceKind = 'deck'): void {
    const world = points.map(([x, z]) => this.world(x, z));
    this.build.statics.add(translate(prism(world, y1 - y0, color), 0, y0, 0), 0, 0, 0, 0, 1, undefined, 'solid', true, `platform:${this.district.id}`, true);
    this.build.surfaces.push({ kind, district: this.district.id, polygon: world, y: y1 });
  }

  /** Declare a walkable surface (bridge deck, pier, roof terrace, sand) without adding geometry. */
  surface(kind: SurfaceKind, points: ReadonlyArray<readonly [number, number]>, y: number): void {
    this.build.surfaces.push({ kind, district: this.district.id, polygon: points.map(([x, z]) => this.world(x, z)), y });
  }

  /** Declare a solid footprint (local centre, size, rotation) that people and fills must avoid. */
  block(x: number, z: number, w: number, d: number, rot = 0): void {
    const [wx, wz] = this.world(x, z);
    this.blockWorld(wx, wz, w, d, rot + this.district.rotation);
  }

  private blockWorld(x: number, z: number, w: number, d: number, rot: number): void {
    this.build.blocks.push({ x, z, hw: w / 2, hd: d / 2, cos: Math.cos(rot), sin: Math.sin(rot) });
  }

  /* ---------------------------------------------------------------- motion */

  /** Closed loop through local [x, y, z] points. */
  loop(points: readonly Vec3[]): RouteRef {
    return this.build.motion.addLoop(points.map((p) => this.worldVec(p)));
  }

  /** There-and-back street route along local [x, y, z] points, keeping `lane` metres to the right. */
  street(points: readonly Vec3[], lane = 0.9): RouteRef {
    return this.build.motion.addStreet(points.map((p) => this.worldVec(p)), lane);
  }

  /** Motion frame following a route. Returns the motion id for `person({motion})` / `dynamic()`. */
  onRoute(route: RouteRef, s0: number, speed: number, opts: { lateral?: number; y?: number; bob?: number } = {}): number {
    return this.build.motion.route(route, s0, speed, opts.lateral ?? 0, opts.y ?? 0, opts.bob ?? 0);
  }

  spin(center: Vec3, speed: number, phase = 0, reach = 6): number {
    return this.build.motion.spin(this.worldVec(center), speed, phase, reach);
  }

  wheel(hub: Vec3, yaw: number, speed: number, phase: number, radius: number): number {
    return this.build.motion.wheel(this.worldVec(hub), yaw + this.district.rotation, speed, phase, radius);
  }

  axle(hub: Vec3, yaw: number, speed: number, phase = 0, reach = 16): number {
    return this.build.motion.axle(this.worldVec(hub), yaw + this.district.rotation, speed, phase, reach);
  }

  swing(pivot: Vec3, yaw: number, freq: number, phase: number, amplitude: number, reach = 4): number {
    return this.build.motion.swing(this.worldVec(pivot), yaw + this.district.rotation, freq, phase, amplitude, reach);
  }

  bob(base: Vec3, yaw: number, freq = 1.1, phase = 0, heave = 0.05, roll = 0.03, reach = 6): number {
    return this.build.motion.bob(this.worldVec(base), yaw + this.district.rotation, freq, phase, heave, roll, reach);
  }

  rock(pivot: Vec3, yaw: number, freq: number, phase: number, amplitude: number, reach = 3): number {
    return this.build.motion.rock(this.worldVec(pivot), yaw + this.district.rotation, freq, phase, amplitude, reach);
  }

  toss(base: Vec3, yaw: number, freq: number, phase: number, width: number, height: number): number {
    return this.build.motion.toss(this.worldVec(base), yaw + this.district.rotation, freq, phase, width, height);
  }

  /** A prop (registered key or bespoke Geo) riding a motion frame; `at` is local to that frame. */
  dynamic(what: string | Geo, motion: number, at: Partial<At> = {}): void {
    let geo: Geo;
    let tint: Col | undefined = at.tint;
    if (typeof what === 'string') {
      if (!hasProp(what)) {
        this.build.warnings.push(`${this.district.id}: unknown dynamic prop "${what}"`);
        return;
      }
      geo = propGeo(what);
      tint = tint ?? propDef(what).defaultTint;
    } else {
      geo = what;
    }
    this.build.dynamics.add(geo, motion, at.x ?? 0, at.y ?? 0, at.z ?? 0, at.rot ?? 0, at.scale ?? 1, tint ?? 'ivory');
  }

  /* ---------------------------------------------------------------- people */

  /** Place one person. Returns the person index (for vignettes / searchables). */
  person(spec: PersonSpec): number {
    const b = this.build;
    const rng = this.rng;
    const base = randomLook(rng, spec.age ?? 'adult');
    const extras = [...(spec.look?.extras ?? base.extras)];
    for (const h of spec.hold ?? []) {
      const key = typeof h === 'string' ? h : h.key;
      const def = b.options.get(key);
      if (!def) {
        b.warnings.push(`${this.district.id}: unknown option "${key}"`);
        continue;
      }
      extras.push({ key, cat: def.cat, tint: typeof h === 'string' ? undefined : h.tint });
    }
    const look: Look = { ...base, ...spec.look, extras };
    for (const key of [look.hairStyle, look.hat, look.glasses, look.lower]) {
      if (key && !b.options.has(key)) b.warnings.push(`${this.district.id}: unknown option "${key}"`);
    }
    const clipId = spec.clip && b.poses.has(spec.clip) ? spec.clip : 'stand';
    if (spec.clip && !b.poses.has(spec.clip)) b.warnings.push(`${this.district.id}: unknown clip "${spec.clip}"`);
    const clip = b.poses.clip(clipId);
    const riding = spec.motion !== undefined && spec.motion >= 0;
    let x = spec.x;
    let z = spec.z;
    let heading = spec.heading ?? 0;
    if (spec.face) heading = Math.atan2(spec.face[0] - spec.x, spec.face[1] - spec.z);
    if (!riding) {
      [x, z] = this.world(spec.x, spec.z);
      heading += this.district.rotation;
    }
    const speed = spec.speed ?? rng.range(0.85, 1.18);
    const id = b.people.add(
      lookToRecord(
        look,
        {
          x,
          y: spec.y ?? 0,
          z,
          heading,
          motion: riding ? (spec.motion as number) : -1,
          clip,
          rate: speed / clip.duration,
          phase: spec.phase ?? rng.next(),
          blob: spec.blob ?? (riding ? 0 : 1),
        },
        b.palette,
      ),
    );
    b.personDistrict[id] = this.district.id;
    if (!riding) {
      const k = hashKey(x, z);
      const cell = b.occupied.get(k);
      if (cell) cell.push(id);
      else b.occupied.set(k, [id]);
    }
    this.currentVignette?.push(id);
    return id;
  }

  /** People walking a there-and-back street (or a prebuilt route) in their own lanes. */
  walkers(
    path: readonly Vec3[] | RouteRef,
    count: number,
    opts: { lanes?: readonly number[]; speed?: readonly [number, number]; childShare?: number; clip?: string; hold?: (rng: Rng) => readonly Hold[] | undefined } = {},
  ): number[] {
    const b = this.build;
    const lanes = opts.lanes ?? [0.8, 1.7];
    const clip = b.poses.clip(opts.clip ?? 'walk');
    const ids: number[] = [];
    const routes: RouteRef[] = Array.isArray(path) ? lanes.map((l) => this.street(path as readonly Vec3[], l)) : [path as RouteRef];
    for (let i = 0; i < count; i++) {
      const route = routes[i % routes.length] as RouteRef;
      const age: Age = this.rng.chance(opts.childShare ?? 0.12) ? 'child' : this.rng.chance(0.1) ? 'elder' : 'adult';
      const base = randomLook(this.rng, age);
      const range = opts.speed ?? [0.95, 1.45];
      const speed = this.rng.range(range[0], range[1]) * (age === 'adult' ? 1 : 0.82);
      const m = b.motion.route(route, ((i + this.rng.next()) / count) * route.length, speed, this.rng.range(-0.25, 0.25));
      const extras = [...base.extras];
      for (const h of opts.hold?.(this.rng) ?? []) {
        const key = typeof h === 'string' ? h : h.key;
        const def = b.options.get(key);
        if (def) extras.push({ key, cat: def.cat, tint: typeof h === 'string' ? undefined : h.tint });
      }
      const id = b.people.add(
        lookToRecord({ ...base, extras }, { x: 0, y: 0, z: 0, heading: 0, motion: m, clip, rate: -speed / ((clip.stride || 1.4) * base.scale), phase: this.rng.next() }, b.palette),
      );
      b.personDistrict[id] = this.district.id;
      ids.push(id);
    }
    return ids;
  }

  /** A conversational ring of people around a local point. */
  group(x: number, z: number, n: number, opts: { clips?: readonly string[]; radius?: number; y?: number; age?: Age } = {}): number[] {
    const clips = opts.clips ?? ['talk', 'stand', 'talk', 'point', 'wave'];
    const r = opts.radius ?? 0.45 + n * 0.11;
    const start = this.rng.range(0, Math.PI * 2);
    const ids: number[] = [];
    for (let i = 0; i < n; i++) {
      const a = start + (i / n) * Math.PI * 2 + this.rng.range(-0.25, 0.25);
      const rr = n === 1 ? 0 : r * this.rng.range(0.85, 1.15);
      ids.push(
        this.person({
          x: x + Math.sin(a) * rr,
          z: z + Math.cos(a) * rr,
          y: opts.y,
          face: [x, z],
          clip: this.rng.pick(clips),
          age: opts.age ?? (this.rng.chance(0.12) ? 'child' : 'adult'),
        }),
      );
    }
    return ids;
  }

  /** A queue of people from `from` toward `to`, all facing `to`. */
  queue(from: readonly [number, number], to: readonly [number, number], n: number, opts: { clips?: readonly string[]; spacing?: number; y?: number } = {}): number[] {
    const dx = to[0] - from[0];
    const dz = to[1] - from[1];
    const len = Math.hypot(dx, dz) || 1;
    const step = opts.spacing ?? 0.72;
    const clips = opts.clips ?? ['stand', 'stand', 'talk', 'lookout'];
    const ids: number[] = [];
    for (let i = 0; i < n; i++) {
      const d = len - step * (i + 1);
      const jitter = this.rng.range(-0.12, 0.12);
      ids.push(
        this.person({
          x: from[0] + (dx / len) * d - (dz / len) * jitter,
          z: from[1] + (dz / len) * d + (dx / len) * jitter,
          y: opts.y,
          heading: Math.atan2(dx, dz) + this.rng.range(-0.3, 0.3),
          clip: this.rng.pick(clips),
        }),
      );
    }
    return ids;
  }

  /**
   * Place a registered prop that has `seats` and put people on them. Seats tagged `seat:feet` get
   * standing people; all others get seated people (hips on the anchor). Returns the person ids.
   */
  seated(
    key: string,
    at: At,
    opts: { clips?: readonly string[]; fill?: number; motion?: number; place?: boolean; hold?: (rng: Rng) => readonly Hold[] | undefined; age?: Age } = {},
  ): number[] {
    if (!hasProp(key)) {
      this.build.warnings.push(`${this.district.id}: unknown prop "${key}"`);
      return [];
    }
    const def = propDef(key);
    if (opts.place !== false && opts.motion === undefined) this.prop(key, at);
    const feet = def.tags?.includes('seat:feet') ?? false;
    const clips = opts.clips ?? (feet ? ['stand', 'talk', 'wave'] : ['sit']);
    const ids: number[] = [];
    const s = at.scale ?? 1;
    for (const seat of def.seats ?? []) {
      if (!this.rng.chance(opts.fill ?? 0.8)) continue;
      const p = this.rel({ x: at.x, z: at.z, rot: at.rot }, seat.x * s, seat.z * s, seat.heading);
      ids.push(
        this.person({
          x: p.x,
          z: p.z,
          y: (at.y ?? 0) + seat.y * s - (feet ? 0 : 0.47),
          heading: p.heading,
          clip: this.rng.pick(clips),
          motion: opts.motion,
          hold: opts.hold?.(this.rng),
          age: opts.age,
          blob: feet && opts.motion === undefined ? 1 : 0,
        }),
      );
    }
    return ids;
  }

  /**
   * Procedural filler: scatter small sociable groups over free ground inside a local polygon.
   * Use it AFTER authored content, to raise density without burying the staged stories.
   */
  fill(
    polygon: ReadonlyArray<readonly [number, number]>,
    count: number,
    opts: { clips?: readonly string[]; groupSize?: readonly [number, number]; y?: number; childShare?: number; anyGround?: boolean } = {},
  ): number {
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const [x, z] of polygon) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    }
    const inside = (x: number, z: number): boolean => {
      let hit = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const a = polygon[i] as readonly [number, number];
        const b = polygon[j] as readonly [number, number];
        if (a[1] > z !== b[1] > z && x < ((b[0] - a[0]) * (z - a[1])) / (b[1] - a[1]) + a[0]) hit = !hit;
      }
      return hit;
    };
    const size = opts.groupSize ?? [1, 4];
    let made = 0;
    for (let tries = 0; tries < count * 12 && made < count; tries++) {
      const x = this.rng.range(minX, maxX);
      const z = this.rng.range(minZ, maxZ);
      const n = Math.min(count - made, this.rng.int(size[0], size[1]));
      const r = 0.45 + n * 0.11;
      if (!inside(x, z) || !this.isFree(x, z, r + 0.35)) continue;
      if (!opts.anyGround && opts.y === undefined) {
        /* the whole group must stand on open land: not in water, and not on ground buried under a
           raised terrace or deck, where nobody could ever be seen */
        let open = true;
        for (const [ox, oz] of [[0, 0], [r + 0.3, 0], [-r - 0.3, 0], [0, r + 0.3], [0, -r - 0.3]] as const) {
          const [wx, wz] = this.world(x + ox, z + oz);
          if (!isLand(wx, wz) || this.build.surfaces.some((surf) => surf.y > 0.4 && pointInPolygon(wx, wz, surf.polygon))) {
            open = false;
            break;
          }
        }
        if (!open) continue;
      }
      const before = this.build.people.count;
      this.group(x, z, n, { clips: opts.clips, y: opts.y, age: this.rng.chance(opts.childShare ?? 0.1) ? 'child' : undefined });
      made += this.build.people.count - before;
    }
    return made;
  }

  /** True when a local point is clear of solid footprints and other people. */
  isFree(x: number, z: number, radius = 0.38): boolean {
    const [wx, wz] = this.world(x, z);
    for (const blk of this.build.blocks) if (blockContains(blk, wx, wz, radius * 0.6)) return false;
    for (let ox = -1; ox <= 1; ox++) {
      for (let oz = -1; oz <= 1; oz++) {
        const ids = this.build.occupied.get(hashKey(wx + ox * HASH, wz + oz * HASH));
        if (!ids) continue;
        for (const id of ids) {
          const p = this.build.people.get(id);
          if (Math.hypot(p.x - wx, p.z - wz) < radius * 2) return false;
        }
      }
    }
    return true;
  }

  /* ---------------------------------------------------------------- stories */

  /** An authored microstory. Everyone placed inside `stage` belongs to it. */
  vignette(meta: { id: string; title: string; story: string }, stage: () => void): number[] {
    const members: number[] = [];
    const outer = this.currentVignette;
    this.currentVignette = members;
    stage();
    this.currentVignette = outer;
    let sx = 0;
    let sz = 0;
    let n = 0;
    for (const id of members) {
      const p = this.build.people.get(id);
      if (p.motion >= 0) continue;
      sx += p.x;
      sz += p.z;
      n++;
    }
    const [ax, az] = this.world(0, 0);
    this.build.vignettes.push({
      id: `${this.district.id}.${meta.id}`,
      district: this.district.id,
      title: meta.title,
      story: meta.story,
      x: n ? sx / n : ax,
      z: n ? sz / n : az,
      people: members,
    });
    return members;
  }

  /** A fair, unoccluded standing spot where the hero may be hidden (local coordinates). */
  targetSpot(x: number, z: number, y = 0, heading = 0): void {
    const [wx, wz] = this.world(x, z);
    this.build.targetSpots.push({ district: this.district.id, x: wx, y, z: wz, heading: heading + this.district.rotation });
  }

  /** Mark a person as an optional secondary search object ("the juggler", "the bride"). */
  searchable(person: number, label: string): void {
    this.build.searchables.push({ label, district: this.district.id, person });
  }
}

export function createKit(build: TownBuild, district: DistrictDef, seed: number): Kit {
  return new Kit(build, district, seed);
}
