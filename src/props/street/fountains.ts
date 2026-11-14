/**
 * Fountains (basins solid; water surfaces are separate `material: 'water'` props placed at the same
 * origin), well, statue, sundial and raised paving decals.
 */
import {
  type Geo,
  beam,
  blob,
  box,
  cone,
  cyl,
  detail,
  disc,
  gable,
  lathe,
  merge,
  profile,
  rotateX,
  rotateY,
  rotateZ,
  shadeY,
  sphere,
  tintable,
  translate,
} from '../../core/geo';
import type { PropDef } from '../registry';
import { prop, topCyl } from './kit';

/* ---------------------------------------------------------------- tiered round fountain */

const BASIN_R = 1.7;

function roundFountain(): Geo {
  const basin = shadeY(lathe([[BASIN_R, 0], [BASIN_R + 0.02, 0.38], [BASIN_R + 0.02, 0.46], [BASIN_R - 0.18, 0.46], [BASIN_R - 0.18, 0.04]], 'stone', 20), 0.8, 1);
  const floor = translate(disc(BASIN_R - 0.17, 'blueDeep', 20), 0, 0.04, 0);
  const column = lathe([[0.35, 0.04], [0.3, 0.3], [0.18, 0.5], [0.16, 1.1], [0.25, 1.2]], 'stone', 12);
  const bowl = lathe([[0.25, 1.2], [0.9, 1.5], [0.95, 1.58], [0.85, 1.58], [0.2, 1.4]], 'ivoryShade', 16);
  const upper = lathe([[0.12, 1.4], [0.08, 1.9], [0.15, 2.0]], 'stone', 10);
  const top = lathe([[0.15, 2.0], [0.5, 2.2], [0.52, 2.26], [0.44, 2.26], [0.1, 2.1]], 'ivoryShade', 12);
  const finial = merge(translate(cone(0.1, 0.32, 'butterDeep', 8), 0, 2.15, 0), translate(sphere(0.06, 'butterDeep', 6, 4), 0, 2.5, 0));
  const tiles = translate(cyl(BASIN_R + 0.025, BASIN_R + 0.025, 0.08, 'blue', 20, false), 0, 0.2, 0);
  const fish = [0, 1, 2, 3].map((i) => {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    return translate(rotateY(rotateZ(blob(0.14, 0.06, 0.06, 'sageDeep', 5, 3), -0.5), -a + Math.PI / 2), Math.sin(a) * 0.45, 1.25, Math.cos(a) * 0.45);
  });
  return merge(basin, floor, column, bowl, upper, top, finial, detail(merge(tiles, fish)));
}

function roundFountainWater(): Geo {
  const pool = translate(cyl(BASIN_R - 0.2, BASIN_R - 0.2, 0.32, 'blue', 20), 0, 0.04, 0);
  const bowlPool = translate(cyl(0.76, 0.6, 0.12, 'blue', 14), 0, 1.43, 0);
  const topPool = translate(cyl(0.42, 0.3, 0.1, 'blue', 10), 0, 2.15, 0);
  const curtainTop = translate(cyl(0.62, 0.53, 0.64, 'blueLight', 14, false), 0, 1.58, 0);
  const curtainLow = translate(cyl(1.05, 0.96, 1.2, 'blueLight', 16, false), 0, 0.36, 0);
  const jet = merge(translate(cyl(0.03, 0.05, 0.4, 'blueLight', 6), 0, 2.58, 0), translate(blob(0.12, 0.08, 0.12, 'blueLight', 6, 3), 0, 2.98, 0));
  return merge(pool, bowlPool, topPool, curtainTop, curtainLow, jet);
}

/* ---------------------------------------------------------------- wall fountain */

function wallFountain(): Geo {
  const wall = shadeY(box(1.6, 2.1, 0.3, 'stone'), 0.8, 1);
  const niche = translate(profile([[-0.4, 0], [0.4, 0], [0.4, 0.8], [0.28, 1.05], [0, 1.15], [-0.28, 1.05], [-0.4, 0.8]], 0.04, 'blueDeep'), 0, 0.6, 0.16);
  const cornice = translate(box(1.7, 0.1, 0.36, 'ivoryShade'), 0, 2.1, 0);
  const mask = merge(translate(sphere(0.14, 'sageDeep', 6, 4), 0, 1.25, 0.24), translate(rotateX(cyl(0.025, 0.025, 0.2, 'sageDeep', 5), Math.PI / 2), 0, 1.2, 0.28));
  const basinFront = translate(box(1.3, 0.5, 0.1, 'stone'), 0, 0, 0.9);
  const basinSides = [-1, 1].map((s) => translate(box(0.1, 0.5, 0.75, 'stone'), s * 0.6, 0, 0.53));
  const basinFloor = translate(box(1.1, 0.04, 0.7, 'blueDeep'), 0, 0, 0.53);
  const rim = translate(box(1.36, 0.06, 0.12, 'ivoryShade'), 0, 0.5, 0.9);
  const shells = detail(merge([-0.25, 0.25].map((x) => translate(blob(0.08, 0.1, 0.03, 'clay', 5, 3), x, 1.6, 0.17))));
  return merge(wall, niche, cornice, mask, basinFront, basinSides, basinFloor, rim, shells);
}

function wallFountainWater(): Geo {
  const pool = translate(box(1.08, 0.38, 0.68, 'blue'), 0, 0.04, 0.53);
  const stream = translate(box(0.05, 0.84, 0.05, 'blueLight'), 0, 0.42, 0.42);
  return merge(pool, stream);
}

/* ---------------------------------------------------------------- drinking fountain, well */

function drinkingFountain(): Geo {
  const step = box(0.6, 0.12, 0.6, 'stone');
  const pedestal = translate(lathe([[0.18, 0], [0.13, 0.15], [0.11, 0.75], [0.2, 0.85], [0.24, 0.92]], 'blueDeep', 7), 0, 0.12, 0);
  const bowl = translate(disc(0.2, 'slate', 8), 0, 1.0, 0);
  const spout = detail(merge(beam([0, 1.0, -0.12], [0, 1.12, -0.05], 0.03, 'butterDeep'), translate(sphere(0.03, 'butterDeep', 4, 2), 0, 1.12, -0.05)));
  return merge(step, pedestal, bowl, spout);
}

function well(): Geo {
  const ring = shadeY(lathe([[0.75, 0], [0.75, 0.7], [0.58, 0.7], [0.58, 0.45]], 'stone', 12), 0.75, 1);
  const water = translate(disc(0.6, 'blueDeep', 12), 0, 0.45, 0);
  const posts = [-1, 1].map((s) => beam([s * 0.66, 0.7, 0], [s * 0.66, 2.1, 0], 0.09, 'timberDeep'));
  const roof = translate(rotateY(gable(1.0, 0.45, 1.8, 'coralDeep'), Math.PI / 2), 0, 2.05, 0);
  const axle = beam([-0.7, 1.55, 0], [0.7, 1.55, 0], 0.06, 'timber');
  const crank = detail(merge(beam([0.72, 1.55, 0], [0.72, 1.4, 0.15], 0.03, 'ink'), beam([0.72, 1.4, 0.15], [0.85, 1.4, 0.15], 0.03, 'ink')));
  const rope = detail(beam([0, 1.55, 0], [0, 0.95, 0], 0.012, 'butterDeep'));
  const bucket = detail(translate(cyl(0.1, 0.12, 0.18, 'timber', 6), 0, 0.78, 0));
  const blocks = detail(merge([0, 1, 2, 3, 4, 5].map((i) => translate(rotateY(box(0.3, 0.06, 0.04, 'ivoryShade'), (i / 6) * Math.PI * 2), Math.sin((i / 6) * Math.PI * 2) * 0.76, 0.3 + (i % 2) * 0.18, Math.cos((i / 6) * Math.PI * 2) * 0.76))));
  return merge(ring, water, posts, roof, axle, crank, rope, bucket, blocks);
}

/* ---------------------------------------------------------------- statue, sundial */

function statue(): Geo {
  const plinth = merge(box(1.2, 0.3, 1.2, 'stone'), translate(box(0.85, 1.1, 0.85, 'ivoryShade'), 0, 0.3, 0), translate(box(0.95, 0.08, 0.95, 'stone'), 0, 1.4, 0));
  const body = translate(lathe([[0.18, 0], [0.24, 0.35], [0.2, 0.7], [0.26, 1.05], [0.16, 1.25], [0.08, 1.32]], 'sageDeep', 8), 0, 1.48, 0);
  const head = translate(sphere(0.15, 'sageDeep', 6, 4), 0, 2.92, 0);
  const arm = translate(rotateZ(blob(0.06, 0.32, 0.06, 'sageDeep', 5, 3), -0.5), 0.3, 2.82, 0);
  const hat = detail(translate(cyl(0.2, 0.2, 0.025, 'sageDeep', 8), 0, 3.02, 0));
  const plaque = detail(merge(translate(box(0.5, 0.26, 0.02, 'butterDeep'), 0, 0.75, 0.43), [0, 1].map((i) => translate(box(0.36 - i * 0.1, 0.03, 0.005, 'cocoa'), 0, 0.92 - i * 0.08, 0.442))));
  const gull = detail(merge(translate(blob(0.07, 0.05, 0.05, 'white', 5, 3), 0, 3.09, 0), translate(rotateZ(blob(0.1, 0.012, 0.04, 'ivoryShade', 4, 2), 0.3), 0.04, 3.11, 0)));
  return merge(plinth, body, head, arm, hat, plaque, gull);
}

function sundial(): Geo {
  const pedestal = lathe([[0.22, 0], [0.12, 0.2], [0.1, 0.85]], 'stone', 8);
  const dial = translate(topCyl(0.3, 0.3, 0.04, 'butterDeep', 10), 0, 0.85, 0);
  const gnomon = translate(profile([[0, 0], [0.22, 0], [0, 0.18]], 0.02, 'ink'), -0.1, 0.89, 0);
  const marks = detail(merge([0, 1, 2, 3, 4, 5].map((i) => {
    const a = -Math.PI / 2 + (i / 5) * Math.PI;
    return translate(rotateY(box(0.06, 0.006, 0.012, 'ink'), -a), Math.sin(a) * 0.24, 0.89, Math.cos(a) * 0.24);
  })));
  return merge(pedestal, dial, gnomon, marks);
}

/* ---------------------------------------------------------------- paving decals (0.02 m raised) */

function manhole(): Geo {
  const lid = cyl(0.35, 0.35, 0.02, 'slate', 10);
  const grid = detail(merge([-0.12, 0, 0.12].map((x) => translate(box(0.02, 0.006, 0.5, 'ink'), x, 0.02, 0)), translate(box(0.5, 0.006, 0.02, 'ink'), 0, 0.02, 0)));
  return merge(lid, grid);
}

function pavingSquare(): Geo {
  const slab = box(1.2, 0.02, 1.2, 'stone');
  const inset = detail(merge(tintable(translate(rotateY(box(0.6, 0.006, 0.6, 'blue'), Math.PI / 4), 0, 0.02, 0)), translate(box(0.2, 0.008, 0.2, 'ivory'), 0, 0.02, 0)));
  return merge(slab, inset);
}

function pavingCircle(): Geo {
  const ring = topCyl(1.0, 1.0, 0.02, 'clayLight', 12);
  const rings = detail(merge(tintable(translate(topCyl(0.7, 0.7, 0.006, 'coral', 12), 0, 0.02, 0)), translate(topCyl(0.45, 0.45, 0.01, 'ivory', 12), 0, 0.02, 0), translate(topCyl(0.2, 0.2, 0.014, 'butter', 8), 0, 0.02, 0)));
  return merge(ring, rings);
}

function compassRose(): Geo {
  const base = topCyl(0.9, 0.9, 0.02, 'stone', 10);
  const pts: Array<readonly [number, number]> = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    const r = i % 4 === 0 ? 0.8 : i % 2 === 0 ? 0.45 : 0.18;
    return [Math.sin(a) * r, Math.cos(a) * r];
  });
  const star = detail(tintable(translate(rotateX(profile(pts, 0.008, 'blue'), -Math.PI / 2), 0, 0.024, 0)));
  return merge(base, star);
}

function drainGrate(): Geo {
  const frame = box(0.6, 0.02, 0.35, 'slate');
  const slots = detail(merge([0, 1, 2, 3, 4].map((i) => translate(box(0.06, 0.006, 0.28, 'ink'), -0.2 + i * 0.1, 0.02, 0))));
  return merge(frame, slots);
}

const DECAL = ['street', 'decal', 'walkable'];

export const FOUNTAIN_PROPS: readonly PropDef[] = [
  prop('fountain.round', [3.45, 3.45], 'house', roundFountain, { tags: ['street', 'plaza', 'fountain', 'landmark-small'] }),
  prop('fountain.round.water', [0, 0], 'stall', roundFountainWater, { material: 'water', tags: ['street', 'fountain', 'water', 'pair:fountain.round'] }),
  prop('fountain.wall', [1.6, 1.0], 'stall', wallFountain, { tags: ['street', 'fountain', 'wall'] }),
  prop('fountain.wall.water', [0, 0], 'small', wallFountainWater, { material: 'water', tags: ['street', 'fountain', 'water', 'pair:fountain.wall'] }),
  prop('fountain.drinking', [0.6, 0.6], 'furniture', drinkingFountain, { tags: ['street', 'park', 'fountain'] }),
  prop('well', [1.5, 1.5], 'stall', well, { tags: ['street', 'plaza'] }),
  prop('statue.plinth', [1.2, 1.2], 'stall', statue, { tags: ['street', 'plaza', 'landmark-small', 'comedy'] }),
  prop('sundial', [0.6, 0.6], 'furniture', sundial, { tags: ['street', 'park'] }),
  prop('decal.manhole', [0, 0], 'small', manhole, { tags: DECAL }),
  prop('decal.paving.square', [0, 0], 'small', pavingSquare, { tint: 'blue', tags: DECAL }),
  prop('decal.paving.circle', [0, 0], 'small', pavingCircle, { tint: 'coral', tags: DECAL }),
  prop('decal.paving.compass', [0, 0], 'small', compassRose, { tint: 'blue', tags: DECAL }),
  prop('decal.drain', [0, 0], 'small', drainGrate, { tags: DECAL }),
];
