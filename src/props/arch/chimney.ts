/** Chimney stack with cap and pots (pots and cap are near-only). */
import { type Col, type Geo, detail, merge } from '../../core/geo';
import type { Rng } from '../../core/rng';
import { bx, cy } from './kit';

export function chimney(x: number, z: number, from: number, top: number, col: Col, rng: Rng): Geo {
  const pots = rng.int(1, 2);
  const potGeo = Array.from({ length: pots }, (_, i) =>
    cy(0.075, 0.28, 'coralDeep', 6, [x + (pots === 1 ? 0 : (i - 0.5) * 0.24), top + 0.1, z], 0.8, false),
  );
  return merge(
    bx(0.56, top - from, 0.46, col, x, from, z),
    detail(merge(bx(0.7, 0.1, 0.6, 'stone', x, top, z), potGeo)),
  );
}

/** Chimney colour that contrasts with a wall colour. */
export function chimneyCol(wall: Col): Col {
  return wall === 'clay' ? 'clayDeep' : 'clay';
}
