/**
 * Rig geometry assembly. A character is a compact always-on body plus a few separately instanced
 * options (hair, hat, glasses, garment, held prop). Each piece is authored with the geometry kit in
 * the pivot space of one rig part (see skeleton.ts) and tagged with how it is coloured.
 */
import * as THREE from 'three';
import { type Geo, merge, selectLod, vertexCount } from '../core/geo';
import { Cat, type CatId, type PartId, type SlotId } from './skeleton';

export interface RigPiece {
  readonly geo: Geo;
  readonly part: PartId;
  readonly slot: SlotId;
}

export interface RigOption {
  /** unique key, e.g. "hat.bobble", "hair.bun", "hold.stick" */
  readonly key: string;
  readonly cat: CatId;
  readonly pieces: readonly RigPiece[];
  /** true when the option is too small to matter in the far tier and should not be drawn there */
  readonly nearOnly?: boolean;
  /** approximate reach beyond the body in metres (kites, rods, balloons) used to pad culling bounds */
  readonly reach?: number;
}

export function piece(geo: Geo, part: PartId, slot: SlotId): RigPiece {
  return { geo, part, slot };
}

export type RigTier = 'near' | 'far';

/** Pack rig pieces into one GPU geometry (compact attributes). Returns null when the tier is empty. */
export function buildRigGeometry(
  pieces: readonly RigPiece[],
  cat: CatId,
  tier: RigTier,
): THREE.BufferGeometry | null {
  const parts = pieces
    .map((p) => ({ ...p, geo: selectLod(p.geo, tier) }))
    .filter((p) => p.geo.idx.length > 0);
  if (parts.length === 0) return null;
  const all = merge(parts.map((p) => p.geo));
  const n = vertexCount(all);
  const normals = new Int8Array(n * 4);
  const meta = new Uint8Array(n * 4);
  const tint = new Uint8Array(n * 4);
  let v = 0;
  for (const p of parts) {
    const count = vertexCount(p.geo);
    for (let i = 0; i < count; i++, v++) {
      meta[v * 4] = p.part;
      meta[v * 4 + 1] = p.slot;
      meta[v * 4 + 2] = cat;
    }
  }
  for (let i = 0; i < n; i++) {
    normals[i * 4] = Math.round((all.nor[i * 3] as number) * 127);
    normals[i * 4 + 1] = Math.round((all.nor[i * 3 + 1] as number) * 127);
    normals[i * 4 + 2] = Math.round((all.nor[i * 3 + 2] as number) * 127);
    tint[i * 4] = Math.round(Math.min(1, all.col[i * 3] as number) * 255);
    tint[i * 4 + 1] = Math.round(Math.min(1, all.col[i * 3 + 1] as number) * 255);
    tint[i * 4 + 2] = Math.round(Math.min(1, all.col[i * 3 + 2] as number) * 255);
    tint[i * 4 + 3] = Math.round(Math.min(1, all.fx[i * 2] as number) * 255);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(all.pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(normals, 4, true));
  g.setAttribute('aMeta', new THREE.BufferAttribute(meta, 4, false));
  g.setAttribute('aTint', new THREE.BufferAttribute(tint, 4, true));
  g.setIndex(new THREE.BufferAttribute(n > 65535 ? all.idx : new Uint16Array(all.idx), 1));
  return g;
}

/**
 * Create an instanced view of a shared rig geometry (shares vertex buffers). `people` holds two
 * floats per instance: the person index and that person's slot in the joint texture.
 */
export function instancedRig(base: THREE.BufferGeometry, people: Float32Array): THREE.InstancedBufferGeometry {
  const g = new THREE.InstancedBufferGeometry();
  g.index = base.index;
  for (const name of ['position', 'normal', 'aMeta', 'aTint'] as const) {
    g.setAttribute(name, base.getAttribute(name));
  }
  g.setAttribute('aPerson', new THREE.InstancedBufferAttribute(people, 2));
  g.instanceCount = people.length / 2;
  return g;
}

/**
 * Concatenate two rig geometries into one buffer set with two index ranges, so one mesh can draw
 * the first range in the colour pass and the second (cheaper) range in the shadow pass.
 */
export function concatRig(a: THREE.BufferGeometry, b: THREE.BufferGeometry): { geometry: THREE.BufferGeometry; first: number; second: number } {
  const out = new THREE.BufferGeometry();
  const count = (g: THREE.BufferGeometry): number => g.getAttribute('position').count;
  const na = count(a);
  const nb = count(b);
  const join = <T extends Float32Array | Int8Array | Uint8Array>(name: string, make: (n: number) => T, size: number): T => {
    const x = a.getAttribute(name).array as T;
    const y = b.getAttribute(name).array as T;
    const arr = make((na + nb) * size);
    arr.set(x, 0);
    arr.set(y, na * size);
    return arr;
  };
  out.setAttribute('position', new THREE.BufferAttribute(join('position', (n) => new Float32Array(n), 3), 3));
  out.setAttribute('normal', new THREE.BufferAttribute(join('normal', (n) => new Int8Array(n), 4), 4, true));
  out.setAttribute('aMeta', new THREE.BufferAttribute(join('aMeta', (n) => new Uint8Array(n), 4), 4, false));
  out.setAttribute('aTint', new THREE.BufferAttribute(join('aTint', (n) => new Uint8Array(n), 4), 4, true));
  const ia = a.index;
  const ib = b.index;
  if (!ia || !ib) throw new Error('Rig geometries must be indexed');
  const idx = na + nb > 65535 ? new Uint32Array(ia.count + ib.count) : new Uint16Array(ia.count + ib.count);
  for (let i = 0; i < ia.count; i++) idx[i] = ia.getX(i);
  for (let i = 0; i < ib.count; i++) idx[ia.count + i] = ib.getX(i) + na;
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  return { geometry: out, first: ia.count, second: ib.count };
}

export const BODY_CAT = Cat.Always;
