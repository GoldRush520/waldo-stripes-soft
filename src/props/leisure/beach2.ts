/** Beach huts, sandcastles, sand sculptures, rock pool and an upturned rowboat. */
import { type Col, type Geo, bakeTint, beam, blob, cone, detail, dome, gable, merge, profile, rotateX, rotateY, rotateZ, scale, sphere, sway, tintable, translate } from '../../core/geo';
import type { PropDef } from '../registry';
import { boxAt, lodPair, pennant, prop, revolve, stripesX } from './kit';

const HUT_W = 1.8;
const HUT_D = 2.0;
const HUT_H = 2.2;

function hutWalls(): Geo {
  const core = boxAt(HUT_W, HUT_H, HUT_D, 'ivory', 0, 0.3, 0);
  const front = translate(stripesX(HUT_W, HUT_H, 0.03, 5, 'coral', 'ivory'), 0, 0.3, HUT_D / 2 + 0.015);
  const side = stripesX(HUT_D, HUT_H, 0.03, 6, 'coral', 'ivory');
  const sides = [-1, 1].map((s) => translate(rotateY(side, Math.PI / 2), s * (HUT_W / 2 + 0.015), 0.3, 0));
  const farSides = [-1, 1].map((s) => tintable(boxAt(0.03, HUT_H, HUT_D, 'coral', s * (HUT_W / 2 + 0.015), 0.3, 0)));
  return merge(core, front, lodPair(merge(sides), merge(farSides)));
}

function hutBuild(): Geo {
  const roof = translate(gable(HUT_W + 0.4, 0.8, HUT_D + 0.3, 'clay'), 0, HUT_H + 0.3, 0);
  const ridge = detail(boxAt(0.1, 0.08, HUT_D + 0.35, 'clayDeep', 0, HUT_H + 1.08, 0));
  const door = tintable(boxAt(0.8, 1.9, 0.04, 'blue', 0, 0.32, HUT_D / 2 + 0.04));
  const deck = merge(boxAt(HUT_W + 0.4, 0.3, HUT_D + 0.6, 'timber', 0, 0, 0.3), boxAt(0.9, 0.15, 0.3, 'timberDeep', 0, 0, HUT_D / 2 + 0.75));
  const planks = detail(merge(Array.from({ length: 6 }, (_, i) => boxAt(HUT_W + 0.38, 0.01, 0.03, 'timberDeep', 0, 0.3, HUT_D / 2 + 0.1 + i * 0.1 - 0.25))));
  const shingles = detail(
    merge(
      [-1, 1].flatMap((s) =>
        [0.2, 0.45].map((t) => translate(rotateZ(boxAt(0.05, 0.03, HUT_D + 0.32, 'clayDeep', 0, 0, 0), s * -0.67), s * (HUT_W / 2 + 0.2) * (1 - t), HUT_H + 0.3 + 0.8 * t + 0.02, 0)),
      ),
    ),
  );
  const shutters = detail(merge([-1, 1].map((s) => merge(boxAt(0.04, 0.5, 0.6, 'ivory', s * (HUT_W / 2 + 0.04), 1.4, 0), boxAt(0.05, 0.4, 0.45, 'blueLight', s * (HUT_W / 2 + 0.045), 1.45, 0)))));
  const trim = detail(
    merge(
      boxAt(0.9, 0.06, 0.06, 'ivory', 0, 2.24, HUT_D / 2 + 0.07),
      boxAt(0.05, 0.05, 0.06, 'butterDeep', 0.3, 1.25, HUT_D / 2 + 0.08),
      [-1, 1].map((s) => boxAt(0.06, HUT_H, 0.06, 'ivory', s * (HUT_W / 2 + 0.02), 0.3, HUT_D / 2 + 0.02)),
      [0, 1, 2, 3].map((i) => translate(pennant(i % 2 === 0 ? 'butter' : 'sage', 0.2, 0.22), -0.6 + i * 0.4, HUT_H + 0.28, HUT_D / 2 + 0.2)),
    ),
  );
  return merge(hutWalls(), roof, ridge, door, deck, trim, planks, shingles, shutters);
}

const HUT_COLS: readonly Col[] = ['coral', 'blue', 'butter', 'sage', 'clayDeep'];

function hutRowBuild(): Geo {
  const hut = hutBuild();
  return merge(HUT_COLS.map((c, i) => translate(bakeTint(hut, c), (i - 2) * 2.5, 0, 0)));
}

function turret(r: number, h: number, crenel: boolean, seg = 6): Geo {
  const body = revolve([[r * 1.15, 0], [r, h], [0.01, h]], 'sand', seg);
  const tops = crenel
    ? detail(merge(Array.from({ length: 4 }, (_, i) => rotateY(boxAt(r * 0.5, r * 0.35, r * 0.3, 'sand', 0, h, r * 0.85), (i / 4) * Math.PI * 2))))
    : [];
  return merge(body, tops);
}

function castleFlag(h: number): Geo {
  const stick = beam([0, 0, 0], [0, h, 0], 0.012, 'timber');
  const flag = tintable(sway(boxAt(0.14, 0.09, 0.01, 'coral', 0.07, h - 0.1, 0), (x) => Math.min(1, x / 0.14)));
  return detail(merge(stick, flag));
}

function smallCastleBuild(): Geo {
  const near = merge(turret(0.13, 0.22, true), translate(turret(0.09, 0.15, false), 0.24, 0, 0.1), translate(turret(0.09, 0.15, false), -0.2, 0, 0.14));
  const far = merge(turret(0.13, 0.22, false, 4), translate(cone(0.1, 0.15, 'sand', 4), 0.24, 0, 0.1), translate(cone(0.1, 0.15, 'sand', 4), -0.2, 0, 0.14));
  return merge(lodPair(near, far), translate(castleFlag(0.25), 0, 0.22, 0));
}

function largeCastleBuild(): Geo {
  const moundP: Array<readonly [number, number]> = [[1.1, 0], [0.95, 0.18], [0.01, 0.2]];
  const corners = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => [sx * 0.55, sz * 0.55] as const));
  const near = merge(
    revolve(moundP, 'sand', 8),
    corners.map(([x, z]) => translate(turret(0.16, 0.45, false), x, 0.18, z)),
    translate(turret(0.24, 0.75, true), 0, 0.18, 0),
  );
  const far = merge(
    revolve(moundP, 'sand', 6),
    corners.map(([x, z]) => translate(cone(0.18, 0.5, 'sand', 4), x, 0.18, z)),
    translate(cone(0.28, 0.85, 'sand', 4), 0, 0.18, 0),
  );
  const walls = detail(merge([
    boxAt(1.1, 0.28, 0.14, 'sand', 0, 0.18, 0.55),
    boxAt(1.1, 0.28, 0.14, 'sand', 0, 0.18, -0.55),
    boxAt(0.14, 0.28, 1.1, 'sand', 0.55, 0.18, 0),
    boxAt(0.14, 0.28, 1.1, 'sand', -0.55, 0.18, 0),
  ]));
  const flags = translate(castleFlag(0.35), 0, 0.93, 0);
  return merge(lodPair(near, far), walls, flags);
}

function collapsedCastleBuild(): Geo {
  const lumps = [
    [0, 0, 0, 0.35, 0.16, 0.3],
    [0.25, 0, 0.15, 0.2, 0.1, 0.18],
    [-0.2, 0, 0.2, 0.18, 0.08, 0.22],
    [0.1, 0, -0.25, 0.22, 0.12, 0.15],
  ] as const;
  const near = lumps.map(([x, , z, rx, ry, rz]) => translate(scale(dome(1, 'sand', 6, 2), rx, ry, rz), x, 0, z));
  const far = lumps.slice(0, 3).map(([x, , z, rx, ry, rz]) => translate(scale(dome(1, 'sand', 4, 2), rx, ry, rz), x, 0, z));
  const fallen = detail(translate(rotateX(turret(0.09, 0.15, false), 1.3), 0.35, 0.09, -0.1));
  return merge(lodPair(merge(near), merge(far)), fallen, translate(rotateX(castleFlag(0.22), 1.2), -0.3, 0.02, -0.1));
}

function moatBuild(): Geo {
  const bankP: Array<readonly [number, number]> = [[1.15, 0], [1.05, 0.1], [0.95, 0.1], [0.95, 0.02], [0.65, 0.02], [0.65, 0.12], [0.5, 0.2], [0.01, 0.24]];
  const bank = lodPair(revolve(bankP, 'sand', 12), revolve([[1.15, 0], [0.95, 0.1], [0.65, 0.02], [0.01, 0.24]], 'sand', 8));
  const water = lodPair(revolve([[0.95, 0.04], [0.65, 0.04]], 'blueLight', 12), revolve([[0.95, 0.05], [0.65, 0.05]], 'blueLight', 6));
  const hull = tintable(lodPair(translate(scale(blob(1, 1, 1, 'coral', 6, 3), 0.06, 0.035, 0.14), 0, 0.05, 0.8), boxAt(0.1, 0.06, 0.26, 'coral', 0, 0.03, 0.8)));
  const sail = detail(merge(beam([0, 0.05, 0.8], [0, 0.22, 0.8], 0.01, 'timber'), translate(profile([[0, 0], [0.1, 0], [0, 0.13]], 0.01, 'ivory'), 0.01, 0.08, 0.8)));
  const tower = translate(lodPair(turret(0.14, 0.25, false), cone(0.16, 0.25, 'sand', 4)), 0, 0.22, 0);
  return merge(bank, water, hull, sail, tower);
}

function mermaidBuild(): Geo {
  const tail = merge(
    translate(blob(0.35, 0.18, 0.7, 'sand', 7, 4), 0, 0.05, 0),
    translate(blob(0.25, 0.14, 0.5, 'sand', 6, 4), 0.05, 0.04, -0.8),
    translate(profile([[-0.45, 0], [0, 0.05], [0.45, 0], [0.35, 0.12], [0, 0.18], [-0.35, 0.12]], 0.12, 'sand'), 0.1, 0.0, -1.35),
  );
  const scales = detail(merge(Array.from({ length: 8 }, (_, i) => translate(blob(0.05, 0.02, 0.04, 'clayLight', 4, 2), -0.15 + (i % 3) * 0.15, 0.2, 0.3 - Math.floor(i / 3) * 0.3))));
  const shells = detail(merge([-1, 1].map((s) => translate(sphere(0.07, 'coralLight', 5, 3), s * 0.15, 0.2, 0.75))));
  const far = merge(boxAt(0.6, 0.2, 1.4, 'sand', 0, 0, -0.1), boxAt(0.9, 0.12, 0.25, 'sand', 0.1, 0, -1.3));
  return merge(lodPair(merge(tail, scales), far), shells);
}

function turtleBuild(): Geo {
  const shell = scale(dome(1, 'sand', 8, 4), 1.0, 0.55, 1.2);
  const head = translate(blob(0.25, 0.2, 0.3, 'sand', 6, 4), 0, 0.15, 1.35);
  const flippers = [-1, 1].flatMap((s) => [
    translate(rotateY(blob(0.45, 0.06, 0.2, 'sand', 5, 3), s * -0.5), s * 0.95, 0.04, 0.6),
    translate(rotateY(blob(0.3, 0.05, 0.15, 'sand', 5, 3), s * 0.6), s * 0.85, 0.04, -0.8),
  ]);
  const plates = detail(merge(Array.from({ length: 5 }, (_, i) => {
    const a = (i / 5) * Math.PI * 2;
    return translate(scale(dome(0.22, 'clayLight', 6, 2), 1, 0.3, 1), i === 0 ? 0 : Math.sin(a) * 0.5, i === 0 ? 0.55 : 0.42, i === 0 ? 0 : Math.cos(a) * 0.6);
  })));
  const eyes = detail(merge([-1, 1].map((s) => boxAt(0.06, 0.06, 0.04, 'cocoa', s * 0.12, 0.22, 1.6))));
  const far = merge(scale(dome(1, 'sand', 6, 2), 1.0, 0.55, 1.2), translate(blob(0.25, 0.2, 0.3, 'sand', 4, 2), 0, 0.15, 1.35));
  return merge(lodPair(merge(shell, head, flippers), far), plates, eyes);
}

function rockPoolBuild(): Geo {
  const rocks = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2;
    const r = 0.95 + (i % 3) * 0.08;
    return translate(blob(0.34 + (i % 2) * 0.1, 0.22 + (i % 3) * 0.06, 0.32, i % 3 === 0 ? 'slate' : 'stone', 5, 3), Math.sin(a) * r, 0.08, Math.cos(a) * r);
  });
  const far = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2;
    return translate(blob(0.4, 0.25, 0.34, i % 3 === 0 ? 'slate' : 'stone', 4, 2), Math.sin(a) * 1.0, 0.08, Math.cos(a) * 1.0);
  });
  const bed = revolve([[0.9, 0.02], [0.01, 0.02]], 'clayLight', 12);
  const star = merge(Array.from({ length: 3 }, (_, i) => rotateY(boxAt(0.035, 0.02, 0.2, 'coral', 0, 0, 0), (i / 3) * Math.PI)));
  const stars = detail(merge(translate(star, 0.3, 0.03, 0.2), translate(star, -0.4, 0.03, -0.1)));
  const weed = detail(merge([0, 1, 2].map((i) => translate(sway(cone(0.06, 0.3, 'sageDeep', 4), 0.4), -0.6 + i * 0.5, 0.02, 0.6 - i * 0.4))));
  return merge(lodPair(merge(rocks), merge(far)), bed, stars, weed);
}

function rockPoolWaterBuild(): Geo {
  return revolve([[0.95, 0.12], [0.01, 0.12]], 'blueLight', 12);
}

function rowboatBuild(): Geo {
  const hull = tintable(scale(dome(1, 'blue', 12, 4), 0.62, 0.5, 1.7));
  const band = translate(scale(revolve([[1.0, 0], [1.0, 0.08]], 'ivory', 12), 0.625, 1, 1.705), 0, 0.02, 0);
  const keel = boxAt(0.08, 0.06, 3.2, 'timberDeep', 0, 0.47, 0);
  const far = merge(tintable(scale(dome(1, 'blue', 6, 2), 0.62, 0.5, 1.7)), boxAt(0.08, 0.06, 3.2, 'timberDeep', 0, 0.47, 0));
  const oar = detail(merge(beam([0.8, 0.03, -1.0], [0.9, 0.03, 1.2], 0.04, 'timber'), boxAt(0.15, 0.02, 0.45, 'timber', 0.9, 0.02, 1.35)));
  return merge(lodPair(merge(hull, band, keel), far), oar);
}

export const BEACH2_PROPS: readonly PropDef[] = [
  prop('beach.hut', hutBuild, [2.2, 2.6], 'stall', { tint: 'coral', tags: ['beach', 'building'] }),
  prop('beach.hutrow', hutRowBuild, [12.2, 2.6], 'house', { tags: ['beach', 'building'] }),
  prop('sandcastle.small', smallCastleBuild, [0, 0], 'clutter', { tint: 'coral', tags: ['beach', 'sand'] }),
  prop('sandcastle.large', largeCastleBuild, [2.2, 2.2], 'furniture', { tint: 'coral', tags: ['beach', 'sand'] }),
  prop('sandcastle.collapsed', collapsedCastleBuild, [0, 0], 'clutter', { tint: 'coral', tags: ['beach', 'sand', 'story'] }),
  prop('beach.moat', moatBuild, [2.3, 2.3], 'furniture', { tint: 'coral', tags: ['beach', 'sand', 'toy'] }),
  prop('sandsculpture.mermaid', mermaidBuild, [1.0, 2.0], 'furniture', { origin: 'sunk', tags: ['beach', 'sand', 'sculpture'] }),
  prop('sandsculpture.turtle', turtleBuild, [2.2, 3.0], 'furniture', { origin: 'sunk', tags: ['beach', 'sand', 'sculpture'] }),
  prop('beach.rockpool', rockPoolBuild, [2.4, 2.4], 'furniture', { origin: 'sunk', tags: ['beach', 'rocks'] }),
  prop('beach.rockpool.water', rockPoolWaterBuild, [0, 0], 'clutter', { material: 'water', tags: ['beach', 'water'] }),
  prop('beach.rowboat.upturned', rowboatBuild, [1.3, 3.4], 'stall', { tint: 'blue', tags: ['beach', 'boat'] }),
];
