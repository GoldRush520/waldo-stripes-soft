/** Sports-ground equipment: goals, nets, courts, hoops, tables, hurdles, scoreboard, flags. */
import { type Geo, beam, cone as coneGeo, cyl, detail, merge, rotateY, sphere, torus, translate } from '../../core/geo';
import type { PropDef } from '../registry';
import { type V3, barX, boxAt, flagOnPole, lodPair, post, prop, revolve, rope, softBox } from './kit';

/** Rectangular net grid in the x/y plane between x0..x1 and y0..y1 at z, near-only. */
function netGrid(x0: number, x1: number, y0: number, y1: number, z: number, step: number): Geo {
  const nx = Math.max(1, Math.round((x1 - x0) / step));
  const ny = Math.max(1, Math.round((y1 - y0) / step));
  const vert = Array.from({ length: nx + 1 }, (_, i) => {
    const x = x0 + ((x1 - x0) * i) / nx;
    return beam([x, y0, z], [x, y1, z], 0.015, 'ivoryShade');
  });
  const hor = Array.from({ length: ny + 1 }, (_, j) => {
    const y = y0 + ((y1 - y0) * j) / ny;
    return beam([x0, y, z], [x1, y, z], 0.015, 'ivoryShade');
  });
  return detail(merge(vert, hor));
}

function goalBuild(): Geo {
  const w = 3;
  const h = 2;
  const dep = 1.1;
  const frame = merge(
    post(-w / 2, 0, h, 0.05, 'white', 6),
    post(w / 2, 0, h, 0.05, 'white', 6),
    translate(barX(w + 0.1, 0.05, 'white', 6), 0, h, 0),
  );
  const back = merge(
    beam([-w / 2, h, 0], [-w / 2, 0.03, -dep], 0.04, 'ivoryShade'),
    beam([w / 2, h, 0], [w / 2, 0.03, -dep], 0.04, 'ivoryShade'),
    beam([-w / 2, 0.03, -dep], [w / 2, 0.03, -dep], 0.04, 'ivoryShade'),
  );
  const net = merge(
    netGrid(-w / 2, w / 2, 0.05, h * 0.5, -dep * 0.9, 0.3),
    detail(merge(Array.from({ length: 11 }, (_, i) => beam([-w / 2 + i * 0.3, h, 0], [-w / 2 + i * 0.3, 0.05, -dep], 0.015, 'ivoryShade')))),
  );
  const far = boxAt(w, 0.05, dep, 'ivoryShade', 0, 0, -dep / 2);
  return merge(frame, lodPair(merge(back, net), far));
}

function line(a: readonly [number, number], b: readonly [number, number], wdt = 0.08): Geo {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const len = Math.hypot(dx, dz);
  return translate(rotateY(boxAt(wdt, 0.02, len, 'white', 0, 0, 0), Math.atan2(dx, dz)), (a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2);
}

function circleLine(r: number, seg = 24): Geo {
  return revolve(
    [
      [r + 0.04, 0],
      [r + 0.04, 0.02],
      [r - 0.04, 0.02],
      [r - 0.04, 0],
    ],
    'white',
    seg,
  );
}

function rectLines(w: number, d: number, cx = 0, cz = 0): Geo[] {
  const x0 = cx - w / 2;
  const x1 = cx + w / 2;
  const z0 = cz - d / 2;
  const z1 = cz + d / 2;
  return [line([x0, z0], [x1, z0]), line([x1, z0], [x1, z1]), line([x1, z1], [x0, z1]), line([x0, z1], [x0, z0])];
}

function pitchBuild(): Geo {
  const W = 20;
  const D = 12;
  return merge(
    rectLines(W, D),
    line([0, -D / 2], [0, D / 2]),
    circleLine(1.8),
    rectLines(3, 6, -W / 2 + 1.5),
    rectLines(3, 6, W / 2 - 1.5),
    boxAt(0.2, 0.04, 0.2, 'white', 0, 0, 0),
  );
}

function tennisCourtBuild(): Geo {
  const L = 23.77;
  const W = 10.97;
  const S = 8.23;
  return merge(
    rectLines(W, L),
    line([-S / 2, -L / 2], [-S / 2, L / 2]),
    line([S / 2, -L / 2], [S / 2, L / 2]),
    line([-S / 2, -6.4], [S / 2, -6.4]),
    line([-S / 2, 6.4], [S / 2, 6.4]),
    line([0, -6.4], [0, 6.4]),
  );
}

function tennisNetBuild(): Geo {
  const w = 12.8;
  const posts = [-1, 1].map((s) => post(s * w / 2, 0, 1.07, 0.04, 'slate', 6));
  const tape = boxAt(w, 0.06, 0.04, 'white', 0, 0.86, 0);
  const near = netGrid(-w / 2, w / 2, 0.05, 0.86, 0, 0.35);
  const far = boxAt(w, 0.8, 0.02, 'slate', 0, 0.06, 0);
  const cord = rope([-w / 2, 1.05, 0], [w / 2, 0.92, 0], 0.02, 'ivoryDeep');
  return merge(posts, tape, lodPair(near, far), cord, boxAt(0.05, 0.9, 0.03, 'white', 0, 0, 0));
}

function hoopBuild(): Geo {
  const pole = merge(post(0, -0.6, 3.05, 0.07, 'blueDeep', 8), boxAt(0.1, 0.1, 0.6, 'blueDeep', 0, 2.95, -0.3));
  const board = merge(boxAt(1.8, 1.05, 0.05, 'white', 0, 2.75, 0), detail(boxAt(0.59, 0.45, 0.06, 'coral', 0, 3.0, 0.005)));
  const rim = lodPair(translate(torus(0.23, 0.02, 'coral', 4, 14), 0, 3.05, 0.3), boxAt(0.46, 0.04, 0.46, 'coral', 0, 3.03, 0.3));
  const net = detail(
    merge(
      Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return beam([Math.sin(a) * 0.23, 3.05, 0.3 + Math.cos(a) * 0.23], [Math.sin(a) * 0.14, 2.65, 0.3 + Math.cos(a) * 0.14], 0.012, 'white');
      }),
    ),
  );
  const base = boxAt(0.6, 0.15, 0.6, 'stone', 0, 0, -0.6);
  return merge(pole, board, rim, net, base);
}

function volleyNet(w: number, h: number): Geo {
  const posts = [-1, 1].map((s) => post(s * w / 2, 0, h + 0.1, 0.05, 'butter', 6));
  const band = merge(boxAt(w, 0.07, 0.03, 'white', 0, h - 0.07, 0), boxAt(w, 0.05, 0.03, 'white', 0, h - 1.0, 0));
  const near = netGrid(-w / 2 + 0.1, w / 2 - 0.1, h - 0.95, h - 0.07, 0, 0.3);
  const far = boxAt(w - 0.2, 0.85, 0.02, 'slate', 0, h - 0.95, 0);
  const antennas = detail(merge([-1, 1].map((s) => beam([s * (w / 2 - 0.3), h - 1.0, 0], [s * (w / 2 - 0.3), h + 0.8, 0], 0.02, 'coral'))));
  const guys = detail(merge([-1, 1].map((s) => beam([s * w / 2, h, 0], [s * (w / 2 + 1.2), 0.02, 0], 0.015, 'ivoryDeep'))));
  return merge(posts, band, lodPair(near, far), antennas, guys);
}

function tableTennisBuild(): Geo {
  const top = merge(softBox(2.74, 0.04, 1.525, 0.01, 'blueDeep'), detail(merge(boxAt(2.74, 0.005, 0.02, 'white', 0, 0.04, 0), boxAt(0.02, 0.005, 1.525, 'white', -1.36, 0.04, 0), boxAt(0.02, 0.005, 1.525, 'white', 1.36, 0.04, 0))));
  const legs = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => boxAt(0.05, 0.72, 0.05, 'slate', sx * 1.2, 0, sz * 0.65)));
  const net = merge(boxAt(0.02, 0.15, 1.7, 'ivoryShade', 0, 0.76, 0), detail(boxAt(0.03, 0.02, 1.7, 'white', 0, 0.9, 0)));
  const bats = detail(merge([-1, 1].map((s) => translate(cyl(0.08, 0.08, 0.01, 'coral', 8), s * 1.0, 0.765, 0.3))));
  return merge(translate(top, 0, 0.72, 0), legs, net, bats);
}

function boulesBuild(): Geo {
  const spots: readonly V3[] = [
    [0.3, 0, 0.2],
    [-0.4, 0, 0.5],
    [0.6, 0, -0.3],
    [-0.2, 0, -0.6],
    [0.9, 0, 0.6],
    [-0.8, 0, -0.1],
  ];
  const near = spots.map((p, i) => translate(sphere(0.037, i < 3 ? 'slate' : 'stone', 5, 3), p[0], 0.037, p[2]));
  const far = spots.map((p, i) => boxAt(0.07, 0.07, 0.07, i < 3 ? 'slate' : 'stone', p[0], 0, p[2]));
  const jack = translate(sphere(0.015, 'coral', 4, 3), 0, 0.015, 0);
  return merge(lodPair(merge(near), merge(far.slice(0, 3))), detail(jack));
}

function hurdleBuild(): Geo {
  const feet = detail(merge([-1, 1].map((s) => boxAt(0.06, 0.04, 0.6, 'slate', s * 0.55, 0, -0.2))));
  const uprights = [-1, 1].map((s) => boxAt(0.05, 0.84, 0.05, 'slate', s * 0.55, 0, 0));
  const bar = boxAt(1.2, 0.12, 0.03, 'white', 0, 0.72, 0.02);
  const stripes = detail(merge([-0.3, 0.3].map((x) => boxAt(0.2, 0.12, 0.035, 'coral', x, 0.72, 0.02))));
  return merge(feet, uprights, bar, stripes);
}

function scoreboardBuild(): Geo {
  const posts = [-1, 1].map((s) => boxAt(0.12, 2.2, 0.12, 'timberDeep', s * 1.3, 0, 0));
  const board = boxAt(3.0, 1.4, 0.12, 'sageDeep', 0, 2.0, 0);
  const frame = boxAt(3.2, 0.12, 0.16, 'ivory', 0, 3.4, 0);
  const digits = detail(merge([-1.0, -0.55, 0.55, 1.0].map((x) => boxAt(0.34, 0.5, 0.04, 'ivory', x, 2.3, 0.07)), boxAt(0.12, 0.12, 0.04, 'ivory', 0, 2.55, 0.07), boxAt(2.4, 0.22, 0.04, 'butter', 0, 3.0, 0.07)));
  return merge(posts, board, frame, digits);
}

function cornerFlagBuild(): Geo {
  return lodPair(flagOnPole(1.5, 'coral'), merge(boxAt(0.03, 1.5, 0.03, 'timberDeep', 0, 0, 0), boxAt(0.3, 0.22, 0.02, 'coral', 0.16, 1.3, 0)));
}

function conesBuild(): Geo {
  const spots: ReadonlyArray<readonly [number, number]> = [[-1.5, 0], [-0.5, 0.2], [0.5, -0.2], [1.5, 0]];
  const cone = merge(revolve([[0.12, 0.02], [0.02, 0.28], [0.01, 0.28]], 'coral', 6), boxAt(0.24, 0.02, 0.24, 'coral', 0, 0, 0));
  const far = coneGeo(0.12, 0.28, 'coral', 4);
  return lodPair(merge(spots.map(([x, z]) => translate(cone, x, 0, z))), merge(spots.map(([x, z]) => translate(far, x, 0, z))));
}

export const SPORT_PROPS: readonly PropDef[] = [
  prop('sport.goal', goalBuild, [3.1, 1.2], 'stall', { tags: ['sports'] }),
  prop('sport.pitchlines', pitchBuild, [0, 0], 'stall', { origin: 'decal', tags: ['sports', 'decal'] }),
  prop('sport.cornerflag', cornerFlagBuild, [0, 0], 'clutter', { tint: 'coral', tags: ['sports', 'flag'] }),
  prop('sport.tenniscourt', tennisCourtBuild, [0, 0], 'stall', { origin: 'decal', tags: ['sports', 'decal'] }),
  prop('sport.tennisnet', tennisNetBuild, [12.8, 0.1], 'stall', { tags: ['sports'] }),
  prop('sport.basketballhoop', hoopBuild, [1.8, 1.0], 'furniture', { tags: ['sports'] }),
  prop('sport.volleyballnet', () => volleyNet(9.5, 2.43), [9.5, 0.1], 'stall', { tags: ['sports'] }),
  prop('beach.volleyballnet', () => merge(volleyNet(9.5, 2.43), detail(merge(rectLinesBeach()))), [9.5, 0.1], 'stall', { tags: ['beach', 'sports'] }),
  prop('sport.tabletennis', tableTennisBuild, [2.8, 1.6], 'furniture', { tags: ['sports'] }),
  prop('sport.boules', boulesBuild, [0, 0], 'clutter', { tags: ['sports', 'clutter'] }),
  prop('sport.hurdle', hurdleBuild, [1.2, 0.6], 'clutter', { tags: ['sports'] }),
  prop('sport.scoreboard', scoreboardBuild, [3.2, 0.2], 'furniture', { tags: ['sports'] }),
  prop('sport.cones', conesBuild, [0, 0], 'clutter', { tags: ['sports', 'clutter'] }),
];

function rectLinesBeach(): Geo[] {
  return [
    beam([-8, 0.02, -4.5], [8, 0.02, -4.5], 0.03, 'blue'),
    beam([8, 0.02, -4.5], [8, 0.02, 4.5], 0.03, 'blue'),
    beam([8, 0.02, 4.5], [-8, 0.02, 4.5], 0.03, 'blue'),
    beam([-8, 0.02, 4.5], [-8, 0.02, -4.5], 0.03, 'blue'),
  ];
}
