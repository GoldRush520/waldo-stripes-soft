/**
 * Ground infrastructure: stairs, ramps, retaining walls, terrace platforms and quay walls.
 * Stairs and ramps climb toward -z (bottom edge at z = +length/2, top edge at z = -length/2).
 */
import { type Col, type Geo, box, merge, prism, profile, rotateX, rotateY, shadeY, translate } from '../../core/geo';
import { profileRail } from './fences';
import { bollard, mooringRing } from './fixtures';
import { type P2, type P3, alongZ, at, boxAt, lod, range } from './util';

export interface StairsOpts {
  /** tread depth per step */
  readonly run?: number;
  readonly color?: Col;
  readonly cheek?: Col;
  readonly cheeks?: boolean;
}

export interface StairsResult {
  readonly geo: Geo;
  /** top landing edge (centre of the top step's back edge) */
  readonly top: P3;
  /** foot of the stairs (centre of the bottom front edge) */
  readonly bottom: P3;
  readonly length: number;
}

function cheekWalls(w: number, L: number, rise: number, c: Col): Geo[] {
  const side: P2[] = [[L / 2, 0], [L / 2, 0.45], [-L / 2, rise + 0.45], [-L / 2, 0]];
  return [-1, 1].map((s) => translate(alongZ(profile(side, 0.24, c)), s * (w / 2 + 0.12), 0, 0));
}

export function stairs(w: number, rise: number, n: number, o: StairsOpts = {}): StairsResult {
  const run = o.run ?? 0.32;
  const c = o.color ?? 'stone';
  const L = n * run;
  const h = rise / n;
  const steps = range(n).map((k) => boxAt(w, (k + 1) * h, run, k % 2 ? c : 'ivoryShade', 0, 0, L / 2 - (k + 0.5) * run));
  const nosings = range(n).map((k) => boxAt(w, 0.03, 0.06, 'ivory', 0, (k + 1) * h, L / 2 - k * run - 0.04));
  const wedge: P2[] = [[L / 2, 0], [L / 2, h], [-L / 2 + run, rise], [-L / 2, rise], [-L / 2, 0]];
  const always = o.cheeks === false ? [] : cheekWalls(w, L, rise, o.cheek ?? 'clay');
  return {
    geo: merge(always, lod([...steps, ...nosings], [alongZ(profile(wedge, w, c))])),
    top: [0, rise, -L / 2],
    bottom: [0, 0, L / 2],
    length: L,
  };
}

export interface RampResult {
  readonly geo: Geo;
  readonly top: P3;
  readonly bottom: P3;
  readonly length: number;
}

export function ramp(w: number, rise: number, length: number, c: Col = 'stone', rail: Col = 'blueDeep'): RampResult {
  const L = length;
  const wedge: P2[] = [[L / 2, 0], [-L / 2, rise], [-L / 2, 0]];
  const ribs = range(Math.max(4, Math.round(L / 0.6))).map((i, _, all) => {
    const t = (i + 0.5) / all.length;
    const z = L / 2 - t * L;
    return translate(rotateX(box(w - 0.3, 0.03, 0.06, 'clayLight'), Math.atan2(rise, L)), 0, t * rise, z);
  });
  const railXs = [L / 2, 0, -L / 2];
  const railYs = [0, rise / 2, rise];
  const rails = [-1, 1].map((s) => translate(alongZ(profileRail(railXs, railYs, 0, 0.95, rail)), s * (w / 2 + 0.12), 0.45, 0));
  return {
    geo: merge(cheekWalls(w, L, rise, 'clay'), alongZ(profile(wedge, w, c)), lod(ribs, []), rails),
    top: [0, rise, -L / 2],
    bottom: [0, 0, L / 2],
    length: L,
  };
}

export function retainingWall(length: number, h: number, c: Col = 'clay', coping: Col = 'ivory'): Geo {
  const rows = Math.max(1, Math.round(h / 0.42));
  const rowH = h / rows;
  const per = Math.max(1, Math.round(length / 0.9));
  const blocks = range(rows).flatMap((r) =>
    range(per).map((i) => {
      const off = r % 2 ? 0.45 : 0;
      const x = -length / 2 + ((i + 0.5) * length) / per + off - (r % 2 && i === per - 1 ? 0.45 : 0);
      return boxAt(length / per - 0.06, rowH - 0.06, 0.04, (r + i) % 3 === 0 ? 'clayLight' : 'clayDeep', Math.min(x, length / 2 - 0.4), r * rowH + 0.03, 0.26);
    }),
  );
  const always = [shadeY(boxAt(length, h, 0.5, c, 0, 0, 0), 0.82, 1), boxAt(length + 0.1, 0.16, 0.66, coping, 0, h, 0.04)];
  return merge(always, lod(blocks, []));
}

export interface PlatformResult {
  readonly geo: Geo;
  readonly topY: number;
}

function signedArea(poly: readonly P2[]): number {
  return poly.reduce((acc, p, i) => {
    const q = at(poly, (i + 1) % poly.length, p);
    return acc + p[0] * q[1] - q[0] * p[1];
  }, 0);
}

/** Extruded terrace block from a ground polygon ([x, z] points) with stone edging along every edge. */
export function platform(poly: readonly P2[], h: number, c: Col = 'clay', edge: Col = 'ivory'): PlatformResult {
  const outward = signedArea(poly) > 0 ? -1 : 1;
  const edges = poly.map((p, i) => {
    const q = at(poly, (i + 1) % poly.length, p);
    const dx = q[0] - p[0];
    const dz = q[1] - p[1];
    const len = Math.hypot(dx, dz);
    const ang = Math.atan2(-dz, dx);
    const nx = (-dz / (len || 1)) * outward;
    const nz = (dx / (len || 1)) * outward;
    return { p, len, ang, nx, nz, mx: (p[0] + q[0]) / 2, mz: (p[1] + q[1]) / 2 };
  });
  const coping = edges.map((e) => translate(rotateY(box(e.len + 0.12, 0.14, 0.42, edge), e.ang), e.mx - e.nx * 0.15, h, e.mz - e.nz * 0.15));
  const joints = edges.flatMap((e) => {
    const k = Math.max(1, Math.floor(e.len / 1.1));
    return range(k).map((j) => {
      const t = (j + 0.5) / k - 0.5;
      const x = e.mx + Math.cos(e.ang) * t * e.len + e.nx * 0.02;
      const z = e.mz - Math.sin(e.ang) * t * e.len + e.nz * 0.02;
      return translate(rotateY(box(0.05, h - 0.1, 0.03, 'clayDeep'), e.ang), x, 0.05, z);
    });
  });
  const corners = poly.map(([x, z]) => boxAt(0.36, h + 0.2, 0.36, edge, x, 0, z));
  return { geo: merge(shadeY(prism(poly, h, c), 0.8, 1), coping, lod([...joints, ...corners], [])), topY: h + 0.14 };
}

export interface QuayOpts {
  /** add a flight of steps down to the water at the +x end */
  readonly steps?: boolean;
  readonly color?: Col;
  readonly coping?: Col;
}

/**
 * Quay wall along x, 1.6 m deep and centred on z: its water face is the plane z = +0.8 facing +z
 * (water side), land behind (-z). Wall from y = -2.2 to the coping at y ≈ 0.06; water at y = -1.
 */
export function quayWall(length: number, o: QuayOpts = {}): Geo {
  const c = o.color ?? 'clay';
  const coping = o.coping ?? 'ivory';
  const posts = range(Math.max(1, Math.floor(length / 4))).map((i, _, all) => -length / 2 + ((i + 0.5) * length) / all.length);
  const always = [
    shadeY(boxAt(length, 2.15, 1.6, c, 0, -2.2, -0.8), 0.7, 1),
    boxAt(length, 0.11, 0.7, coping, 0, -0.05, -0.35),
    boxAt(length, 0.3, 0.03, 'sageDeep', 0, -1.2, 0.015),
  ];
  const courses = [-0.95, -0.55, -0.3].map((y) => boxAt(length, 0.03, 0.02, 'clayDeep', 0, y, 0.01));
  const joints = range(Math.round(length / 0.8)).map((i) => boxAt(0.03, 0.9, 0.02, 'clayDeep', -length / 2 + (i + 0.5) * 0.8, -0.95, 0.01));
  const near = [
    ...courses,
    ...joints,
    ...posts.map((x) => translate(mooringRing(), x, -0.25, 0)),
    ...posts.map((x) => translate(bollard(), x + 1.2, 0.06, -0.4)),
  ];
  const flight = o.steps ? quaySteps(length / 2 - 0.6) : [];
  return translate(merge(always, flight, lod(near, [])), 0, 0, 0.8);
}

function quaySteps(xTop: number): Geo[] {
  const n = 6;
  const run = 0.34;
  const drop = 1.1;
  const stepsGeo = range(n).map((k) => {
    const top = -((k + 1) * drop) / n;
    return boxAt(run, top + 2.2, 1.0, k % 2 ? 'stone' : 'ivoryShade', xTop - (k + 0.5) * run, -2.2, 0.5);
  });
  const far = [translate(boxAt(n * run, 2.2 - drop / 2, 1.0, 'stone', 0, -2.2, 0.5), xTop - (n * run) / 2, 0, 0)];
  return [lod(stepsGeo, far), boxAt(0.2, 1.3, 1.0, 'clay', xTop + 0.1, -2.2 + 0.9, 0.5)];
}
