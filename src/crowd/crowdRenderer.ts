/**
 * Instanced crowd renderer.
 *
 * - Visibility is resolved on the CPU when the view changes (and at a low cadence for walkers):
 *   `cull()` rewrites the instance lists so exactly the people who can appear on screen are
 *   submitted — one draw for all bodies, one small draw per accessory type actually worn.
 * - Posing is resolved on the GPU once per visible person per frame: a small fragment pass writes
 *   every part's world matrix into a float texture ("joint texture"), and each vertex of the
 *   colour, shadow and picking passes just reads three texels. (Without float render targets the
 *   same maths runs per vertex.)
 * - Shadows are drawn from the low body through a second index range of the same mesh.
 * Nothing allocates per frame.
 */
import * as THREE from 'three';
import { bodyHigh, bodyLow } from './body';
import type { CrowdMaterials, CrowdUniforms } from './materials';
import { type RigOption, buildRigGeometry, concatRig, instancedRig } from './rig';
import { JOINT_PASS_FRAGMENT, JOINT_PASS_VERTEX, JOINT_SLOTS_PER_ROW, JOINT_TEX_WIDTH } from './shaderChunks';
import { Cat } from './skeleton';
import type { MotionStore, PersonStore } from './stores';

/** 0 = far (low body, blob shadows only), 1 = mid (low body + cast shadows), 2 = near (high body). */
export type CrowdTier = 0 | 1 | 2;

interface TierMesh {
  readonly mesh: THREE.Mesh;
  readonly near: boolean;
  /** false for tiny accessories whose shadows are imperceptible */
  readonly casts: boolean;
}

interface InstanceList {
  readonly attr: THREE.InstancedBufferAttribute;
  /** (person, slot) pairs */
  readonly ids: Float32Array;
  readonly geometries: THREE.InstancedBufferGeometry[];
  /** people eligible for this list (null = everyone, for bodies) */
  readonly members: Int32Array | null;
}

export interface CrowdStats {
  readonly people: number;
  readonly visiblePeople: number;
  readonly optionTypes: number;
  readonly visibleOptionTypes: number;
  readonly bodyTriangles: { readonly near: number; readonly far: number };
  readonly jointTexture: boolean;
}

/** pixels per metre thresholds with hysteresis: [enter, leave] */
const MID_PPM: readonly [number, number] = [8.5, 7];
const NEAR_PPM: readonly [number, number] = [24, 20];
const EVERYWHERE = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1e5);
const PERSON_RADIUS = 1.6;
/** extra metres kept around route followers: fastest mover (≈3.2 m/s) × the re-cull interval, plus slack */
const MOVER_PAD = 2.5;
/** seconds between re-culls of moving people (static people are only culled when the view changes) */
export const MOVER_CULL_INTERVAL = 0.5;
/** accessory categories whose shadows are too small to matter at game scale */
const NO_SHADOW_CATS: ReadonlySet<number> = new Set([Cat.Hair, Cat.Hat, Cat.Face, Cat.Beard, Cat.Neck]);

/** The per-frame pass that writes every visible person's part matrices into a float texture. */
class JointPass {
  readonly target: THREE.WebGLRenderTarget;
  readonly slotMap: THREE.DataTexture;
  private readonly slotData: Float32Array;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly material: THREE.RawShaderMaterial;
  private readonly quad: THREE.Mesh;
  private rows = 1;

  constructor(capacity: number, uniforms: CrowdUniforms) {
    const height = Math.max(1, Math.ceil(capacity / JOINT_SLOTS_PER_ROW));
    this.target = new THREE.WebGLRenderTarget(JOINT_TEX_WIDTH, height, {
      type: THREE.FloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false,
    });
    this.target.scissorTest = true;
    this.slotData = new Float32Array(JOINT_SLOTS_PER_ROW * height * 4);
    this.slotMap = new THREE.DataTexture(this.slotData, JOINT_SLOTS_PER_ROW, height, THREE.RGBAFormat, THREE.FloatType);
    this.slotMap.minFilter = THREE.NearestFilter;
    this.slotMap.magFilter = THREE.NearestFilter;
    this.slotMap.needsUpdate = true;
    this.material = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      uniforms: uniforms as unknown as Record<string, THREE.IUniform>,
      vertexShader: JOINT_PASS_VERTEX,
      fragmentShader: JOINT_PASS_FRAGMENT,
      depthTest: false,
      depthWrite: false,
    });
    const tri = new THREE.BufferGeometry();
    tri.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
    this.quad = new THREE.Mesh(tri, this.material);
    this.quad.frustumCulled = false;
    this.scene.add(this.quad);
  }

  /** Record which person occupies each slot (called by cull). */
  setSlots(people: Int32Array, count: number): void {
    for (let s = 0; s < count; s++) this.slotData[s * 4] = people[s] as number;
    this.rows = Math.max(1, Math.ceil(count / JOINT_SLOTS_PER_ROW));
    this.slotMap.needsUpdate = true;
  }

  render(renderer: THREE.WebGLRenderer): void {
    const previous = renderer.getRenderTarget();
    this.target.scissor.set(0, 0, JOINT_TEX_WIDTH, this.rows);
    this.target.viewport.set(0, 0, JOINT_TEX_WIDTH, this.target.height);
    renderer.setRenderTarget(this.target);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(previous);
  }

  dispose(): void {
    this.target.dispose();
    this.slotMap.dispose();
    this.material.dispose();
    this.quad.geometry.dispose();
  }
}

export class CrowdRenderer {
  readonly group = new THREE.Group();
  private readonly tiered: TierMesh[] = [];
  private readonly lists: InstanceList[] = [];
  private readonly optionLists: InstanceList[] = [];
  private blob: THREE.Mesh | null = null;
  private readonly shared: THREE.BufferGeometry[] = [];
  private readonly views: THREE.BufferGeometry[] = [];
  private readonly optionGeo = new Map<string, { near: THREE.BufferGeometry | null; far: THREE.BufferGeometry | null }>();
  private bodyNear: THREE.BufferGeometry | null = null;
  private tier: CrowdTier = 0;
  private bodyTris = { near: 0, far: 0 };
  private visible = new Uint8Array(0);
  private slotOf = new Int32Array(0);
  private slotPeople = new Int32Array(0);
  private visibleCount = 0;
  private visibleOptions = 0;
  private readonly matrix = new THREE.Matrix4();
  private readonly routePoint = new Float32Array(3);
  private joints: JointPass | null = null;
  private picking = false;
  /** whether people are drawn into the shadow map (contact blobs are always drawn) */
  castShadows = true;

  constructor(
    private readonly people: PersonStore,
    private readonly motion: MotionStore,
    private readonly optionDefs: ReadonlyMap<string, RigOption>,
    private readonly materials: CrowdMaterials,
    private readonly uniforms: CrowdUniforms,
    private readonly useJointTexture: boolean,
  ) {
    this.group.name = 'crowd';
  }

  build(): void {
    const near = buildRigGeometry(bodyHigh(), Cat.Always, 'near');
    const far = buildRigGeometry(bodyLow(), Cat.Always, 'far');
    if (!near || !far) throw new Error('Body geometry is empty');
    this.bodyNear = near;
    this.bodyTris = { near: (near.index?.count ?? 0) / 3, far: (far.index?.count ?? 0) / 3 };
    /* one buffer set, two index ranges: detailed body for colour, low body for the shadow pass */
    const combined = concatRig(near, far);
    this.shared.push(near, far, combined.geometry);
    const count = this.people.count;
    this.visible = new Uint8Array(count);
    this.slotOf = new Int32Array(count);
    this.slotPeople = new Int32Array(count);
    if (this.useJointTexture) {
      this.joints = new JointPass(count, this.uniforms);
      this.uniforms.uJoints.value = this.joints.target.texture;
      this.uniforms.uSlotMap.value = this.joints.slotMap;
    }

    const bodies = this.list(count, null);
    const bodyMesh = this.mesh(combined.geometry, bodies, true, true);
    const bodyGeo = bodyMesh.geometry as THREE.InstancedBufferGeometry;
    bodyGeo.setDrawRange(0, combined.first);
    bodyMesh.onBeforeShadow = () => bodyGeo.setDrawRange(combined.first, combined.second);
    bodyMesh.onAfterShadow = () => bodyGeo.setDrawRange(0, combined.first);
    this.mesh(far, bodies, false, true);

    const blobGeo = new THREE.PlaneGeometry(1, 1);
    blobGeo.rotateX(-Math.PI / 2);
    this.shared.push(blobGeo);
    const bg = new THREE.InstancedBufferGeometry();
    bg.index = blobGeo.index;
    bg.setAttribute('position', blobGeo.getAttribute('position'));
    bg.setAttribute('aPerson', bodies.attr);
    bg.boundingSphere = EVERYWHERE;
    bg.instanceCount = 0;
    bodies.geometries.push(bg);
    this.views.push(bg);
    this.blob = new THREE.Mesh(bg, this.materials.blob);
    this.blob.renderOrder = 2;
    this.blob.frustumCulled = false;
    this.blob.matrixAutoUpdate = false;
    this.group.add(this.blob);

    const wearers = new Map<string, number[]>();
    const records = this.people.all();
    for (let i = 0; i < records.length; i++) {
      for (const opt of records[i]?.options ?? []) {
        const w = wearers.get(opt);
        if (w) w.push(i);
        else wearers.set(opt, [i]);
      }
    }
    for (const [key, members] of wearers) {
      const def = this.optionDefs.get(key);
      if (!def) throw new Error(`Unknown crowd option: ${key}`);
      const geo = this.optionGeometry(def);
      const list = this.list(members.length, new Int32Array(members));
      this.optionLists.push(list);
      const casts = !NO_SHADOW_CATS.has(def.cat);
      if (geo.near) this.mesh(geo.near, list, true, casts);
      if (geo.far) this.mesh(geo.far, list, false, casts);
    }
    this.applyTier();
  }

  private list(capacity: number, members: Int32Array | null): InstanceList {
    const ids = new Float32Array(Math.max(1, capacity) * 2);
    const attr = new THREE.InstancedBufferAttribute(ids, 2);
    attr.setUsage(THREE.DynamicDrawUsage);
    const list: InstanceList = { attr, ids, geometries: [], members };
    this.lists.push(list);
    return list;
  }

  private mesh(base: THREE.BufferGeometry, list: InstanceList, near: boolean, casts: boolean): THREE.Mesh {
    const g = instancedRig(base, list.ids);
    g.setAttribute('aPerson', list.attr);
    g.instanceCount = 0;
    g.boundingSphere = EVERYWHERE;
    list.geometries.push(g);
    this.views.push(g);
    const mesh = new THREE.Mesh(g, this.materials.color);
    mesh.customDepthMaterial = this.materials.depth;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.matrixAutoUpdate = false;
    this.group.add(mesh);
    this.tiered.push({ mesh, near, casts });
    return mesh;
  }

  private optionGeometry(def: RigOption): { near: THREE.BufferGeometry | null; far: THREE.BufferGeometry | null } {
    let geo = this.optionGeo.get(def.key);
    if (!geo) {
      geo = {
        near: buildRigGeometry(def.pieces, def.cat, 'near'),
        far: def.nearOnly ? null : buildRigGeometry(def.pieces, def.cat, 'far'),
      };
      if (geo.near) this.shared.push(geo.near);
      if (geo.far) this.shared.push(geo.far);
      this.optionGeo.set(def.key, geo);
    }
    return geo;
  }

  /**
   * Resolve who can be on screen for this camera and rewrite the instance lists. Call when the
   * view or a person's position changes, and at a low cadence for movers — not per frame.
   * `margin` (metres) keeps people just outside the frame whose shadows or props reach into it.
   */
  cull(camera: THREE.Camera, moveTime = 0, margin = 3): number {
    const e = this.matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).elements;
    const sx = Math.hypot(e[0] as number, e[4] as number, e[8] as number);
    const sy = Math.hypot(e[1] as number, e[5] as number, e[9] as number);
    const records = this.people.all();
    const visible = this.visible;
    const slotOf = this.slotOf;
    const slotPeople = this.slotPeople;
    const at = this.routePoint;
    let count = 0;
    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      visible[i] = 0;
      if (!r || r.scale < 0.01) continue;
      let x = r.x;
      let y = r.y + 0.9;
      let z = r.z;
      let radius = PERSON_RADIUS + margin;
      if (r.motion >= 0) {
        if (this.motion.routePosition(r.motion, moveTime, at)) {
          /* walkers and riders: where they actually are now, padded for travel until the next cull */
          x = at[0] as number;
          y = (at[1] as number) + r.y + 0.9;
          z = at[2] as number;
          radius += MOVER_PAD + Math.hypot(r.x, r.z);
        } else {
          const b = this.motion.boundsOf(r.motion);
          const hx = (b.max[0] - b.min[0]) / 2;
          const hy = (b.max[1] - b.min[1]) / 2;
          const hz = (b.max[2] - b.min[2]) / 2;
          radius += Math.hypot(hx, hy, hz) + Math.hypot(r.x, r.z);
          x = (b.min[0] + b.max[0]) / 2;
          y = (b.min[1] + b.max[1]) / 2 + r.y + 0.9;
          z = (b.min[2] + b.max[2]) / 2;
        }
      }
      const w = (e[3] as number) * x + (e[7] as number) * y + (e[11] as number) * z + (e[15] as number) || 1;
      const nx = ((e[0] as number) * x + (e[4] as number) * y + (e[8] as number) * z + (e[12] as number)) / w;
      const ny = ((e[1] as number) * x + (e[5] as number) * y + (e[9] as number) * z + (e[13] as number)) / w;
      if (Math.abs(nx) > 1 + (radius * sx) / w || Math.abs(ny) > 1 + (radius * sy) / w) continue;
      visible[i] = 1;
      slotOf[i] = count;
      slotPeople[count] = i;
      count++;
    }
    this.visibleCount = count;
    this.visibleOptions = 0;
    this.joints?.setSlots(slotPeople, count);
    for (const list of this.lists) {
      let n = 0;
      if (list.members) {
        for (let k = 0; k < list.members.length; k++) {
          const id = list.members[k] as number;
          if (!visible[id]) continue;
          list.ids[n * 2] = id;
          list.ids[n * 2 + 1] = slotOf[id] as number;
          n++;
        }
        if (n > 0) this.visibleOptions++;
      } else {
        for (let s = 0; s < count; s++) {
          list.ids[s * 2] = slotPeople[s] as number;
          list.ids[s * 2 + 1] = s;
        }
        n = count;
      }
      list.attr.clearUpdateRanges();
      if (n > 0) list.attr.addUpdateRange(0, n * 2);
      list.attr.needsUpdate = true;
      for (const g of list.geometries) g.instanceCount = n;
    }
    this.applyTier();
    return count;
  }

  /**
   * Write this frame's joint matrices for everyone currently visible. Call once per frame after
   * the clocks advance (and after a cull), before anything draws the crowd.
   */
  updateJoints(renderer: THREE.WebGLRenderer): void {
    if (this.joints && this.visibleCount > 0) this.joints.render(renderer);
  }

  /**
   * A reusable single-person body mesh drawn with the picking material, in its own scene: rendering
   * it alone gives the person's unoccluded pixel footprint for visibility checks. The person must
   * be in the current visible set (cull first). `dispose()` releases its instance buffer.
   */
  createProbe(): { scene: THREE.Scene; set(person: number): void; dispose(): void } {
    if (!this.bodyNear) throw new Error('Crowd not built');
    const ids = new Float32Array(2);
    const g = instancedRig(this.bodyNear, ids);
    g.boundingSphere = EVERYWHERE;
    const attr = g.getAttribute('aPerson') as THREE.InstancedBufferAttribute;
    const mesh = new THREE.Mesh(g, this.materials.pick);
    mesh.frustumCulled = false;
    mesh.matrixAutoUpdate = false;
    const scene = new THREE.Scene();
    scene.add(mesh);
    const slotOf = this.slotOf;
    this.views.push(g);
    return {
      scene,
      set(person: number): void {
        ids[0] = person;
        ids[1] = slotOf[person] ?? 0;
        attr.needsUpdate = true;
      },
      dispose(): void {
        scene.remove(mesh);
      },
    };
  }

  /** Choose the detail tier from projected pixels-per-metre (hysteresis avoids flicker). */
  updateTier(ppm: number): void {
    let next: CrowdTier = this.tier;
    for (let pass = 0; pass < 2; pass++) {
      if (next === 0 && ppm > MID_PPM[0]) next = 1;
      else if (next === 1 && ppm < MID_PPM[1]) next = 0;
      else if (next === 1 && ppm > NEAR_PPM[0]) next = 2;
      else if (next === 2 && ppm < NEAR_PPM[1]) next = 1;
    }
    if (next !== this.tier) {
      this.tier = next;
      this.applyTier();
    }
  }

  get currentTier(): CrowdTier {
    return this.tier;
  }

  setCastShadows(on: boolean): void {
    this.castShadows = on;
    this.applyTier();
  }

  private applyTier(): void {
    const useNear = this.tier === 2;
    const cast = this.tier >= 1 && this.castShadows;
    for (const t of this.tiered) {
      const g = t.mesh.geometry as THREE.InstancedBufferGeometry;
      t.mesh.visible = t.near === useNear && g.instanceCount > 0;
      t.mesh.castShadow = cast && t.casts;
    }
    if (this.blob) this.blob.visible = this.visibleCount > 0 && !this.picking;
  }

  /** Swap every crowd mesh to the picking material (and back). Blobs are hidden while picking. */
  setPickMode(on: boolean): void {
    this.picking = on;
    for (const t of this.tiered) t.mesh.material = on ? this.materials.pick : this.materials.color;
    if (this.blob) this.blob.visible = !on && this.visibleCount > 0;
  }

  stats(): CrowdStats {
    return {
      people: this.people.count,
      visiblePeople: this.visibleCount,
      optionTypes: this.optionLists.length,
      visibleOptionTypes: this.visibleOptions,
      bodyTriangles: this.bodyTris,
      jointTexture: this.joints !== null,
    };
  }

  /**
   * Disposes every instanced view (including probes), the joint pass and the shared rig
   * geometries, all of which this renderer owns. Materials belong to the caller.
   */
  dispose(): void {
    for (const g of this.views) g.dispose();
    for (const g of this.shared) g.dispose();
    this.joints?.dispose();
    this.joints = null;
    this.uniforms.uJoints.value = null;
    this.uniforms.uSlotMap.value = null;
    this.tiered.length = 0;
    this.lists.length = 0;
    this.optionLists.length = 0;
    this.views.length = 0;
    this.shared.length = 0;
    this.optionGeo.clear();
    this.blob = null;
    this.group.clear();
  }
}
