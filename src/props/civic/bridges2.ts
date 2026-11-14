/**
 * Canal bridges, part 2: double-leaf drawbridge, plank rope bridge and the three-arch tram viaduct.
 * Same conventions as bridges.ts (span along x, banks at x = ±5, water y = -1).
 */
import { type Col, type Geo, box, cyl, merge, profile, rotateY, rotateZ, translate } from '../../core/geo';
import type { BridgeOpts, BridgeResult } from './bridges';
import { ironRailing, profileRail } from './fences';
import { lampPost } from './fixtures';
import { tramTrack } from './track';
import { type P2, boxAt, deckXs, lod, plateau, range, sampleDeck, segBox, steps, strip } from './util';

export interface DrawBridgeOpts extends BridgeOpts {
  /** true = both leaves raised (canal open, deck gap not walkable) */
  readonly raised?: boolean;
}

const LEAF = 4.2;

function leaf(W: number, c: Col, rail: Col): Geo {
  const near = [
    ...range(9).map((i) => boxAt(0.4, 0.02, W - 0.2, i % 2 ? 'timber' : 'clayLight', 0.25 + i * 0.45, 0, 0)),
    ...[-1, 1].map((s) => boxAt(LEAF, 0.08, 0.08, c, LEAF / 2, -0.3, s * (W / 2 - 0.05))),
  ];
  const rails = [-1, 1].map((s) => translate(ironRailing(LEAF - 0.2, { h: 0.95, color: rail }), LEAF / 2, 0, s * (W / 2 - 0.05)));
  return merge(boxAt(LEAF, 0.28, W, 'timberDeep', LEAF / 2, -0.28, 0), rails, lod(near, []));
}

function gantry(x: number, top: number, W: number, raised: boolean, c: Col): Geo {
  const h = 4.4;
  const zs = [W / 2 + 0.25, -(W / 2 + 0.25)];
  const sx = Math.sign(x);
  const tilt = raised ? -sx * 0.75 : 0;
  const arm = (z: number): Geo =>
    translate(rotateZ(translate(box(6.4, 0.24, 0.18, c), sx * 0.2, -0.12, 0), tilt), x, top + h, z);
  const always = [
    ...zs.map((z) => boxAt(0.32, h + 0.3, 0.32, c, x, top, z)),
    boxAt(0.3, 0.3, W + 0.8, c, x, top + h + 0.3, 0),
    ...zs.map(arm),
  ];
  const tipX = raised ? x - sx * LEAF * Math.cos(1.2) : x - sx * LEAF;
  const tipY = raised ? top + LEAF * Math.sin(1.2) : top;
  const armX = x - sx * 3 * Math.cos(tilt);
  const armY = top + h - sx * 3 * Math.sin(tilt);
  const near = zs.flatMap((z) => [
    segBox(armX, armY, tipX, tipY, 0.04, 0.04, 'ink', z),
    segBox(x + sx * 0.6, top, x, top + 1.6, 0.12, 0.12, c, z),
    boxAt(0.5, 0.5, 0.3, 'cocoa', x + sx * 3, top + h - 0.6, z),
  ]);
  return merge(always, lod(near, []));
}

export function drawBridge(o: DrawBridgeOpts = {}): BridgeResult {
  const L = o.span ?? 16;
  const W = o.width ?? 3;
  const c = o.color ?? 'ivory';
  const top = 0.5;
  const raised = o.raised ?? false;
  const profileY = plateau(top, 0.12);
  const deck = sampleDeck(profileY, 16);
  const xs = deckXs(deck, L);
  const side = (s: number): Geo => {
    const outer = xs.filter((x) => s * x > LEAF + 0.05);
    const ax = s < 0 ? [...outer, -LEAF] : [LEAF, ...outer];
    const ay = ax.map((x) => profileY(x / L + 0.5));
    return merge(
      strip(ax, ay.map((y) => y - 0.3), ay, W, 'timberDeep'),
      boxAt(1.2, 1.2 + top - 0.3, W + 0.4, 'clay', s * (LEAF + 0.5), -1.2, 0),
      ...[-1, 1].map((zs) => profileRail(ax, ay, zs * (W / 2 - 0.05), 0.95, o.accent ?? 'blueDeep')),
      gantry(s * LEAF, top, W, raised, c),
    );
  };
  const ang = raised ? 1.2 : 0;
  const lf = leaf(W, c, o.accent ?? 'blueDeep');
  const leaves = [
    translate(rotateZ(lf, ang), -LEAF, top, 0),
    translate(rotateZ(rotateY(lf, Math.PI), -ang), LEAF, top, 0),
  ];
  const gap: readonly [number, number] = [0.5 - LEAF / L, 0.5 + LEAF / L];
  return { geo: merge(side(-1), side(1), leaves), deck, width: W - 0.2, length: L, ...(raised ? { gap } : {}) };
}

/* ------------------------------------------------------------------ plank rope bridge */

export function plankRopeBridge(o: BridgeOpts = {}): BridgeResult {
  const L = o.span ?? 12;
  const W = o.width ?? 1.3;
  const rope = o.trim ?? 'butterDeep';
  const sag = (t: number): number => 0.05 - 0.4 * Math.sin(Math.PI * t);
  const deck = sampleDeck(sag, 16);
  const xs = deckXs(deck, L);
  const ys = deck.map((p) => p.y);
  const railY = (t: number): number => 1.1 - 0.25 * Math.sin(Math.PI * t);
  const rx = steps(-L / 2, L / 2, 12);
  const ry = rx.map((x) => railY(x / L + 0.5));
  const zs = [W / 2, -W / 2];
  const nPl = Math.round(L / 0.27);
  const planks = range(nPl).map((i) => {
    const t = (i + 0.5) / nPl;
    return translate(rotateZ(box(0.22, 0.05, W, i % 5 === 0 ? 'timberDeep' : o.color ?? 'timber'), Math.cos(Math.PI * t) * -0.12), (t - 0.5) * L, sag(t) - 0.05, 0);
  });
  const ropeSegs = zs.flatMap((z) =>
    range(rx.length - 1).flatMap((i) => [
      segBox(rx[i] ?? 0, ry[i] ?? 0, rx[i + 1] ?? 0, ry[i + 1] ?? 0, 0.035, 0.035, rope, z),
      segBox(rx[i] ?? 0, sag(i / 12) - 0.02, rx[i + 1] ?? 0, sag((i + 1) / 12) - 0.02, 0.035, 0.035, rope, z),
    ]),
  );
  const hangers = zs.flatMap((z) => rx.slice(1, -1).map((x, i) => boxAt(0.02, (ry[i + 1] ?? 1) - sag(x / L + 0.5), 0.02, rope, x, sag(x / L + 0.5), z)));
  const posts = [-1, 1].flatMap((s) => zs.map((z) => translate(cyl(0.1, 0.08, 1.35, 'timberDeep', 6), s * (L / 2 + 0.05), 0, z * 1.1)));
  const fx = steps(-L / 2, L / 2, 6);
  const far = [
    strip(fx, fx.map((x) => sag(x / L + 0.5) - 0.06), fx.map((x) => sag(x / L + 0.5)), W, o.color ?? 'timber'),
    ...zs.map((z) => strip(fx, fx.map((x) => railY(x / L + 0.5) - 0.06), fx.map((x) => railY(x / L + 0.5)), 0.04, rope, z)),
  ];
  return { geo: merge(posts, lod([...planks, ...ropeSegs, ...hangers], far)), deck, width: W - 0.1, length: L };
}

/* ------------------------------------------------------------------ tram viaduct */

function viaductOutline(L: number, top: number, base: number, crown: number): { pts: P2[]; arches: number[]; a: number } {
  const pier = 1.2;
  const a = (L - 4 * pier) / 6;
  const arches = [1, 0, -1].map((k) => k * (2 * a + pier));
  const archPts = arches.flatMap((cx) => steps(0, Math.PI, 10).map((th): P2 => [cx + a * Math.cos(th), base + (crown - base) * Math.sin(th)]));
  return { pts: [[-L / 2, base], [-L / 2, top], [L / 2, top], [L / 2, base], ...archPts], arches, a };
}

export function tramViaduct(o: BridgeOpts = {}): BridgeResult {
  const L = o.span ?? 24;
  const W = o.width ?? 4.4;
  const c = o.color ?? 'clay';
  const trim = o.trim ?? 'ivory';
  const top = 0.05;
  const base = -2.2;
  const crown = -0.75;
  const { pts, arches, a } = viaductOutline(L, top, base, crown);
  const zs = [W / 2 - 0.15, -(W / 2 - 0.15)];
  const faceZ = [W / 2 + 0.02, -W / 2 - 0.02];
  const always = [
    profile(pts, W, c),
    ...zs.map((z) => boxAt(L, 0.75, 0.3, trim, 0, top, z)),
    translate(tramTrack(L - 0.4, { bed: 'stone' }), 0, top, 0),
  ];
  const voussoirs = faceZ.flatMap((z) =>
    arches.flatMap((cx) =>
      range(9).map((k) => {
        const th = ((k + 0.5) / 9) * Math.PI;
        const b = crown - base;
        const ang = Math.atan2(Math.sin(th) / b, Math.cos(th) / a) - Math.PI / 2;
        return translate(rotateZ(box(0.5, 0.4, 0.06, k === 4 ? 'coral' : k % 2 ? trim : 'ivoryShade'), ang), cx + a * Math.cos(th), base + b * Math.sin(th), z);
      }),
    ),
  );
  const near = [
    ...voussoirs,
    ...faceZ.map((z) => boxAt(L, 0.14, 0.08, 'clayDeep', 0, top - 0.25, z)),
    ...zs.map((z) => boxAt(L + 0.1, 0.08, 0.38, 'coralLight', 0, top + 0.75, z)),
    ...faceZ.flatMap((z) => [-1.5, -0.5, 0.5, 1.5].map((k) => boxAt(0.6, top - base - 0.3, 0.1, 'clayLight', k * (2 * a + 1.2), base, z))),
    ...[-1, 1].map((s) => translate(lampPost(3.4), s * (a + 0.6), top + 0.75, zs[s < 0 ? 0 : 1] ?? 0)),
  ];
  const deck = sampleDeck(() => top, 4);
  return { geo: merge(always, lod(near, [])), deck, width: W - 0.6, length: L };
}
