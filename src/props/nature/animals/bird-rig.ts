/** Bird rig: body, head on a neck, beak, folded / spread / raised wings, tail and stick legs. Faces +z. */
import { type Col, type Geo, cone, merge, sphere, tintable, translate } from '../../../core/geo';
import { type Q, type Size, type V3, chain, ell, ellR, hiOnly, limb, orient, pair } from '../kit';

export type Wings = 'fold' | 'spread' | 'up';

export interface Bird {
  /** body radii x, y, z */
  readonly body: V3;
  readonly bodySize?: Size;
  /** body centre height above the feet */
  readonly height: number;
  /** body pitch, positive = breast up */
  readonly pitch?: number;
  readonly headR: number;
  /** head centre relative to body centre (y, z) */
  readonly head: readonly [number, number];
  /** extra neck mid point (y, z) for long S-necks */
  readonly neckMid?: readonly [number, number];
  readonly neckR?: number;
  readonly beak: readonly [number, number];
  readonly beakPitch?: number;
  readonly beakCol: Col;
  readonly wings: Wings;
  readonly wingSpan?: number;
  readonly tail: number;
  readonly coat: Col;
  readonly wingCol?: Col;
  readonly headCol?: Col;
  readonly legCol?: Col;
  /** draw legs (false for swimming / flying birds) */
  readonly legs?: boolean;
}

function wingGeo(q: Q, b: Bird, c: V3): Geo[] {
  const [bx, by, bz] = b.body;
  const col = b.wingCol ?? b.coat;
  if (b.wings === 'fold') {
    return pair((s) => ellR(q, q.hi ? 'tiny' : 'nub', [c[0] + s * bx * 0.8, c[1] + by * 0.15, c[2] - bz * 0.15], [bx * 0.35, by * 0.6, bz * 0.85], [-(b.pitch ?? 0), 0, 0], col));
  }
  const span = b.wingSpan ?? bx * 6;
  const lift = b.wings === 'up' ? 0.75 : 0.12;
  return pair((s) => {
    const mid: V3 = [c[0] + s * span * 0.27, c[1] + Math.sin(lift) * span * 0.25 + by * 0.3, c[2]];
    return ellR(q, q.hi ? 'tiny' : 'nub', mid, [span * 0.27, by * 0.18, bz * 0.6], [0, 0, s * lift], col);
  });
}

/** Build a bird with feet at y = 0 (or its body centre at `height` for flyers / swimmers). */
export function bird(q: Q, b: Bird): Geo {
  const c: V3 = [0, b.height, 0];
  const [bx, by, bz] = b.body;
  const body = ellR(q, b.bodySize ?? 'small', c, [bx, by, bz], [-(b.pitch ?? 0), 0, 0], b.coat);
  const hc: V3 = [0, c[1] + b.head[0], c[2] + b.head[1]];
  const neckFrom: V3 = [0, c[1] + by * 0.4, c[2] + bz * 0.6];
  const neckPts: V3[] = b.neckMid && q.hi ? [neckFrom, [0, c[1] + b.neckMid[0], c[2] + b.neckMid[1]], hc] : [neckFrom, hc];
  const neckLen = Math.hypot(hc[1] - neckFrom[1], hc[2] - neckFrom[2]);
  const neck = neckLen > b.headR * 1.2 ? chain(neckPts, b.neckR ?? b.headR * 0.6, (b.neckR ?? b.headR * 0.6) * 0.8, b.headCol ?? b.coat, q.s(5, 3)) : [];
  const head = ell(q, q.hi ? 'tiny' : 'nub', hc[0], hc[1], hc[2], b.headR, b.headR, b.headR * 1.1, b.headCol ?? b.coat);
  const [bl, br] = b.beak;
  const beak = orient(cone(br, bl, b.beakCol, q.s(4, 3)), [Math.PI / 2 + (b.beakPitch ?? 0), 0, 0], [0, hc[1] - b.headR * 0.15, hc[2] + b.headR * 0.85]);
  const tail = b.tail > 0 ? [ellR(q, 'nub', [0, c[1] + by * 0.2, c[2] - bz - b.tail * 0.4], [bx * 0.5, by * 0.15, b.tail * 0.6], [-(b.pitch ?? 0) - 0.25, 0, 0], b.wingCol ?? b.coat)] : [];
  const legs =
    b.legs === false
      ? []
      : hiOnly(q, () => pair((s) => limb([s * bx * 0.35, c[1] - by * 0.6, c[2]], [s * bx * 0.35, 0, c[2] + 0.01], Math.max(0.006, bx * 0.08), Math.max(0.005, bx * 0.06), b.legCol ?? b.beakCol, 3)));
  const eyes = hiOnly(q, () => pair((s) => translate(sphere(Math.max(0.006, b.headR * 0.16), 'ink', 3, 2), s * b.headR * 0.7, hc[1] + b.headR * 0.25, hc[2] + b.headR * 0.45)));
  return merge(tintable(merge(body, neck, head, wingGeo(q, b, c), tail)), beak, legs, eyes);
}
