/** Flowers: clumps, tulips, sunflowers, lavender, roses, hydrangea, plus the seeded `flowerBed`. */
import { type Col, type Geo, box, cone, cyl, merge, scale, sphere, sway, tintable, translate } from '../../core/geo';
import { type Rng, createRng } from '../../core/rng';
import { type Q, type V3, ell, ground, hiOnly, limb, orient, tiered } from './kit';

/** Tint-masked bloom ball (HI only use). */
export function bud(p: V3, r: number, color: Col = 'coral', flat = 1): Geo {
  return tintable(translate(scale(sphere(r, color, 4, 2), 1, flat, 1), p[0], p[1], p[2]));
}

/** Points scattered in a disc of radius r at heights [y0, y1]. */
function scatter(rng: Rng, n: number, r: number, y0: number, y1: number): V3[] {
  return Array.from({ length: n }, () => {
    const a = rng.range(0, Math.PI * 2);
    const d = r * Math.sqrt(rng.next());
    return [Math.sin(a) * d, rng.range(y0, y1), Math.cos(a) * d] as V3;
  });
}

/** Foliage mound plus a far-tier tinted colour cap. */
function mound(q: Q, r: number, h: number, bloomCol: Col, col: Col = 'sage'): Geo[] {
  const leaf = ell(q, q.hi ? 'small' : 'nub', 0, h * 0.45, 0, r, h * 0.5, r, col);
  return q.hi ? [leaf] : [leaf, tintable(ell(q, 'nub', 0, h * 0.85, 0, r * 0.8, h * 0.25, r * 0.8, bloomCol))];
}

const leafy = (g: Geo, h: number): Geo => sway(g, (_x, y) => Math.min(0.35, 0.1 + (0.25 * y) / Math.max(0.1, h)));

/** Cottage clump: a round mound studded with blooms. */
export function clumpRound(q: Q, rng: Rng): Geo {
  const blooms = hiOnly(q, () => scatter(rng, 9, 0.24, 0.32, 0.44).map((p) => bud(p, 0.06)));
  return leafy(merge(mound(q, 0.32, 0.42, 'coral'), blooms), 0.5);
}

/** Spires: upright tint-masked flower spikes from a low mound (foxglove / lupin). */
export function clumpSpires(q: Q, rng: Rng): Geo {
  const spikes = hiOnly(q, () =>
    scatter(rng, 5, 0.18, 0.2, 0.3).map((p) => tintable(translate(cone(0.06, 0.38, 'coral', 5), p[0], p[1], p[2]))),
  );
  const far = q.hi ? [] : [tintable(translate(cone(0.2, 0.55, 'coral', 4), 0, 0.15, 0))];
  return leafy(merge(ell(q, q.hi ? 'small' : 'nub', 0, 0.12, 0, 0.28, 0.16, 0.28, 'sageDeep'), spikes, far), 0.7);
}

/** Daisy cushion: wide low mound covered in flat blooms with butter eyes. */
export function clumpDaisy(q: Q, rng: Rng): Geo {
  const pts = scatter(rng, 9, 0.34, 0.18, 0.22);
  const blooms = hiOnly(q, () => pts.map((p) => bud(p, 0.07, 'ivory', 0.35)));
  const eyes = hiOnly(q, () => pts.slice(0, 5).map((p) => translate(sphere(0.025, 'butter', 4, 2), p[0], p[1] + 0.025, p[2])));
  const base = ell(q, q.hi ? 'small' : 'nub', 0, 0.06, 0, 0.42, 0.14, 0.42, 'sage');
  const far = q.hi ? [] : [tintable(ell(q, 'nub', 0, 0.14, 0, 0.36, 0.07, 0.36, 'ivory'))];
  return leafy(merge(base, blooms, eyes, far), 0.3);
}

/** Tulip row (1.6 m) on a soil strip; cups tint-masked. */
export function tulipRow(q: Q, rng: Rng): Geo {
  const soil = box(1.6, 0.06, 0.3, 'cocoa');
  const xs = [-0.65, -0.39, -0.13, 0.13, 0.39, 0.65];
  const lean = xs.map(() => rng.range(-0.05, 0.05));
  const plants = q.hi
    ? xs.flatMap((x, i) => {
        const top: V3 = [x + (lean[i] ?? 0), 0.42, 0];
        return [limb([x, 0.05, 0], top, 0.012, 0.01, 'sageDeep', 3), tintable(translate(sphere(0.055, 'coral', 4, 3), top[0], top[1] + 0.03, 0))];
      })
    : [box(1.4, 0.3, 0.1, 'sageDeep'), tintable(translate(box(1.4, 0.09, 0.12, 'coral'), 0, 0.33, 0))];
  return merge(soil, sway(merge(plants), (_x, y) => Math.min(0.35, y * 0.8)));
}

/** Sunflower trio, about 2 m tall, heads turned to the sun (+z). */
export function sunflowers(q: Q, rng: Rng): Geo {
  const spots: ReadonlyArray<readonly [number, number, number]> = [
    [-0.25, 0, 1.95],
    [0.22, -0.12, 1.7],
    [0.02, 0.2, 2.1],
  ];
  const tilt = spots.map(() => rng.range(-0.25, 0.25));
  const parts = spots.flatMap(([x, z, h], i) => {
    const top: V3 = [x + (tilt[i] ?? 0) * 0.3, h, z + 0.08];
    const stem = limb([x, 0, z], top, 0.03, 0.022, 'sageDeep', q.s(4, 3));
    const head = orient(cyl(0.2, 0.18, 0.06, 'butter', q.s(8, 4)), [1.25, tilt[i] ?? 0, 0], top);
    const eye = hiOnly(q, () => orient(cyl(0.1, 0.1, 0.02, 'cocoa', 8), [1.25, tilt[i] ?? 0, 0], [top[0], top[1] + 0.016, top[2] + 0.047]));
    const side = i % 2 ? 1 : -1;
    const leaves = hiOnly(q, () => ell(q, 'nub', x + side * 0.12, h * 0.45, z, 0.14, 0.03, 0.08, 'sage'));
    return [stem, head, ...eye, ...leaves];
  });
  return sway(merge(parts), (_x, y) => Math.min(0.3, 0.15 * y));
}

/** Lavender bush: grey-green cushion bristling with tint-masked spikes (default blue). */
export function lavender(q: Q, rng: Rng): Geo {
  const spikes = hiOnly(q, () =>
    scatter(rng, 12, 0.32, 0.28, 0.34).map((p) =>
      tintable(orient(cone(0.035, 0.22, 'blue', 3), [p[2] * 0.6, 0, -p[0] * 0.6], p)),
    ),
  );
  return leafy(merge(mound(q, 0.38, 0.4, 'blue', 'sageLight'), spikes), 0.6);
}

/** Rose bush: dense dark mound with tint-masked roses. */
export function roseBush(q: Q, rng: Rng): Geo {
  const roses = hiOnly(q, () => scatter(rng, 5, 0.3, 0.45, 0.65).map((p) => tintable(translate(sphere(0.075, 'coral', 4, 3), p[0], p[1], p[2]))));
  const body = ell(q, q.hi ? 'mid' : 'nub', 0, 0.36, 0, 0.42, 0.36, 0.4, 'sageDeep');
  const far = q.hi ? [] : [tintable(ell(q, 'nub', 0.05, 0.6, 0.05, 0.3, 0.12, 0.3, 'coral'))];
  return leafy(merge(body, roses, far), 0.75);
}

/** Hydrangea: round shrub carrying big tint-masked mop heads (default blueLight). */
export function hydrangea(q: Q, rng: Rng): Geo {
  const heads = hiOnly(q, () =>
    scatter(rng, 5, 0.38, 0.5, 0.75).map((p) => tintable(ell(q, 'tiny', p[0], p[1], p[2], 0.16, 0.13, 0.16, 'blueLight'))),
  );
  return leafy(merge(mound(q, 0.5, 0.8, 'blueLight', 'sageDeep'), heads), 0.9);
}

function bedGeo(q: Q, w: number, d: number, rng: Rng): Geo {
  const edge = box(w, 0.14, d, 'timber');
  const soil = translate(box(w - 0.12, 0.04, d - 0.12, 'cocoa'), 0, 0.12, 0);
  const nx = Math.max(1, Math.round(w / 0.65));
  const nz = Math.max(1, Math.round(d / 0.65));
  const cells = Array.from({ length: nx * nz }, (_, i) => [((i % nx) + 0.5) / nx - 0.5, (Math.floor(i / nx) + 0.5) / nz - 0.5] as const);
  const accents: readonly Col[] = ['ivory', 'butter'];
  const plants = q.hi
    ? cells.flatMap(([u, v], i) => {
        const cx = u * (w - 0.2);
        const cz = v * (d - 0.2);
        const leaf = ell(q, 'tiny', cx, 0.24, cz, 0.2, 0.12, 0.2, i % 2 ? 'sage' : 'sageDeep');
        const blooms = scatter(rng, 3, 0.14, 0.32, 0.38).map((p, k) =>
          k === 2 && i % 3 === 0
            ? translate(sphere(0.05, accents[i % 2] ?? 'ivory', 4, 2), cx + p[0], p[1], cz + p[2])
            : bud([cx + p[0], p[1], cz + p[2]], 0.055),
        );
        return [leaf, ...blooms];
      })
    : [ell(q, 'nub', 0, 0.22, 0, w * 0.45, 0.1, d * 0.42, 'sage'), tintable(ell(q, 'nub', 0, 0.28, 0, w * 0.4, 0.08, d * 0.36, 'coral'))];
  return merge(edge, soil, sway(merge(plants), (_x, y) => Math.min(0.3, y)));
}

/** Seeded timber-edged flower bed (w along x, d along z); blooms tint-masked (default coral). */
export function flowerBed(w = 2, d = 1.2, seed = 1): Geo {
  return ground(tiered((q) => bedGeo(q, w, d, createRng(seed))));
}
