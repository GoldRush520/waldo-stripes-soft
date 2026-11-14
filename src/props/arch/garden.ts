/**
 * Garden / courtyard elements (rest on y = 0, centred): garden wall segment with an optional
 * gate, and a courtyard pergola with climbing vines and tint-masked blossoms.
 */
import { type Col, type Geo, detail, farOnly, merge, tintable } from '../../core/geo';
import type { Rng } from '../../core/rng';
import { ball, bx } from './kit';

export interface GardenWallOpts {
  /** length along x */
  readonly len?: number;
  readonly h?: number;
  readonly col?: Col;
  /** gate opening in the middle */
  readonly gate?: boolean;
  readonly gateCol?: Col;
}

function gateLeaf(w: number, h: number, col: Col): Geo {
  const slats = Math.max(3, Math.round(w / 0.18));
  const near = [
    ...Array.from({ length: slats }, (_, i) => bx(0.07, h - 0.1, 0.04, col, -w / 2 + ((i + 0.5) * w) / slats, 0.06, 0)),
    bx(w, 0.08, 0.06, col, 0, 0.25, 0.03),
    bx(w, 0.08, 0.06, col, 0, h - 0.4, 0.03),
    bx(0.05, 0.05, 0.08, 'ink', w * 0.35, h * 0.55, 0.06),
  ];
  return merge(detail(merge(near)), farOnly(bx(w, h - 0.1, 0.05, col, 0, 0.06, 0)));
}

/** Garden wall segment (x-aligned) with coping, end piers and an optional slatted gate. */
export function gardenWall(opts: GardenWallOpts = {}): Geo {
  const { len = 4, h = 1.5, col = 'clay', gate = false, gateCol = 'sage' } = opts;
  const t = 0.3;
  const gw = gate ? 1.1 : 0;
  const seg = (len - gw) / 2;
  const walls = gate
    ? [-1, 1].map((s) => bx(seg, h, t, col, s * (gw / 2 + seg / 2), 0, 0))
    : [bx(len, h, t, col, 0, 0, 0)];
  const pierXs = gate ? [-len / 2 + 0.2, -gw / 2 - 0.2, gw / 2 + 0.2, len / 2 - 0.2] : [-len / 2 + 0.2, len / 2 - 0.2];
  const piers = pierXs.map((x) => bx(0.42, h + 0.2, 0.42, col, x, 0, 0));
  const near = [
    ...walls.map((_, i) => bx(gate ? seg + 0.04 : len + 0.04, 0.07, t + 0.08, 'stone', gate ? (i === 0 ? -1 : 1) * (gw / 2 + seg / 2) : 0, h, 0)),
    ...pierXs.map((x) => bx(0.5, 0.08, 0.5, 'stone', x, h + 0.2, 0)),
    ...pierXs.filter((_, i) => !gate || i === 1 || i === 2).map((x) => ball([0.11, 0.11, 0.11], 'stone', [x, h + 0.38, 0], 5, 3)),
  ];
  const gateG = gate ? [gateLeaf(gw - 0.02, h - 0.1, gateCol)] : [];
  return merge(walls, piers, gateG, detail(merge(near)));
}

/** Courtyard pergola w x d (x, z): posts, beams, rafters and vines with blossoms. */
export function pergola(w = 3, d = 2.4, rng?: Rng): Geo {
  const h = 2.45;
  const posts = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => bx(0.14, h, 0.14, 'timber', sx * (w / 2 - 0.1), 0, sz * (d / 2 - 0.1))));
  const beams = [-1, 1].map((sz) => bx(w + 0.3, 0.16, 0.12, 'timber', 0, h, sz * (d / 2 - 0.1)));
  const rafters = Math.max(3, Math.round(w / 0.45));
  const near = Array.from({ length: rafters }, (_, i) =>
    bx(0.07, 0.12, d + 0.3, 'timberDeep', -w / 2 + ((i + 0.5) * w) / rafters, h + 0.16, 0),
  );
  const leaves = Array.from({ length: rafters + 2 }, (_, i) => {
    const x = -w / 2 + (i * w) / (rafters + 1);
    const z = rng ? rng.range(-d / 3, d / 3) : 0;
    return ball([0.32, 0.12, 0.28], i % 2 === 0 ? 'sage' : 'sageDeep', [x, h + 0.34, z], 5, 3);
  });
  const vines = [-1, 1].map((s) => bx(0.2, h - 0.2, 0.2, 'sageDeep', s * (w / 2 - 0.1), 0.2, d / 2 - 0.1));
  const blossoms = Array.from({ length: 5 }, (_, i) => {
    const x = -w / 2 + ((i + 0.5) * w) / 5;
    return ball([0.06, 0.05, 0.06], 'coral', [x, h + 0.44, rng ? rng.range(-d / 3, d / 3) : 0], 4, 3);
  });
  return merge(
    posts,
    beams,
    detail(merge(near, leaves, vines, tintable(merge(blossoms)))),
    farOnly(merge(bx(w * 0.9, 0.18, d * 0.8, 'sage', 0, h + 0.2, 0))),
  );
}
