/** Playground surfaces: paddling pool (+ water), skate mini-ramp, trampoline and hopscotch decal. */
import { type Col, type Geo, beam, detail, merge, profile, rotateY, translate } from '../../core/geo';
import type { PropDef } from '../registry';
import { barZ, boxAt, lodPair, prop, revolve, stripedLod } from './kit';

const POOL_R = 1.8;
export const POOL_WATER_Y = 0.25;

function poolBuild(): Geo {
  const rim: Array<readonly [number, number]> = [
    [POOL_R - 0.2, 0.32],
    [POOL_R - 0.2, 0.02],
    [POOL_R, 0.02],
    [POOL_R + 0.02, 0],
    [POOL_R + 0.02, 0.3],
    [POOL_R - 0.05, 0.38],
    [POOL_R - 0.2, 0.32],
  ];
  const farRim: Array<readonly [number, number]> = [
    [POOL_R + 0.02, 0],
    [POOL_R + 0.02, 0.36],
    [POOL_R - 0.2, 0.36],
  ];
  const ring = stripedLod(rim, 14, 1, 1, 'blue', 'ivory', farRim);
  const floor = revolve([[POOL_R - 0.19, 0.03], [0.01, 0.03]], 'blueLight', 12);
  const step = detail(boxAt(0.4, 0.15, 0.3, 'butter', 0, 0, POOL_R + 0.18));
  return merge(ring, floor, step);
}

function poolWaterBuild(): Geo {
  return revolve([[POOL_R - 0.19, POOL_WATER_Y], [0.01, POOL_WATER_Y]], 'blueLight', 16);
}

function rampProfile(): Array<readonly [number, number]> {
  const r = 1.15;
  const cx = 1.4;
  const cy = 1.2;
  const right = Array.from({ length: 6 }, (_, i) => {
    const t = (i / 5) * (Math.PI / 2);
    return [cx + Math.sin(t) * r, cy - Math.cos(t) * r] as const;
  });
  const down = [...right].reverse();
  const up = right.map(([x, y]) => [-x, y] as const);
  return [[-3, 0], [3, 0], [3, cy], ...down, ...up, [-3, cy]];
}

function skateRampBuild(): Geo {
  const depth = 3;
  const body = profile(rampProfile(), depth, 'blueLight');
  const sides = merge([-1, 1].map((s) => translate(profile([[-3, 0], [3, 0], [3, 1.2], [-3, 1.2]], 0.04, 'blue'), 0, 0, s * (depth / 2 + 0.02))));
  const coping = lodPair(
    merge([-1, 1].map((s) => translate(barZ(depth, 0.04, 'slate', 8), s * 2.55, 1.22, 0))),
    merge([-1, 1].map((s) => boxAt(0.08, 0.08, depth, 'slate', s * 2.55, 1.18, 0))),
  );
  const rails = detail(
    merge(
      [-1, 1].flatMap((s) => [
        beam([s * 2.95, 1.2, -depth / 2], [s * 2.95, 2.1, -depth / 2], 0.04, 'butter'),
        beam([s * 2.95, 1.2, depth / 2], [s * 2.95, 2.1, depth / 2], 0.04, 'butter'),
        beam([s * 2.95, 2.1, -depth / 2], [s * 2.95, 2.1, depth / 2], 0.04, 'butter'),
      ]),
    ),
  );
  const seams = detail(merge(Array.from({ length: 7 }, (_, i) => boxAt(0.02, 0.012, depth - 0.1, 'blue', -1.2 + i * 0.4, 0.05, 0))));
  const graffiti = detail(merge(boxAt(1.2, 0.5, 0.01, 'coral', -1, 0.4, depth / 2 + 0.045), boxAt(0.8, 0.35, 0.01, 'butter', 1.2, 0.5, depth / 2 + 0.045)));
  return merge(body, sides, coping, rails, seams, graffiti);
}

function trampolineBuild(): Geo {
  const h = 0.75;
  const pad = translate(
    stripedLod([[1.75, 0], [1.75, 0.08], [1.3, 0.08], [1.3, 0], [1.75, 0]], 8, 1, 1, 'sage', 'butter', [[1.75, 0.08], [1.3, 0.08]]),
    0,
    h,
    0,
  );
  const mat = revolve([[1.32, h + 0.03], [0.01, h + 0.03]], 'slate', 12);
  const matUnder = detail(revolve([[0.01, h], [1.32, h]], 'slate', 12));
  const legAt = (i: number, n: number): Geo => {
    const a = (i / n) * Math.PI * 2;
    return beam([Math.sin(a) * 1.7, 0, Math.cos(a) * 1.7], [Math.sin(a) * 1.7, h, Math.cos(a) * 1.7], 0.06, 'slate');
  };
  const legs = lodPair(merge(Array.from({ length: 4 }, (_, i) => legAt(i, 4))), merge(Array.from({ length: 3 }, (_, i) => legAt(i, 3))));
  const springs = detail(
    merge(Array.from({ length: 10 }, (_, i) => rotateY(boxAt(0.03, 0.02, 0.4, 'ivoryDeep', 0, h + 0.02, 1.5), (i / 10) * Math.PI * 2))),
  );
  return merge(pad, mat, matUnder, legs, springs);
}

const HOP_COLS: readonly Col[] = ['coral', 'butter', 'blue', 'sage'];

function hopscotchBuild(): Geo {
  const cells: ReadonlyArray<readonly [number, number]> = [
    [0, 0],
    [0, 0.5],
    [-0.25, 1.0],
    [0.25, 1.0],
    [0, 1.5],
    [-0.25, 2.0],
    [0.25, 2.0],
    [0, 2.5],
    [-0.25, 3.0],
    [0.25, 3.0],
  ];
  const near = cells.map(([x, z], i) => boxAt(0.44, 0.012, 0.44, HOP_COLS[i % HOP_COLS.length] ?? 'coral', x, 0, -1.5 + z));
  const far = merge(boxAt(0.44, 0.012, 3.5, 'butter', 0, 0, 0), boxAt(0.9, 0.032, 0.4, 'coral', 0, 0, -0.5));
  return lodPair(merge(near), far);
}

export const PLAYGROUND2_PROPS: readonly PropDef[] = [
  prop('playground.paddlingpool', poolBuild, [3.7, 3.7], 'furniture', { tags: ['playground', 'pool'] }),
  prop('playground.paddlingpool.water', poolWaterBuild, [0, 0], 'clutter', { material: 'water', tags: ['playground', 'water'] }),
  prop('playground.skateramp', skateRampBuild, [6, 3], 'stall', { tags: ['playground', 'skate'] }),
  prop('playground.trampoline', trampolineBuild, [3.5, 3.5], 'furniture', { tags: ['playground'] }),
  prop('playground.hopscotch', hopscotchBuild, [0, 0], 'clutter', { origin: 'decal', tags: ['playground', 'decal'] }),
];
