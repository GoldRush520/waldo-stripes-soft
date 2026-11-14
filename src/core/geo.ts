/**
 * Procedural geometry kit. Every visible asset in the town is assembled from these primitives.
 *
 * A `Geo` is an immutable vertex-coloured indexed mesh. Primitives are created base-centred
 * (resting on y = 0, centred on x/z) so they stack naturally. Transform helpers return new Geos.
 *
 * Per-vertex extras:
 *  - tint mask: 0 = keep the authored colour, 1 = take the per-instance / per-placement tint
 *  - sway: 0..1 amount of wind motion (flags, laundry, foliage, bunting)
 */
import * as THREE from 'three';
import { type ColorName, type RGB, colorOf } from './palette';

export type Col = ColorName | RGB;

export interface Geo {
  readonly pos: Float32Array;
  readonly nor: Float32Array;
  readonly col: Float32Array;
  /** interleaved (tintMask, sway) per vertex */
  readonly fx: Float32Array;
  /** per-vertex detail tier: 0 = always drawn, 1 = near view only (small detail), 2 = far view only (stand-in) */
  readonly lod: Uint8Array;
  readonly idx: Uint32Array;
}

export const LOD_ALWAYS = 0;
export const LOD_NEAR_ONLY = 1;
export const LOD_FAR_ONLY = 2;

export const EMPTY: Geo = {
  pos: new Float32Array(0),
  nor: new Float32Array(0),
  col: new Float32Array(0),
  fx: new Float32Array(0),
  lod: new Uint8Array(0),
  idx: new Uint32Array(0),
};

export function vertexCount(g: Geo): number {
  return g.pos.length / 3;
}

export function triangleCount(g: Geo): number {
  return g.idx.length / 3;
}

/** Convert a THREE geometry into a Geo painted a single colour. `flat` gives faceted shading. */
export function fromThree(src: THREE.BufferGeometry, color: Col, flat = false): Geo {
  let g = src;
  if (flat) {
    g = src.index ? src.toNonIndexed() : src;
    g.computeVertexNormals();
  } else if (!g.getAttribute('normal')) {
    g.computeVertexNormals();
  }
  const p = g.getAttribute('position');
  const n = g.getAttribute('normal');
  const count = p.count;
  const pos = new Float32Array(count * 3);
  const nor = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const c = colorOf(color);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = p.getX(i);
    pos[i * 3 + 1] = p.getY(i);
    pos[i * 3 + 2] = p.getZ(i);
    nor[i * 3] = n.getX(i);
    nor[i * 3 + 1] = n.getY(i);
    nor[i * 3 + 2] = n.getZ(i);
    col[i * 3] = c[0];
    col[i * 3 + 1] = c[1];
    col[i * 3 + 2] = c[2];
  }
  let idx: Uint32Array;
  if (g.index) {
    idx = new Uint32Array(g.index.count);
    for (let i = 0; i < idx.length; i++) idx[i] = g.index.getX(i);
  } else {
    idx = new Uint32Array(count);
    for (let i = 0; i < count; i++) idx[i] = i;
  }
  if (g !== src) g.dispose();
  src.dispose();
  return { pos, nor, col, fx: new Float32Array(count * 2), lod: new Uint8Array(count), idx };
}

/* ------------------------------------------------------------------ primitives */

/** Axis-aligned box resting on y=0. Faceted. */
export function box(w: number, h: number, d: number, color: Col): Geo {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(0, h / 2, 0);
  return fromThree(g, color);
}

/** Rounded box resting on y=0; `r` is the edge radius. Soft crafted look for furniture, cars, hulls. */
export function rbox(w: number, h: number, d: number, r: number, color: Col): Geo {
  const rr = Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4);
  const g = new THREE.BoxGeometry(w, h, d, 3, 3, 3);
  const p = g.getAttribute('position');
  const n = g.getAttribute('normal');
  const hx = w / 2 - rr;
  const hy = h / 2 - rr;
  const hz = d / 2 - rr;
  const snap = (v: number, half: number, inner: number): number => {
    // move the inner subdivision lines out to the start of the rounding
    const third = half / 3;
    if (Math.abs(Math.abs(v) - third) < 1e-5) return Math.sign(v) * inner;
    return v;
  };
  for (let i = 0; i < p.count; i++) {
    const x = snap(p.getX(i), w / 2, hx);
    const y = snap(p.getY(i), h / 2, hy);
    const z = snap(p.getZ(i), d / 2, hz);
    const cx = Math.max(-hx, Math.min(hx, x));
    const cy = Math.max(-hy, Math.min(hy, y));
    const cz = Math.max(-hz, Math.min(hz, z));
    let dx = x - cx;
    let dy = y - cy;
    let dz = z - cz;
    const len = Math.hypot(dx, dy, dz);
    if (len > 1e-6) {
      dx /= len;
      dy /= len;
      dz /= len;
      p.setXYZ(i, cx + dx * rr, cy + dy * rr, cz + dz * rr);
      n.setXYZ(i, dx, dy, dz);
    } else {
      p.setXYZ(i, x, y, z);
    }
  }
  g.translate(0, h / 2, 0);
  return fromThree(g, color);
}

/** Cylinder / tapered cylinder resting on y=0. */
export function cyl(rBottom: number, rTop: number, h: number, color: Col, seg = 10, capped = true): Geo {
  const g = new THREE.CylinderGeometry(rTop, rBottom, h, seg, 1, !capped);
  g.translate(0, h / 2, 0);
  return fromThree(g, color);
}

export function cone(r: number, h: number, color: Col, seg = 10): Geo {
  const g = new THREE.ConeGeometry(r, h, seg, 1);
  g.translate(0, h / 2, 0);
  return fromThree(g, color);
}

/** Sphere centred on the origin (not base-rested: spheres are usually stacked by hand). */
export function sphere(r: number, color: Col, wSeg = 10, hSeg = 7): Geo {
  return fromThree(new THREE.SphereGeometry(r, wSeg, hSeg), color);
}

/** Ellipsoid centred on the origin. */
export function blob(rx: number, ry: number, rz: number, color: Col, wSeg = 10, hSeg = 7): Geo {
  return scale(sphere(1, color, wSeg, hSeg), rx, ry, rz);
}

/** Upper hemisphere resting on y=0. */
export function dome(r: number, color: Col, wSeg = 12, hSeg = 5): Geo {
  return fromThree(new THREE.SphereGeometry(r, wSeg, hSeg, 0, Math.PI * 2, 0, Math.PI / 2), color);
}

/** Vertical capsule resting on y=0, total height h. */
export function capsule(r: number, h: number, color: Col, seg = 8, capSeg = 2): Geo {
  const len = Math.max(0.0001, h - 2 * r);
  const g = new THREE.CapsuleGeometry(r, len, capSeg, seg);
  g.translate(0, h / 2, 0);
  return fromThree(g, color);
}

/** Torus lying flat (axis = y), centred on the origin. */
export function torus(R: number, r: number, color: Col, tubeSeg = 6, ringSeg = 18): Geo {
  const g = new THREE.TorusGeometry(R, r, tubeSeg, ringSeg);
  g.rotateX(Math.PI / 2);
  return fromThree(g, color);
}

/** Flat disc facing up at y=0. */
export function disc(r: number, color: Col, seg = 16): Geo {
  const g = new THREE.CircleGeometry(r, seg);
  g.rotateX(-Math.PI / 2);
  return fromThree(g, color);
}

/** Horizontal rectangle facing up at y=0. */
export function quad(w: number, d: number, color: Col): Geo {
  const g = new THREE.PlaneGeometry(w, d);
  g.rotateX(-Math.PI / 2);
  return fromThree(g, color);
}

/** Gable (triangular prism) roof: ridge runs along z, eaves at y=0, apex at y=h. */
export function gable(w: number, h: number, d: number, color: Col): Geo {
  const shape = new THREE.Shape([
    new THREE.Vector2(-w / 2, 0),
    new THREE.Vector2(w / 2, 0),
    new THREE.Vector2(0, h),
  ]);
  const g = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false });
  g.translate(0, 0, -d / 2);
  return fromThree(g, color);
}

/** Four-sided pyramid / hip roof resting on y=0. */
export function pyramid(w: number, h: number, d: number, color: Col): Geo {
  const g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
  g.rotateY(Math.PI / 4);
  g.scale(w, h, d);
  g.translate(0, h / 2, 0);
  return fromThree(g, color, true);
}

/** Vertical extrusion of a ground-plan polygon ([x,z] points) from y=0 to y=h. */
export function prism(points: ReadonlyArray<readonly [number, number]>, h: number, color: Col): Geo {
  const shape = new THREE.Shape(points.map(([x, z]) => new THREE.Vector2(x, -z)));
  const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  return fromThree(g, color);
}

/** Extrusion of a side-profile polygon ([x,y] points) along z, centred on z=0. Arches, signs, hull ribs. */
export function profile(points: ReadonlyArray<readonly [number, number]>, depth: number, color: Col): Geo {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  g.translate(0, 0, -depth / 2);
  return fromThree(g, color);
}

/** Surface of revolution about y from [radius, y] points (bottom -> top). Vases, domes, bollards. */
export function lathe(points: ReadonlyArray<readonly [number, number]>, color: Col, seg = 12): Geo {
  const g = new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(Math.max(0.0001, r), y)), seg);
  return fromThree(g, color);
}

/** Tube swept along a 3D polyline. Ropes, rails, pipes, hoses, handles. */
export function tube(
  path: ReadonlyArray<readonly [number, number, number]>,
  r: number,
  color: Col,
  seg = 5,
  smooth = false,
): Geo {
  const pts = path.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  if (pts.length === 2 || !smooth) {
    const parts: Geo[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i] as THREE.Vector3;
      const b = pts[i + 1] as THREE.Vector3;
      const len = a.distanceTo(b);
      if (len < 1e-5) continue;
      const g = new THREE.CylinderGeometry(r, r, len, seg, 1, false);
      g.translate(0, len / 2, 0);
      const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        b.clone().sub(a).normalize(),
      );
      g.applyQuaternion(q);
      g.translate(a.x, a.y, a.z);
      parts.push(fromThree(g, color));
    }
    return merge(parts);
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  return fromThree(new THREE.TubeGeometry(curve, Math.max(4, pts.length * 4), r, seg, false), color);
}

/** Straight bar between two points (thin square beam). Cheaper than `tube` for struts and legs. */
export function beam(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  thickness: number,
  color: Col,
): Geo {
  const va = new THREE.Vector3(a[0], a[1], a[2]);
  const vb = new THREE.Vector3(b[0], b[1], b[2]);
  const len = va.distanceTo(vb);
  const g = new THREE.BoxGeometry(thickness, len, thickness);
  g.translate(0, len / 2, 0);
  g.applyQuaternion(
    new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize()),
  );
  g.translate(va.x, va.y, va.z);
  return fromThree(g, color);
}

/* ------------------------------------------------------------------ transforms */

export function xform(g: Geo, m: THREE.Matrix4): Geo {
  const n = vertexCount(g);
  const pos = new Float32Array(g.pos.length);
  const nor = new Float32Array(g.nor.length);
  const e = m.elements;
  const nm = new THREE.Matrix3().getNormalMatrix(m).elements;
  for (let i = 0; i < n; i++) {
    const x = g.pos[i * 3] as number;
    const y = g.pos[i * 3 + 1] as number;
    const z = g.pos[i * 3 + 2] as number;
    pos[i * 3] = (e[0] as number) * x + (e[4] as number) * y + (e[8] as number) * z + (e[12] as number);
    pos[i * 3 + 1] = (e[1] as number) * x + (e[5] as number) * y + (e[9] as number) * z + (e[13] as number);
    pos[i * 3 + 2] = (e[2] as number) * x + (e[6] as number) * y + (e[10] as number) * z + (e[14] as number);
    const a = g.nor[i * 3] as number;
    const b = g.nor[i * 3 + 1] as number;
    const c = g.nor[i * 3 + 2] as number;
    let nx = (nm[0] as number) * a + (nm[3] as number) * b + (nm[6] as number) * c;
    let ny = (nm[1] as number) * a + (nm[4] as number) * b + (nm[7] as number) * c;
    let nz = (nm[2] as number) * a + (nm[5] as number) * b + (nm[8] as number) * c;
    const len = Math.hypot(nx, ny, nz) || 1;
    nx /= len;
    ny /= len;
    nz /= len;
    nor[i * 3] = nx;
    nor[i * 3 + 1] = ny;
    nor[i * 3 + 2] = nz;
  }
  let idx = g.idx;
  if (m.determinant() < 0) {
    idx = new Uint32Array(g.idx.length);
    for (let i = 0; i < idx.length; i += 3) {
      idx[i] = g.idx[i] as number;
      idx[i + 1] = g.idx[i + 2] as number;
      idx[i + 2] = g.idx[i + 1] as number;
    }
  }
  return { pos, nor, col: g.col, fx: g.fx, lod: g.lod, idx };
}

const M = new THREE.Matrix4();

export function translate(g: Geo, x: number, y: number, z: number): Geo {
  const pos = new Float32Array(g.pos.length);
  for (let i = 0; i < pos.length; i += 3) {
    pos[i] = (g.pos[i] as number) + x;
    pos[i + 1] = (g.pos[i + 1] as number) + y;
    pos[i + 2] = (g.pos[i + 2] as number) + z;
  }
  return { ...g, pos };
}

export function rotateY(g: Geo, angle: number): Geo {
  return xform(g, M.clone().makeRotationY(angle));
}

export function rotateX(g: Geo, angle: number): Geo {
  return xform(g, M.clone().makeRotationX(angle));
}

export function rotateZ(g: Geo, angle: number): Geo {
  return xform(g, M.clone().makeRotationZ(angle));
}

export function scale(g: Geo, sx: number, sy = sx, sz = sx): Geo {
  return xform(g, M.clone().makeScale(sx, sy, sz));
}

/** Place a Geo: scale, then rotate about y, then translate. The common authoring transform. */
export function place(g: Geo, x: number, y: number, z: number, rotY = 0, s = 1): Geo {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotY),
    new THREE.Vector3(s, s, s),
  );
  return xform(g, m);
}

/** Repaint every vertex. */
export function paint(g: Geo, color: Col): Geo {
  const c = colorOf(color);
  const col = new Float32Array(g.col.length);
  for (let i = 0; i < col.length; i += 3) {
    col[i] = c[0];
    col[i + 1] = c[1];
    col[i + 2] = c[2];
  }
  return { ...g, col };
}

/** Mark the whole Geo as tintable (takes the placement tint). */
export function tintable(g: Geo, mask = 1): Geo {
  const fx = new Float32Array(g.fx);
  for (let i = 0; i < fx.length; i += 2) fx[i] = mask;
  return { ...g, fx };
}

/** Set wind sway. Pass a number, or a function of the vertex position for anchored cloth. */
export function sway(g: Geo, amount: number | ((x: number, y: number, z: number) => number)): Geo {
  const fx = new Float32Array(g.fx);
  const n = vertexCount(g);
  for (let i = 0; i < n; i++) {
    fx[i * 2 + 1] =
      typeof amount === 'number'
        ? amount
        : amount(g.pos[i * 3] as number, g.pos[i * 3 + 1] as number, g.pos[i * 3 + 2] as number);
  }
  return { ...g, fx };
}

/** Vertical brightness gradient (cheap baked contact shading): multiply colour from bottom to top. */
export function shadeY(g: Geo, bottom = 0.8, top = 1): Geo {
  const n = vertexCount(g);
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < n; i++) {
    const y = g.pos[i * 3 + 1] as number;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const span = maxY - minY || 1;
  const col = new Float32Array(g.col.length);
  for (let i = 0; i < n; i++) {
    const t = ((g.pos[i * 3 + 1] as number) - minY) / span;
    const k = bottom + (top - bottom) * t;
    col[i * 3] = (g.col[i * 3] as number) * k;
    col[i * 3 + 1] = (g.col[i * 3 + 1] as number) * k;
    col[i * 3 + 2] = (g.col[i * 3 + 2] as number) * k;
  }
  return { ...g, col };
}

/** Bake a tint colour into the tint-masked vertices (used when merging static geometry). */
export function bakeTint(g: Geo, tint: Col): Geo {
  const c = colorOf(tint);
  const n = vertexCount(g);
  const col = new Float32Array(g.col.length);
  const fx = new Float32Array(g.fx);
  for (let i = 0; i < n; i++) {
    const m = g.fx[i * 2] as number;
    col[i * 3] = (g.col[i * 3] as number) * (1 - m) + c[0] * m;
    col[i * 3 + 1] = (g.col[i * 3 + 1] as number) * (1 - m) + c[1] * m;
    col[i * 3 + 2] = (g.col[i * 3 + 2] as number) * (1 - m) + c[2] * m;
    fx[i * 2] = 0;
  }
  return { ...g, col, fx };
}

/**
 * Mark a Geo as small detail that is only drawn in near views (handles, hinges, mullions, individual
 * fruit, lettering blocks, thin rails). Anything under ~15 cm that does not shape the silhouette
 * belongs here: distant tiers skip it entirely, which is the main lever keeping the overview fast.
 */
export function detail(g: Geo): Geo {
  return { ...g, lod: new Uint8Array(g.lod.length).fill(LOD_NEAR_ONLY) };
}

/**
 * Mark a Geo as a far-view stand-in (e.g. one low-poly mound replacing a heap of 40 detailed
 * oranges). It is drawn only in distant tiers, where `detail()` geometry is skipped.
 */
export function farOnly(g: Geo): Geo {
  return { ...g, lod: new Uint8Array(g.lod.length).fill(LOD_FAR_ONLY) };
}

/** Keep only the triangles belonging to a view tier. `near` drops far-only stand-ins and vice versa. */
export function selectLod(g: Geo, tier: 'near' | 'far'): Geo {
  const drop = tier === 'near' ? LOD_FAR_ONLY : LOD_NEAR_ONLY;
  const n = vertexCount(g);
  let any = false;
  for (let i = 0; i < n; i++) {
    if (g.lod[i] === drop) {
      any = true;
      break;
    }
  }
  if (!any) return g;
  const remap = new Int32Array(n).fill(-1);
  let kept = 0;
  const keepIdx: number[] = [];
  for (let i = 0; i < g.idx.length; i += 3) {
    const a = g.idx[i] as number;
    const b = g.idx[i + 1] as number;
    const c = g.idx[i + 2] as number;
    if (g.lod[a] === drop || g.lod[b] === drop || g.lod[c] === drop) continue;
    for (const v of [a, b, c]) {
      if (remap[v] === -1) remap[v] = kept++;
      keepIdx.push(remap[v] as number);
    }
  }
  const pos = new Float32Array(kept * 3);
  const nor = new Float32Array(kept * 3);
  const col = new Float32Array(kept * 3);
  const fx = new Float32Array(kept * 2);
  const lod = new Uint8Array(kept);
  for (let i = 0; i < n; i++) {
    const j = remap[i] as number;
    if (j < 0) continue;
    for (let k = 0; k < 3; k++) {
      pos[j * 3 + k] = g.pos[i * 3 + k] as number;
      nor[j * 3 + k] = g.nor[i * 3 + k] as number;
      col[j * 3 + k] = g.col[i * 3 + k] as number;
    }
    fx[j * 2] = g.fx[i * 2] as number;
    fx[j * 2 + 1] = g.fx[i * 2 + 1] as number;
    lod[j] = g.lod[i] as number;
  }
  return { pos, nor, col, fx, lod, idx: new Uint32Array(keepIdx) };
}

type GeoList = ReadonlyArray<Geo | GeoList>;

function flatten(list: GeoList, out: Geo[]): Geo[] {
  for (const item of list) {
    if (Array.isArray(item)) flatten(item as GeoList, out);
    else out.push(item as Geo);
  }
  return out;
}

/** Concatenate any number of Geos (nested arrays allowed) into one. Build-time only (it copies). */
export function merge(...items: GeoList): Geo {
  const parts = flatten(items, []);
  if (parts.length === 0) return EMPTY;
  if (parts.length === 1) return parts[0] as Geo;
  let v = 0;
  let t = 0;
  for (const p of parts) {
    v += p.pos.length / 3;
    t += p.idx.length;
  }
  const pos = new Float32Array(v * 3);
  const nor = new Float32Array(v * 3);
  const col = new Float32Array(v * 3);
  const fx = new Float32Array(v * 2);
  const lod = new Uint8Array(v);
  const idx = new Uint32Array(t);
  let vo = 0;
  let io = 0;
  for (const p of parts) {
    pos.set(p.pos, vo * 3);
    nor.set(p.nor, vo * 3);
    col.set(p.col, vo * 3);
    fx.set(p.fx, vo * 2);
    lod.set(p.lod, vo);
    for (let i = 0; i < p.idx.length; i++) idx[io + i] = (p.idx[i] as number) + vo;
    vo += p.pos.length / 3;
    io += p.idx.length;
  }
  return { pos, nor, col, fx, lod, idx };
}

/** Axis-aligned bounds of a Geo. */
export function bounds(g: Geo): { min: [number, number, number]; max: [number, number, number] } {
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < g.pos.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      const v = g.pos[i + k] as number;
      if (v < (min[k] as number)) min[k] = v;
      if (v > (max[k] as number)) max[k] = v;
    }
  }
  return { min, max };
}

export function toBufferGeometry(g: Geo): THREE.BufferGeometry {
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(g.pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(g.nor, 3));
  out.setAttribute('color', new THREE.BufferAttribute(g.col, 3));
  out.setAttribute('aFx', new THREE.BufferAttribute(g.fx, 2));
  const n = vertexCount(g);
  out.setIndex(new THREE.BufferAttribute(n > 65535 ? g.idx : new Uint16Array(g.idx), 1));
  out.computeBoundingSphere();
  out.computeBoundingBox();
  return out;
}
