/** Small open boats: rowboat (+ oar), dinghy with outboard, kayak (+ paddle), canoe, toy sailboat. */
import {
  type Geo,
  beam,
  box,
  cyl,
  merge,
  profile,
  rotateY,
  rotateZ,
  scale,
  sway,
  tintable,
  torus,
  translate,
} from '../../core/geo';
import { FAR, type Q, type V3, boxAt, cylX, nearOnly, sg } from './kit';
import { type HullSpec, beamAt, floorAt, hull, hullDeck, sheerAt } from './hull';

export const ROW_HULL: HullSpec = {
  length: 3.4,
  beam: 1.2,
  draft: 0.26,
  freeboard: 0.38,
  bowRise: 0.14,
  sternRise: 0.05,
  transom: 0.55,
  floor: -0.12,
  shell: 0.045,
};

/** Thwart (bench) across the hull at z with its top at y. */
export function thwart(s: HullSpec, z: number, y: number, depth = 0.24): Geo {
  const half = beamAt(s, z, y) - (s.shell ?? 0.05) * 0.5;
  return boxAt(half * 2, 0.04, depth, 'timber', 0, y - 0.04, z);
}

function oarlock(x: number, y: number, z: number): Geo {
  return merge(
    beam([x, y - 0.02, z - 0.04], [x, y + 0.07, z - 0.04], 0.018, 'slate'),
    beam([x, y - 0.02, z + 0.04], [x, y + 0.07, z + 0.04], 0.018, 'slate'),
    boxAt(0.03, 0.02, 0.1, 'slate', x, y - 0.02, z),
  );
}

const ROW_OARLOCK_Z = 0.35;

/** Oarlock pivots of the rowboat (where `boat.oar` origins go). */
export const ROWBOAT_OARLOCKS: readonly V3[] = [-1, 1].map((sx): V3 => {
  const y = sheerAt(ROW_HULL, ROW_OARLOCK_Z) + 0.05;
  return [sx * beamAt(ROW_HULL, ROW_OARLOCK_Z, y - 0.05), y, ROW_OARLOCK_Z];
});

export function rowboat(q: Q): Geo {
  return merge(
    hull(q, ROW_HULL),
    thwart(ROW_HULL, -1.0, 0.16, 0.36),
    thwart(ROW_HULL, 0.05, 0.16),
    thwart(ROW_HULL, 0.85, 0.16),
    nearOnly(q, () => [
      ...ROWBOAT_OARLOCKS.map(([x, y, z]) => oarlock(x, y, z)),
      boxAt(0.5, 0.025, 0.9, 'timberDeep', 0, floorAt(ROW_HULL, 0) + 0.01, -0.3),
      translate(torus(0.1, 0.02, 'butterDeep', 4, 10), 0, 0.17, 1.2),
      beam([-0.3, 0.22, -1.25], [0.3, 0.22, -1.25], 0.05, 'timber'),
    ]),
  );
}

/** One oar. Origin at the oarlock pivot, shaft along x, blade toward +x, handle toward -x. */
export function oar(q: Q): Geo {
  const blade = q.far
    ? [tintable(boxAt(0.5, 0.15, 0.025, 'coral', 1.5, -0.075, 0))]
    : [boxAt(0.32, 0.15, 0.025, 'ivory', 1.41, -0.075, 0), tintable(boxAt(0.18, 0.15, 0.025, 'coral', 1.66, -0.075, 0))];
  return merge(
    cylX(0.022, 2.2, 'timber', sg(q, 6, 4), -0.95, 0, 0),
    blade,
    nearOnly(q, () => [
      cylX(0.03, 0.12, 'ivoryDeep', 6, -0.06, 0, 0),
      cylX(0.028, 0.16, 'cocoa', 6, -0.98, 0, 0),
    ]),
  );
}

/** Double-bladed kayak paddle, origin at the centre grip, shaft along x. */
export function paddle(q: Q): Geo {
  const bladeAt = (x: number): Geo => tintable(boxAt(0.42, 0.02, 0.17, 'coral', x, -0.01, 0));
  return merge(
    q.far ? beam([-1.0, 0, 0], [1.0, 0, 0], 0.03, 'timberDeep') : cylX(0.016, 2.0, 'timberDeep', 6, -1.0, 0, 0),
    bladeAt(-1.0),
    bladeAt(1.0),
    nearOnly(q, () => [-0.55, 0.55].map((x) => translate(rotateZ(torus(0.045, 0.012, 'ivoryDeep', 3, 8), Math.PI / 2), x, 0, 0))),
  );
}

export const DINGHY_HULL: HullSpec = {
  length: 2.6,
  beam: 1.3,
  draft: 0.24,
  freeboard: 0.36,
  bowRise: 0.1,
  transom: 0.8,
  floor: -0.1,
  shell: 0.045,
  hullCol: 'blue',
  trimCol: 'ivory',
};

function outboard(q: Q, z: number): Geo {
  const top = sheerAt(DINGHY_HULL, -1.3);
  return merge(
    boxAt(0.2, 0.08, 0.16, 'slate', 0, top - 0.06, z),
    boxAt(0.1, 0.62, 0.1, 'ivoryDeep', 0, top - 0.6, z - 0.12),
    q.far
      ? boxAt(0.28, 0.32, 0.36, 'ivory', 0, top + 0.02, z - 0.14)
      : translate(scale(cyl(0.18, 0.16, 0.32, 'ivory', 10), 0.8, 1, 1), 0, top + 0.02, z - 0.14),
    boxAt(0.29, 0.06, 0.37, 'coralDeep', 0, top + 0.12, z - 0.14),
    nearOnly(q, () => [
      beam([0, top + 0.12, z], [0, top + 0.2, z + 0.5], 0.035, 'cocoa'),
      boxAt(0.06, 0.1, 0.22, 'slate', 0, top - 0.68, z - 0.14),
    ]),
  );
}

export function dinghy(q: Q): Geo {
  return merge(
    hull(q, DINGHY_HULL),
    thwart(DINGHY_HULL, -0.8, 0.15, 0.4),
    thwart(DINGHY_HULL, 0.2, 0.15),
    outboard(q, -1.32),
    nearOnly(q, () => [
      boxAt(0.45, 0.025, 0.8, 'timberDeep', 0, floorAt(DINGHY_HULL, 0) + 0.01, -0.2),
      translate(torus(0.09, 0.02, 'butterDeep', 4, 10), 0, 0.15, 0.85),
    ]),
  );
}

export const KAYAK_HULL: HullSpec = {
  length: 3.6,
  beam: 0.62,
  draft: 0.15,
  freeboard: 0.18,
  bowRise: 0.06,
  sternRise: 0.05,
  transom: 0.02,
  bowLen: 0.45,
  floor: -0.07,
  shell: 0.03,
  trimH: 0.04,
  hullCol: 'butter',
  trimCol: 'coral',
};

export function kayak(q: Q): Geo {
  const y = 0.165;
  return merge(
    hull(q, KAYAK_HULL),
    hullDeck(q, KAYAK_HULL, 0, 0.38, y, 'ivory'),
    hullDeck(q, KAYAK_HULL, 0.6, 1, y, 'ivory'),
    translate(scale(torus(1, 0.04, 'coralDeep', 4, sg(q, 12, 6)), 0.25, 1, 0.42), 0, y + 0.02, -0.04),
    nearOnly(q, () => [
      boxAt(0.32, 0.04, 0.35, 'blueDeep', 0, floorAt(KAYAK_HULL, -0.1), -0.1),
      boxAt(0.3, 0.12, 0.04, 'blueDeep', 0, floorAt(KAYAK_HULL, -0.3), -0.3),
      beam([-0.18, y + 0.01, 0.6], [0.18, y + 0.01, 1.2], 0.012, 'cocoa'),
      beam([0.18, y + 0.01, 0.6], [-0.18, y + 0.01, 1.2], 0.012, 'cocoa'),
    ]),
  );
}

export const CANOE_HULL: HullSpec = {
  length: 4.8,
  beam: 0.86,
  draft: 0.2,
  freeboard: 0.3,
  bowRise: 0.16,
  sternRise: 0.16,
  transom: 0.02,
  bowLen: 0.42,
  floor: -0.08,
  shell: 0.035,
  hullCol: 'sage',
  trimCol: 'timberDeep',
  innerCol: 'timber',
  floorCol: 'timberDeep',
};

export function canoe(q: Q): Geo {
  return merge(
    hull(q, CANOE_HULL),
    thwart(CANOE_HULL, 1.55, 0.12, 0.22),
    thwart(CANOE_HULL, -1.7, 0.12, 0.22),
    nearOnly(q, () => [
      thwart(CANOE_HULL, 0, 0.26, 0.08),
      hullDeck(q, CANOE_HULL, 0, 0.05, sheerAt(CANOE_HULL, -2.3) - 0.06, 'timberDeep'),
      hullDeck(q, CANOE_HULL, 0.95, 1, sheerAt(CANOE_HULL, 2.3) - 0.06, 'timberDeep'),
      translate(torus(0.1, 0.018, 'butterDeep', 3, 8), 0, 0.02, 1.95),
      ...[-0.9, 0.8].map((z) => thwart(CANOE_HULL, z, 0.27, 0.05)),
    ]),
  );
}

export const TOY_HULL: HullSpec = {
  length: 0.4,
  beam: 0.14,
  draft: 0.035,
  freeboard: 0.05,
  bowRise: 0.015,
  transom: 0.5,
  floor: 0.0,
  shell: 0.008,
  trimH: 0.012,
  hullCol: 'blue',
};

function toySail(): Geo {
  const sail = tintable(
    profile(
      [
        [0, 0.08],
        [0, 0.42],
        [0.16, 0.08],
      ],
      0.006,
      'coral',
    ),
  );
  return sway(rotateY(sail, Math.PI / 2), (_x, y) => (y - 0.08) * 0.6);
}

export function toySailboat(q: Q): Geo {
  if (q.far) {
    return merge(
      rotateY(
        tintable(
          profile(
          [
            [-0.2, 0.05],
            [-0.19, -0.03],
            [0.12, -0.03],
            [0.21, 0.07],
          ],
            0.12,
            'blue',
          ),
        ),
        -Math.PI / 2,
      ),
      toySail(),
      box(0.012, 0.44, 0.012, 'timberDeep'),
    );
  }
  return merge(hull(FAR, TOY_HULL), toySail(), cyl(0.006, 0.006, 0.45, 'timberDeep', 4), boxAt(0.05, 0.03, 0.006, 'butter', 0.025, 0.42, 0.02));
}

/** Rowboat turned keel-up on two trestles for repainting (rests on land, y = 0). */
export function rowboatUpturned(q: Q): Geo {
  const lift = 0.55 + (ROW_HULL.freeboard ?? 0);
  const trestle = (z: number): Geo[] =>
    q.far
      ? [boxAt(1.3, 0.55, 0.12, 'timberDeep', 0, 0, z)]
      : [
    ...[-1, 1].flatMap((sx) => [
      beam([sx * 0.62, 0, z - 0.2], [sx * 0.55, 0.55, z], 0.05, 'timberDeep'),
      beam([sx * 0.62, 0, z + 0.2], [sx * 0.55, 0.55, z], 0.05, 'timberDeep'),
    ]),
          boxAt(1.3, 0.06, 0.1, 'timber', 0, 0.5, z),
        ];
  return merge(
    translate(rotateZ(merge(hull(q, ROW_HULL), thwart(ROW_HULL, 0.05, 0.16)), Math.PI), 0, lift, 0),
    trestle(-0.9),
    trestle(0.9),
    nearOnly(q, () => [
      translate(cyl(0.08, 0.07, 0.14, 'coralDeep', 6), 0.4, 0, 1.5),
      beam([0.4, 0.14, 1.5], [0.55, 0.45, 1.5], 0.015, 'timberDeep'),
    ]),
  );
}
