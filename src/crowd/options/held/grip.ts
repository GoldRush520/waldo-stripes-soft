/**
 * Held-prop helpers. Hand space (skeleton.ts): origin at the fist centre; with the arm hanging,
 * +y points up toward the elbow, +z is the person's forward, +x the person's LEFT.
 *
 * Conventions used by every held prop (so clips can choose a grip angle):
 *  - poles and handles run along y through the fist (radius 0.01–0.02 m at the origin);
 *  - "aloft" props (flags, umbrellas, placards) extend up (+y) and are raised by the clip;
 *  - carried loads (bags, buckets, tools at rest) hang below the fist (-y);
 *  - flat props (trays, books, maps) are horizontal, centred ≈ 0.02 m above the fist;
 *  - discs and faces (pans, rackets, signs, lenses) face +z.
 * Right-hand props are authored for HandR; left-hand variants are mirrored across x.
 */
import { type Col, type Geo, beam, cyl, rotateX, rotateZ } from '../../../core/geo';
import { Cat, Part, Slot } from '../../skeleton';
import type { RigOption } from '../../rig';
import { type Build, type Meta, type Q, type V3, at, mirrorX, path, single } from '../wardrobe/kit';

export type Hands = 'R' | 'RL' | 'L';

export interface HeldDef {
  readonly name: string;
  readonly build: Build;
  readonly meta?: Meta;
  /** R: right hand only (default); RL: right plus mirrored left; L: left hand only, authored for HandL */
  readonly hands?: Hands;
}

export const held = (name: string, build: Build, hands: Hands = 'R', meta: Meta = {}): HeldDef => ({
  name,
  build,
  hands,
  meta,
});

export function heldOptions(defs: readonly HeldDef[]): RigOption[] {
  return defs.flatMap((d) => {
    const hands = d.hands ?? 'R';
    const meta = d.meta ?? {};
    const right =
      hands === 'L' ? [] : [single(`hold.${d.name}`, Cat.HandR, Part.HandR, Slot.Vertex, d.build, meta)];
    const leftBuild: Build = hands === 'L' ? d.build : (q) => mirrorX(d.build(q));
    const left =
      hands === 'R' ? [] : [single(`holdL.${d.name}`, Cat.HandL, Part.HandL, Slot.Vertex, leftBuild, meta)];
    return [...right, ...left];
  });
}

/** Round pole along y from y0 to y1 (a square beam in the far tier). */
export function pole(q: Q, y0: number, y1: number, r: number, col: Col, x = 0, z = 0): Geo {
  return q === 'near'
    ? at(cyl(r, r, y1 - y0, col, 5), x, y0, z)
    : beam([x, y0, z], [x, y1, z], r * 2, col);
}

/** Cylinder centred on the origin with its axis along z. */
export const zCyl = (r: number, h: number, col: Col, seg: number): Geo =>
  rotateX(at(cyl(r, r, h, col, seg), 0, -h / 2, 0), Math.PI / 2);

/** Cylinder centred on the origin with its axis along x. */
export const xCyl = (r: number, h: number, col: Col, seg: number): Geo =>
  rotateZ(at(cyl(r, r, h, col, seg), 0, -h / 2, 0), Math.PI / 2);

/** Turn a y-axis lathe so its axis points forward (+y -> +z). */
export const forward = (g: Geo): Geo => rotateX(g, Math.PI / 2);

/** Wire bail from a rim at height `rimY` (half-span `half` along z) up through the fist. */
export function bail(q: Q, rimY: number, half: number, col: Col, t = 0.012): Geo {
  const pts: readonly V3[] =
    q === 'near'
      ? [
          [0, rimY, -half],
          [0, 0.0, -0.035],
          [0, 0.0, 0.035],
          [0, rimY, half],
        ]
      : [
          [0, rimY, 0],
          [0, 0.0, 0],
        ];
  return path(pts, q === 'near' ? t : t * 1.6, col);
}
