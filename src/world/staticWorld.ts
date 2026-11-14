/**
 * Static scenery batching. Every placement of a (shared, cached) Geo is recorded per spatial cell
 * and baked ONCE into compact per-cell buffers for two detail tiers. At runtime a cell is one draw
 * call per material; zoom only toggles the prebuilt near/far meshes.
 *
 * Measured tradeoff: merging placements costs vertex memory but keeps colour-pass draw calls at
 * roughly one per visible cell, which matters more than buffer size on this content.
 */
import * as THREE from 'three';
import { separateCoplanar } from '../core/coplanar';
import { type Col, type Geo, bounds, selectLod } from '../core/geo';
import { colorOf } from '../core/palette';
import type { WorldMaterials } from '../render/worldMaterial';
import { type Bounds3, HORIZONTAL_STEP, LIFT_STEP, LiftAllocator, placedBounds } from './depthSeparation';

export type StaticKind = 'solid' | 'glass' | 'water';

interface Placement {
  readonly geo: Geo;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly cos: number;
  readonly sin: number;
  readonly scale: number;
  readonly tint: readonly [number, number, number] | null;
  readonly cast: boolean;
}

interface CellMeshes {
  near: THREE.Mesh[];
  far: THREE.Mesh[];
}

export interface StaticStats {
  readonly cells: number;
  readonly placements: number;
  readonly trianglesNear: number;
  readonly trianglesFar: number;
  readonly bytes: number;
}

export const STATIC_CELL = 45;
const FAR_PPM: readonly [number, number] = [8.5, 7];

const lodCache = new WeakMap<Geo, { near: Geo; far: Geo }>();
const boundsCache = new WeakMap<Geo, Bounds3>();

function localBounds(g: Geo): Bounds3 {
  let hit = boundsCache.get(g);
  if (!hit) {
    hit = bounds(g);
    boundsCache.set(g, hit);
  }
  return hit;
}

/** how a placement is drawn in depth: normally, pushed back (ground, terrace tops) or never fighting (glass) */
export type DepthClass = 'main' | 'back' | 'glass';

/**
 * The two detail tiers of a mesh as they are baked. The near tier — the only one the game shows at
 * its fixed scale — has flush faces separated; the far tier (free dev camera only) is left as is.
 */
export function bakedLods(g: Geo): { near: Geo; far: Geo } {
  let hit = lodCache.get(g);
  if (!hit) {
    hit = { near: separateCoplanar(selectLod(g, 'near')), far: selectLod(g, 'far') };
    lodCache.set(g, hit);
  }
  return hit;
}

function bake(list: readonly Placement[], tier: 'near' | 'far'): { geometry: THREE.BufferGeometry; tris: number; bytes: number } | null {
  let verts = 0;
  let indices = 0;
  for (const p of list) {
    const g = bakedLods(p.geo)[tier];
    verts += g.pos.length / 3;
    indices += g.idx.length;
  }
  if (indices === 0) return null;
  const pos = new Float32Array(verts * 3);
  const nor = new Int8Array(verts * 4);
  const col = new Uint8Array(verts * 4);
  const idx = verts > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
  let vo = 0;
  let io = 0;
  for (const p of list) {
    const g = bakedLods(p.geo)[tier];
    const n = g.pos.length / 3;
    const { cos, sin, scale: s, tint } = p;
    for (let i = 0; i < n; i++) {
      const x = (g.pos[i * 3] as number) * s;
      const y = (g.pos[i * 3 + 1] as number) * s;
      const z = (g.pos[i * 3 + 2] as number) * s;
      const o = (vo + i) * 3;
      pos[o] = x * cos + z * sin + p.x;
      pos[o + 1] = y + p.y;
      pos[o + 2] = -x * sin + z * cos + p.z;
      const nx = g.nor[i * 3] as number;
      const nz = g.nor[i * 3 + 2] as number;
      const q = (vo + i) * 4;
      nor[q] = Math.round((nx * cos + nz * sin) * 127);
      nor[q + 1] = Math.round((g.nor[i * 3 + 1] as number) * 127);
      nor[q + 2] = Math.round((-nx * sin + nz * cos) * 127);
      let r = g.col[i * 3] as number;
      let gg = g.col[i * 3 + 1] as number;
      let b = g.col[i * 3 + 2] as number;
      const mask = g.fx[i * 2] as number;
      if (tint && mask > 0) {
        r += (tint[0] - r) * mask;
        gg += (tint[1] - gg) * mask;
        b += (tint[2] - b) * mask;
      }
      col[q] = Math.min(255, Math.round(r * 255));
      col[q + 1] = Math.min(255, Math.round(gg * 255));
      col[q + 2] = Math.min(255, Math.round(b * 255));
      col[q + 3] = Math.min(255, Math.round((g.fx[i * 2 + 1] as number) * 255));
    }
    for (let i = 0; i < g.idx.length; i++) idx[io + i] = (g.idx[i] as number) + vo;
    vo += n;
    io += g.idx.length;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(nor, 4, true));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(col, 4, true));
  geometry.setIndex(new THREE.BufferAttribute(idx, 1));
  geometry.computeBoundingSphere();
  return { geometry, tris: indices / 3, bytes: pos.byteLength + nor.byteLength + col.byteLength + idx.byteLength };
}

export class StaticWorld {
  readonly group = new THREE.Group();
  private readonly cells = new Map<string, Record<StaticKind, { cast: Placement[]; flat: Placement[]; under: Placement[] }>>();
  private readonly built: CellMeshes[] = [];
  private readonly occludable: THREE.Mesh[] = [];
  private placements = 0;
  private readonly lifts = new LiftAllocator();
  private far = true;
  private stat: StaticStats = { cells: 0, placements: 0, trianglesNear: 0, trianglesFar: 0, bytes: 0 };

  constructor() {
    this.group.name = 'static-world';
  }

  /** when true, every placement is also recorded in `traceLog` (development analysis only) */
  trace = false;
  readonly traceLog: Array<{ label: string; geo: Geo; x: number; y: number; z: number; cos: number; sin: number; scale: number; kind: StaticKind; depth: DepthClass; tint: readonly [number, number, number] | null }> = [];

  /**
   * Record one placement: scale, rotate about y, translate.
   * `cast: false` — ground-hugging overlays and terrain (no shadow casting, depth pushed back).
   * `under: true` — solid bases other things rest on, such as terrace tops (casts shadows, depth
   * pushed back). Anything laid exactly on these surfaces then wins the depth test.
   * Solid placements other than ground overlays also receive a sub-centimetre offset that differs
   * from every placement they touch (see depthSeparation.ts), so coincident surfaces of different
   * placements cannot z-fight.
   */
  add(geo: Geo, baseX: number, baseY: number, baseZ: number, rotY = 0, scale = 1, tint?: Col, kind: StaticKind = 'solid', cast = true, label = '', under = false): void {
    if (geo.idx.length === 0) return;
    const cos = Math.cos(rotY);
    const sin = Math.sin(rotY);
    const separable = kind === 'solid' && (cast || under);
    const level = separable ? this.lifts.assign(placedBounds(localBounds(geo), baseX, baseY, baseZ, cos, sin, scale)) : 0;
    /* up, and along the placement's own diagonal so that flush walls separate as well as flush tops */
    const y = baseY + level * LIFT_STEP;
    const x = baseX + level * HORIZONTAL_STEP * (cos + sin);
    const z = baseZ + level * HORIZONTAL_STEP * (cos - sin);
    if (this.trace) {
      const depth: DepthClass = kind === 'glass' ? 'glass' : kind === 'solid' && (under || !cast) ? 'back' : 'main';
      this.traceLog.push({ label, geo, x, y, z, cos, sin, scale, kind, depth, tint: tint === undefined ? null : colorOf(tint) });
    }
    const key = `${Math.floor(x / STATIC_CELL)},${Math.floor(z / STATIC_CELL)}`;
    let cell = this.cells.get(key);
    if (!cell) {
      cell = {
        solid: { cast: [], flat: [], under: [] },
        glass: { cast: [], flat: [], under: [] },
        water: { cast: [], flat: [], under: [] },
      };
      this.cells.set(key, cell);
    }
    const placement: Placement = {
      geo,
      x,
      y,
      z,
      cos,
      sin,
      scale,
      tint: tint === undefined ? null : colorOf(tint),
      cast,
    };
    (under ? cell[kind].under : cast ? cell[kind].cast : cell[kind].flat).push(placement);
    this.placements++;
  }

  /** Bake all cells. `water` is the material for 'water' placements (ponds, fountains). */
  build(materials: WorldMaterials, water: THREE.Material): void {
    let trisNear = 0;
    let trisFar = 0;
    let bytes = 0;
    for (const cell of this.cells.values()) {
      const meshes: CellMeshes = { near: [], far: [] };
      for (const kind of ['solid', 'glass', 'water'] as const) {
        for (const batch of ['cast', 'under', 'flat'] as const) {
          const list = cell[kind][batch];
          if (list.length === 0) continue;
          for (const tier of ['near', 'far'] as const) {
            const baked = bake(list, tier);
            if (!baked) continue;
            const pushedBack = kind === 'solid' && batch !== 'cast';
            const material = kind === 'solid' ? (pushedBack ? materials.ground : materials.solid) : kind === 'glass' ? materials.glass : water;
            const mesh = new THREE.Mesh(baked.geometry, material);
            mesh.matrixAutoUpdate = false;
            mesh.receiveShadow = kind !== 'glass';
            mesh.castShadow = batch !== 'flat' && kind === 'solid';
            if (mesh.castShadow) mesh.customDepthMaterial = materials.depth;
            if (kind === 'glass') mesh.renderOrder = 3;
            mesh.userData.kind = kind;
            mesh.userData.material = material;
            meshes[tier].push(mesh);
            if (kind !== 'glass') this.occludable.push(mesh);
            this.group.add(mesh);
            if (tier === 'near') trisNear += baked.tris;
            else trisFar += baked.tris;
            bytes += baked.bytes;
          }
        }
      }
      this.built.push(meshes);
    }
    this.stat = { cells: this.built.length, placements: this.placements, trianglesNear: trisNear, trianglesFar: trisFar, bytes };
    this.cells.clear();
    this.applyTier();
  }

  updateTier(ppm: number): void {
    const next = this.far ? ppm <= FAR_PPM[0] : ppm < FAR_PPM[1];
    if (next !== this.far) {
      this.far = next;
      this.applyTier();
    }
  }

  private applyTier(): void {
    for (const c of this.built) {
      for (const m of c.near) m.visible = !this.far;
      for (const m of c.far) m.visible = this.far;
    }
  }

  /** While picking, scenery renders as flat black occluders (glass is ignored). */
  setPickMode(on: boolean, materials: WorldMaterials, _water?: THREE.Material): void {
    for (const m of this.occludable) {
      m.material = on ? materials.occluder : (m.userData.material as THREE.Material);
    }
    for (const c of this.built) {
      for (const m of [...c.near, ...c.far]) if (m.userData.kind === 'glass') m.visible = on ? false : m.visible;
    }
    if (!on) this.applyTier();
  }

  stats(): StaticStats {
    return this.stat;
  }

  dispose(): void {
    for (const c of this.built) for (const m of [...c.near, ...c.far]) m.geometry.dispose();
    this.group.clear();
    this.built.length = 0;
    this.occludable.length = 0;
  }
}
