/**
 * Coplanar-face separation.
 *
 * Assets are assembled from primitives, and parts are often authored flush: a trim board on a
 * wall, a panel on a cart side, a line on a court. Two faces that lie in exactly the same plane and
 * face the same way z-fight — the depth buffer cannot order them and the winner flickers while the
 * camera pans. `separateCoplanar` finds such faces inside one mesh and moves the smaller one a
 * millimetre out along its normal (nested details stack: wall, panel, label). The shift is far
 * below what can be seen at game scale; only the flicker disappears.
 */
import type { Geo } from './geo';

/**
 * Distance a fighting face moves along its normal per nesting level, in metres. Deliberately not a
 * multiple of the whole-millimetre offsets given to placements (world/depthSeparation.ts), so the
 * two kinds of separation cannot cancel each other out.
 */
export const SEPARATION_STEP = 0.0006;
/** faces closer than this along their normal are treated as the same plane */
const PLANE_TOL = 0.0004;
/** overlaps narrower than this are ignored (shared edges, abutting parts) */
const INSET = 0.008;
/** triangles smaller than this (m²) are too small to show a fight */
const MIN_AREA = 1e-4;
/** normal quantisation used to group parallel triangles */
const NORMAL_STEPS = 500;
const MAX_LEVEL = 12;
/** triangle indices share a sort key with the quantised normal; larger meshes are left as they are */
const MAX_TRIANGLES = 2 ** 21;

interface Face {
  readonly tris: number[];
  minU: number;
  maxU: number;
  minW: number;
  maxW: number;
  area: number;
  level: number;
  readonly over: number[];
}

/** 2D overlap of triangles a and b (6 numbers each: u0,w0,u1,w1,u2,w2), shrunk by INSET. */
function trianglesOverlap(uv: Float64Array, a: number, b: number): boolean {
  for (let pass = 0; pass < 2; pass++) {
    const p = pass === 0 ? a : b;
    const q = pass === 0 ? b : a;
    for (let i = 0; i < 3; i++) {
      const j = (i + 1) % 3;
      const ex = (uv[p + j * 2 + 1] as number) - (uv[p + i * 2 + 1] as number);
      const ey = (uv[p + i * 2] as number) - (uv[p + j * 2] as number);
      const el = Math.sqrt(ex * ex + ey * ey) || 1;
      let minP = Infinity;
      let maxP = -Infinity;
      let minQ = Infinity;
      let maxQ = -Infinity;
      for (let k = 0; k < 3; k++) {
        const dp = ((uv[p + k * 2] as number) * ex + (uv[p + k * 2 + 1] as number) * ey) / el;
        if (dp < minP) minP = dp;
        if (dp > maxP) maxP = dp;
        const dq = ((uv[q + k * 2] as number) * ex + (uv[q + k * 2 + 1] as number) * ey) / el;
        if (dq < minQ) minQ = dq;
        if (dq > maxQ) maxQ = dq;
      }
      if (maxP < minQ + INSET || maxQ < minP + INSET) return false;
    }
  }
  return true;
}

function find(parent: Int32Array, i: number): number {
  let r = i;
  while (parent[r] !== r) r = parent[r] as number;
  let c = i;
  while (parent[c] !== r) {
    const next = parent[c] as number;
    parent[c] = r;
    c = next;
  }
  return r;
}

/**
 * Faces (triangles joined by shared vertices) of one plane, with the nesting level each must be
 * moved out by: 0 for a face nothing larger overlaps, otherwise one more than the highest level
 * among the larger faces it overlaps.
 */
function planeFaces(g: Geo, tris: readonly number[], nx: number, ny: number, nz: number): Face[] {
  const parent = new Int32Array(tris.length);
  const firstUse = new Map<number, number>();
  for (let i = 0; i < tris.length; i++) parent[i] = i;
  for (let i = 0; i < tris.length; i++) {
    const t = (tris[i] as number) * 3;
    for (let k = 0; k < 3; k++) {
      const v = g.idx[t + k] as number;
      const seen = firstUse.get(v);
      if (seen === undefined) firstUse.set(v, i);
      else parent[find(parent, i)] = find(parent, seen);
    }
  }
  let single = true;
  const root0 = find(parent, 0);
  for (let i = 1; i < tris.length && single; i++) if (find(parent, i) !== root0) single = false;
  if (single) return [];

  /* in-plane frame */
  const ax = Math.abs(nx) < 0.9 ? 1 : 0;
  const ay = 1 - ax;
  let ux = ay * nz;
  let uy = -ax * nz;
  let uz = ax * ny - ay * nx;
  const ul = Math.sqrt(ux * ux + uy * uy + uz * uz);
  ux /= ul;
  uy /= ul;
  uz /= ul;
  const wx = ny * uz - nz * uy;
  const wy = nz * ux - nx * uz;
  const wz = nx * uy - ny * ux;

  const uv = new Float64Array(tris.length * 6);
  const faceOf = new Map<number, Face>();
  const faces: Face[] = [];
  for (let i = 0; i < tris.length; i++) {
    const t = (tris[i] as number) * 3;
    const root = find(parent, i);
    let face = faceOf.get(root);
    if (!face) {
      face = { tris: [], minU: Infinity, maxU: -Infinity, minW: Infinity, maxW: -Infinity, area: 0, level: 0, over: [] };
      faceOf.set(root, face);
      faces.push(face);
    }
    face.tris.push(i);
    for (let k = 0; k < 3; k++) {
      const v = (g.idx[t + k] as number) * 3;
      const x = g.pos[v] as number;
      const y = g.pos[v + 1] as number;
      const z = g.pos[v + 2] as number;
      const u = x * ux + y * uy + z * uz;
      const w = x * wx + y * wy + z * wz;
      uv[i * 6 + k * 2] = u;
      uv[i * 6 + k * 2 + 1] = w;
      if (u < face.minU) face.minU = u;
      if (u > face.maxU) face.maxU = u;
      if (w < face.minW) face.minW = w;
      if (w > face.maxW) face.maxW = w;
    }
    const o = i * 6;
    face.area +=
      Math.abs(
        ((uv[o + 2] as number) - (uv[o] as number)) * ((uv[o + 5] as number) - (uv[o + 1] as number)) -
          ((uv[o + 4] as number) - (uv[o] as number)) * ((uv[o + 3] as number) - (uv[o + 1] as number)),
      ) / 2;
  }

  /* overlapping face pairs: sweep along u */
  const order = faces.map((_, i) => i).sort((a, b) => (faces[a] as Face).minU - (faces[b] as Face).minU);
  let any = false;
  for (let i = 0; i < order.length; i++) {
    const fa = faces[order[i] as number] as Face;
    for (let j = i + 1; j < order.length; j++) {
      const fb = faces[order[j] as number] as Face;
      if (fb.minU > fa.maxU - INSET) break;
      if (fb.minW > fa.maxW - INSET || fa.minW > fb.maxW - INSET) continue;
      let hit = false;
      for (let a = 0; a < fa.tris.length && !hit; a++) {
        for (let b = 0; b < fb.tris.length && !hit; b++) {
          hit = trianglesOverlap(uv, (fa.tris[a] as number) * 6, (fb.tris[b] as number) * 6);
        }
      }
      if (hit) {
        fa.over.push(order[j] as number);
        fb.over.push(order[i] as number);
        any = true;
      }
    }
  }
  if (!any) return [];

  /* largest first; each face sits one level above the highest larger face it overlaps */
  const rank = faces.map((_, i) => i).sort((a, b) => (faces[b] as Face).area - (faces[a] as Face).area || a - b);
  const placed = new Uint8Array(faces.length);
  for (const fi of rank) {
    const face = faces[fi] as Face;
    let level = 0;
    for (const other of face.over) {
      if (placed[other] === 1) level = Math.max(level, (faces[other] as Face).level + 1);
    }
    face.level = Math.min(MAX_LEVEL, level);
    placed[fi] = 1;
  }
  /* translate local triangle slots back to mesh triangle indices */
  return faces.filter((f) => f.level > 0).map((f) => ({ ...f, tris: f.tris.map((i) => tris[i] as number) }));
}

/**
 * One separation pass. `geo` is the input itself when nothing needs to move; `again` is true when a
 * moved face landed on a plane that already holds other faces, so the result must be re-checked.
 */
function separateOnce(g: Geo, step: number): { geo: Geo; again: boolean } {
  const triCount = g.idx.length / 3;
  if (triCount < 2) return { geo: g, again: false };
  if (triCount > MAX_TRIANGLES) return { geo: g, again: false };
  const normals = new Float64Array(triCount * 3);
  const dist = new Float64Array(triCount);
  /* one sortable number per triangle: quantised normal in the high bits, triangle index in the low */
  const order = new Float64Array(triCount);
  let used = 0;
  const size = NORMAL_STEPS * 2 + 1;
  for (let t = 0; t < triCount; t++) {
    const a = (g.idx[t * 3] as number) * 3;
    const b = (g.idx[t * 3 + 1] as number) * 3;
    const c = (g.idx[t * 3 + 2] as number) * 3;
    const ax = g.pos[a] as number;
    const ay = g.pos[a + 1] as number;
    const az = g.pos[a + 2] as number;
    const e1x = (g.pos[b] as number) - ax;
    const e1y = (g.pos[b + 1] as number) - ay;
    const e1z = (g.pos[b + 2] as number) - az;
    const e2x = (g.pos[c] as number) - ax;
    const e2y = (g.pos[c + 1] as number) - ay;
    const e2z = (g.pos[c + 2] as number) - az;
    let nx = e1y * e2z - e1z * e2y;
    let ny = e1z * e2x - e1x * e2z;
    let nz = e1x * e2y - e1y * e2x;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (len / 2 < MIN_AREA) continue;
    nx /= len;
    ny /= len;
    nz /= len;
    normals[t * 3] = nx;
    normals[t * 3 + 1] = ny;
    normals[t * 3 + 2] = nz;
    dist[t] = nx * ax + ny * ay + nz * az;
    const key =
      Math.round(nx * NORMAL_STEPS) + NORMAL_STEPS + size * (Math.round(ny * NORMAL_STEPS) + NORMAL_STEPS + size * (Math.round(nz * NORMAL_STEPS) + NORMAL_STEPS));
    order[used++] = key * MAX_TRIANGLES + t;
  }
  if (used < 2) return { geo: g, again: false };
  const sorted = order.subarray(0, used).sort();

  let moved: Float32Array | null = null;
  /** Move the fighting faces among `tris`; returns the highest level used (0 = nothing moved). */
  const apply = (tris: readonly number[]): number => {
    let top = 0;
    const first = tris[0] as number;
    const nx = normals[first * 3] as number;
    const ny = normals[first * 3 + 1] as number;
    const nz = normals[first * 3 + 2] as number;
    for (const face of planeFaces(g, tris, nx, ny, nz)) {
      moved ??= new Float32Array(g.pos.length);
      const k = face.level * step;
      if (face.level > top) top = face.level;
      for (const t of face.tris) {
        for (let c = 0; c < 3; c++) {
          const v = (g.idx[t * 3 + c] as number) * 3;
          /* a vertex shared by several faces keeps the largest shift asked of it */
          if ((moved[v] as number) ** 2 + (moved[v + 1] as number) ** 2 + (moved[v + 2] as number) ** 2 < k * k * 0.999) {
            moved[v] = nx * k;
            moved[v + 1] = ny * k;
            moved[v + 2] = nz * k;
          }
        }
      }
    }
    return top;
  };
  let again = false;
  const sharesVertex = (p: number, q: number): boolean => {
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (g.idx[p * 3 + i] === g.idx[q * 3 + j]) return true;
    return false;
  };
  let run = 0;
  while (run < used) {
    const key = Math.floor((sorted[run] as number) / MAX_TRIANGLES);
    let end = run + 1;
    while (end < used && Math.floor((sorted[end] as number) / MAX_TRIANGLES) === key) end++;
    if (end - run >= 2) {
      const first = (sorted[run] as number) - key * MAX_TRIANGLES;
      const second = (sorted[run + 1] as number) - key * MAX_TRIANGLES;
      /* by far the commonest case: the two triangles of one quad */
      if (end - run > 2 || !sharesVertex(first, second)) {
        const list: number[] = [];
        for (let i = run; i < end; i++) list.push((sorted[i] as number) - key * MAX_TRIANGLES);
        list.sort((p, q) => (dist[p] as number) - (dist[q] as number));
        let start = 0;
        for (let i = 1; i <= list.length; i++) {
          if (i === list.length || (dist[list[i] as number] as number) - (dist[list[i - 1] as number] as number) > PLANE_TOL) {
            if (i - start >= 2) {
              const top = apply(list.slice(start, i));
              /* does any moved face now sit on a plane further out that already holds faces? */
              const base = dist[list[i - 1] as number] as number;
              for (let n = i; top > 0 && !again && n < list.length; n++) {
                const gap = (dist[list[n] as number] as number) - base;
                if (gap > top * step + PLANE_TOL) break;
                if (Math.abs(gap / step - Math.round(gap / step)) * step <= PLANE_TOL) again = true;
              }
            }
            start = i;
          }
        }
      }
    }
    run = end;
  }
  if (!moved) return { geo: g, again: false };
  const shift: Float32Array = moved;
  const pos = new Float32Array(g.pos.length);
  for (let i = 0; i < pos.length; i++) pos[i] = (g.pos[i] as number) + (shift[i] as number);
  return { geo: { ...g, pos }, again };
}

/**
 * Return a mesh in which no two faces fight for the same plane: wherever same-facing faces overlap
 * in one plane, the smaller is moved `step` metres per nesting level along the normal. A moved face
 * can land on a plane that was authored just above it; only then is the pass repeated.
 * Returns the input itself when it was already clean.
 */
export function separateCoplanar(g: Geo, step = SEPARATION_STEP): Geo {
  let out = g;
  for (let pass = 0; pass < 4; pass++) {
    const next = separateOnce(out, step);
    out = next.geo;
    if (!next.again) break;
  }
  return out;
}
