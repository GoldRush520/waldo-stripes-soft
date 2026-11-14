/** Small civic buildings: ticket and newspaper kiosks, gazebo, pier pavilion, boathouse, bakery chimney. */
import {
  type Col,
  type Geo,
  cone,
  cyl,
  dome,
  gable,
  lathe,
  merge,
  place,
  profile,
  rotateY,
  shadeY,
  sphere,
  sway,
  tintable,
  translate,
} from '../../core/geo';
import { ironRailing } from './fences';
import { archPlate } from './towers';
import { type P2, alongZ, boxAt, lod, range, segBox, steps, stripedCone, stripedCyl } from './util';

function flag(h: number, c: Col): Geo {
  const cloth = sway(tintable(boxAt(0.5, 0.3, 0.02, c, 0.27, h - 0.35, 0)), (x) => Math.min(1, Math.max(0, x / 0.5)));
  return merge(boxAt(0.035, h, 0.035, 'cocoa', 0, 0, 0), cloth);
}

/** Letter-like blocks on a sign board facing +z (near detail). */
function letters(n: number, w: number, y: number, z: number, c: Col): Geo[] {
  return range(n).map((i) => boxAt(w * 0.6, w, 0.03, c, (i - (n - 1) / 2) * w * 0.9, y, z));
}

/* ------------------------------------------------------------------ ticket kiosk */

export function ticketKiosk(a: Col = 'coral', b: Col = 'ivory'): Geo {
  const r = 1.1;
  const always = [
    cyl(r + 0.1, r + 0.1, 0.25, 'stone', 10),
    translate(stripedCyl(r, 2.2, 12, a, b), 0, 0.25, 0),
    translate(cyl(r + 0.08, r + 0.08, 0.2, 'blueDeep', 10), 0, 2.45, 0),
    translate(stripedCone(r + 0.45, 1.0, 12, a, b), 0, 2.65, 0),
  ];
  const z = r + 0.02;
  const near = [
    boxAt(1.0, 0.8, 0.04, 'blueDeep', 0, 1.15, z),
    boxAt(1.2, 0.08, 0.1, 'ivory', 0, 1.95, z),
    boxAt(1.2, 0.08, 0.1, 'ivory', 0, 1.08, z),
    ...[-0.6, 0.6].map((x) => boxAt(0.08, 0.95, 0.1, 'ivory', x, 1.08, z)),
    boxAt(1.3, 0.06, 0.35, 'timber', 0, 1.06, z + 0.12),
    ...range(5).map((i) => boxAt(0.02, 0.78, 0.02, 'butterDeep', -0.4 + i * 0.2, 1.16, z + 0.03)),
    boxAt(1.1, 0.3, 0.06, 'butter', 0, 2.1, z + 0.02),
    ...letters(6, 0.14, 2.18, z + 0.06, 'coralDeep'),
    ...[-1, 1].map((s) => place(boxAt(0.5, 0.7, 0.02, s < 0 ? 'blue' : 'sage', 0, 0, 0), s * r * 0.8, 0.6, r * 0.6 + 0.02, s * 0.93)),
    translate(flag(1.1, a), 0, 3.6, 0),
    translate(sphere(0.07, 'butter', 6, 4), 0, 4.72, 0),
  ];
  return merge(always, lod(near, [boxAt(1.0, 0.9, 0.04, 'blueDeep', 0, 1.1, z)]));
}

/* ------------------------------------------------------------------ newspaper kiosk */

export function newsKiosk(body: Col = 'sage', roof: Col = 'coral'): Geo {
  const r = 1.2;
  const always = [
    rotateY(cyl(r, r, 2.4, body, 8), Math.PI / 8),
    translate(rotateY(cyl(r + 0.15, r + 0.15, 0.25, 'ivory', 8), Math.PI / 8), 0, 2.4, 0),
    translate(rotateY(tintable(dome(r + 0.1, roof, 8, 3)), Math.PI / 8), 0, 2.65, 0),
  ];
  const z = r * Math.cos(Math.PI / 8);
  const mags = range(3).flatMap((row) =>
    range(6).map((i) => boxAt(0.14, 0.2, 0.03, (['coral', 'blue', 'butter', 'sage', 'ivory', 'coralLight'] as const)[(i + row) % 6] ?? 'coral', -0.4 + i * 0.16, 0.7 + row * 0.32, z + 0.06)),
  );
  const near = [
    boxAt(1.0, 0.04, 0.12, 'timber', 0, 0.68, z + 0.04),
    boxAt(1.0, 0.04, 0.12, 'timber', 0, 1.0, z + 0.04),
    boxAt(1.0, 0.04, 0.12, 'timber', 0, 1.32, z + 0.04),
    ...mags,
    boxAt(0.9, 0.3, 0.05, 'ivory', 0, 2.0, z + 0.02),
    ...letters(5, 0.13, 2.08, z + 0.05, 'ink'),
    translate(lathe([[0.12, 0], [0.04, 0.3], [0.01, 0.42]], 'butter', 6), 0, 3.85, 0),
    ...[-1, 1].map((s) => place(boxAt(0.5, 1.4, 0.03, 'ivory', 0, 0, 0), Math.sin(s * Math.PI / 4) * (z + 0.02), 0.5, Math.cos(s * Math.PI / 4) * (z + 0.02), s * Math.PI / 4)),
  ];
  return merge(always, lod(near, [boxAt(1.0, 0.95, 0.05, 'butter', 0, 0.68, z + 0.03)]));
}

/* ------------------------------------------------------------------ gazebo */

export interface GazeboResult {
  readonly geo: Geo;
  /** bench seat anchors (hips) */
  readonly seats: ReadonlyArray<{ x: number; y: number; z: number; heading: number }>;
  readonly floorY: number;
}

const GZ = { R: 2.4, fy: 0.3 } as const;

/** Bench seat anchors (hips) of the default gazebo, computed without building geometry. */
export function gazeboSeats(): ReadonlyArray<{ x: number; y: number; z: number; heading: number }> {
  const inR = GZ.R * Math.cos(Math.PI / 6);
  return range(5).map((i) => {
    const t = ((i + 1) / 6) * Math.PI * 2;
    return { x: Math.sin(t) * (inR - 0.45), y: GZ.fy + 0.48, z: Math.cos(t) * (inR - 0.45), heading: t + Math.PI };
  });
}

export function gazebo(a: Col = 'coral', b: Col = 'ivory', wood: Col = 'ivory'): GazeboResult {
  const R = GZ.R;
  const fy = GZ.fy;
  const verts = range(6).map((i) => (i / 6) * Math.PI * 2 + Math.PI / 6);
  const faces = range(6).map((i) => (i / 6) * Math.PI * 2);
  const inR = R * Math.cos(Math.PI / 6);
  const always = [
    rotateY(cyl(R, R, fy, 'timber', 6), Math.PI / 6),
    translate(stripedCone(R + 0.45, 1.6, 12, a, b), 0, fy + 2.4, 0),
    translate(rotateY(tintable(cyl(R + 0.45, R + 0.45, 0.2, a, 6, false)), Math.PI / 6), 0, fy + 2.2, 0),
    boxAt(0.6, 0.15, 0.4, 'ivoryShade', 0, 0, inR + 0.2),
  ];
  const benchFaces = faces.slice(1);
  const near = [
    ...verts.map((t) => boxAt(0.12, 2.4, 0.12, wood, Math.sin(t) * (R - 0.12), fy, Math.cos(t) * (R - 0.12))),
    ...benchFaces.map((t) => place(merge(boxAt(1.6, 0.06, 0.4, 'timber', 0, 0.42, 0), boxAt(1.5, 0.42, 0.06, 'timberDeep', 0, 0, 0.12)), Math.sin(t) * (inR - 0.35), fy, Math.cos(t) * (inR - 0.35), t)),
    ...benchFaces.map((t) => place(merge(boxAt(2.2, 0.06, 0.06, wood, 0, 0.85, 0), ...range(7).map((k) => boxAt(0.04, 0.8, 0.04, wood, -0.9 + k * 0.3, 0.05, 0))), Math.sin(t) * (inR - 0.08), fy, Math.cos(t) * (inR - 0.08), t)),
    ...faces.map((t) => place(segBox(-1.1, 2.15, -0.5, 2.4, 0.06, 0.06, wood), Math.sin(t) * (inR - 0.08), fy, Math.cos(t) * (inR - 0.08), t)),
    translate(sphere(0.16, 'butter', 8, 5), 0, fy + 4.1, 0),
  ];
  const far = verts.map((t) => boxAt(0.18, 2.4, 0.18, wood, Math.sin(t) * (R - 0.12), fy, Math.cos(t) * (R - 0.12)));
  const seats = gazeboSeats();
  return { geo: merge(always, lod(near, far)), seats, floorY: fy };
}

/* ------------------------------------------------------------------ pier pavilion */

export function pierPavilion(body: Col = 'ivory', a: Col = 'coral'): Geo {
  const W = 6;
  const H = 4.2;
  const sides = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
  const onion = (seg: number): Geo =>
    lathe([[2.2, 0], [2.6, 0.7], [2.3, 1.6], [1.2, 2.5], [0.25, 3.1], [0.05, 3.5]], a, seg);
  const turret = (x: number, z: number, seg: number): Geo =>
    merge(boxAt(0.8, H + 1.0, 0.8, body, x, 0, z), translate(tintable(cone(0.6, 1.3, a, seg)), x, H + 1.0, z));
  const corners = (seg: number): Geo[] => [-1, 1].flatMap((sx) => [-1, 1].map((sz) => turret(sx * (W / 2), sz * (W / 2), seg)));
  const walls = (seg: number): Geo[] =>
    sides.map((t) => place(archPlate(W, H, 2.2, 3.0, 0.4, body, seg), Math.sin(t) * (W / 2 - 0.2), 0.3, Math.cos(t) * (W / 2 - 0.2), t));
  const always = [
    boxAt(W + 0.4, 0.3, W + 0.4, 'stone', 0, 0, 0),
    boxAt(W + 0.5, 0.4, W + 0.5, a, 0, H + 0.3, 0),
    translate(cyl(2.2, 2.2, 0.6, body, 10), 0, H + 0.7, 0),
  ];
  const near = [
    ...walls(8),
    ...corners(8),
    ...sides.map((t) => place(ironRailing(W - 0.9, { h: 0.6, color: body, spacing: 0.3 }), Math.sin(t) * (W / 2), H + 0.7, Math.cos(t) * (W / 2), t)),
    translate(tintable(onion(14)), 0, H + 1.3, 0),
    ...sides.flatMap((t) => [
      place(boxAt(W - 1.0, 0.25, 0.06, 'butter', 0, 0, 0), Math.sin(t) * (W / 2 + 0.02), H - 0.35, Math.cos(t) * (W / 2 + 0.02), t),
      ...range(6).map((k) => place(boxAt(0.3, 0.3, 0.05, k % 2 ? 'coral' : 'blue', -1.9 + k * 0.76, 0, 0), Math.sin(t) * (W / 2 + 0.03), 1.1, Math.cos(t) * (W / 2 + 0.03), t)),
    ]),
    translate(flag(1.6, a), 0, H + 4.8, 0),
    ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => translate(sphere(0.12, 'butter', 6, 4), sx * (W / 2), H + 2.35, sz * (W / 2)))),
  ];
  return merge(always, lod(near, [...walls(2), ...corners(4), translate(tintable(onion(7)), 0, H + 1.3, 0)]));
}

/* ------------------------------------------------------------------ boathouse */

export interface BoathouseResult {
  readonly geo: Geo;
  /** slipway runs from the door (z = slipTop) down into the water (z = slipEnd, y = -1.3) */
  readonly slipTop: number;
  readonly slipEnd: number;
}

export function boathouse(wall: Col = 'timber', roof: Col = 'coral'): BoathouseResult {
  const W = 6;
  const D = 8;
  const H = 3;
  const zf = D / 2;
  const slipEnd = zf + 5;
  const ramp: P2[] = [[-zf + 1, 0.03], [zf, 0.03], [slipEnd, -1.3], [slipEnd, -1.5], [-zf + 1, -0.15]];
  const always = [
    boxAt(W, H, 0.2, wall, 0, 0, -zf + 0.1),
    ...[-1, 1].map((s) => boxAt(0.2, H, D, wall, s * (W / 2 - 0.1), 0, 0)),
    ...[-1, 1].map((s) => boxAt(0.9, H, 0.2, wall, s * (W / 2 - 0.45), 0, zf - 0.1)),
    boxAt(W, 0.5, 0.2, wall, 0, H - 0.5, zf - 0.1),
    translate(tintable(gable(W + 0.6, 2.2, D + 0.8, roof)), 0, H, 0),
    translate(alongZ(profile(ramp, 3.4, 'clay')), 0, 0, 0),
  ];
  const planks = range(16).map((i) => boxAt(0.12, H - 0.2, 0.03, i % 2 ? 'timberDeep' : 'clayLight', -W / 2 + 0.3 + i * 0.36, 0.1, -zf - 0.01));
  const sidePlanks = [-1, 1].flatMap((s) => range(10).map((i) => boxAt(0.03, 0.1, D - 0.4, 'timberDeep', s * (W / 2 + 0.01), 0.3 + i * 0.28, 0)));
  const slipRails = [-0.8, 0.8].flatMap((x) =>
    range(5).map((i) => {
      const z0 = zf - 3 + i * 1.6;
      const y = (z: number): number => (z <= zf ? 0.03 : 0.03 - 1.33 * ((z - zf) / 5));
      const z1 = Math.min(slipEnd, z0 + 1.6);
      return translate(alongZ(segBox(z0, y(z0), z1, y(z1), 0.08, 0.1, 'timberDeep')), x, 0.01, 0);
    }),
  );
  const near = [
    ...planks,
    ...sidePlanks,
    ...slipRails,
    translate(gable(W + 0.7, 2.25, 0.06, 'ivory'), 0, H - 0.02, zf + 0.42),
    boxAt(1.0, 0.6, 0.06, 'blueDeep', 0, H + 0.6, zf + 0.46),
    ...[-1, 1].map((s) => place(boxAt(1.4, H - 0.6, 0.06, 'blue', 0.7, 0, 0), s * (W / 2 - 0.9), 0, zf + 0.05, s < 0 ? -1.3 : Math.PI + 1.3)),
    boxAt(0.8, 0.7, 0.06, 'blueDeep', 0, 1.4, -zf - 0.03),
  ];
  const dz = -(slipEnd - zf) / 2;
  return { geo: translate(merge(always, lod(near, [])), 0, 0, dz), slipTop: zf + dz, slipEnd: slipEnd + dz };
}

/* ------------------------------------------------------------------ bakery chimney */

export function bakeryChimney(c: Col = 'clay', band: Col = 'ivory'): Geo {
  const H = 13;
  const r0 = 1.0;
  const r1 = 0.7;
  const rAt = (y: number): number => r0 + (r1 - r0) * (y / H);
  const sq = (rb: number, rt: number, h: number, col: Col): Geo => rotateY(cyl(rb, rt, h, col, 4), Math.PI / 4);
  const always = [
    shadeY(boxAt(2.4, 2.2, 2.4, c, 0, 0, 0), 0.8, 1),
    boxAt(2.6, 0.3, 2.6, band, 0, 2.2, 0),
    translate(sq(r0 * 1.414, r1 * 1.414, H, c), 0, 2.5, 0),
    ...[0.35, 0.7].map((f) => translate(sq(rAt(H * f) * 1.414 + 0.06, rAt(H * f) * 1.414 + 0.06, 0.4, band), 0, 2.5 + H * f, 0)),
    translate(sq(r1 * 1.414 + 0.2, r1 * 1.414 + 0.2, 0.6, band), 0, 2.5 + H, 0),
  ];
  const courses = steps(0.8, H - 0.6, 18).map((y) => translate(sq(rAt(y) * 1.414 + 0.02, rAt(y) * 1.414 + 0.02, 0.08, 'clayDeep'), 0, 2.5 + y, 0));
  const near = [
    ...courses,
    boxAt(0.9, 1.2, 0.08, 'cocoa', 0, 0.3, 1.21),
    boxAt(1.1, 0.12, 0.12, band, 0, 1.5, 1.22),
    translate(sq(r1 * 1.414 - 0.1, r1 * 1.414 - 0.1, 0.05, 'ink'), 0, 3.12 + H, 0),
    ...range(4).map((i) => boxAt(0.14, 0.14, 0.1, 'ink', -0.3 + i * 0.2, 2.6 + H * 0.5, rAt(H * 0.5) + 0.03)),
  ];
  return merge(always, lod(near, []));
}
