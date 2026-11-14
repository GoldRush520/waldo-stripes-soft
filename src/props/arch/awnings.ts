/**
 * Striped fabric awnings. Local frame: centred on x, top back edge at y = 0 on the wall plane
 * z = 0, cloth running out toward +z and down. Coloured stripes are tint-masked; alternate
 * stripes stay ivory. Stripes are part of the far tier (they are the silhouette); arms are detail.
 */
import * as THREE from 'three';
import { type Col, type Geo, detail, farOnly, fromThree, merge, rotateY, tintable } from '../../core/geo';
import { HALF_PI, PI, type V2, arc, bx, bxc, fit, slab, unit } from './kit';
import type { AwningKind } from './types';

export interface AwningOpts {
  readonly w: number;
  readonly kind?: AwningKind;
  /** horizontal projection from the wall */
  readonly depth?: number;
  /** vertical fall of the sloped cloth */
  readonly drop?: number;
  /** height of the front valance */
  readonly valance?: number;
  /** approximate stripe width */
  readonly stripeW?: number;
  /** colour of the tint-masked stripes before tinting */
  readonly col?: Col;
  /** iron support arms (default true) */
  readonly arms?: boolean;
}

const T = 0.035;

function stripeUnit(depth: number, drop: number, valance: number, col: Col, withValance: boolean): Geo {
  const key = `awn:${depth.toFixed(2)}:${drop.toFixed(2)}:${valance.toFixed(2)}:${withValance}`;
  return unit(key, col, () => {
    const pts = withValance
      ? ([
          [0, 0],
          [depth, -drop],
          [depth, -drop - valance],
          [depth - T, -drop - valance],
          [depth - T, -drop - T * 0.5],
        ] as const)
      : ([
          [0, 0],
          [depth, -drop],
          [depth - T, -drop - T],
          [0, -T],
        ] as const);
    // profile extrudes along z (unit width); turn so the profile's x runs out along +z
    return rotateY(slab(pts, 1, col), -HALF_PI);
  });
}

function scallopUnit(sw: number, valance: number, col: Col): Geo {
  return unit(`scal:${sw.toFixed(2)}:${valance.toFixed(2)}`, col, () => {
    // flattened half-ellipse tongue below a straight band
    const tongue = arc([0, 0], 1, 0, -PI, 3).map(([x, y]) => [x * (sw / 2), -valance + y * sw * 0.3] as const);
    const pts = [[-sw / 2, 0] as const, [sw / 2, 0] as const, ...tongue];
    return slab(pts, T, col);
  });
}

function stripeColour(i: number, col: Col): { readonly c: Col; readonly tinted: boolean } {
  return i % 2 === 0 ? { c: col, tinted: true } : { c: 'ivory', tinted: false };
}

function stripes(o: Required<AwningOpts>, stripeW: number, scalloped: boolean): Geo {
  const n = Math.max(3, Math.round(o.w / stripeW) | 1);
  const sw = o.w / n;
  const tinted: Geo[] = [];
  const plain: Geo[] = [];
  for (let i = 0; i < n; i++) {
    const x = -o.w / 2 + (i + 0.5) * sw;
    const { c, tinted: isTint } = stripeColour(i, o.col);
    const parts = [fit(stripeUnit(o.depth, o.drop, o.valance, c, !scalloped), [sw, 1, 1], [x, 0, 0])];
    if (scalloped) {
      parts.push(fit(scallopUnit(sw, o.valance * 0.6, c), [1, 1, 1], [x, -o.drop, o.depth - T / 2]));
    }
    (isTint ? tinted : plain).push(...parts);
  }
  return merge(tintable(merge(tinted)), plain);
}

/** Near: fine stripes (scalloped or with valance). Far: half as many bold stripes, same outline. */
function straight(o: Required<AwningOpts>, scalloped: boolean): Geo {
  return merge(
    detail(stripes(o, scalloped ? Math.max(o.stripeW, 0.6) : o.stripeW, scalloped)),
    farOnly(stripes(o, o.stripeW * 2.4, false)),
    o.arms ? armsOf(o) : [],
  );
}

function armsOf(o: Required<AwningOpts>): Geo {
  // diagonal stay from a wall bracket 0.5 m below the cloth's front edge level up to that edge
  const len = Math.hypot(o.depth, 0.5);
  const tilt = Math.atan2(o.depth, 0.5);
  const arms = [-1, 1].map((s) =>
    bxc(0.03, len, 0.03, 'ink', [s * (o.w / 2 - 0.08), -o.drop - 0.25, o.depth / 2], tilt, 0, 0),
  );
  const rod = bx(o.w, 0.04, 0.04, 'ink', 0, -0.02, 0.03);
  return detail(merge(arms, rod));
}

/** Superellipse half-outline (radius, axial) from the +axial pole to the -axial pole: a barrel with rounded ends. */
function barrel(r: number, seg: number, reverse: boolean): V2[] {
  const p = 0.35;
  const pts = Array.from({ length: seg + 1 }, (_, i) => {
    const a = HALF_PI - (i * Math.PI) / seg;
    const s = Math.sin(a);
    return [r * Math.pow(Math.abs(Math.cos(a)), p), r * Math.sign(s) * Math.pow(Math.abs(s), p)] as const;
  });
  return reverse ? pts.reverse() : pts;
}

function domeGores(o: Required<AwningOpts>, n: number, arcSeg: number): Geo {
  const r = o.w / 2;
  const v = o.drop + o.valance;
  const prof = [...barrel(r, arcSeg, false), ...barrel(r - T, arcSeg, true)].map(([a, b]) => new THREE.Vector2(Math.max(0, a), b));
  const gores = Array.from({ length: n }, (_, i) => {
    const { c, tinted } = stripeColour(i, o.col);
    const g = fromThree(new THREE.LatheGeometry(prof, 1, -HALF_PI + (i * HALF_PI) / n, HALF_PI / n), c);
    // lathe axis y -> x; the gore fans over y >= 0, z >= 0; then squash to (drop + valance) x depth
    const placed = fit(g, [1, 1, 1], [0, 0, 0], 0, 0, -HALF_PI);
    const squashed = fit(placed, [1, v / r, o.depth / r], [0, -v, 0]);
    return tinted ? tintable(squashed) : squashed;
  });
  return merge(gores);
}

/** Pram-hood (dome) awning: gores revolve about the x axis over the upper front quarter. */
function domeAwning(o: Required<AwningOpts>): Geo {
  const v = o.drop + o.valance;
  const rim = bx(o.w, 0.05, 0.05, 'ink', 0, -v - 0.02, 0.03);
  return merge(detail(merge(domeGores(o, 7, 8), rim)), farOnly(domeGores(o, 3, 4)));
}

/** Striped awning (straight with valance, scalloped valance, or dome / pram hood). */
export function awning(opts: AwningOpts): Geo {
  const o: Required<AwningOpts> = {
    kind: 'straight',
    depth: 1.2,
    drop: 0.45,
    valance: 0.22,
    stripeW: 0.5,
    col: 'coral',
    arms: true,
    ...opts,
  };
  if (o.kind === 'dome') return domeAwning(o);
  return straight(o, o.kind === 'scalloped');
}
