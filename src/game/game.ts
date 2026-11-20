/**
 * Game logic for the full-screen puzzle: the player pans a fixed-scale view across the generated
 * town. A puzzle is a random valid hero position (verified against the actual render) that is NOT
 * on the opening screen, plus a densely populated opening view elsewhere. GPU picking decides
 * clicks. The town is reused between puzzles.
 */
import * as THREE from 'three';
import { createRng, hashString } from '../core/rng';
import { Cat, Pattern } from '../crowd/skeleton';
import type { PersonRecord } from '../crowd/stores';
import type { Engine, QualityName } from '../render/engine';
import { WORLD, districtById, isLand, pointInPolygon } from '../world/layout';
import type { HeroCandidate, Town } from '../world/town';
import type { ClickFeedback, GameApi, GameState, HintOutline, QualitySetting, SecondaryTarget } from './api';
import { type Rect, VIEW_ELEVATION, type ViewSpec, basePpm, clampView, projectPoint, screenHeight } from './composition';
import { type SearchArea, searchAreas, hintBoundary } from './searchHints';
import { type Campaign, stageFrame } from './campaign';

const SECONDARY_COUNT = 5;
/** GPU visibility checks are spent on at most this many shortlisted candidates per puzzle */
const MAX_CANDIDATES = 60;
/** last-resort thresholds: below these a position is never used */
const RECOVERY_VISIBLE = 0.55;
const RECOVERY_HEAD = 0.7;
const MIN_VISIBLE = 0.72;
const MIN_HEAD_VISIBLE = 0.8;
const BASE_AZIMUTH = -0.38;
/** a composition is only accepted when no more than this share of screen cells is nearly empty */
const MAX_EMPTY_SHARE = 0.1;
/** minimum people per square metre of ground shown */
const MIN_DENSITY = 0.19;
const MIN_COMPANY = 9;

const INITIAL: GameState = {
  status: 'loading',
  runId: 0,
  waiting: false,
  seed: '',
  paused: false,
  reducedMotion: false,
  quality: 'medium',
  hintLevel: 0,
  hintText: null,
  elapsedMs: 0,
  wrongClicks: 0,
  hintsUsed: 0,
  hintReward: null,
  hintOutline: null,
  secondary: [],
  lastClick: null,
  marker: null,
  progress: 0,
};

/** Which of the hero's five identifying features a person shares. */
export interface FeatureMatch {
  readonly stripes: boolean;
  readonly hat: boolean;
  readonly glasses: boolean;
  readonly trousers: boolean;
  readonly stick: boolean;
  readonly count: number;
}

export function heroFeatures(p: PersonRecord, palette: { index(c: 'coral' | 'ivory' | 'blue'): number }): FeatureMatch {
  const coral = palette.index('coral');
  const ivory = palette.index('ivory');
  const blue = palette.index('blue');
  const stripes = p.pattern === Pattern.HStripe && ((p.shirt === coral && p.shirt2 === ivory) || (p.shirt === ivory && p.shirt2 === coral));
  const hat = p.options.includes('hat.bobble') && p.tints[Cat.Hat] === coral;
  const glasses = p.options.includes('face.glasses.round');
  const trousers = p.pants === blue && p.longLegs && !p.options.some((o) => o.startsWith('lower.'));
  const stick = p.options.includes('hold.stick');
  return { stripes, hat, glasses, trousers, stick, count: [stripes, hat, glasses, trousers, stick].filter(Boolean).length };
}

export interface Occupancy {
  /** people projected into the viewport */
  readonly total: number;
  /** share of screen grid cells holding fewer than three people */
  readonly emptyShare: number;
  /** people within five metres of the hero */
  readonly company: number;
  readonly grid: number[][];
}

export interface VisibilityResult {
  readonly body: number;
  readonly head: number;
  readonly pixels: number;
}

export interface PuzzleDebug {
  readonly seed: string;
  readonly view: ViewSpec;
  readonly hero: { x: number; z: number; district: string };
  readonly heroOnOpeningScreen: boolean;
  readonly tried: number;
  readonly scanned: number;
  readonly shortlisted: number;
  readonly shortlistMs: number;
  readonly totalMs: number;
  readonly visibility: VisibilityResult;
  readonly occupancy: Occupancy;
  readonly candidates: number;
}

export class Game implements GameApi {
  private state: GameState = INITIAL;
  private readonly listeners = new Set<(s: GameState) => void>();
  private dirty = false;
  private town: Town | null = null;
  private serial = 0;
  private inputEpoch = 0;
  private hintAdActive = false;
  private hintPlan: readonly SearchArea[] | null = null;
  private readonly projected = new THREE.Vector3();
  private secondaryPeople = new Map<number, string>();
  private probe: ReturnType<Town['crowd']['createProbe']> | null = null;
  private azimuth = BASE_AZIMUTH;
  private view: ViewSpec | null = null;
  private debug: PuzzleDebug | null = null;
  private puzzleCount = 0;
  private peoplePos = new Float32Array(0);
  private peopleKind = new Uint8Array(0);
  /** HUD rectangles in CSS px (kept for layout-aware features; the hero is found by panning) */
  hudBlocks: () => readonly Rect[] = () => [];

  private frame: ReturnType<typeof stageFrame> | null = null;

  constructor(private readonly engine: Engine, readonly campaign?: Campaign) {
    engine.rig.onTap = (x, y) => this.click(x, y);
    engine.onResolutionChange = () => this.recompose();
    /* panning is clamped to the generated world for the current viewport */
    engine.rig.constrain = (goal) => {
      const { width, height } = engine.rig.size;
      const v = this.frame ? this.frame.constrain(goal, width, height) : clampView(goal, width, height);
      goal.x = v.x;
      goal.z = v.z;
    };
  }

  /* ---------------------------------------------------------------- lifecycle */

  setProgress(progress: number): void {
    this.set({ progress });
  }

  /** The town finished building: set up the first puzzle for the session seed. */
  async attach(town: Town, seedText: string): Promise<void> {
    this.town = town;
    this.probe = town.crowd.createProbe();
    this.indexPeople();
    if (!this.campaign?.district) await this.warmUp();
    await this.beginPuzzle(seedText, true);
  }

  /**
   * While still loading: draw every part of the town once at the game scale so that all static
   * buffers, the shadow map and every shader program are uploaded/compiled before play. Panning
   * into a new area then never stalls on first use.
   */
  private async warmUp(): Promise<void> {
    const town = this.town;
    if (!town) return;
    const { width, height } = this.engine.rig.size;
    const ppm = basePpm(width, height);
    const stepX = (width / ppm) * 0.9;
    const stepZ = (height / (ppm * Math.sin(VIEW_ELEVATION))) * 0.9;
    let n = 0;
    for (let z = WORLD.minZ + stepZ / 2; z < 70; z += stepZ) {
      for (let x = WORLD.minX + stepX / 2; x < WORLD.maxX; x += stepX) {
        this.engine.rig.setView(clampView({ x, z, azimuth: this.azimuth, elevation: VIEW_ELEVATION, ppm }, width, height), true);
        this.engine.renderOnce();
        if (++n % 4 === 0) await yieldTask();
      }
    }
    /* picking programs too */
    this.pickAt(width / 2, height / 2);
  }

  /** Flat arrays of where everyone stands, so occupancy scans allocate nothing. */
  private indexPeople(): void {
    const town = this.town;
    if (!town) return;
    const people = town.build.people.all();
    const pos = new Float32Array(people.length * 3);
    const kind = new Uint8Array(people.length);
    people.forEach((p, i) => {
      if (p.scale < 0.01 || p.roaming) return;
      let x = p.x;
      let z = p.z;
      kind[i] = 1;
      if (p.motion >= 0) {
        const b = town.build.motion.boundsOf(p.motion);
        if (b.max[0] - b.min[0] > 45 || b.max[2] - b.min[2] > 45) {
          kind[i] = 0;
          return;
        }
        x = (b.min[0] + b.max[0]) / 2;
        z = (b.min[2] + b.max[2]) / 2;
        kind[i] = 2;
      }
      pos[i * 3] = x;
      pos[i * 3 + 1] = p.y + 0.9;
      pos[i * 3 + 2] = z;
    });
    this.peoplePos = pos;
    this.peopleKind = kind;
  }

  /** True when a standing position is on land or on a declared walkable surface at its height. */
  private supported(c: HeroCandidate): boolean {
    const town = this.town;
    if (!town) return false;
    if (Math.abs(c.y) < 0.3 && isLand(c.x, c.z)) return true;
    return town.build.surfaces.some((surf) => Math.abs(surf.y - c.y) < 0.5 && pointInPolygon(c.x, c.z, surf.polygon));
  }

  /**
   * Set up a puzzle: hide the hero somewhere valid, then open on a busy part of town that does not
   * show him.
   *
   * Hard gates for the hero (never traded away): supported ground, clear of the world edge, in
   * company, and measured visibility of body and head in the id buffer of a view centred on him
   * (the camera is orthographic with a fixed angle, so occlusion is the same wherever the player
   * pans). Candidates are shortlisted on the CPU; GPU checks are bounded and yield between
   * candidates. If nothing passes, explicit recovery limits apply; below those setup fails loudly.
   */
  private async beginPuzzle(seedText: string, relocate: boolean): Promise<void> {
    const town = this.town;
    if (!town) return;
    this.inputEpoch++;
    if (relocate) this.hintPlan = null;
    const t0 = performance.now();
    const { width, height } = this.engine.rig.size;
    if (relocate) {
      this.set({ status: 'loading', progress: 0.97 });
      const rng = createRng(hashString(seedText)).fork(`puzzle-${this.puzzleCount}`);
      if (this.puzzleCount === 0) this.azimuth = BASE_AZIMUTH + rng.range(-0.3, 0.3);
      const district = this.campaign?.district;
      if (this.campaign) {
        const frame = stageFrame(district?.polygon, this.azimuth);
        this.frame = frame;
        this.engine.rig.overviewPpm = (w, h) => frame.fit(w, h);
      }
      type Attempt = { c: HeroCandidate; vis: VisibilityResult; heading: number; phase: number };
      const shortlist: HeroCandidate[] = [];
      let scanned = 0;
      for (const c of rng.shuffle(town.heroCandidates())) {
        if (district && !pointInPolygon(c.x, c.z, district.polygon)) continue;
        if (shortlist.length >= MAX_CANDIDATES || scanned >= 900) break;
        if (c.x < WORLD.minX + 8 || c.x > WORLD.maxX - 8 || c.z < WORLD.minZ + 8 || !this.supported(c)) continue;
        scanned++;
        if (this.companyAt(c.x, c.z) < MIN_COMPANY) continue;
        shortlist.push(c);
      }
      const shortlistMs = performance.now() - t0;
      let chosen = null as Attempt | null;
      let best = null as Attempt | null;
      let tried = 0;
      const centred = (c: HeroCandidate): ViewSpec => {
        const view = { x: c.x, z: c.z, azimuth: this.azimuth, elevation: VIEW_ELEVATION, ppm: basePpm(width, height) };
        return district ? view : clampView(view, width, height);
      };
      for (const c of shortlist) {
        tried++;
        const heading = this.azimuth + rng.range(-0.85, 0.85);
        const phase = rng.next();
        town.setHero(c, heading, phase);
        this.engine.rig.setView(centred(c), true);
        const vis = this.heroVisibility();
        const attempt: Attempt = { c, vis, heading, phase };
        if (!best || Math.min(vis.body, vis.head) > Math.min(best.vis.body, best.vis.head)) best = attempt;
        if (vis.pixels > 0 && vis.body >= MIN_VISIBLE && vis.head >= MIN_HEAD_VISIBLE) {
          chosen = attempt;
          break;
        }
        if (tried % 3 === 0) await yieldTask();
      }
      /* verified recovery only: the best measured candidate, if it clears the recovery limits */
      if (!chosen && best && best.vis.pixels > 0 && best.vis.body >= RECOVERY_VISIBLE && best.vis.head >= RECOVERY_HEAD) {
        town.setHero(best.c, best.heading, best.phase);
        this.engine.rig.setView(centred(best.c), true);
        const again = this.heroVisibility();
        if (again.pixels > 0 && again.body >= RECOVERY_VISIBLE && again.head >= RECOVERY_HEAD) chosen = { ...best, vis: again };
      }
      if (!chosen) {
        throw new Error(`No valid hero position found for seed "${seedText}" (${shortlist.length} shortlisted of ${scanned} scanned)`);
      }
      /* opening view: the busiest of a few seeded crops that keep the hero well off screen */
      const hero = chosen.c;
      let opening: ViewSpec | null = district ? {
        x: district.anchor[0], z: district.anchor[1], azimuth: this.azimuth,
        elevation: VIEW_ELEVATION, ppm: basePpm(width,height),
      } : null;
      let openingScore = -Infinity;
      for (let i = 0; !district && i < 40; i++) {
        const view = clampView(
          { x: rng.range(WORLD.minX, WORLD.maxX), z: rng.range(WORLD.minZ, 60), azimuth: this.azimuth, elevation: VIEW_ELEVATION, ppm: basePpm(width, height) },
          width,
          height,
        );
        const p = projectPoint(view, width, height, hero.x, hero.y + 1, hero.z);
        const away = Math.max(-p.x, p.x - width, -p.y, p.y - height);
        if (away < Math.min(width, height) * 0.35) continue;
        const occ = this.occupancy(view, width, height);
        const ground = (width / view.ppm) * (height / (view.ppm * Math.sin(view.elevation)));
        /* take the first crop that is properly busy (keeps openings varied); otherwise the busiest seen */
        if (occ.emptyShare <= MAX_EMPTY_SHARE && occ.total >= ground * MIN_DENSITY) {
          opening = view;
          break;
        }
        const score = occ.total / ground - occ.emptyShare * 2;
        if (score > openingScore) {
          openingScore = score;
          opening = view;
        }
      }
      if (!opening) throw new Error(`No opening view away from the hero for seed "${seedText}"`);
      this.view = opening;
      this.engine.rig.setView(opening, true);
      this.debug = {
        seed: seedText,
        view: opening,
        hero: { x: hero.x, z: hero.z, district: hero.district },
        tried,
        scanned,
        shortlisted: shortlist.length,
        visibility: chosen.vis,
        occupancy: this.occupancy(opening, width, height),
        heroOnOpeningScreen: this.heroOnScreen(),
        candidates: town.heroCandidates().length,
        shortlistMs: Math.round(shortlistMs),
        totalMs: Math.round(performance.now() - t0),
      };
      this.puzzleCount++;
    }
    const rng2 = createRng(hashString(seedText)).fork('secondary');
    const pool = rng2.shuffle(town.build.searchables.filter((sch) => town.build.people.get(sch.person).motion < 0)).slice(0, SECONDARY_COUNT);
    this.secondaryPeople = new Map(pool.map((sch) => [sch.person, sch.label]));
    const secondary: SecondaryTarget[] = pool.map((sch) => ({ id: String(sch.person), label: sch.label, found: false }));
    this.engine.paused = this.state.paused || this.hintAdActive;
    this.set({
      status: 'playing',
      runId: this.state.runId + 1,
      seed: seedText,
      hintLevel: relocate ? 0 : this.state.hintLevel,
      hintText: null,
      elapsedMs: 0,
      wrongClicks: 0,
      hintsUsed: relocate ? 0 : this.state.hintsUsed,
      adPlayed: relocate ? false : this.state.adPlayed === true,
      hintReward: relocate ? 'range' : this.state.hintReward,
      hintOutline: null,
      secondary,
      lastClick: null,
      marker: null,
      progress: 1,
    });
  }

  /** People standing within five metres of a ground point. */
  private companyAt(x: number, z: number): number {
    const pos = this.peoplePos;
    const kind = this.peopleKind;
    let n = 0;
    for (let i = 0; i < kind.length; i++) {
      if (kind[i] === 1 && Math.abs((pos[i * 3] as number) - x) < 5 && Math.abs((pos[i * 3 + 2] as number) - z) < 5) n++;
    }
    return n;
  }

  /** True when any part of the hero is inside the canvas for the current view. */
  heroOnScreen(): boolean {
    const town = this.town;
    if (!town) return false;
    const { width, height } = this.engine.rig.size;
    this.engine.rig.update(0);
    const s = town.hero.spot;
    const feet = this.screen(s.x, s.y, s.z);
    const head = this.screen(s.x, s.y + 2, s.z);
    return feet.x > -20 && feet.x < width + 20 && head.y < height + 10 && feet.y > -10;
  }

  /**
   * Screen-space occupancy of a prospective view: how many people land in each cell of a grid over
   * the canvas (walkers and riders are counted at the middle of their route), and how much company
   * the hero would have. Pure CPU; used to reject sparse compositions.
   */
  occupancy(view: ViewSpec, width: number, height: number, hero?: { x: number; z: number }): Occupancy {
    const cols = Math.max(3, Math.round(width / 180));
    const rows = Math.max(3, Math.round(height / 180));
    const cells = new Int32Array(cols * rows);
    const pos = this.peoplePos;
    const kind = this.peopleKind;
    const ca = Math.cos(view.azimuth);
    const sa = Math.sin(view.azimuth);
    const kx = view.ppm;
    const kz = view.ppm * Math.sin(view.elevation);
    const ky = view.ppm * Math.cos(view.elevation);
    let total = 0;
    let company = 0;
    for (let i = 0; i < kind.length; i++) {
      const k = kind[i] as number;
      if (k === 0) continue;
      const dx = (pos[i * 3] as number) - view.x;
      const dz = (pos[i * 3 + 2] as number) - view.z;
      if (hero && k === 1 && Math.abs((pos[i * 3] as number) - hero.x) < 5 && Math.abs((pos[i * 3 + 2] as number) - hero.z) < 5) company++;
      const sx = width / 2 + (dx * ca - dz * sa) * kx;
      const sy = height / 2 - (-dx * sa - dz * ca) * kz - (pos[i * 3 + 1] as number) * ky;
      if (sx < 0 || sx >= width || sy < 0 || sy >= height) continue;
      const cell = Math.floor((sy / height) * rows) * cols + Math.floor((sx / width) * cols);
      cells[cell] = (cells[cell] as number) + 1;
      total++;
    }
    let empty = 0;
    const grid: number[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: number[] = [];
      for (let c = 0; c < cols; c++) {
        const n = cells[r * cols + c] as number;
        if (n < 3) empty++;
        row.push(n);
      }
      grid.push(row);
    }
    return { total, emptyShare: empty / (cols * rows), company, grid };
  }

  /**
   * Viewport changed: keep the player's place in town (the view is only re-clamped to the world
   * for the new size and scale). The puzzle is never rerolled.
   */
  recompose(): void {
    if (!this.town || !this.view) return;
    const { width, height } = this.engine.rig.size;
    const s = this.engine.rig.state;
    const base = basePpm(width, height);
    const zoom = this.engine.rig.goalPpm / this.view.ppm;
    const view = clampView({ x: s.x, z: s.z, azimuth: this.azimuth, elevation: VIEW_ELEVATION, ppm: base }, width, height);
    this.view = view;
    this.engine.rig.setView({ ...view, ppm: base * zoom }, true);
    this.updateMarker();
  }

  /**
   * How much of the hero is really visible right now: his pixels in the scene's id buffer divided
   * by the pixels of his body rendered alone, for the whole figure and for the head band.
   */
  heroVisibility(): VisibilityResult {
    const town = this.town;
    const probe = this.probe;
    if (!town || !probe) return { body: 0, head: 0, pixels: 0 };
    /* place the camera and resolve the visible set for this view before measuring */
    this.engine.rig.update(0);
    town.cullNow(this.engine);
    const spot = town.hero.spot;
    const ppm = this.engine.rig.pixelsPerMetre;
    const canvas = this.engine.renderer.domElement;
    const feet = this.screen(spot.x, spot.y, spot.z);
    const w = Math.ceil(ppm * 1.7);
    const h = Math.ceil(screenHeight(ppm, 2.5) + ppm * 0.5);
    const x0 = Math.max(0, Math.min(canvas.clientWidth - w, Math.round(feet.x - w / 2)));
    const y0 = Math.max(0, Math.min(canvas.clientHeight - h, Math.round(feet.y - screenHeight(ppm, 2.35))));
    const id = town.hero.person + 1;
    probe.set(town.hero.person);
    const alone = this.engine.readIds(x0, y0, w, h, (render) => render(), probe.scene);
    let best: VisibilityResult = { body: 1, head: 1, pixels: 0 };
    const uniforms = town.crowdUniforms;
    const move = uniforms.uMoveTime.value;
    /* sample two moments so a passer-by standing in front for an instant is not decisive, but a stream is */
    for (const offset of [0, 4.5]) {
      uniforms.uMoveTime.value = move + offset;
      town.crowd.updateJoints(this.engine.renderer);
      const scene = this.engine.readIds(x0, y0, w, h, (render) => {
        town.setPickMode(true);
        render();
        town.setPickMode(false);
      });
      let total = 0;
      let seen = 0;
      let top = alone.height;
      for (let i = 0; i < alone.ids.length; i++) {
        if (alone.ids[i] === id) {
          total++;
          top = Math.min(top, Math.floor(i / alone.width));
        }
      }
      for (let i = 0; i < scene.ids.length; i++) if (scene.ids[i] === id && alone.ids[i] === id) seen++;
      const headRows = Math.max(2, Math.round((screenHeight(ppm, 0.34) * alone.height) / h));
      let headTotal = 0;
      let headSeen = 0;
      for (let y = top; y < Math.min(alone.height, top + headRows); y++) {
        for (let x = 0; x < alone.width; x++) {
          const i = y * alone.width + x;
          if (alone.ids[i] !== id) continue;
          headTotal++;
          if (scene.ids[i] === id) headSeen++;
        }
      }
      const result = { body: total ? seen / total : 0, head: headTotal ? headSeen / headTotal : 0, pixels: total };
      if (result.body + result.head < best.body + best.head || best.pixels === 0) best = result;
    }
    uniforms.uMoveTime.value = move;
    town.crowd.updateJoints(this.engine.renderer);
    return best;
  }

  /** Per-frame hook (called from the engine loop): clock, marker projection, batched notify. */
  update(realDt: number): void {
    const s = this.state;
    if (s.status === 'playing' && !s.paused && !s.waiting && !this.hintAdActive && realDt > 0) {
      this.state = { ...s, elapsedMs: s.elapsedMs + realDt * 1000 };
    }
    this.updateMarker();
    this.updateHintOutline();
    if (this.dirty) {
      this.dirty = false;
      const snapshot = this.state;
      for (const l of this.listeners) l(snapshot);
    }
  }

  private set(patch: Partial<GameState>): void {
    this.state = { ...this.state, ...patch };
    this.dirty = true;
    this.engine.invalidate();
  }

  /* ---------------------------------------------------------------- marker */

  private screen(x: number, y: number, z: number): { x: number; y: number } {
    const canvas = this.engine.renderer.domElement;
    const v = this.projected.set(x, y, z).project(this.engine.rig.camera);
    return { x: (v.x * 0.5 + 0.5) * canvas.clientWidth, y: (-v.y * 0.5 + 0.5) * canvas.clientHeight };
  }

  private updateMarker(): void {
    const town = this.town;
    const s = this.state;
    if (!town) return;
    let next: GameState['marker'] = null;
    const ppm = this.engine.rig.pixelsPerMetre;
    const hero = town.hero.spot;
    if (s.status === 'won' || (s.status === 'playing' && s.hintLevel === 3)) {
      const p = this.screen(hero.x, hero.y + 0.95, hero.z);
      next = { x: p.x, y: p.y, radius: Math.max(30, ppm * 1.35), kind: s.status === 'won' ? 'found' : 'reveal' };
    }
    const prev = s.marker;
    const same =
      (prev === null && next === null) ||
      (prev !== null && next !== null && prev.kind === next.kind && Math.abs(prev.x - next.x) < 0.4 && Math.abs(prev.y - next.y) < 0.4 && Math.abs(prev.radius - next.radius) < 0.4);
    if (!same) {
      this.state = { ...this.state, marker: next };
      this.dirty = true;
    }
  }

  private get hintArea(): SearchArea | undefined {
    return this.hintPlan?.[this.state.hintsUsed - 1];
  }

  private updateHintOutline(): void {
    const s = this.state;
    const area = s.status === 'playing' ? this.hintArea : undefined;
    let outline: HintOutline | null = null;
    if (area && this.town) {
      const y = this.town.hero.spot.y;
      outline = hintBoundary(area, this.campaign?.district?.polygon).map(([x, z]) => {
        const screen = this.screen(x, y, z);
        return [screen.x, screen.y] as const;
      });
    }
    const previous = s.hintOutline;
    if (outline === null ? previous === null : previous && previous.length === outline.length && outline.every(([x, y], index) =>
      Math.abs(x - previous[index][0]) < 0.4 && Math.abs(y - previous[index][1]) < 0.4)) return;
    this.state = { ...this.state, hintOutline: outline };
    this.dirty = true;
  }

  /* ---------------------------------------------------------------- picking */

  /** Id (person index + 1, or 0) of what is actually visible at a canvas position. */
  pickAt(x: number, y: number): number {
    const town = this.town;
    if (!town) return 0;
    return this.engine.pick(x, y, (render) => {
      town.setPickMode(true);
      render();
      town.setPickMode(false);
    });
  }

  private click(x: number, y: number): void {
    if (this.state.waiting || this.hintAdActive) return;
    const town = this.town;
    if (!town || this.state.status !== 'playing') return;
    const serial = ++this.serial;
    const epoch = this.inputEpoch;
    this.engine
      .pickAsync(x, y, (render) => {
        town.setPickMode(true);
        render();
        town.setPickMode(false);
      })
      .then((id) => this.resolveClick(id, x, y, serial, epoch))
      .catch(() => this.resolveClick(0, x, y, serial, epoch));
  }

  private resolveClick(id: number, x: number, y: number, serial: number, epoch: number): void {
    const town = this.town;
    if (!town || this.state.status !== 'playing' || this.state.waiting || this.hintAdActive || epoch !== this.inputEpoch) return;
    const person = id - 1;
    const feedback = (kind: ClickFeedback['kind'], message: string | null): ClickFeedback => ({ kind, x, y, serial, message });
    if (id > 0 && person === town.hero.person) {
      this.campaign?.finish(this.state.elapsedMs, this.state.adPlayed === true);
      this.set({ status: 'won', lastClick: feedback('hit', null), hintText: null });
      return;
    }
    const label = id > 0 ? this.secondaryPeople.get(person) : undefined;
    if (label !== undefined) {
      const already = this.state.secondary.find((t) => t.id === String(person))?.found ?? false;
      this.set({
        secondary: this.state.secondary.map((t) => (t.id === String(person) ? { ...t, found: true } : t)),
        lastClick: feedback('secondary', already ? `Already found ${label}.` : `You found ${label}!`),
      });
      return;
    }
    /* look-alikes get no special feedback: saying what matched would be a hint */
    this.set({ wrongClicks: this.state.wrongClicks + 1, lastClick: feedback('miss', null) });
  }

  /* ---------------------------------------------------------------- GameApi */

  markAdPlayed(runId: number): void {
    if (this.hintAdActive && this.state.status === 'playing' && runId === this.state.runId) this.set({adPlayed: true});
  }

  enterStage(stage: number): void {
    if (!this.campaign?.canPlay(stage)) return;
    if (stage === this.campaign.stage) { this.newPuzzle(); return; }
    const url = new URL(location.href);
    url.searchParams.set('stage', String(stage));
    location.replace(url);
  }

  getState(): GameState {
    return this.state;
  }

  subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  setPaused(paused: boolean): void {
    this.engine.paused = paused || this.hintAdActive;
    this.set({ paused });
  }

  setWaiting(waiting: boolean): void {
    this.engine.rig.pannable = !waiting && !this.hintAdActive;
    this.set({ waiting });
  }

  setReducedMotion(on: boolean): void {
    this.set({ reducedMotion: on });
  }

  get reducedMotion(): boolean {
    return this.state.reducedMotion;
  }

  setQuality(q: QualitySetting): void {
    this.engine.setQuality(q as QualityName);
    this.set({ quality: q });
  }

  setHintAdActive(active: boolean): void {
    if (active === this.hintAdActive) return;
    if (active) this.inputEpoch++;
    this.hintAdActive = active;
    this.engine.paused = this.state.paused || active;
    this.engine.rig.pannable = !this.state.waiting && !active;
    this.engine.invalidate();
  }

  requestHint(runId: number): boolean {
    const town = this.town;
    const state = this.state;
    if (!town || !this.hintAdActive || state.runId !== runId || state.status !== 'playing' || state.waiting || !state.hintReward) return false;

    if (!this.hintPlan) {
      const district = this.campaign?.district;
      const candidates = town.build.people.all().filter((person, index) =>
        index !== town.hero.person && person.motion < 0 && !person.roaming && person.scale >= 0.1 &&
        (!district || pointInPolygon(person.x, person.z, district.polygon)));
      this.hintPlan = searchAreas(town.hero.spot, candidates, state.seed);
    }
    const hintsUsed = state.hintsUsed + 1;
    const revealed = state.hintReward === 'reveal';
    const hintReward = revealed ? null : hintsUsed >= this.hintPlan.length ? 'reveal' : 'shrink';
    this.set({ hintsUsed, hintLevel: revealed ? 3 : 2, hintReward });
    this.focusHint();
    return true;
  }

  focusHint(): void {
    const spot = this.town?.hero.spot;
    if (!spot || this.state.status !== 'playing' || this.state.hintsUsed === 0) return;
    const area = this.hintArea;
    const x = area ? (area.minX + area.maxX) / 2 : spot.x;
    const z = area ? (area.minZ + area.maxZ) / 2 : spot.z;
    const height = spot.y + (area ? 0 : 0.95);
    const view = this.engine.rig.state;
    this.engine.rig.setView({
      x: x - Math.sin(view.azimuth) * height / Math.tan(view.elevation),
      z: z - Math.cos(view.azimuth) * height / Math.tan(view.elevation),
    }, true);
  }

  resetView(): void {
    if (this.view) this.engine.rig.setView(this.view);
  }

  zoomBy(_factor: number): void {
    /* Touch zoom is handled at the two-finger midpoint by the camera rig. */
  }

  rotateBy(_radians: number): void {
    /* no in-game orbit */
  }

  restart(): void {
    if (!this.town || this.state.status === 'loading') return;
    void this.beginPuzzle(this.state.seed, false);
  }

  /** A new puzzle in the same generated scene: new hero position and composition, no rebuild. */
  newPuzzle(seed?: string): void {
    if (!this.town || this.state.status === 'loading') return;
    const text = seed && seed.trim() ? seed.trim() : randomSeed();
    this.beginPuzzle(text, true).catch((error: unknown) => this.onFailure?.(error));
  }

  /** called when a puzzle cannot be set up (the page shows a terminal error with a retry) */
  onFailure: ((error: unknown) => void) | null = null;

  /** No reference picture is shown (direct user instruction); kept as a no-op for the HUD contract. */
  renderPortrait(_canvas: HTMLCanvasElement): void {
    /* intentionally empty */
  }

  /** Dev/test helpers (spoilers!). */
  heroScreen(): { x: number; y: number } {
    const town = this.town;
    if (!town) return { x: 0, y: 0 };
    return this.screen(town.hero.spot.x, town.hero.spot.y + 1.2, town.hero.spot.z);
  }

  puzzleDebug(): PuzzleDebug | null {
    return this.debug;
  }
}

/** Yield to the browser with a message task (timers are throttled in background tabs). */
function yieldTask(): Promise<void> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      channel.port1.close();
      resolve();
    };
    channel.port2.postMessage(0);
  });
}

const SEED_WORDS = ['festival', 'harbour', 'bunting', 'pretzel', 'lantern', 'carousel', 'gondola', 'parasol', 'confetti', 'marmalade', 'tram', 'topiary'];

/** A fresh local seed for every visit: no backend, no fixed default. */
export function randomSeed(): string {
  const buf = new Uint32Array(2);
  crypto.getRandomValues(buf);
  const word = SEED_WORDS[(buf[0] as number) % SEED_WORDS.length] as string;
  return `${word}-${String((buf[1] as number) % 100000).padStart(5, '0')}`;
}
