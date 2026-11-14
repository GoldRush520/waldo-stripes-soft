/**
 * Moving scenery (boats, trams, ride parts, carts, pets). Each prop key is one instanced geometry;
 * every instance rides a motion record evaluated in the vertex shader, so nothing is updated on the
 * CPU per frame and riders (people referencing the same motion id) stay locked to their vehicle.
 */
import * as THREE from 'three';
import { separateCoplanar } from '../core/coplanar';
import { type Col, type Geo, bounds as geoBounds, selectLod, vertexCount } from '../core/geo';
import { colorOf } from '../core/palette';
import { MOTION_GLSL } from '../crowd/shaderChunks';
import type { CrowdUniforms } from '../crowd/materials';
import type { MotionStore } from '../crowd/stores';
import type { WorldUniforms } from '../render/worldMaterial';

interface Instance {
  readonly motion: number;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly rot: number;
  readonly scale: number;
  readonly tint: readonly [number, number, number];
}

const PARS = /* glsl */ `
${MOTION_GLSL}
attribute vec4 aColor;
attribute float aMask;
attribute vec4 aLocal;
attribute vec4 aTintScale;
attribute float aMotion;
uniform float uSwayTime;
varying vec3 vWorldColor;
mat3 dynR;
vec3 dynT;
vec3 dynamicPosition() {
  motionFrame(int(aMotion + 0.5), dynR, dynT);
  vec3 p = position * aTintScale.w;
  if (aColor.a > 0.0) {
    float ph = uSwayTime * 2.3 + aLocal.x * 0.7 + position.y * 0.6;
    p.x += sin(ph) * 0.085 * aColor.a;
    p.z += cos(ph * 0.83 + 1.1) * 0.06 * aColor.a;
  }
  return dynR * (cry(aLocal.w) * p + aLocal.xyz) + dynT;
}
`;

function patch(material: THREE.Material, uniforms: Record<string, THREE.IUniform>, key: string, lit: boolean): void {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>\n${PARS}`);
    if (lit) {
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <beginnormal_vertex>',
          'vec3 dynPos = dynamicPosition();\nvec3 objectNormal = dynR * (cry(aLocal.w) * normal);\nvWorldColor = mix(aColor.rgb, aTintScale.rgb, aMask);',
        )
        .replace('#include <begin_vertex>', 'vec3 transformed = dynPos;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vWorldColor;')
        .replace('#include <color_fragment>', 'diffuseColor.rgb *= vWorldColor;');
    } else {
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = dynamicPosition();');
    }
  };
  material.customProgramCacheKey = () => key;
}

function packDynamic(g: Geo): THREE.BufferGeometry | null {
  const n = vertexCount(g);
  if (g.idx.length === 0) return null;
  const nor = new Int8Array(n * 4);
  const col = new Uint8Array(n * 4);
  const mask = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    nor[i * 4] = Math.round((g.nor[i * 3] as number) * 127);
    nor[i * 4 + 1] = Math.round((g.nor[i * 3 + 1] as number) * 127);
    nor[i * 4 + 2] = Math.round((g.nor[i * 3 + 2] as number) * 127);
    col[i * 4] = Math.min(255, Math.round((g.col[i * 3] as number) * 255));
    col[i * 4 + 1] = Math.min(255, Math.round((g.col[i * 3 + 1] as number) * 255));
    col[i * 4 + 2] = Math.min(255, Math.round((g.col[i * 3 + 2] as number) * 255));
    col[i * 4 + 3] = Math.min(255, Math.round((g.fx[i * 2 + 1] as number) * 255));
    mask[i] = Math.min(255, Math.round((g.fx[i * 2] as number) * 255));
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(g.pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 4, true));
  out.setAttribute('aColor', new THREE.BufferAttribute(col, 4, true));
  out.setAttribute('aMask', new THREE.BufferAttribute(mask, 1, true));
  out.setIndex(new THREE.BufferAttribute(n > 65535 ? g.idx : new Uint16Array(g.idx), 1));
  return out;
}

export class DynamicProps {
  readonly group = new THREE.Group();
  private readonly byGeo = new Map<Geo, Instance[]>();
  private readonly meshes: { near: THREE.Mesh | null; far: THREE.Mesh | null }[] = [];
  private readonly color: THREE.Material;
  private readonly depth: THREE.Material;
  private readonly occluder: THREE.Material;
  private readonly shared: THREE.BufferGeometry[] = [];
  private far = true;
  private count = 0;

  constructor(world: WorldUniforms, crowd: CrowdUniforms, private readonly motion: MotionStore) {
    this.group.name = 'dynamic-props';
    const uniforms: Record<string, THREE.IUniform> = {
      uMotion: crowd.uMotion,
      uRoute: crowd.uRoute,
      uMoveTime: crowd.uMoveTime,
      uSwayTime: world.uSwayTime,
    };
    this.color = new THREE.MeshLambertMaterial();
    patch(this.color, uniforms, 'dynamic-color', true);
    this.depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
    patch(this.depth, uniforms, 'dynamic-depth', false);
    this.occluder = new THREE.MeshBasicMaterial({ color: 0x000000 });
    patch(this.occluder, uniforms, 'dynamic-occluder', false);
  }

  /** Add an instance of a shared Geo riding `motion`; x/y/z/rot are local to the motion frame. */
  add(geo: Geo, motion: number, x: number, y: number, z: number, rot = 0, scale = 1, tint: Col = 'ivory'): void {
    const list = this.byGeo.get(geo);
    const inst: Instance = { motion, x, y, z, rot, scale, tint: colorOf(tint) };
    if (list) list.push(inst);
    else this.byGeo.set(geo, [inst]);
    this.count++;
  }

  /**
   * One instanced mesh per (geometry, motion region): instances are grouped by the cell of their
   * motion's full-trajectory bounds, so close-ups only submit props that can be on screen.
   */
  build(): void {
    const REGION = 60;
    for (const [geo, list] of this.byGeo) {
      const gb = geoBounds(geo);
      const reach = Math.hypot(
        Math.max(Math.abs(gb.min[0]), Math.abs(gb.max[0])),
        Math.max(Math.abs(gb.min[1]), Math.abs(gb.max[1])),
        Math.max(Math.abs(gb.min[2]), Math.abs(gb.max[2])),
      );
      const near = packDynamic(separateCoplanar(selectLod(geo, 'near')));
      const far = packDynamic(selectLod(geo, 'far'));
      if (near) this.shared.push(near);
      if (far) this.shared.push(far);
      const groups = new Map<string, { items: Instance[]; box: THREE.Box3 }>();
      for (const it of list) {
        const mb = this.motion.boundsOf(it.motion);
        const pad = reach * it.scale + Math.hypot(it.x, it.y, it.z);
        const box = new THREE.Box3(
          new THREE.Vector3(mb.min[0] - pad, mb.min[1] - pad, mb.min[2] - pad),
          new THREE.Vector3(mb.max[0] + pad, mb.max[1] + pad, mb.max[2] + pad),
        );
        const key = `${Math.floor((box.min.x + box.max.x) / 2 / REGION)},${Math.floor((box.min.z + box.max.z) / 2 / REGION)}`;
        const g = groups.get(key);
        if (g) {
          g.items.push(it);
          g.box.union(box);
        } else {
          groups.set(key, { items: [it], box });
        }
      }
      for (const group of groups.values()) {
        const n = group.items.length;
        const local = new Float32Array(n * 4);
        const tint = new Float32Array(n * 4);
        const motion = new Float32Array(n);
        group.items.forEach((it, i) => {
          local.set([it.x, it.y, it.z, it.rot], i * 4);
          tint.set([it.tint[0], it.tint[1], it.tint[2], it.scale], i * 4);
          motion[i] = it.motion;
        });
        const sphere = group.box.getBoundingSphere(new THREE.Sphere());
        const make = (base: THREE.BufferGeometry | null): THREE.Mesh | null => {
          if (!base) return null;
          const g = new THREE.InstancedBufferGeometry();
          g.index = base.index;
          for (const name of ['position', 'normal', 'aColor', 'aMask'] as const) g.setAttribute(name, base.getAttribute(name));
          g.setAttribute('aLocal', new THREE.InstancedBufferAttribute(local, 4));
          g.setAttribute('aTintScale', new THREE.InstancedBufferAttribute(tint, 4));
          g.setAttribute('aMotion', new THREE.InstancedBufferAttribute(motion, 1));
          g.instanceCount = n;
          g.boundingSphere = sphere;
          const mesh = new THREE.Mesh(g, this.color);
          mesh.customDepthMaterial = this.depth;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.matrixAutoUpdate = false;
          this.group.add(mesh);
          return mesh;
        };
        this.meshes.push({ near: make(near), far: make(far) });
      }
    }
    this.byGeo.clear();
    this.applyTier();
  }

  updateTier(ppm: number): void {
    const next = this.far ? ppm <= 8.5 : ppm < 7;
    if (next !== this.far) {
      this.far = next;
      this.applyTier();
    }
  }

  private applyTier(): void {
    for (const m of this.meshes) {
      if (m.near) m.near.visible = !this.far;
      if (m.far) m.far.visible = this.far;
    }
  }

  setPickMode(on: boolean): void {
    for (const m of this.meshes) {
      if (m.near) m.near.material = on ? this.occluder : this.color;
      if (m.far) m.far.material = on ? this.occluder : this.color;
    }
  }

  get instances(): number {
    return this.count;
  }

  dispose(): void {
    for (const m of this.meshes) {
      m.near?.geometry.dispose();
      m.far?.geometry.dispose();
    }
    for (const g of this.shared) g.dispose();
    this.color.dispose();
    this.depth.dispose();
    this.occluder.dispose();
    this.group.clear();
    this.meshes.length = 0;
    this.shared.length = 0;
  }
}
