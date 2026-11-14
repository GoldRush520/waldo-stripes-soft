/**
 * Striped cloth builders shared by stalls, parasols and carts: a tint-masked slab with ivory bands,
 * hanging valances (straight or scalloped), and gored umbrella canopies.
 */
import {
  type Geo,
  beam,
  box,
  detail,
  farOnly,
  gable,
  merge,
  profile,
  rotateX,
  rotateY,
  tintable,
  translate,
} from '../../core/geo';
import type { ColorName } from '../../core/palette';
import { type V3, oddBands, orient, tris } from './kit';

export type AwningStyle = 'flat' | 'pitched' | 'scallop' | 'umbrella';

/** Cloth slab W x L (bottom at y = 0) with tinted base and raised ivory stripes running along z. */
export function stripedSlab(W: number, L: number, tint: ColorName, band = 0.4): Geo {
  const n = oddBands(W, band);
  const bw = W / n;
  const bands: Geo[] = [];
  for (let i = 1; i < n; i += 2) bands.push(translate(box(bw, 0.02, L, 'ivory'), -W / 2 + (i + 0.5) * bw, 0.04, 0));
  return merge(tintable(box(W, 0.04, L, tint)), bands);
}

/** Hanging valance along x (top at y = 0.04, hanging to about -0.16), near-only bands + far strip. */
export function valance(W: number, tint: ColorName, scallop: boolean, withFar = true, band = 0.4): Geo {
  const n = oddBands(W, band);
  const bw = W / n;
  const pts: ReadonlyArray<readonly [number, number]> = [
    [-bw / 2, 0.04],
    [bw / 2, 0.04],
    [bw / 2, -0.08],
    [bw * 0.3, -0.14],
    [0, -0.16],
    [-bw * 0.3, -0.14],
    [-bw / 2, -0.08],
  ];
  const piece = (c: ColorName): Geo =>
    scallop ? profile(pts, 0.02, c) : translate(box(bw, 0.2, 0.02, c), 0, -0.16, 0);
  const tinted = tintable(piece(tint));
  const plain = piece('ivory');
  const parts = Array.from({ length: n }, (_, i) => translate(i % 2 === 0 ? tinted : plain, -W / 2 + (i + 0.5) * bw, 0, 0));
  const near = detail(merge(parts));
  return withFar ? merge(near, farOnly(tintable(translate(box(W, 0.18, 0.02, tint), 0, -0.14, 0)))) : near;
}

/** Gored umbrella canopy: rim at y = 0, apex at y = rise; even gores tint-masked, odd gores ivory. */
export function gores(radius: number, rise: number, n: number, tint: ColorName, thick = 0.03): Geo {
  const tinted: V3[] = [];
  const plain: V3[] = [];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    const am = (a0 + a1) / 2;
    const p0: V3 = [Math.sin(a0) * radius, 0, Math.cos(a0) * radius];
    const p1: V3 = [Math.sin(a1) * radius, 0, Math.cos(a1) * radius];
    const q0: V3 = [p0[0], -thick, p0[2]];
    const q1: V3 = [p1[0], -thick, p1[2]];
    const out: V3 = [Math.sin(am), 0, Math.cos(am)];
    const target = i % 2 === 0 ? tinted : plain;
    target.push(
      ...orient([0, rise, 0], p0, p1, [out[0], 1, out[2]]),
      ...orient([0, rise - thick * 1.4, 0], q0, q1, [0, -1, 0]),
      ...orient(p0, p1, q1, out),
      ...orient(p0, q1, q0, out),
    );
  }
  return merge(tintable(tris(tinted, tint)), tris(plain, 'ivory'));
}

const STALL_D = 1.4;
const POST = 0.07;

function postAt(x: number, z: number, top: number): Geo {
  return beam([x, 0, z], [x, top, z], POST, 'timber');
}

/** Flat or scalloped sloping awning with its four posts (stall coordinates). */
function slopedAwning(w: number, tint: ColorName, scallop: boolean): Geo {
  const pz = STALL_D / 2 - 0.04;
  const back = 2.42;
  const front = 2.14;
  const a = Math.atan((back - front) / (2 * pz));
  const W = w + 0.1;
  const L = 1.75;
  const cloth = merge(stripedSlab(W, L, tint), translate(valance(W, tint, scallop), 0, 0, L / 2 + 0.012));
  const zc = 0.1;
  const yc = back - (zc + pz) * Math.tan(a);
  const px = w / 2 - 0.04;
  const posts = [-px, px].flatMap((x) => [postAt(x, -pz, back), postAt(x, pz, front)]);
  return merge(translate(rotateX(cloth, a), 0, yc, zc), posts);
}

function pitchedAwning(w: number, tint: ColorName): Geo {
  const a = 0.6;
  const ridge = 2.62;
  const pz = STALL_D / 2 - 0.04;
  const eave = ridge - pz * Math.tan(a);
  const W = w + 0.1;
  const L = 0.9 / Math.cos(a);
  const slab = stripedSlab(W, L, tint);
  const half = (withFar: boolean): Geo =>
    translate(
      rotateX(merge(slab, translate(valance(W, tint, true, withFar), 0, 0, L / 2 + 0.012)), a),
      0,
      ridge - (L / 2) * Math.sin(a),
      (L / 2) * Math.cos(a),
    );
  const end = rotateY(gable(2 * pz, ridge - eave, 0.03, 'ivory'), Math.PI / 2);
  const px = w / 2 - 0.04;
  const ends = [-px, px].map((x) => translate(end, x, eave, 0));
  const posts = [-px, px].flatMap((x) => [postAt(x, -pz, eave), postAt(x, pz, eave)]);
  return merge(half(true), rotateY(half(false), Math.PI), ends, posts);
}

function umbrellaAwning(w: number, tint: ColorName): Geo {
  const radius = Math.max(w * 0.62, 1.05);
  const pole = beam([0, 0, -0.12], [0, 2.66, -0.12], 0.06, 'timberDeep');
  const foot = translate(box(0.4, 0.08, 0.4, 'slate'), 0, 0, -0.12);
  const canopy = translate(gores(radius, 0.5, 10, tint), 0, 2.16, -0.12);
  return merge(pole, foot, canopy);
}

/** The stall roof (and whatever holds it up) for each awning style. */
export function stallRoof(style: AwningStyle, w: number, tint: ColorName): Geo {
  if (style === 'pitched') return pitchedAwning(w, tint);
  if (style === 'umbrella') return umbrellaAwning(w, tint);
  return slopedAwning(w, tint, style === 'scallop');
}
