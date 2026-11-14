/** Window boxes and flower clumps with tint-masked petals. */
import { type Col, type Geo, detail, farOnly, merge, tintable, translate } from '../../core/geo';
import type { Rng } from '../../core/rng';
import { ball, bx } from './kit';

/** A row of flower heads over leaves, `w` wide, resting on y = 0, centred. Petals take the tint. */
export function flowerRow(w: number, rng: Rng, petal: Col = 'coral'): Geo {
  const n = Math.max(2, Math.round(w / 0.28));
  const heads = Array.from({ length: n }, (_, i) => {
    const x = -w / 2 + ((i + 0.5) * w) / n + rng.range(-0.03, 0.03);
    const r = rng.range(0.045, 0.065);
    return ball([r, r * 0.8, r], petal, [x, 0.13 + rng.range(0, 0.05), rng.range(-0.03, 0.03)], 4, 3);
  });
  const leaves = bx(w * 0.95, 0.1, 0.14, 'sageDeep', 0, 0.04, 0);
  return merge(tintable(merge(heads)), leaves);
}

export interface WindowBoxOpts {
  readonly w: number;
  readonly col?: Col;
  readonly petal?: Col;
  /** add a far-tier tinted stand-in block (default false: window boxes vanish far away) */
  readonly farBlock?: boolean;
}

/** Planter box with flowers. Local: centred on x, resting on y = 0, back face at z = 0. Near-only. */
export function windowBox(opts: WindowBoxOpts, rng: Rng): Geo {
  const { w, col = 'timber', petal = 'coral', farBlock = false } = opts;
  const body = bx(w, 0.18, 0.18, col, 0, 0, 0.09);
  const flowers = translate(flowerRow(w - 0.06, rng, petal), 0, 0.12, 0.09);
  const near = detail(merge(body, flowers));
  if (!farBlock) return near;
  return merge(near, farOnly(tintable(bx(w, 0.24, 0.18, petal, 0, 0, 0.09))));
}
