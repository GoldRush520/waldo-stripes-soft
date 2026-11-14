/** Small shared fittings: lamp posts, clock faces, bells, bollards and mooring rings. */
import { type Col, type Geo, box, cone, cyl, dome, lathe, merge, rotateX, rotateZ, sphere, torus, translate } from '../../core/geo';
import { boxAt, lod, range } from './util';

/** Street lamp post (pole + lantern), base on y = 0. */
export function lampPost(h = 3.6, c: Col = 'blueDeep'): Geo {
  const near = [
    cyl(0.14, 0.12, 0.35, c, 6),
    cyl(0.06, 0.045, h - 0.2, c, 6),
    translate(cyl(0.12, 0.16, 0.36, 'butterLight', 6), 0, h - 0.5, 0),
    translate(cone(0.22, 0.22, c, 6), 0, h - 0.14, 0),
    translate(sphere(0.04, 'butter', 5, 3), 0, h + 0.1, 0),
  ];
  const far = [boxAt(0.1, h - 0.4, 0.1, c, 0, 0, 0), boxAt(0.3, 0.4, 0.3, 'butterLight', 0, h - 0.5, 0)];
  return lod(near, far);
}

/**
 * Clock face facing +z, centred on the origin (the face centre), `r` radius. Rim and dial always draw;
 * hands and hour blocks are near-only detail. `hour`/`minute` set the hand angles.
 */
export function clockFace(r: number, hour = 10, minute = 10, rim: Col = 'coral'): Geo {
  const face = (rr: number, d: number, c: Col, seg: number): Geo =>
    rotateX(cyl(rr, rr, d, c, seg), Math.PI / 2);
  const hand = (len: number, w: number, ang: number, dz: number): Geo =>
    translate(rotateZ(translate(box(w, len, 0.03, 'ink'), 0, -0.04, 0), -ang), 0, 0, dz);
  const blocks = range(12).map((i) => {
    const a = (i / 12) * Math.PI * 2;
    const big = i % 3 === 0;
    return translate(
      rotateZ(box(big ? 0.09 * r : 0.05 * r, big ? 0.2 * r : 0.13 * r, 0.03, 'cocoa'), -a),
      Math.sin(a) * r * 0.78,
      Math.cos(a) * r * 0.78,
      0.11,
    );
  });
  const near = [
    hand(r * 0.5, 0.07 * r, ((hour % 12) / 12) * Math.PI * 2, 0.12),
    hand(r * 0.75, 0.045 * r, (minute / 60) * Math.PI * 2, 0.14),
    translate(sphere(0.06 * r, 'butterDeep', 6, 4), 0, 0, 0.15),
    ...blocks,
  ];
  return merge(face(r, 0.08, rim, 12), translate(face(r * 0.88, 0.04, 'ivory', 12), 0, 0, 0.06), lod(near, []));
}

/** Church / belfry bell hanging from its crown at y = 0 (bell body below). */
export function bell(r: number, c: Col = 'butterDeep'): Geo {
  const body = lathe(
    [
      [r, -r * 1.3],
      [r * 0.92, -r * 1.15],
      [r * 0.62, -r * 0.6],
      [r * 0.55, -r * 0.1],
      [r * 0.05, 0],
    ],
    c,
    10,
  );
  return merge(body, translate(sphere(r * 0.15, 'cocoa', 6, 4), 0, -r * 1.25, 0));
}

/** Mooring bollard, base on y = 0. */
export function bollard(c: Col = 'cocoa'): Geo {
  return merge(cyl(0.16, 0.13, 0.42, c, 8), translate(dome(0.17, c, 8, 3), 0, 0.42, 0));
}

/** Vertical mooring ring on a wall face that faces +z; centred on its top fixing point. */
export function mooringRing(c: Col = 'ink'): Geo {
  return merge(
    translate(rotateX(torus(0.12, 0.022, c, 4, 10), Math.PI / 2), 0, -0.13, 0.04),
    boxAt(0.08, 0.08, 0.04, c, 0, -0.04, 0.01),
  );
}
