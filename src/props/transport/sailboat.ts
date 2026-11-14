/** Sloop-rigged day sailer with a tint-masked striped mainsail and a small cabin. */
import { type Col, type Geo, bakeTint, beam, merge, profile, rotateY, scale, sway, tintable, translate } from '../../core/geo';
import { type Q, type V2, boxAt, cylZ, nearOnly, post, sg, soft } from './kit';
import { type HullSpec, hull, hullDeck } from './hull';

export const SAIL_HULL: HullSpec = {
  length: 5.5,
  beam: 1.9,
  draft: 0.32,
  freeboard: 0.5,
  bowRise: 0.15,
  transom: 0.6,
  floor: 0.02,
  shell: 0.05,
  hullCol: 'ivory',
  trimCol: 'blueDeep',
  innerCol: 'ivoryShade',
  tint: false,
};

const MAST_Z = 0.9;
const DECK_Y = 0.47;
const BOOM_Y = 1.35;
const LUFF_TOP = 6.6;
const FOOT = 2.4;

/** Cockpit bench top height and x offset (default 5.5 m boat). */
export const SAILBOAT_BENCH = { y: 0.3, x: 0.6, z: [-0.4, -1.1] } as const;

export interface SailboatOptions {
  /** overall hull length in metres (default 5.5); the whole boat scales with it */
  readonly length?: number;
  /** bake this colour into the sail stripes; omit to leave them tint-masked */
  readonly sailTint?: Col;
  /** sails stowed: furled sail on the boom instead of the striped mainsail and jib */
  readonly furled?: boolean;
}

function leechX(y: number): number {
  const k = (y - BOOM_Y) / (LUFF_TOP - BOOM_Y);
  return FOOT * (1 - k) + 0.12 * k;
}

/** Mainsail as alternating horizontal strips (tint-masked / ivory) in the yz plane, aft of the mast. */
function mainsail(q: Q): Geo {
  const n = q.far ? 3 : 5;
  const h = (LUFF_TOP - BOOM_Y - 0.05) / n;
  const strips = Array.from({ length: n }, (_, i) => {
    const ya = BOOM_Y + 0.05 + i * h;
    const yb = ya + h;
    const pts: V2[] = [
      [0, ya],
      [leechX(ya), ya],
      [leechX(yb), yb],
      [0, yb],
    ];
    const p = profile(pts, 0.025, i % 2 === 0 ? 'coral' : 'ivory');
    return i % 2 === 0 ? tintable(p) : p;
  });
  const sail = translate(rotateY(merge(strips), Math.PI / 2), 0, 0, MAST_Z - 0.07);
  return sway(sail, (_x, _y, z) => Math.min(1, Math.max(0, (MAST_Z - z) / FOOT)) * 0.25);
}

function jib(): Geo {
  const p = profile(
    [
      [0.05, 0.85],
      [1.75, 0.62],
      [0.05, 5.7],
    ],
    0.02,
    'ivory',
  );
  const g = translate(rotateY(p, -Math.PI / 2), 0.04, 0, MAST_Z + 0.08);
  return sway(g, (_x, _y, z) => Math.min(0.2, Math.max(0, z - MAST_Z) * 0.1));
}

function cockpit(q: Q): Geo[] {
  return [
    ...[-1, 1].map((sx) => boxAt(0.32, 0.3, 1.4, 'timber', sx * SAILBOAT_BENCH.x, 0.0, -0.75)),
    ...nearOnly(q, () => [
      boxAt(0.04, 0.02, 1.1, 'timberDeep', 0, 0.03, -1.0),
      beam([0, 0.6, -2.4], [0, 0.55, -1.6], 0.05, 'timberDeep'),
    ]),
  ];
}

function rigging(): Geo[] {
  const top: [number, number, number] = [0, LUFF_TOP, MAST_Z];
  return [
    beam(top, [0, 0.65, 2.7], 0.012, 'ivoryDeep'),
    beam(top, [0.85, DECK_Y, MAST_Z - 0.4], 0.012, 'ivoryDeep'),
    beam(top, [-0.85, DECK_Y, MAST_Z - 0.4], 0.012, 'ivoryDeep'),
    beam(top, [0, 0.62, -2.7], 0.012, 'ivoryDeep'),
    ...[-1, 1].flatMap((sx) => [
      beam([sx * 0.7, 0.55, 1.7], [sx * 0.5, 0.85, 2.45], 0.02, 'slate'),
      beam([sx * 0.78, 0.55, 1.2], [sx * 0.78, 0.85, 1.2], 0.02, 'slate'),
      beam([sx * 0.78, 0.85, 1.2], [sx * 0.62, 0.85, 2.0], 0.02, 'slate'),
    ]),
  ];
}

/** Parametric sailboat. Hull ivory with deep blue trim; sail stripes tint-masked unless sailTint. */
export function sailboat(q: Q, o: SailboatOptions = {}): Geo {
  const sail = o.furled
    ? tintable(cylZ(0.11, FOOT - 0.3, 'coral', sg(q, 8, 4), 0, BOOM_Y + 0.1, MAST_Z - FOOT / 2 - 0.1))
    : merge(mainsail(q), jib());
  const sails = o.sailTint ? bakeTint(sail, o.sailTint) : sail;
  const cabinTop = DECK_Y - 0.12 + 0.45;
  const g = merge(
    hull(q, SAIL_HULL),
    hullDeck(q, SAIL_HULL, 0.5, 1, DECK_Y, 'timber'),
    translate(soft(q, 1.3, 0.45, 1.4, 0.12, 'ivory'), 0, DECK_Y - 0.12, 0.75),
    cockpit(q),
    post(q, 0.06, DECK_Y, LUFF_TOP + 0.2, 'timberDeep', 0, MAST_Z),
    cylZ(0.045, FOOT + 0.1, 'timberDeep', sg(q, 6, 4), 0, BOOM_Y, MAST_Z - FOOT / 2),
    sails,
    nearOnly(q, () => [
      ...[-1, 1].map((sx) => boxAt(0.02, 0.12, 0.8, 'blueDeep', sx * 0.66, DECK_Y + 0.08, 0.75)),
      boxAt(0.6, 0.04, 0.5, 'ivoryShade', 0, cabinTop, 0.6),
      boxAt(0.02, 0.2, 0.3, 'butter', 0, LUFF_TOP + 0.05, MAST_Z - 0.2),
      ...rigging(),
    ]),
  );
  const k = (o.length ?? SAIL_HULL.length) / SAIL_HULL.length;
  return k === 1 ? g : scale(g, k);
}
