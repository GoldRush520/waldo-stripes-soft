/**
 * Renderer, light rig, frame loop and measurement.
 *
 * - one dominant shadow-casting sun, fitted to the visible ground and snapped in light space;
 *   the shadow map is re-rendered only when something that casts into it can have changed
 * - render-on-demand when nothing moves; hidden tabs do no work; deltas are clamped on resume
 * - bounded pixel ratio with an optional adaptive controller (hysteresis + cooldown)
 * - on-demand GPU picking of a few pixels under the cursor (never per frame)
 */
import * as THREE from 'three';
import { WORLD } from '../world/layout';
import { CameraRig } from './cameraRig';

export type QualityName = 'auto' | 'low' | 'medium' | 'high';

interface QualitySpec {
  readonly dprCap: number;
  readonly shadowSize: number;
}

const QUALITY: Record<QualityName, QualitySpec> = {
  auto: { dprCap: 1.5, shadowSize: 2048 },
  low: { dprCap: 1, shadowSize: 1024 },
  medium: { dprCap: 1.5, shadowSize: 2048 },
  high: { dprCap: 2, shadowSize: 2048 },
};

export interface FrameSystem {
  /** advance clocks / uniforms; `animDt` is 0 while paused */
  update(animDt: number, engine: Engine): void;
}

export interface FrameStats {
  readonly frames: number;
  readonly seconds: number;
  readonly medianMs: number;
  readonly p95Ms: number;
  readonly p99Ms: number;
  readonly worstMs: number;
  readonly over20: number;
  readonly over33: number;
  readonly over50: number;
  readonly cpuMedianMs: number;
  readonly cpuP95Ms: number;
  readonly drawCallsMedian: number;
  readonly drawCallsMax: number;
  readonly trianglesMedian: number;
  readonly trianglesMax: number;
}

const SUN_DIR = new THREE.Vector3(-0.52, 0.72, 0.46).normalize();
const SUN_RIGHT = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), SUN_DIR).normalize();
const SUN_UP = new THREE.Vector3().crossVectors(SUN_DIR, SUN_RIGHT).normalize();
const SAMPLE_CAP = 9000;

/** The non-zero pick id nearest to the centre of a square id buffer, within radius r (pixels). */
function nearestId(buffer: Uint8Array, size: number, r: number): number {
  let best = 0;
  let bestD = Infinity;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const o = (y * size + x) * 4;
      const id = (buffer[o] as number) + ((buffer[o + 1] as number) << 8) + ((buffer[o + 2] as number) << 16);
      if (id === 0) continue;
      const d = (x - r) * (x - r) + (y - r) * (y - r);
      if (d < bestD && d <= r * r) {
        bestD = d;
        best = id;
      }
    }
  }
  return best;
}
const SPARSE_SHADOW_INTERVAL = 6;
const ADAPT_WINDOW = 120;

export class Engine {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly rig: CameraRig;
  readonly sun = new THREE.DirectionalLight('#FFF3E2', 1.6);
  readonly hemi = new THREE.HemisphereLight('#FFF9F0', '#E6CDBE', 1.72);
  private readonly systems: FrameSystem[] = [];
  private readonly abort = new AbortController();
  /** locked to medium by default (user decision); 'auto' adaptive mode only runs if explicitly selected */
  private quality: QualityName = 'medium';
  private dpr = 1;
  private last = 0;
  private running = false;
  private needsRender = true;
  private frame = 0;
  paused = false;
  /** true when moving shadow casters are being drawn into the shadow map (crowd in mid/near tier) */
  dynamicShadows: () => boolean = () => true;
  /** called when the adaptive controller changes the pixel ratio */
  onResolutionChange: (() => void) | null = null;
  private readonly rafMs = new Float32Array(SAMPLE_CAP);
  private readonly cpuMs = new Float32Array(SAMPLE_CAP);
  private readonly drawSamples = new Uint16Array(SAMPLE_CAP);
  private readonly triSamples = new Uint32Array(SAMPLE_CAP);
  private readonly timeSamples = new Float64Array(SAMPLE_CAP);
  private samples = 0;
  private sampling = false;
  private lastDraws = 0;
  private lastTris = 0;
  private shadowRadius = 0;
  private shadowA = NaN;
  private shadowB = NaN;
  private shadowDirty = true;
  private readonly tmp = new THREE.Vector3();
  private slowFrames = 0;
  private windowFrames = 0;
  private cleanWindows = 0;
  private cooldownUntil = 0;
  private retryUpAfter = 0;
  private lastUpAt = -1e9;
  private pickTarget: THREE.WebGLRenderTarget | null = null;
  private pickBuffer = new Uint8Array(4);

  constructor(private readonly container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.info.autoReset = false;
    this.scene.background = new THREE.Color('#EEF3F4');
    container.appendChild(this.renderer.domElement);
    this.rig = new CameraRig(this.renderer.domElement, WORLD);
    this.rig.onInteract = () => this.invalidate();
    this.sun.castShadow = true;
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 0.05;
    this.sun.shadow.radius = 2.2;
    this.scene.add(this.hemi, this.sun, this.sun.target);
    this.setQuality('medium');
    const signal = this.abort.signal;
    window.addEventListener('resize', () => this.resize(), { signal });
    document.addEventListener(
      'visibilitychange',
      () => {
        this.last = 0;
        this.invalidate();
      },
      { signal },
    );
  }

  addSystem(system: FrameSystem): void {
    this.systems.push(system);
  }

  setQuality(q: QualityName): void {
    this.quality = q;
    const spec = QUALITY[q];
    if (this.sun.shadow.mapSize.x !== spec.shadowSize) {
      this.sun.shadow.mapSize.set(spec.shadowSize, spec.shadowSize);
      this.sun.shadow.map?.dispose();
      this.sun.shadow.map = null;
    }
    this.shadowRadius = 0;
    this.applyDpr(Math.min(window.devicePixelRatio || 1, spec.dprCap));
    this.cleanWindows = 0;
    this.windowFrames = 0;
    this.slowFrames = 0;
  }

  get qualityName(): QualityName {
    return this.quality;
  }

  get pixelRatio(): number {
    return this.dpr;
  }

  private applyDpr(dpr: number): void {
    this.dpr = dpr;
    this.renderer.setPixelRatio(dpr);
    this.resize();
    this.onResolutionChange?.();
  }

  resize(): void {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h);
    this.rig.resize(w, h);
    this.invalidate();
  }

  /** Request a frame even when the scene is otherwise idle. */
  invalidate(): void {
    this.needsRender = true;
    this.shadowDirty = true;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    requestAnimationFrame(this.tick);
  }

  private readonly tick = (now: number): void => {
    if (!this.running) return;
    requestAnimationFrame(this.tick);
    if (document.hidden) {
      this.last = 0;
      return;
    }
    const raf = this.last === 0 ? 16.7 : now - this.last;
    this.last = now;
    const dt = Math.min(0.1, raf / 1000);
    const cameraMoved = this.rig.update(dt);
    const animDt = this.paused ? 0 : dt;
    if (!cameraMoved && animDt === 0 && !this.needsRender) return;
    const t0 = performance.now();
    for (const s of this.systems) s.update(animDt, this);
    const fitChanged = this.fitShadow();
    this.frame++;
    const dynamic = this.dynamicShadows() && animDt > 0;
    if (dynamic || fitChanged || this.shadowDirty || (animDt > 0 && this.frame % SPARSE_SHADOW_INTERVAL === 0)) {
      this.renderer.shadowMap.needsUpdate = true;
      this.shadowDirty = false;
    }
    this.renderer.info.reset();
    this.renderer.render(this.scene, this.rig.camera);
    this.needsRender = false;
    this.lastDraws = this.renderer.info.render.calls;
    this.lastTris = this.renderer.info.render.triangles;
    if (this.sampling && this.samples < SAMPLE_CAP) {
      this.rafMs[this.samples] = raf;
      this.cpuMs[this.samples] = performance.now() - t0;
      this.drawSamples[this.samples] = this.lastDraws;
      this.triSamples[this.samples] = this.lastTris;
      this.timeSamples[this.samples] = now;
      this.samples++;
    }
    if (this.quality === 'auto' && animDt > 0) this.adapt(raf, now);
  };

  /**
   * Adaptive resolution: a rolling share of slow frames steps the pixel ratio down; long clean
   * stretches step it back up. A failed step-up is remembered so the controller does not oscillate.
   */
  private adapt(raf: number, now: number): void {
    this.windowFrames++;
    if (raf > 21) this.slowFrames++;
    if (this.windowFrames < ADAPT_WINDOW) return;
    const slow = this.slowFrames / this.windowFrames;
    this.windowFrames = 0;
    this.slowFrames = 0;
    if (now < this.cooldownUntil) return;
    const cap = Math.min(window.devicePixelRatio || 1, QUALITY.auto.dprCap);
    if (slow > 0.25 && this.dpr > 1) {
      if (now - this.lastUpAt < 8000) this.retryUpAfter = now + 90000;
      this.applyDpr(Math.max(1, this.dpr - 0.25));
      this.cooldownUntil = now + 4000;
      this.cleanWindows = 0;
    } else if (slow < 0.02) {
      this.cleanWindows++;
      if (this.cleanWindows >= 5 && this.dpr < cap && now > this.retryUpAfter) {
        this.applyDpr(Math.min(cap, this.dpr + 0.25));
        this.lastUpAt = now;
        this.cooldownUntil = now + 4000;
        this.cleanWindows = 0;
      }
    } else {
      this.cleanWindows = 0;
    }
  }

  /**
   * Fit the single shadow frustum to the visible ground. The centre is snapped to whole shadow
   * texels along the light's own axes so static shadows do not shimmer while panning.
   * Returns true when the frustum moved (the shadow map must then be redrawn).
   */
  private fitShadow(): boolean {
    const s = this.rig.state;
    const wanted = Math.min(210, Math.max(26, this.rig.viewRadius() * 1.05 + 8));
    const cam = this.sun.shadow.camera;
    let changed = false;
    if (Math.abs(wanted - this.shadowRadius) > this.shadowRadius * 0.04) {
      this.shadowRadius = wanted;
      cam.left = -wanted;
      cam.right = wanted;
      cam.top = wanted;
      cam.bottom = -wanted;
      cam.near = 120;
      cam.far = 760;
      cam.updateProjectionMatrix();
      changed = true;
    }
    const texel = (this.shadowRadius * 2) / this.sun.shadow.mapSize.x;
    const p = this.tmp.set(s.x, 0, s.z);
    const a = Math.round(p.dot(SUN_RIGHT) / texel) * texel;
    const b = Math.round(p.dot(SUN_UP) / texel) * texel;
    if (a !== this.shadowA || b !== this.shadowB) {
      this.shadowA = a;
      this.shadowB = b;
      const depth = p.dot(SUN_DIR);
      const t = this.sun.target.position;
      t.set(0, 0, 0).addScaledVector(SUN_RIGHT, a).addScaledVector(SUN_UP, b).addScaledVector(SUN_DIR, depth);
      this.sun.position.copy(t).addScaledVector(SUN_DIR, 420);
      this.sun.target.updateMatrixWorld();
      changed = true;
    }
    return changed;
  }

  /** Render one frame right now and return the canvas as a PNG blob (no retained drawing buffer). */
  async capture(): Promise<Blob> {
    this.rig.update(0);
    for (const s of this.systems) s.update(0, this);
    this.fitShadow();
    this.renderer.shadowMap.needsUpdate = true;
    this.renderer.render(this.scene, this.rig.camera);
    const blob = await new Promise<Blob | null>((resolve) => this.renderer.domElement.toBlob(resolve, 'image/png'));
    this.invalidate();
    if (!blob) throw new Error('Canvas capture failed');
    return blob;
  }

  /** Draw one frame immediately, outside the loop (used to warm up buffers and programs while loading). */
  renderOnce(): void {
    this.rig.update(0);
    for (const s of this.systems) s.update(0, this);
    this.fitShadow();
    this.renderer.shadowMap.needsUpdate = true;
    this.renderer.render(this.scene, this.rig.camera);
    this.invalidate();
  }

  /**
   * Like pick(), but reads the pixels back asynchronously (no pipeline stall): the id resolves a
   * frame or two later. Use for player clicks; the synchronous version is for setup checks.
   */
  async pickAsync(cssX: number, cssY: number, withPickMaterials: (render: () => void) => void, radius = 2.5): Promise<number> {
    const r = Math.max(1, Math.round(radius * this.dpr));
    const size = r * 2 + 1;
    if (!this.pickTarget || this.pickTarget.width !== size) {
      this.pickTarget?.dispose();
      this.pickTarget = new THREE.WebGLRenderTarget(size, size, { depthBuffer: true });
      this.pickBuffer = new Uint8Array(size * size * 4);
    }
    const cam = this.rig.camera;
    const canvas = this.renderer.domElement;
    cam.setViewOffset(canvas.width, canvas.height, Math.round(cssX * this.dpr) - r, Math.round(cssY * this.dpr) - r, size, size);
    const background = this.scene.background;
    this.scene.background = null;
    const target = this.pickTarget;
    withPickMaterials(() => {
      this.renderer.setRenderTarget(target);
      this.renderer.setClearColor(0x000000, 1);
      this.renderer.clear();
      this.renderer.render(this.scene, cam);
      this.renderer.setRenderTarget(null);
    });
    this.scene.background = background;
    cam.clearViewOffset();
    cam.updateProjectionMatrix();
    this.invalidate();
    const buffer = new Uint8Array(size * size * 4);
    await this.renderer.readRenderTargetPixelsAsync(target, 0, 0, size, size, buffer);
    return nearestId(buffer, size, r);
  }

  /**
   * GPU pick: render the ids of whatever is visible in a few pixels around a canvas position.
   * `withPickMaterials` must swap the scene to id/occluder materials for the duration of the call.
   * Returns the id nearest to the cursor within `radius` CSS pixels (0 = nothing pickable).
   */
  pick(cssX: number, cssY: number, withPickMaterials: (render: () => void) => void, radius = 2.5): number {
    const r = Math.max(1, Math.round(radius * this.dpr));
    const size = r * 2 + 1;
    if (!this.pickTarget || this.pickTarget.width !== size) {
      this.pickTarget?.dispose();
      this.pickTarget = new THREE.WebGLRenderTarget(size, size, { depthBuffer: true });
      this.pickBuffer = new Uint8Array(size * size * 4);
    }
    const cam = this.rig.camera;
    const canvas = this.renderer.domElement;
    this.rig.update(0);
    cam.setViewOffset(canvas.width, canvas.height, Math.round(cssX * this.dpr) - r, Math.round(cssY * this.dpr) - r, size, size);
    const background = this.scene.background;
    this.scene.background = null;
    const target = this.pickTarget;
    withPickMaterials(() => {
      this.renderer.setRenderTarget(target);
      this.renderer.setClearColor(0x000000, 1);
      this.renderer.clear();
      this.renderer.render(this.scene, cam);
      this.renderer.setRenderTarget(null);
    });
    this.scene.background = background;
    cam.clearViewOffset();
    cam.updateProjectionMatrix();
    this.renderer.readRenderTargetPixels(target, 0, 0, size, size, this.pickBuffer);
    const best = nearestId(this.pickBuffer, size, r);
    this.invalidate();
    return best;
  }

  /**
   * Render the pick ids of a rectangle of the canvas (CSS px) and return them row-major, top row
   * first. Used for on-demand visibility checks; never called per frame.
   */
  readIds(cssX: number, cssY: number, cssW: number, cssH: number, renderWith: (render: () => void) => void, scene: THREE.Scene = this.scene): { ids: Uint32Array; width: number; height: number } {
    const scale = Math.min(this.dpr, 2);
    const w = Math.max(1, Math.round(cssW * scale));
    const h = Math.max(1, Math.round(cssH * scale));
    const canvas = this.renderer.domElement;
    const fullW = Math.round(canvas.clientWidth * scale);
    const fullH = Math.round(canvas.clientHeight * scale);
    const cam = this.rig.camera;
    this.rig.update(0);
    cam.setViewOffset(fullW, fullH, Math.round(cssX * scale), Math.round(cssY * scale), w, h);
    const target = new THREE.WebGLRenderTarget(w, h, { depthBuffer: true });
    const background = this.scene.background;
    this.scene.background = null;
    renderWith(() => {
      this.renderer.setRenderTarget(target);
      this.renderer.setClearColor(0x000000, 1);
      this.renderer.clear();
      this.renderer.render(scene, cam);
      this.renderer.setRenderTarget(null);
    });
    this.scene.background = background;
    cam.clearViewOffset();
    cam.updateProjectionMatrix();
    const raw = new Uint8Array(w * h * 4);
    this.renderer.readRenderTargetPixels(target, 0, 0, w, h, raw);
    target.dispose();
    const ids = new Uint32Array(w * h);
    for (let y = 0; y < h; y++) {
      const src = (h - 1 - y) * w * 4;
      for (let x = 0; x < w; x++) {
        const o = src + x * 4;
        ids[y * w + x] = (raw[o] as number) + ((raw[o + 1] as number) << 8) + ((raw[o + 2] as number) << 16);
      }
    }
    this.invalidate();
    return { ids, width: w, height: h };
  }

  beginSampling(): void {
    this.samples = 0;
    this.sampling = true;
  }

  endSampling(): FrameStats {
    this.sampling = false;
    const n = this.samples;
    const sorted = (a: ArrayLike<number>): number[] => Array.from({ length: n }, (_, i) => a[i] as number).sort((x, y) => x - y);
    const raf = sorted(this.rafMs);
    const cpu = sorted(this.cpuMs);
    const draws = sorted(this.drawSamples);
    const tris = sorted(this.triSamples);
    const q = (arr: number[], p: number): number => (arr.length ? (arr[Math.min(arr.length - 1, Math.floor(arr.length * p))] as number) : 0);
    let total = 0;
    for (const v of raf) total += v;
    return {
      frames: n,
      seconds: total / 1000,
      medianMs: q(raf, 0.5),
      p95Ms: q(raf, 0.95),
      p99Ms: q(raf, 0.99),
      worstMs: raf[raf.length - 1] ?? 0,
      over20: raf.filter((v) => v > 20).length,
      over33: raf.filter((v) => v > 33.4).length,
      over50: raf.filter((v) => v > 50).length,
      cpuMedianMs: q(cpu, 0.5),
      cpuP95Ms: q(cpu, 0.95),
      drawCallsMedian: q(draws, 0.5),
      drawCallsMax: draws[draws.length - 1] ?? 0,
      trianglesMedian: q(tris, 0.5),
      trianglesMax: tris[tris.length - 1] ?? 0,
    };
  }

  /** Frames slower than `ms` from the last sampling run: [time since page load, frame ms, cpu ms]. */
  slowFrameLog(ms = 25): Array<readonly [number, number, number]> {
    const out: Array<readonly [number, number, number]> = [];
    for (let i = 0; i < this.samples; i++) {
      if ((this.rafMs[i] as number) > ms) out.push([Math.round(this.timeSamples[i] as number), Math.round(this.rafMs[i] as number), +(this.cpuMs[i] as number).toFixed(1)]);
    }
    return out;
  }

  get drawCalls(): number {
    return this.lastDraws;
  }

  get triangles(): number {
    return this.lastTris;
  }

  /** Stop the loop, remove every listener, release GPU resources and the canvas. */
  dispose(): void {
    this.running = false;
    this.abort.abort();
    this.rig.dispose();
    this.pickTarget?.dispose();
    this.sun.shadow.map?.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
