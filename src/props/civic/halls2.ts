/** Glass palm house (frame + separate glass) and the octagonal bandstand. */
import { type Col, type Geo, cone, cyl, dome, merge, place, profile, rotateY, sphere, tintable, translate } from '../../core/geo';
import { ironRailing } from './fences';
import { type P2, type Rect, alongZ, boxAt, lod, range, segBox, steps, stripedCone } from './util';

/* ------------------------------------------------------------------ greenhouse */

export interface GreenhouseResult {
  /** opaque frame and plinth */
  readonly geo: Geo;
  /** panes, register as material 'glass' */
  readonly glass: Geo;
  /** doorway centres [x, z] (open, walkable) */
  readonly doors: readonly P2[];
  /** walkable interior rectangles (wings and the dome square) */
  readonly interior: readonly Rect[];
}

const GH = { R: 5.2, drumH: 4.6, wingX0: 4.6, wingX1: 14, wingD: 8, wallH: 3.2, vault: 2.0, plinth: 0.6 } as const;
const DRUM_SEG = 16;
const DOOR_W = 1.8;

/** Drum segments that carry walls: not facing the front door, not inside a wing junction. */
function drumSegments(): number[] {
  return range(DRUM_SEG).filter((i) => {
    const t = ((i + 0.5) / DRUM_SEG) * Math.PI * 2;
    const x = Math.sin(t) * GH.R;
    const z = Math.cos(t) * GH.R;
    const front = z > GH.R * 0.9;
    const wing = Math.abs(z) < GH.wingD / 2 + 0.3 && Math.abs(x) > 2;
    return !front && !wing;
  });
}

function drumPiece(i: number, h: number, depth: number, c: Col, y: number): Geo {
  const t = ((i + 0.5) / DRUM_SEG) * Math.PI * 2;
  const w = 2 * GH.R * Math.sin(Math.PI / DRUM_SEG) + 0.05;
  return place(boxAt(w, h, depth, c, 0, 0, 0), Math.sin(t) * GH.R, y, Math.cos(t) * GH.R, t);
}

function vaultArc(n: number, inset = 0): P2[] {
  const half = GH.wingD / 2 - inset;
  return steps(0, Math.PI, n).map((t): P2 => [half * Math.cos(t), GH.wallH + (GH.vault - inset) * Math.sin(t)]);
}

/** Wing wall runs as [x0, x1] along x at z, split for nothing; end walls get a door gap. */
function wingWalls(make: (len: number, x: number, z: number, alongXAxis: boolean) => Geo): Geo[] {
  const len = GH.wingX1 - GH.wingX0;
  const endSide = (GH.wingD - DOOR_W) / 2;
  return [-1, 1].flatMap((s) => [
    make(len, s * (GH.wingX0 + len / 2), GH.wingD / 2, true),
    make(len, s * (GH.wingX0 + len / 2), -GH.wingD / 2, true),
    make(endSide, s * GH.wingX1, GH.wingD / 2 - endSide / 2, false),
    make(endSide, s * GH.wingX1, -GH.wingD / 2 + endSide / 2, false),
  ]);
}

function greenhouseFrame(frame: Col, base: Col): Geo {
  const segs = drumSegments();
  const wingLen = GH.wingX1 - GH.wingX0;
  const always = [
    ...wingWalls((len, x, z, ax) => boxAt(ax ? len : 0.3, GH.plinth, ax ? 0.3 : len, base, x, 0, z)),
    ...segs.map((i) => drumPiece(i, GH.plinth, 0.3, base, 0)),
    ...[-1, 1].flatMap((s) => [-1, 1].map((sz) => boxAt(wingLen, 0.16, 0.16, frame, s * (GH.wingX0 + wingLen / 2), GH.wallH, sz * GH.wingD / 2))),
    ...[-1, 1].flatMap((s) => [-1, 1].map((sz) => boxAt(0.2, GH.wallH, 0.2, frame, s * GH.wingX1, 0, sz * GH.wingD / 2))),
    translate(cyl(GH.R + 0.1, GH.R + 0.1, 0.2, frame, DRUM_SEG, false), 0, GH.drumH, 0),
    translate(merge(cyl(0.6, 0.6, 0.9, frame, 8), translate(tintable(cone(0.8, 1.0, 'coral', 8)), 0, 0.9, 0)), 0, GH.drumH + GH.R - 0.3, 0),
    ...doorFrames(frame),
  ];
  const wingMullions = [-1, 1].flatMap((s) =>
    [-1, 1].flatMap((sz) => steps(GH.wingX0 + 0.5, GH.wingX1 - 0.5, 8).map((x) => boxAt(0.07, GH.wallH - GH.plinth, 0.08, frame, s * x, GH.plinth, sz * GH.wingD / 2))),
  );
  const vaultRibs = [-1, 1].flatMap((s) =>
    steps(GH.wingX0 + 0.8, GH.wingX1, 6).map((x) => translate(alongZ(profile([...vaultArc(8), ...vaultArc(8, 0.12).reverse()], 0.08, frame)), s * x, 0, 0)),
  );
  const domeRibs = range(8).flatMap((k) => {
    const a = (k / 8) * Math.PI * 2;
    const pts = steps(0, Math.PI / 2, 5).map((p): P2 => [Math.cos(p) * (GH.R + 0.03), GH.drumH + Math.sin(p) * (GH.R + 0.03)]);
    return range(5).map((i) => {
      const [r0, y0] = pts[i] ?? [0, 0];
      const [r1, y1] = pts[i + 1] ?? [0, 0];
      return rotateY(segBox(r0, y0, r1, y1, 0.1, 0.1, frame), a + Math.PI / 2);
    });
  });
  const drumMullions = segs.flatMap((i) =>
    [i, i + 1].map((k) => {
      const t = (k / DRUM_SEG) * Math.PI * 2;
      return boxAt(0.1, GH.drumH - GH.plinth, 0.1, frame, Math.sin(t) * GH.R, GH.plinth, Math.cos(t) * GH.R);
    }),
  );
  const near = [...wingMullions, ...vaultRibs, ...domeRibs, ...drumMullions];
  return merge(always, lod(near, [translate(sphere(GH.R * 0.15, frame, 6, 4), 0, GH.drumH + GH.R + 1.6, 0)]));
}

function doorFrames(frame: Col): Geo[] {
  const door = merge(
    boxAt(0.18, 2.6, 0.24, frame, -DOOR_W / 2 - 0.09, 0, 0),
    boxAt(0.18, 2.6, 0.24, frame, DOOR_W / 2 + 0.09, 0, 0),
    boxAt(DOOR_W + 0.36, 0.25, 0.26, frame, 0, 2.6, 0),
  );
  return [
    translate(door, 0, 0, GH.R - 0.1),
    translate(rotateY(door, Math.PI / 2), GH.wingX1, 0, 0),
    translate(rotateY(door, Math.PI / 2), -GH.wingX1, 0, 0),
  ];
}

function greenhouseGlass(): Geo {
  const segs = drumSegments();
  const pts = vaultArc(6, 0.05);
  const pane = (i: number, len: number, x: number): Geo => {
    const [z0, y0] = pts[i] ?? [0, 0];
    const [z1, y1] = pts[i + 1] ?? [0, 0];
    return translate(alongZ(segBox(z0, y0, z1, y1, 0.04, len, 'blueLight')), x, 0, 0);
  };
  const wingLen = GH.wingX1 - GH.wingX0;
  const bays = 6;
  const bayLen = wingLen / bays;
  const walls = wingWalls((len, x, z, ax) => boxAt(ax ? len : 0.04, GH.wallH - GH.plinth, ax ? 0.04 : len, 'blueLight', x, GH.plinth, z));
  const transoms = [-1, 1].map((s) => boxAt(0.04, GH.wallH - 2.85, DOOR_W, 'blueLight', s * GH.wingX1, 2.85, 0));
  const near = [
    ...[-1, 1].flatMap((s) => range(bays).flatMap((b) => range(6).map((i) => pane(i, bayLen - 0.1, s * (GH.wingX0 + (b + 0.5) * bayLen))))),
    translate(dome(GH.R, 'blueLight', 16, 6), 0, GH.drumH, 0),
  ];
  const far = [
    ...[-1, 1].flatMap((s) => range(6).map((i) => pane(i, wingLen, s * (GH.wingX0 + wingLen / 2)))),
    translate(dome(GH.R, 'blueLight', 8, 3), 0, GH.drumH, 0),
  ];
  return merge(walls, transoms, segs.map((i) => drumPiece(i, GH.drumH - GH.plinth, 0.04, 'blueLight', GH.plinth)), lod(near, far));
}

export function greenhouse(frame: Col = 'ivory', base: Col = 'sage'): GreenhouseResult {
  return {
    geo: greenhouseFrame(frame, base),
    glass: greenhouseGlass(),
    doors: [
      [0, GH.R],
      [GH.wingX1, 0],
      [-GH.wingX1, 0],
    ],
    interior: [
      { x0: -GH.wingX1 + 0.3, z0: -GH.wingD / 2 + 0.3, x1: GH.wingX1 - 0.3, z1: GH.wingD / 2 - 0.3 },
      { x0: -GH.R * 0.7, z0: -GH.R * 0.7, x1: GH.R * 0.7, z1: GH.R * 0.7 },
    ],
  };
}

/* ------------------------------------------------------------------ bandstand */

export interface BandstandOpts {
  readonly a?: Col;
  readonly b?: Col;
  readonly frame?: Col;
}

export interface BandstandResult {
  readonly geo: Geo;
  /** walkable deck height and (inscribed) radius */
  readonly deckY: number;
  readonly radius: number;
  /** foot of the steps [x, z] */
  readonly stepsFoot: P2;
}

export function bandstand(o: BandstandOpts = {}): BandstandResult {
  const R = 3.6;
  const deckY = 0.9;
  const frame = o.frame ?? 'ivory';
  const a = o.a ?? 'coral';
  const inR = R * Math.cos(Math.PI / 8);
  const colH = 2.7;
  const verts = range(8).map((i) => (i / 8) * Math.PI * 2 + Math.PI / 8);
  const always = [
    rotateY(cyl(R, R, deckY, frame, 8), Math.PI / 8),
    translate(rotateY(cyl(R + 0.04, R + 0.04, 0.45, a, 8, false), Math.PI / 8), 0, 0.2, 0),
    ...range(4).map((k) => boxAt(1.8, deckY - k * 0.225, 0.34, k % 2 ? 'ivoryShade' : 'ivory', 0, 0, inR + 0.17 + k * 0.34)),
    translate(stripedCone(R + 0.5, 1.8, 16, a, o.b ?? 'ivory'), 0, deckY + colH, 0),
    translate(rotateY(tintable(cyl(R + 0.5, R + 0.5, 0.3, a, 8, false)), Math.PI / 8), 0, deckY + colH - 0.3, 0),
  ];
  const sides = range(8).filter((i) => i !== 0);
  const sideLen = 2 * R * Math.sin(Math.PI / 8) - 0.2;
  const near = [
    ...verts.map((t) => translate(cyl(0.08, 0.06, colH, frame, 6), Math.sin(t) * (R - 0.25), deckY, Math.cos(t) * (R - 0.25))),
    ...sides.map((i) => {
      const t = (i / 8) * Math.PI * 2;
      return place(ironRailing(sideLen, { h: 0.9, color: frame, spacing: 0.32 }), Math.sin(t) * (inR - 0.2), deckY, Math.cos(t) * (inR - 0.2), t);
    }),
    ...range(8).flatMap((i) => {
      const t = (i / 8) * Math.PI * 2;
      const p = (g: Geo): Geo => place(g, Math.sin(t) * (inR + 0.06), 0.25, Math.cos(t) * (inR + 0.06), t);
      return [p(segBox(-0.8, 0, 0.8, 0.4, 0.05, 0.03, 'coralDeep')), p(segBox(-0.8, 0.4, 0.8, 0, 0.05, 0.03, 'coralDeep'))];
    }),
    translate(sphere(0.2, 'butter', 8, 5), 0, deckY + colH + 1.95, 0),
    boxAt(0.05, 0.7, 0.05, 'butterDeep', 0, deckY + colH + 1.9, 0),
  ];
  const far = verts.map((t) => boxAt(0.14, colH, 0.14, frame, Math.sin(t) * (R - 0.25), deckY, Math.cos(t) * (R - 0.25)));
  return { geo: merge(always, lod(near, far)), deckY, radius: inR - 0.25, stepsFoot: [0, inR + 1.5] };
}
