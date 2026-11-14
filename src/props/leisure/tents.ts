/** Big-top circus tent, small round tents and the fortune-teller's tent. */
import { type Col, type Geo, beam, cone, cyl, detail, merge, rotateY, sphere, sway, tintable, translate } from '../../core/geo';
import type { PropDef } from '../registry';
import { boxAt, flagOnPole, lodPair, pennant, prop, revolve, stripedLod, stripedRevolve, wallProfile } from './kit';

type Profile = ReadonlyArray<readonly [number, number]>;

/** Striped wall/roof ring of `n` gores leaving `gap` gores open around +z (phi = 0). */
function gappedRing(profile: Profile, n: number, gap: number, a: Col, b: Col, seg = 1): Geo {
  const step = (Math.PI * 2) / n;
  const start = (gap / 2) * step;
  return merge(
    Array.from({ length: n - gap }, (_, i) => {
      const g = revolve(profile, i % 2 === 0 ? a : b, seg, start + i * step, step);
      return i % 2 === 0 ? tintable(g) : g;
    }),
  );
}

const BT_R = 9;
const BT_WALL = 3.2;
const BT_PEAK = 10;

function bigTopRoof(): Geo {
  const roof: Profile = [
    [0.01, BT_PEAK - 0.3],
    [BT_R + 0.05, BT_WALL - 0.1],
    [BT_R + 0.05, BT_WALL],
    [5.2, 6.0],
    [2.5, 8.1],
    [0.01, BT_PEAK],
  ];
  const nearRoof = stripedRevolve(roof, 24, 2, 'coral', 'ivory');
  const farRoof = stripedRevolve(roof, 24, 1, 'coral', 'ivory');
  return lodPair(nearRoof, farRoof);
}

function bigTopTrim(): Geo {
  const flags = Array.from({ length: 36 }, (_, i) => {
    const a = (i / 36) * Math.PI * 2;
    const col: Col = i % 3 === 0 ? 'butter' : i % 3 === 1 ? 'blue' : 'sage';
    return rotateY(translate(pennant(col, 0.45, 0.55), 0, BT_WALL - 0.05, BT_R + 0.08), a);
  });
  const ropes = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2 + 0.13;
    const s = Math.sin(a);
    const c = Math.cos(a);
    return merge(
      beam([s * BT_R, BT_WALL - 0.1, c * BT_R], [s * (BT_R + 2.2), 0.05, c * (BT_R + 2.2)], 0.03, 'timber'),
      boxAt(0.08, 0.25, 0.08, 'timberDeep', s * (BT_R + 2.25), 0, c * (BT_R + 2.25)),
    );
  });
  return detail(merge(flags, ropes));
}

function bigTopPoles(): Geo {
  const king = cyl(0.18, 0.14, BT_PEAK + 1.6, 'ivory', 8);
  const flag = translate(flagOnPole(1.4, 'coral'), 0, BT_PEAK + 1.6, 0);
  const peakFlags = detail(
    merge([-1, 1].map((s) => translate(sway(beam([0, 0, 0], [s * 1.8, -0.6, 0], 0.04, 'butter'), 0.4), 0, BT_PEAK + 1.2, 0))),
  );
  return merge(king, flag, peakFlags);
}

function bigTopInterior(): Geo {
  const ring = disc(4.5, 'sand');
  const curb = stripedRevolve(wallProfile(4.6, 0.45, 0.25), 16, 1, 'blue', 'ivory');
  const tiers = [0, 1, 2].map((k) =>
    revolve(
      [
        [6.0 + k * 0.8, 0.45 * (k + 1)],
        [6.0 + k * 0.8, 0],
        [8.7, 0],
        [8.7, 0.45 * (k + 1)],
        [6.0 + k * 0.8, 0.45 * (k + 1)],
      ],
      k % 2 === 0 ? 'clay' : 'clayLight',
      18,
    ),
  );
  return merge(ring, curb, detail(merge(tiers)));
}

function disc(r: number, col: Col): Geo {
  return revolve(
    [
      [r, 0.02],
      [0.01, 0.02],
    ],
    col,
    16,
  );
}

function bigTopEntrance(): Geo {
  const flaps = [-1, 1].map((s) =>
    tintable(rotateY(boxAt(0.9, BT_WALL - 0.2, 0.08, 'coral', s * 2.5, 0, BT_R - 0.2), s * 0.15)),
  );
  const arch = merge(
    boxAt(0.2, 3.6, 0.2, 'butter', -2.2, 0, BT_R + 0.3),
    boxAt(0.2, 3.6, 0.2, 'butter', 2.2, 0, BT_R + 0.3),
    boxAt(4.8, 0.7, 0.16, 'butter', 0, 3.6, BT_R + 0.3),
  );
  const letters = detail(merge(Array.from({ length: 6 }, (_, i) => boxAt(0.4, 0.4, 0.06, 'coral', -1.5 + i * 0.6, 3.75, BT_R + 0.42))));
  return merge(flaps, arch, letters);
}

function bigTopBuild(): Geo {
  const walls = gappedRing(wallProfile(BT_R, BT_WALL, 0.08), 24, 2, 'coral', 'ivory');
  return merge(walls, bigTopRoof(), bigTopTrim(), bigTopPoles(), bigTopInterior(), bigTopEntrance());
}

function roundTentBuild(): Geo {
  const walls = lodPair(
    gappedRing(wallProfile(1.6, 1.5, 0.05), 12, 2, 'coral', 'ivory', 3),
    gappedRing(wallProfile(1.6, 1.5, 0.05), 12, 2, 'coral', 'ivory', 1),
  );
  const roofProfile: Profile = [
    [0.01, 1.4],
    [1.75, -0.08],
    [1.75, 0],
    [0.9, 0.95],
    [0.01, 1.7],
  ];
  const roof = translate(stripedLod(roofProfile, 12, 3, 1, 'coral', 'ivory'), 0, 1.5, 0);
  const pole = cyl(0.05, 0.05, 3.5, 'ivory', 6);
  const flag = translate(flagOnPole(0.6, 'butter'), 0, 3.4, 0);
  const flaps = detail(merge([-1, 1].map((s) => tintable(boxAt(0.35, 1.4, 0.04, 'coral', s * 0.55, 0, 1.6)))));
  const scallops = detail(
    merge(Array.from({ length: 12 }, (_, i) => rotateY(translate(pennant('butter', 0.35, 0.2), 0, 1.5, 1.78), (i / 12) * Math.PI * 2))),
  );
  return merge(walls, roof, pole, flag, flaps, scallops);
}

function fortuneBuild(): Geo {
  const walls = gappedRing(wallProfile(1.9, 1.9, 0.06), 6, 1, 'blue', 'blueDeep');
  const tassels = detail(
    merge(
      Array.from({ length: 18 }, (_, i) =>
        rotateY(translate(pennant(i % 2 === 0 ? 'butter' : 'coral', 0.4, 0.22), 0, 1.9, 2.0), (i / 18) * Math.PI * 2),
      ),
    ),
  );
  const rug = detail(boxAt(1.2, 0.02, 0.9, 'coralDeep', 0, 0, 0.3));
  const stool = detail(merge(cyl(0.18, 0.18, 0.45, 'timber', 8), translate(cyl(0.2, 0.2, 0.05, 'butter', 8), 0, 0.45, 0)));
  const roof = translate(
    stripedRevolve(
      [
        [0.01, 1.3],
        [2.1, -0.08],
        [2.1, 0],
        [0.01, 1.8],
      ],
      6,
      1,
      'blue',
      'butter',
      Math.PI / 6,
    ),
    0,
    1.9,
    0,
  );
  const finial = merge(
    lodPair(translate(sphere(0.18, 'butter', 6, 4), 0, 3.85, 0), translate(cone(0.18, 0.3, 'butter', 5), 0, 3.7, 0)),
    translate(cone(0.06, 0.4, 'butterDeep', 5), 0, 3.95, 0),
  );
  const stars = detail(
    merge(Array.from({ length: 5 }, (_, i) => rotateY(boxAt(0.18, 0.18, 0.04, 'butterLight', 0, 0.9 + (i % 2) * 0.5, 1.92), 0.8 + i * 0.9))),
  );
  const table = merge(
    lodPair(cyl(0.35, 0.35, 0.72, 'coralDeep', 10), cyl(0.35, 0.35, 0.72, 'coralDeep', 5)),
    detail(translate(sphere(0.16, 'blueLight', 8, 5), 0, 0.88, 0)),
  );
  const beads = detail(merge(Array.from({ length: 7 }, (_, i) => beam([-0.6 + i * 0.2, 1.85, 1.75], [-0.6 + i * 0.2, 0.6, 1.75], 0.025, 'butter'))));
  const sign = merge(boxAt(0.08, 1.4, 0.08, 'timber', 1.4, 0, 2.3), boxAt(0.9, 0.5, 0.06, 'butter', 1.4, 1.2, 2.34));
  return merge(walls, roof, finial, stars, translate(table, 0, 0, 0.4), beads, sign, tassels, rug, translate(stool, 0, 0, -0.35));
}

export const TENT_PROPS: readonly PropDef[] = [
  prop('tent.bigtop', bigTopBuild, [18.2, 18.2], 'landmark', { tint: 'coral', tags: ['funfair', 'landmark', 'tent'] }),
  prop('tent.round', roundTentBuild, [3.3, 3.3], 'stall', { tint: 'coral', tags: ['funfair', 'tent'] }),
  prop('tent.fortune', fortuneBuild, [4.0, 4.0], 'stall', { tags: ['funfair', 'tent', 'stall'] }),
];
