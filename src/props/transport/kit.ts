/**
 * Shared building blocks for the transport library.
 *
 * Every prop is authored once as `(q: Q) => Geo` and built twice by `tiered`: the full-detail
 * build is tagged `detail()` (near views only) and a coarse rebuild with low segment counts and
 * without small parts is tagged `farOnly()`, so the far tier keeps the silhouette, main colours
 * and stripes at a fraction of the triangles.
 */
import * as THREE from 'three';
import {
  type Col,
  type Geo,
  EMPTY,
  beam,
  box,
  cyl,
  detail,
  farOnly,
  fromThree,
  merge,
  profile,
  rbox,
  rotateX,
  rotateY,
  rotateZ,
  scale,
  sway,
  torus,
  translate,
} from '../../core/geo';

export type V3 = readonly [number, number, number];
export type V2 = readonly [number, number];

/** Build quality: `far` asks for the coarse stand-in build. */
export interface Q {
  readonly far: boolean;
}

export const NEAR: Q = { far: false };
export const FAR: Q = { far: true };

/** Segment count for the current tier (halved, never below `min`, for the far build). */
export function sg(q: Q, n: number, min = 3): number {
  return q.far ? Math.max(min, Math.round(n / 2)) : n;
}

/** Build a prop twice: full detail for near views, coarse stand-in for far views. */
export function tiered(build: (q: Q) => Geo): Geo {
  return merge(detail(build(NEAR)), farOnly(build(FAR)));
}

/** Parts that only exist in the near build. */
export function nearOnly(q: Q, make: () => Geo | readonly Geo[]): Geo[] {
  if (q.far) return [];
  const g = make();
  return Array.isArray(g) ? [...(g as readonly Geo[])] : [g as Geo];
}

/** Rounded box near, plain box far. */
export function soft(q: Q, w: number, h: number, d: number, r: number, color: Col): Geo {
  return q.far ? box(w, h, d, color) : rbox(w, h, d, r, color);
}

/** Box placed by its centre-bottom. */
export function boxAt(w: number, h: number, d: number, color: Col, x: number, y: number, z: number): Geo {
  return translate(box(w, h, d, color), x, y, z);
}

/** Cylinder lying along x (axle direction) from x to x + len, axis at height y and depth z. */
export function cylX(r: number, len: number, color: Col, seg: number, x = 0, y = 0, z = 0): Geo {
  return translate(rotateZ(cyl(r, r, len, color, seg), Math.PI / 2), x + len, y, z);
}

/** Cylinder lying along z, centred on (x, y, z). */
export function cylZ(r: number, len: number, color: Col, seg: number, x = 0, y = 0, z = 0): Geo {
  return translate(rotateX(cyl(r, r, len, color, seg), Math.PI / 2), x, y, z - len / 2);
}

export type Orient = (c: V3) => V3;

function fixNormals(g: THREE.BufferGeometry): void {
  const n = g.getAttribute('normal');
  for (let i = 0; i < n.count; i++) {
    if (Math.hypot(n.getX(i), n.getY(i), n.getZ(i)) < 1e-6) n.setXYZ(i, 0, 1, 0);
  }
}

function sub(a: V3, b: V3): V3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a: V3, b: V3): V3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

/**
 * Smooth-shaded grid surface through rows of points (all rows the same length).
 * `orient` either flips the natural winding (boolean) or gives the desired outward direction at a
 * triangle centroid; each triangle is wound to face it. Degenerate triangles are dropped.
 */
export function mesh(rows: ReadonlyArray<ReadonlyArray<V3>>, color: Col, orient: Orient | boolean): Geo {
  const nr = rows.length;
  const nc = rows[0]?.length ?? 0;
  if (nr < 2 || nc < 2) return EMPTY;
  const pts: V3[] = rows.flat();
  const pos = new Float32Array(pts.length * 3);
  pts.forEach((p, i) => pos.set(p, i * 3));
  const idx: number[] = [];
  const tri = (a: number, b: number, c: number): void => {
    const pa = pts[a];
    const pb = pts[b];
    const pc = pts[c];
    if (!pa || !pb || !pc) return;
    const n = cross(sub(pb, pa), sub(pc, pa));
    if (Math.hypot(n[0], n[1], n[2]) < 1e-9) return;
    let flip: boolean;
    if (typeof orient === 'boolean') flip = orient;
    else {
      const ctr: V3 = [(pa[0] + pb[0] + pc[0]) / 3, (pa[1] + pb[1] + pc[1]) / 3, (pa[2] + pb[2] + pc[2]) / 3];
      const d = orient(ctr);
      flip = n[0] * d[0] + n[1] * d[1] + n[2] * d[2] < 0;
    }
    if (flip) idx.push(a, c, b);
    else idx.push(a, b, c);
  };
  for (let i = 0; i < nr - 1; i++) {
    for (let j = 0; j < nc - 1; j++) {
      const a = i * nc + j;
      const b = (i + 1) * nc + j;
      const c = i * nc + j + 1;
      const d = (i + 1) * nc + j + 1;
      tri(a, b, c);
      tri(c, b, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  fixNormals(g);
  return fromThree(g, color);
}

export const UP: Orient = () => [0, 1, 0];
export const awayFromY =
  (cx: number, cz: number): Orient =>
  (c) => [c[0] - cx, 0, c[2] - cz];
export const towardY =
  (cx: number, cz: number): Orient =>
  (c) => [cx - c[0], 0, cz - c[2]];

/* ------------------------------------------------------------------ wheels */

export interface WheelOpts {
  readonly tyre?: Col;
  readonly hub?: Col;
  readonly spokes?: number;
  /** solid wheel disc colour (scooters, vans); no spokes */
  readonly disc?: Col;
}

/** Wheel with its axle along x, resting on y = 0, centred on x = z = 0. Spokes are near-only. */
export function wheel(q: Q, r: number, width: number, o: WheelOpts = {}): Geo {
  const tyre = o.tyre ?? 'cocoa';
  if (q.far) return cylX(r, width, tyre, 8, -width / 2, r, 0);
  if (o.disc) {
    return merge(
      cylX(r, width, tyre, 10, -width / 2, r, 0),
      cylX(r * 0.6, width + 0.03, o.disc, 6, -width / 2 - 0.015, r, 0),
    );
  }
  const tt = Math.min(width / 2, r * 0.2);
  const ring = translate(scale(rotateZ(torus(r - tt, tt, tyre, 3, 12), Math.PI / 2), width / 2 / tt, 1, 1), 0, r, 0);
  const hub = cylX(Math.max(0.02, r * 0.14), width * 1.3, o.hub ?? 'ivoryDeep', 6, -width * 0.65, r, 0);
  const n = Math.ceil((o.spokes ?? 8) / 2);
  const st = Math.max(0.01, r * 0.04);
  const rr = r - tt * 1.5;
  const spokes = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI;
    const dy = Math.sin(a) * rr;
    const dz = Math.cos(a) * rr;
    return beam([0, r - dy, -dz], [0, r + dy, dz], st, o.hub ?? 'ivoryDeep');
  });
  return merge(ring, hub, spokes);
}

/** Small caster / solid wheel disc with axle along x, resting on y = 0. */
export function caster(q: Q, r: number, width: number, color: Col = 'cocoa'): Geo {
  return cylX(r, width, color, sg(q, 8, 5), -width / 2, r, 0);
}

/* ------------------------------------------------------------------ hollow shells */

export function chamferRect(w: number, d: number, c: number): V2[] {
  const x = w / 2;
  const z = d / 2;
  const k = Math.min(c, x * 0.9, z * 0.9);
  return [
    [-x + k, -z],
    [x - k, -z],
    [x, -z + k],
    [x, z - k],
    [x - k, z],
    [-x + k, z],
    [-x, z - k],
    [-x, -z + k],
  ];
}

/** Rounded-rectangle plan outline with `seg` points per corner. */
export function roundRect(w: number, d: number, r: number, seg = 3): V2[] {
  const rr = Math.min(r, w / 2 - 1e-3, d / 2 - 1e-3);
  const cs: ReadonlyArray<readonly [number, number, number]> = [
    [w / 2 - rr, d / 2 - rr, 0],
    [-w / 2 + rr, d / 2 - rr, Math.PI / 2],
    [-w / 2 + rr, -d / 2 + rr, Math.PI],
    [w / 2 - rr, -d / 2 + rr, (3 * Math.PI) / 2],
  ];
  return cs.flatMap(([cx, cz, a0]) =>
    Array.from({ length: seg + 1 }, (_, i): V2 => {
      const a = a0 + (i / seg) * (Math.PI / 2);
      return [cx + Math.cos(a) * rr, cz + Math.sin(a) * rr];
    }),
  );
}

function inset(outline: readonly V2[], t: number): V2[] {
  const n = outline.length;
  let cx = 0;
  let cz = 0;
  outline.forEach(([x, z]) => {
    cx += x / n;
    cz += z / n;
  });
  return outline.map((p, i) => {
    const prev = outline[(i - 1 + n) % n] ?? p;
    const next = outline[(i + 1) % n] ?? p;
    const tx = next[0] - prev[0];
    const tz = next[1] - prev[1];
    const len = Math.hypot(tx, tz) || 1;
    let nx = tz / len;
    let nz = -tx / len;
    if (nx * (p[0] - cx) + nz * (p[1] - cz) < 0) {
      nx = -nx;
      nz = -nz;
    }
    return [p[0] - nx * t, p[1] - nz * t];
  });
}

function ringAt(outline: readonly V2[], y: number): V3[] {
  const first = outline[0];
  const pts: V3[] = outline.map(([x, z]) => [x, y, z]);
  return first ? [...pts, [first[0], y, first[1]]] : pts;
}

export interface WallOpts {
  readonly inCol?: Col;
  readonly rimCol?: Col;
  /** plan outline scale at the top relative to the bottom (taper) */
  readonly topScale?: number;
  readonly floor?: boolean;
}

/** Hollow wall band around a convex plan outline: outer face, inner face and top rim. */
export function wallLoop(outline: readonly V2[], y0: number, y1: number, t: number, col: Col, o: WallOpts = {}): Geo {
  const ts = o.topScale ?? 1;
  const top = outline.map(([x, z]): V2 => [x * ts, z * ts]);
  const inB = inset(outline, t);
  const inT = inset(top, t);
  const parts = [
    mesh([ringAt(outline, y0), ringAt(top, y1)], col, awayFromY(0, 0)),
    mesh([ringAt(inB, y0), ringAt(inT, y1)], o.inCol ?? col, towardY(0, 0)),
    mesh([ringAt(top, y1), ringAt(inT, y1)], o.rimCol ?? col, UP),
  ];
  return o.floor ? merge(parts, floorPlate(inB, y0 + 0.005, o.inCol ?? col)) : merge(parts);
}

/** Rounded roof lid: sloped band from the outline at y0 up to an inset outline at y1, plus a flat top. */
export function lid(outline: readonly V2[], y0: number, y1: number, insetBy: number, col: Col): Geo {
  const top = inset(outline, insetBy);
  return merge(mesh([ringAt(outline, y0), ringAt(top, y1)], col, (c) => [c[0], 1, c[2]]), floorPlate(top, y1, col));
}

/** Points of a convex outline as [x, z, heading of the outline tangent]. */
export function outlineFrames(outline: readonly V2[]): Array<readonly [number, number, number]> {
  const n = outline.length;
  return outline.map((p, i) => {
    const prev = outline[(i - 1 + n) % n] ?? p;
    const next = outline[(i + 1) % n] ?? p;
    return [p[0], p[1], Math.atan2(next[0] - prev[0], next[1] - prev[1])];
  });
}

/** Flat up-facing polygon (fan) at height y. */
export function floorPlate(outline: readonly V2[], y: number, col: Col): Geo {
  const n = outline.length;
  let cx = 0;
  let cz = 0;
  outline.forEach(([x, z]) => {
    cx += x / n;
    cz += z / n;
  });
  const centre: V3[] = ringAt(outline, y).map((): V3 => [cx, y, cz]);
  return mesh([centre, ringAt(outline, y)], col, UP);
}

/** Open-topped tapered tub (crate, tray, basket, barrow) resting on y = 0. */
export function tray(
  wTop: number,
  dTop: number,
  wBot: number,
  dBot: number,
  h: number,
  t: number,
  col: Col,
  inCol: Col = col,
  rimCol: Col = col,
): Geo {
  const c = Math.min(wBot, dBot) * 0.12;
  const bottom = chamferRect(wBot, dBot, c);
  const sx = wTop / wBot;
  const sz = dTop / dBot;
  const topScaleOutline = bottom.map(([x, z]): V2 => [x * sx, z * sz]);
  const inB = inset(bottom, t);
  const inT = inset(topScaleOutline, t);
  return merge(
    mesh([ringAt(bottom, 0), ringAt(topScaleOutline, h)], col, awayFromY(0, 0)),
    mesh([ringAt(inB, t), ringAt(inT, h)], inCol, towardY(0, 0)),
    mesh([ringAt(topScaleOutline, h), ringAt(inT, h)], rimCol, UP),
    floorPlate(inB, t, inCol),
  );
}

/* ------------------------------------------------------------------ festive */

/** Sagging cord of small triangular pennants between a and b (with sway). */
export function pennants(q: Q, a: V3, b: V3, n: number, colors: readonly Col[], size = 0.22, sag = 0.3): Geo {
  const count = q.far ? Math.max(2, Math.ceil(n / 2)) : n;
  const heading = Math.atan2(b[0] - a[0], b[2] - a[2]);
  const at = (u: number): V3 => [
    a[0] + (b[0] - a[0]) * u,
    a[1] + (b[1] - a[1]) * u - sag * 4 * u * (1 - u),
    a[2] + (b[2] - a[2]) * u,
  ];
  const flag = (c: Col): Geo =>
    sway(
      profile(
        [
          [-size / 2, 0],
          [0, -size * 1.3],
          [size / 2, 0],
        ],
        0.014,
        c,
      ),
      (_x, y) => Math.min(1, (-y / (size * 1.3)) * 0.9),
    );
  const flags = Array.from({ length: count }, (_, i) => {
    const p = at((i + 0.5) / count);
    const c = colors[i % colors.length] ?? 'coral';
    return translate(rotateY(flag(c), heading - Math.PI / 2), p[0], p[1], p[2]);
  });
  const segs = q.far ? [] : Array.from({ length: 6 }, (_, i) => beam(at(i / 6), at((i + 1) / 6), 0.014, 'ivoryDeep'));
  return merge(flags, segs);
}

/** Thin pole / post rising from y0 to y1 at (x, z). */
export function post(q: Q, r: number, y0: number, y1: number, color: Col, x = 0, z = 0): Geo {
  return translate(cyl(r, r, y1 - y0, color, sg(q, 8, 4)), x, y0, z);
}

