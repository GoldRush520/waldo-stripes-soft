/**
 * Playground equipment. Moving parts are separate props with the origin at their pivot:
 * - "swing.seat": origin at the top hanger pivot (see SWING_PIVOTS in frame space); swings about x.
 * - "seesaw.plank": origin at the fulcrum (SEESAW_PIVOT in base space); tilts about z.
 * - "playground.roundabout": origin at the centre on the ground; rotates about y.
 */
import { type Col, type Geo, beam, blob, cone, cyl, detail, merge, rotateX, rotateY, sphere, tintable, torus, translate } from '../../core/geo';
import type { PropDef } from '../registry';
import { type Seat, type V3, barX, boxAt, drumProfile, lodPair, prop, revolve, rope, stripedLod } from './kit';

const SWING_TOP = 2.4;
const SWING_DROP = 1.9;

/** The four seat pivots of "swing.frame" (two per bay), in frame space. */
export const SWING_PIVOTS: readonly V3[] = [-1.55, -0.55, 0.55, 1.55].map((x) => [x, SWING_TOP - 0.05, 0] as const);

function swingFrameBuild(): Geo {
  const legs = [-2.1, 2.1].flatMap((x) => [
    beam([x, 0, -1.2], [x, SWING_TOP, 0], 0.09, 'sage'),
    beam([x, 0, 1.2], [x, SWING_TOP, 0], 0.09, 'sage'),
  ]);
  const legsNear = [-2.1, 0, 2.1].flatMap((x) => [
    cylBetween([x, 0.02, -1.2], [x, SWING_TOP, 0], 0.05, 'sage'),
    cylBetween([x, 0.02, 1.2], [x, SWING_TOP, 0], 0.05, 'sage'),
  ]);
  const bar = lodPair(translate(barX(4.4, 0.06, 'butter', 8), 0, SWING_TOP, 0), boxAt(4.4, 0.12, 0.12, 'butter', 0, SWING_TOP - 0.06, 0));
  const hooks = detail(merge(SWING_PIVOTS.map((p) => boxAt(0.5, 0.06, 0.04, 'slate', p[0], p[1] - 0.03, 0))));
  return merge(lodPair(merge(legsNear), merge(legs)), bar, hooks);
}

function cylBetween(a: V3, b: V3, r: number, col: Col): Geo {
  const dy = b[1] - a[1];
  const dz = b[2] - a[2];
  const len = Math.hypot(dy, dz);
  return translate(rotateX(cyl(r, r, len, col, 6), Math.atan2(dz, dy)), a[0], a[1], a[2]);
}

function swingSeatBuild(): Geo {
  const chains = merge([-0.22, 0.22].map((x) => rope([x, 0, 0], [x, -SWING_DROP + 0.04, 0], 0.025, 'slate')));
  const farChain = beam([0, 0, 0], [0, -SWING_DROP, 0], 0.05, 'slate');
  const seat = tintable(boxAt(0.48, 0.05, 0.2, 'coral', 0, -SWING_DROP, 0));
  return merge(lodPair(chains, farChain), seat);
}

function slideBuild(): Geo {
  const h = 1.5;
  const deck = boxAt(0.8, 0.08, 0.8, 'clay', 0, h - 0.08, -0.9);
  const postsG = lodPair(
    merge([-1, 1].flatMap((sx) => [-1, 1].map((sz) => boxAt(0.07, h + 0.9, 0.07, 'sage', sx * 0.37, 0, -0.9 + sz * 0.37)))),
    merge([-1, 1].map((sx) => boxAt(0.07, h + 0.9, 0.8, 'sage', sx * 0.37, 0, -0.9))),
  );
  const ladder = lodPair(
    merge(
      [-1, 1].map((s) => beam([s * 0.3, 0, -1.75], [s * 0.3, h, -1.3], 0.05, 'butter')),
      Array.from({ length: 5 }, (_, i) => boxAt(0.6, 0.03, 0.06, 'butter', 0, 0.3 * (i + 1) - 0.03, -1.75 + 0.09 * (i + 1))),
    ),
    boxAt(0.6, h, 0.06, 'butter', 0, 0, -1.55),
  );
  const chuteLen = Math.hypot(h - 0.35, 2.3);
  const tilt = Math.atan2(h - 0.35, 2.3);
  const chuteNear = merge(boxAt(0.55, 0.04, chuteLen, 'coral', 0, 0, 0), boxAt(0.04, 0.2, chuteLen, 'coral', -0.3, 0, 0), boxAt(0.04, 0.2, chuteLen, 'coral', 0.3, 0, 0));
  const chute = translate(rotateX(lodPair(chuteNear, boxAt(0.64, 0.2, chuteLen, 'coral', 0, 0, 0)), tilt), 0, 0.35 + (h - 0.35) / 2, -0.5 + 1.15);
  const runout = tintable(boxAt(0.55, 0.04, 0.5, 'coral', 0, 0.33, 2.0));
  const legs = detail(boxAt(0.5, 0.33, 0.06, 'sage', 0, 0, 2.1));
  const rails = detail(merge([-1, 1].map((s) => beam([s * 0.37, h + 0.6, -1.3], [s * 0.37, h + 0.6, -0.5], 0.04, 'butter'))));
  const roof = translate(tintable(cone(0.65, 0.5, 'coral', 4)), 0, h + 0.9, -0.9);
  return merge(deck, postsG, ladder, tintable(chute), runout, legs, rails, roof);
}

export const SEESAW_PIVOT: V3 = [0, 0.6, 0];

function seesawBaseBuild(): Geo {
  const pin = lodPair(translate(rotateX(cyl(0.08, 0.08, 0.45, 'slate', 8), Math.PI / 2), 0, SEESAW_PIVOT[1], -0.225), boxAt(0.14, 0.14, 0.45, 'slate', 0, SEESAW_PIVOT[1] - 0.07, 0));
  const block = merge(boxAt(0.5, 0.5, 0.35, 'sage', 0, 0, 0), pin);
  const tyres = [-1, 1].map((s) => translate(lodPair(torus(0.2, 0.07, 'ink', 4, 10), cyl(0.27, 0.27, 0.14, 'ink', 6)), s * 1.55, 0.07, 0));
  return merge(block, tyres);
}

function seesawPlankBuild(): Geo {
  const plank = tintable(boxAt(3.6, 0.08, 0.3, 'butter', 0, -0.04, 0));
  const handles = [-1, 1].map((s) => merge(boxAt(0.05, 0.35, 0.05, 'slate', s * 1.3, 0.04, 0), translate(barX(0.3, 0.025, 'coral', 6), s * 1.3, 0.38, 0)));
  const pads = detail(merge([-1, 1].map((s) => boxAt(0.35, 0.04, 0.32, 'coral', s * 1.6, 0.04, 0))));
  return merge(plank, lodPair(merge(handles), merge([-1, 1].map((s) => boxAt(0.05, 0.4, 0.3, 'slate', s * 1.3, 0.04, 0)))), pads);
}

const SEESAW_SEATS: readonly Seat[] = [
  { x: -1.6, y: 0.08, z: 0, heading: Math.PI / 2 },
  { x: 1.6, y: 0.08, z: 0, heading: -Math.PI / 2 },
];

function roundaboutBuild(): Geo {
  const disc = stripedLod(drumProfile(1.25, 0.32), 8, 2, 1, 'coral', 'butter');
  const hub = lodPair(merge(cyl(0.08, 0.08, 1.0, 'slate', 8), translate(sphere(0.1, 'butter', 6, 4), 0, 1.0, 0)), boxAt(0.16, 1.05, 0.16, 'slate', 0, 0, 0));
  const bars = Array.from({ length: 4 }, (_, i) => {
    const a = (i / 4) * Math.PI * 2;
    const s = Math.sin(a);
    const c = Math.cos(a);
    return merge(beam([s * 0.1, 0.9, c * 0.1], [s * 1.1, 0.9, c * 1.1], 0.04, 'slate'), beam([s * 1.1, 0.9, c * 1.1], [s * 1.1, 0.32, c * 1.1], 0.04, 'slate'));
  });
  const far = merge(Array.from({ length: 2 }, (_, i) => rotateY(boxAt(2.2, 0.06, 0.06, 'slate', 0, 0.9, 0), (i * Math.PI) / 2)));
  return merge(disc, hub, lodPair(merge(bars), far));
}

const ROUNDABOUT_SEATS: readonly Seat[] = Array.from({ length: 4 }, (_, i) => {
  const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
  return { x: Math.sin(a) * 0.9, y: 0.32, z: Math.cos(a) * 0.9, heading: a + Math.PI };
});

function domeBuild(): Geo {
  const R = 1.8;
  const node = (i: number, k: number): V3 => {
    const a = (i / 10) * Math.PI * 2;
    const e = (k / 4) * (Math.PI / 2);
    return [Math.sin(a) * Math.cos(e) * R, Math.sin(e) * R + 0.02, Math.cos(a) * Math.cos(e) * R];
  };
  const mer = Array.from({ length: 10 }, (_, i) => Array.from({ length: 4 }, (_, k) => beam(node(i, k), node(i, k + 1), 0.045, i % 2 === 0 ? 'coral' : 'blue')));
  const par = Array.from({ length: 3 }, (_, k) => Array.from({ length: 10 }, (_, i) => beam(node(i, k + 1), node(i + 1, k + 1), 0.045, 'butter')));
  const base = Array.from({ length: 10 }, (_, i) => beam(node(i, 0), node(i + 1, 0), 0.06, 'sage'));
  const far = Array.from({ length: 5 }, (_, i) => [beam(node(i * 2, 0), node(i * 2, 2), 0.08, 'coral'), beam(node(i * 2, 2), node(i * 2, 4), 0.08, 'coral')]);
  const farRing = Array.from({ length: 5 }, (_, i) => beam(node(i * 2, 2), node(i * 2 + 2, 2), 0.08, 'butter'));
  return merge(lodPair(merge(mer, par), merge(far, farRing)), base);
}

function monkeyBarsBuild(): Geo {
  const h = 2.1;
  const ends = [-1.5, 1.5].flatMap((x) => [boxAt(0.07, h, 0.07, 'blue', x, 0, -0.3), boxAt(0.07, h, 0.07, 'blue', x, 0, 0.3)]);
  const rungs = detail(merge([-1.5, 1.5].flatMap((x) => [0.4, 0.8, 1.2, 1.6].map((y) => boxAt(0.04, 0.04, 0.6, 'butter', x, y, 0)))));
  const rails = [-0.3, 0.3].map((z) => boxAt(3.1, 0.07, 0.07, 'blue', 0, h - 0.07, z));
  const bars = detail(merge(Array.from({ length: 9 }, (_, i) => boxAt(0.04, 0.04, 0.6, 'butter', -1.2 + i * 0.3, h - 0.07, 0))));
  return merge(ends, rungs, rails, bars);
}

function springCoil(): Geo {
  const near = merge(Array.from({ length: 3 }, (_, i) => translate(torus(0.09, 0.025, 'slate', 3, 6), 0, 0.12 + i * 0.1, 0)));
  return lodPair(near, cyl(0.1, 0.1, 0.4, 'slate', 5));
}

function riderBase(): Geo {
  return merge(cyl(0.3, 0.3, 0.06, 'stone', 6), translate(springCoil(), 0, 0.03, 0));
}

function duckRiderBuild(): Geo {
  const body = tintable(lodPair(translate(blob(0.25, 0.2, 0.38, 'butter', 7, 5), 0, 0.62, 0), boxAt(0.45, 0.35, 0.7, 'butter', 0, 0.45, 0)));
  const head = lodPair(translate(sphere(0.15, 'butter', 6, 4), 0, 0.95, 0.3), boxAt(0.26, 0.26, 0.26, 'butter', 0, 0.82, 0.3));
  const beak = translate(rotateX(cone(0.06, 0.15, 'coral', 5), Math.PI / 2), 0, 0.93, 0.43);
  const handles = detail(translate(barX(0.36, 0.02, 'slate', 5), 0, 0.92, 0.2));
  const eyes = detail(merge([-1, 1].map((s) => boxAt(0.03, 0.04, 0.03, 'ink', s * 0.12, 0.98, 0.36))));
  return merge(riderBase(), body, head, beak, handles, eyes);
}

function horseRiderBuild(): Geo {
  const body = tintable(lodPair(translate(blob(0.18, 0.2, 0.4, 'blue', 7, 5), 0, 0.62, 0), boxAt(0.36, 0.35, 0.75, 'blue', 0, 0.45, 0)));
  const neck = tintable(beam([0, 0.7, 0.28], [0, 1.0, 0.42], 0.13, 'blue'));
  const head = tintable(lodPair(translate(blob(0.09, 0.1, 0.18, 'blue', 6, 4), 0, 1.02, 0.52), boxAt(0.16, 0.18, 0.34, 'blue', 0, 0.93, 0.52)));
  const mane = detail(beam([0, 0.82, 0.3], [0, 1.1, 0.42], 0.05, 'butter'));
  const handles = detail(translate(barX(0.34, 0.02, 'slate', 5), 0, 0.95, 0.38));
  return merge(riderBase(), body, neck, head, mane, handles);
}

function sandboxBuild(): Geo {
  const frame = merge([-1, 1].flatMap((s) => [boxAt(2.5, 0.3, 0.12, 'timber', 0, 0, s * 1.19), boxAt(0.12, 0.3, 2.26, 'timber', s * 1.19, 0, 0)]));
  const sand = boxAt(2.26, 0.2, 2.26, 'sand', 0, 0, 0);
  const mound = lodPair(translate(blob(0.5, 0.18, 0.4, 'sand', 6, 4), -0.4, 0.2, -0.3), boxAt(0.7, 0.1, 0.6, 'sand', -0.4, 0.2, -0.3));
  const toys = detail(
    merge(
      translate(revolve([[0.07, 0], [0.1, 0.16], [0.09, 0.16], [0.06, 0.02], [0.01, 0.02]], 'coral', 8), 0.5, 0.2, 0.4),
      beam([0.2, 0.21, 0.6], [0.45, 0.22, 0.75], 0.03, 'blue'),
      boxAt(0.12, 0.02, 0.1, 'blue', 0.5, 0.2, 0.8),
      boxAt(0.3, 0.12, 0.18, 'butter', -0.6, 0.2, 0.5),
      boxAt(0.12, 0.1, 0.16, 'butter', -0.4, 0.32, 0.5),
    ),
  );
  return merge(frame, sand, mound, toys);
}

export const PLAYGROUND_PROPS: readonly PropDef[] = [
  prop('swing.frame', swingFrameBuild, [4.4, 2.5], 'furniture', { tags: ['playground'] }),
  prop('swing.seat', swingSeatBuild, [0, 0], 'clutter', {
    origin: 'pivot',
    tint: 'coral',
    seats: [{ x: 0, y: -SWING_DROP + 0.05, z: 0, heading: 0 }],
    tags: ['playground', 'moving', 'rotate:x'],
  }),
  prop('playground.slide', slideBuild, [1.0, 4.0], 'furniture', { tint: 'coral', tags: ['playground'] }),
  prop('seesaw.base', seesawBaseBuild, [3.6, 0.6], 'furniture', { tags: ['playground'] }),
  prop('seesaw.plank', seesawPlankBuild, [0, 0], 'furniture', {
    origin: 'pivot',
    tint: 'butter',
    seats: SEESAW_SEATS,
    tags: ['playground', 'moving', 'rotate:z'],
  }),
  prop('playground.roundabout', roundaboutBuild, [2.5, 2.5], 'furniture', {
    tint: 'coral',
    seats: ROUNDABOUT_SEATS,
    tags: ['playground', 'moving', 'rotate:y'],
  }),
  prop('playground.climbdome', domeBuild, [3.6, 3.6], 'stall', { tags: ['playground'] }),
  prop('playground.monkeybars', monkeyBarsBuild, [3.1, 0.7], 'furniture', { tags: ['playground'] }),
  prop('springrider.duck', duckRiderBuild, [0.6, 0.8], 'furniture', { tint: 'butter', seats: [{ x: 0, y: 0.8, z: -0.05, heading: 0 }], tags: ['playground'] }),
  prop('springrider.horse', horseRiderBuild, [0.6, 0.9], 'furniture', { tint: 'blue', seats: [{ x: 0, y: 0.8, z: -0.05, heading: 0 }], tags: ['playground'] }),
  prop('playground.sandbox', sandboxBuild, [2.5, 2.5], 'furniture', { tags: ['playground'] }),
];
