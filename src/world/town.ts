/**
 * Town assembly: deterministic build of terrain, districts, crowd and hero from a seed.
 * Authored arrangement lives in src/world/districts/*; this file only orchestrates.
 */
import * as THREE from 'three';
import { box, prism, translate } from '../core/geo';
import { createRng, hashString } from '../core/rng';
import { ACTIVE_CLIPS } from '../crowd/clips/active/index';
import { BASE_CLIPS } from '../crowd/clips/base';
import { EVERYDAY_CLIPS } from '../crowd/clips/everyday/index';
import { CrowdRenderer, MOVER_CULL_INTERVAL } from '../crowd/crowdRenderer';
import { HERO_LOOK, lookToRecord } from '../crowd/look';
import { type CrowdMaterials, type CrowdUniforms, createCrowdMaterials, createCrowdUniforms } from '../crowd/materials';
import { BASIC_OPTIONS } from '../crowd/options/basic';
import { EXTRA_OPTION_LIST } from '../crowd/options/extra';
import type { RigOption } from '../crowd/rig';
import { MotionStore, PaletteStore, type PersonRecord, PersonStore, PoseLibrary } from '../crowd/stores';
import { registerAllProps } from '../props/index';
import type { Engine } from '../render/engine';
import { type WorldMaterials, type WorldUniforms, createWorldMaterials, createWorldUniforms } from '../render/worldMaterial';
import { DISTRICT_BUILDERS } from './districts/index';
import { DynamicProps } from './dynamicProps';
import { Kit, type TargetSpot, type TownBuild } from './kit';
import {
  BEACH_WATERLINE,
  DISTRICTS,
  type DistrictDef,
  type DistrictId,
  EAST_SHORE,
  WATER_Y,
  eastLandOutline,
  isLand,
  pointInPolygon,
  westLandOutline,
} from './layout';
import { StaticWorld } from './staticWorld';

export interface Hero {
  readonly person: number;
  readonly spot: TargetSpot;
}

/** A place the hero could stand: an authored fair spot, or an ordinary standing person to replace. */
export interface HeroCandidate {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly heading: number;
  readonly district: DistrictId;
  /** index of the townsperson standing here (they step out when the hero takes the spot), or -1 */
  readonly person: number;
}

const FILL_CLIPS = [
  'talk', 'stand', 'point', 'wave', 'lookout', 'talk.animated', 'talk.nod', 'talk.laugh', 'talk.shrug', 'idle.shift', 'idle.hips',
  'idle.arms', 'idle.behind', 'idle.watch', 'idle.phone', 'photo.camera', 'photo.selfie', 'point.across', 'point.sky', 'greet.bigwave',
  'greet.handshake', 'cheer.clap', 'queue.shuffle', 'queue.tiptoe', 'eat.icecream', 'drink.cup', 'read.map',
];
const STANDING = /^(stand|talk|point|wave|lookout|idle\.|talk\.|queue\.|point\.|photo\.camera|greet\.|cheer\.clap|drink\.|eat\.icecream|read\.)/;
/** people per square metre of district land that the filler tops districts up to */
const FILL_DENSITY = 0.25;
/** metres of people kept beyond the frame so short pans need no re-cull */
const CULL_MARGIN = 9;
/** metres the view may move before the visible set is rebuilt (must stay below CULL_MARGIN - shadow reach) */
const CULL_SLACK = 5;

export interface TownCounts {
  readonly people: number;
  readonly movers: number;
  readonly clips: number;
  readonly vignettes: number;
  readonly filled: number;
  readonly staticPlacements: number;
  readonly dynamicProps: number;
  readonly targetSpots: number;
}

export class Town {
  readonly group = new THREE.Group();
  readonly build: TownBuild;
  readonly crowdUniforms: CrowdUniforms;
  readonly worldUniforms: WorldUniforms;
  readonly worldMaterials: WorldMaterials;
  readonly water: THREE.Material;
  readonly crowdMaterials: CrowdMaterials;
  seed: number;

  crowd!: CrowdRenderer;
  hero!: Hero;
  buildMs = 0;
  private readonly options: Map<string, RigOption>;
  private readonly only: readonly DistrictId[] | undefined;
  private steppedOut: { index: number; record: PersonRecord } | null = null;
  /** people added by the density pass */
  filled = 0;
  /** true when poses are resolved once per person in a GPU pass instead of per vertex */
  readonly jointTexture: boolean;
  /** seed of the generated arrangement (fixed for the session; `seed` may change with new puzzles) */
  readonly sessionSeed: number;

  /**
   * Synchronous build (tests, tools). Pass `defer: true` and call `Town.create` instead to build
   * progressively without long main-thread stalls.
   */
  constructor(seedText: string, opts: { only?: readonly DistrictId[]; defer?: boolean; jointTexture?: boolean; densify?: boolean; traceStatics?: boolean } = {}) {
    const t0 = performance.now();
    registerAllProps();
    this.seed = hashString(seedText);
    this.sessionSeed = this.seed;
    this.only = opts.only;
    this.worldUniforms = createWorldUniforms();
    this.worldMaterials = createWorldMaterials(this.worldUniforms);
    this.crowdUniforms = createCrowdUniforms();
    this.jointTexture = opts.jointTexture ?? false;
    this.crowdMaterials = createCrowdMaterials(this.crowdUniforms, this.jointTexture);
    this.water = new THREE.MeshLambertMaterial({ color: '#8EB8E0' });
    const motion = new MotionStore();
    this.options = new Map<string, RigOption>([...BASIC_OPTIONS, ...EXTRA_OPTION_LIST].map((o) => [o.key, o]));
    this.build = {
      statics: new StaticWorld(),
      dynamics: new DynamicProps(this.worldUniforms, this.crowdUniforms, motion),
      people: new PersonStore(16384),
      motion,
      palette: new PaletteStore(),
      poses: new PoseLibrary([...BASE_CLIPS, ...EVERYDAY_CLIPS, ...ACTIVE_CLIPS]),
      options: this.options,
      vignettes: [],
      surfaces: [],
      blocks: [],
      targetSpots: [],
      searchables: [],
      personDistrict: [],
      warnings: [],
      occupied: new Map(),
      groundLayers: [],
    };
    this.build.statics.trace = opts.traceStatics ?? false;
    this.terrain();
    if (opts.defer) return;
    for (const def of this.districtList()) this.buildDistrict(def);
    if (opts.densify !== false) this.densify();
    this.finish();
    this.buildMs = performance.now() - t0;
  }

  /** Progressive build: one district per task so the page stays responsive while loading. */
  static async create(seedText: string, onProgress: (p: number) => void = () => undefined, opts: { jointTexture?: boolean; only?: readonly DistrictId[] } = {}): Promise<Town> {
    const t0 = performance.now();
    const town = new Town(seedText, { ...opts, defer: true });
    /* yield with a message task, not a timer: timers are throttled to seconds in background tabs */
    const pause = (): Promise<void> =>
      new Promise((resolve) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = () => {
          channel.port1.close();
          resolve();
        };
        channel.port2.postMessage(0);
      });
    const list = town.districtList();
    for (let i = 0; i < list.length; i++) {
      town.buildDistrict(list[i] as DistrictDef);
      onProgress((i + 1) / (list.length + 2));
      await pause();
    }
    town.densify();
    await pause();
    town.finish();
    onProgress(1);
    town.buildMs = performance.now() - t0;
    return town;
  }

  private districtList(): DistrictDef[] {
    return DISTRICTS.filter((d) => !this.only || this.only.includes(d.id));
  }

  /* every district builder runs on the session seed, so each refresh gives a varied arrangement */
  private buildDistrict(def: DistrictDef): void {
    const builder = DISTRICT_BUILDERS[def.id];
    if (builder) builder(new Kit(this.build, def, this.sessionSeed));
  }

  private finish(): void {
    this.hero = this.placeHero();
    this.build.statics.build(this.worldMaterials, this.water);
    this.build.dynamics.build();
    const mt = this.build.motion.textures();
    const u = this.crowdUniforms;
    u.uPerson.value = this.build.people.texture();
    u.uPose.value = this.build.poses.texture();
    u.uPalette.value = this.build.palette.texture();
    u.uMotion.value = mt.motion;
    u.uRoute.value = mt.route;
    this.crowd = new CrowdRenderer(this.build.people, this.build.motion, this.options, this.crowdMaterials, this.crowdUniforms, this.jointTexture);
    this.crowd.build();
    this.group.add(this.build.statics.group, this.build.dynamics.group, this.crowd.group);
  }

  private terrain(): void {
    const s = this.build.statics;
    s.add(translate(prism(westLandOutline(), 3.2, 'ivoryShade'), 0, -3.2, 0), 0, 0, 0, 0, 1, undefined, 'solid', false, 'terrain:land');
    s.add(translate(prism(eastLandOutline(), 3.2, 'ivoryShade'), 0, -3.2, 0), 0, 0, 0, 0, 1, undefined, 'solid', false, 'terrain:land');
    const sand: [number, number][] = EAST_SHORE.map((p) => [p[0], p[1]]);
    for (const [x, z] of [...BEACH_WATERLINE].reverse()) sand.push([x, z + 6]);
    s.add(translate(prism(sand, 0.5, 'sand'), 0, WATER_Y - 0.2, 0), 0, 0, 0, 0, 1, undefined, 'solid', false, 'terrain:sand');
    s.add(translate(box(900, 0.4, 700, 'blue'), 0, WATER_Y - 0.4, 0), 0, 0, 0, 0, 1, undefined, 'water', false, 'terrain:water');
  }

  /**
   * Density pass: top every district up to a minimum crowd density with small sociable groups on
   * free land, so no crop of the town is left sparse. Authored content always goes first.
   */
  private densify(): void {
    const b = this.build;
    const clips = FILL_CLIPS.filter((c) => b.poses.has(c));
    const counts = new Map<DistrictId, number>();
    for (const d of b.personDistrict) if (d) counts.set(d, (counts.get(d) ?? 0) + 1);
    for (const def of this.districtList()) {
      const kit = new Kit(b, def, this.sessionSeed ^ 0x5bd1e995);
      let area = 0;
      for (let i = 0, j = def.polygon.length - 1; i < def.polygon.length; j = i++) {
        const p = def.polygon[i] as readonly [number, number];
        const q = def.polygon[j] as readonly [number, number];
        area += (q[0] + p[0]) * (q[1] - p[1]);
      }
      area = Math.abs(area) / 2;
      let land = 0;
      const probe = createRng(hashString(def.id));
      const xs = def.polygon.map((p) => p[0]);
      const zs = def.polygon.map((p) => p[1]);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minZ = Math.min(...zs);
      const maxZ = Math.max(...zs);
      let inside = 0;
      for (let i = 0; i < 400; i++) {
        const x = probe.range(minX, maxX);
        const z = probe.range(minZ, maxZ);
        if (!pointInPolygon(x, z, def.polygon)) continue;
        inside++;
        if (isLand(x, z)) land++;
      }
      const landArea = inside > 0 ? (area * land) / inside : 0;
      const want = Math.round(landArea * FILL_DENSITY) - (counts.get(def.id) ?? 0);
      if (want <= 0) continue;
      const local = def.polygon.map(([x, z]) => kit.local(x, z));
      this.filled += kit.fill(local, want, { clips, groupSize: [2, 5] });
    }
  }

  /** Every place the hero could stand, across the whole generated town. */
  heroCandidates(): HeroCandidate[] {
    const b = this.build;
    const out: HeroCandidate[] = b.targetSpots.map((s) => ({ ...s, person: -1 }));
    const staged = new Set<number>();
    for (const v of b.vignettes) for (const id of v.people) staged.add(id);
    for (const s of b.searchables) staged.add(s.person);
    const people = b.people.all();
    for (let i = 0; i < people.length; i++) {
      const p = people[i] as PersonRecord;
      if (i === this.hero?.person || p.motion >= 0 || p.roaming || staged.has(i)) continue;
      if (p.scale < 0.9 || p.blob <= 0 || !STANDING.test(p.clip.id)) continue;
      if (p.options.some((o) => o.startsWith('hold.umbrella') || o.startsWith('carry.'))) continue;
      const district = b.personDistrict[i];
      if (district) out.push({ x: p.x, y: p.y, z: p.z, heading: p.heading, district, person: i });
    }
    return out;
  }

  /**
   * Put the hero at a candidate. The townsperson who stood there (if any) steps out, and whoever
   * stepped out for the previous hero position comes back. Only two person records are rewritten.
   */
  setHero(c: HeroCandidate, heading: number, phase: number): Hero {
    const b = this.build;
    if (this.steppedOut) {
      b.people.update(this.steppedOut.index, this.steppedOut.record);
      this.steppedOut = null;
    }
    if (c.person >= 0) {
      const record = b.people.get(c.person);
      this.steppedOut = { index: c.person, record };
      b.people.update(c.person, { ...record, scale: 0.0001, blob: 0 });
    }
    const spot: TargetSpot = { district: c.district, x: c.x, y: c.y, z: c.z, heading };
    b.people.update(this.hero.person, this.heroRecord(spot, phase));
    b.personDistrict[this.hero.person] = c.district;
    this.hero = { person: this.hero.person, spot };
    this.cullDirty = true;
    return this.hero;
  }

  private heroSpot(seed: number): { spot: TargetSpot; phase: number } {
    const rng = createRng(seed).fork('hero');
    const spots = this.build.targetSpots.length > 0 ? this.build.targetSpots : [{ district: 'market' as DistrictId, x: -64, y: 0, z: 12, heading: 0.3 }];
    return { spot: rng.pick(spots), phase: rng.next() };
  }

  private heroRecord(spot: TargetSpot, phase: number): ReturnType<typeof lookToRecord> {
    const clip = this.build.poses.clip('stand.stick');
    return lookToRecord(
      HERO_LOOK,
      { x: spot.x, y: spot.y, z: spot.z, heading: spot.heading, motion: -1, clip, rate: 1 / clip.duration, phase, roaming: true },
      this.build.palette,
    );
  }

  /** Choose the hero's spot from the authored fair spots using the puzzle seed. */
  private placeHero(): Hero {
    const { spot, phase } = this.heroSpot(this.seed);
    const person = this.build.people.add(this.heroRecord(spot, phase));
    this.build.personDistrict[person] = spot.district;
    return { person, spot };
  }

  /**
   * New puzzle: move the hero to the spot chosen by `seedText`. The town itself is reused — this
   * rewrites one person record (no geometry rebuild, no stall).
   */
  relocateHero(seedText: string): Hero {
    this.seed = hashString(seedText);
    const { spot, phase } = this.heroSpot(this.seed);
    this.build.people.update(this.hero.person, this.heroRecord(spot, phase));
    this.build.personDistrict[this.hero.person] = spot.district;
    this.hero = { person: this.hero.person, spot };
    return this.hero;
  }

  private readonly lastView = new Float64Array(7);
  private cullDirty = true;
  private sinceCull = 0;

  /** Re-resolve which people can be on screen (after the view or the hero changed). */
  cullNow(engine: Engine): number {
    /* make sure the camera matrices match the current view state before projecting anyone */
    engine.rig.update(0);
    const s = engine.rig.state;
    const size = engine.rig.size;
    const v = this.lastView;
    v[0] = s.x;
    v[1] = s.z;
    v[2] = s.azimuth;
    v[3] = s.elevation;
    v[4] = s.ppm;
    v[5] = size.width;
    v[6] = size.height;
    this.cullDirty = false;
    /* detail tiers first, so anything measured after this call matches what will be drawn */
    this.crowd.updateTier(s.ppm);
    this.build.statics.updateTier(s.ppm);
    this.build.dynamics.updateTier(s.ppm);
    this.sinceCull = 0;
    const count = this.crowd.cull(engine.rig.camera, this.crowdUniforms.uMoveTime.value, CULL_MARGIN);
    this.crowd.updateJoints(engine.renderer);
    return count;
  }

  /**
   * Per-frame work: advance three clocks and pick prebuilt detail tiers. The visible set is only
   * recomputed when the view actually changed (new puzzle, resize, development camera).
   */
  update(animDt: number, engine: Engine, reducedMotion: boolean): void {
    this.crowdUniforms.uPoseTime.value += reducedMotion ? animDt * 0.2 : animDt;
    this.crowdUniforms.uMoveTime.value += reducedMotion ? 0 : animDt;
    this.worldUniforms.uSwayTime.value += reducedMotion ? animDt * 0.15 : animDt;
    const s = engine.rig.state;
    const size = engine.rig.size;
    const v = this.lastView;
    const ppm = s.ppm;
    this.crowd.updateTier(ppm);
    this.build.statics.updateTier(ppm);
    this.build.dynamics.updateTier(ppm);
    this.sinceCull += animDt;
    if (this.sinceCull >= MOVER_CULL_INTERVAL) this.cullDirty = true;
    /* while panning, the padded visible set stays valid until the view has moved a few metres */
    const moved = Math.abs((v[0] as number) - s.x) + Math.abs((v[1] as number) - s.z) > CULL_SLACK;
    if (this.cullDirty || moved || v[2] !== s.azimuth || v[3] !== s.elevation || v[4] !== ppm || v[5] !== size.width || v[6] !== size.height) {
      this.cullNow(engine);
    } else if (animDt > 0) {
      /* clocks advanced: refresh the joint matrices of everyone on screen (one small GPU pass) */
      this.crowd.updateJoints(engine.renderer);
    }
  }

  counts(): TownCounts {
    const b = this.build;
    return {
      people: b.people.count,
      movers: b.people.all().filter((p) => p.motion >= 0).length,
      clips: b.poses.ids().length,
      vignettes: b.vignettes.length,
      filled: this.filled,
      staticPlacements: b.statics.stats().placements,
      dynamicProps: b.dynamics.instances,
      targetSpots: b.targetSpots.length,
    };
  }

  setPickMode(on: boolean): void {
    this.crowd.setPickMode(on);
    this.build.statics.setPickMode(on, this.worldMaterials, this.water);
    this.build.dynamics.setPickMode(on);
  }

  dispose(): void {
    this.crowd.dispose();
    this.build.statics.dispose();
    this.build.dynamics.dispose();
    this.build.people.dispose();
    this.build.poses.dispose();
    this.build.palette.dispose();
    this.build.motion.dispose();
    for (const m of Object.values(this.crowdMaterials)) m.dispose();
    for (const m of Object.values(this.worldMaterials)) m.dispose();
    this.water.dispose();
    this.group.clear();
  }
}
