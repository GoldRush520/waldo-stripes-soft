/** Sports-day kit: bleachers, referee chair, tables, balls, ropes, hoops and the bicycle rack. */
import { type Col, type Geo, beam, blob, cone, cyl, detail, merge, rotateX, sphere, tintable, torus, translate } from '../../core/geo';
import type { PropDef } from '../registry';
import { type Seat, type V3, barX, boxAt, lodPair, prop, revolve } from './kit';

const TIERS = 3;
const PER_TIER = 4;

function bleachersBuild(): Geo {
  const tiers = Array.from({ length: TIERS }, (_, k) =>
    merge(
      boxAt(4.0, 0.08, 0.35, 'timber', 0, 0.37 + k * 0.4, 0.6 - k * 0.6),
      boxAt(4.0, 0.06, 0.25, 'timberDeep', 0, 0.12 + k * 0.4, 0.25 - k * 0.6),
    ),
  );
  const frame = [-1.9, 0, 1.9].map((x) => merge(beam([x, 0.05, 0.9], [x, 1.25, -0.7], 0.08, 'slate'), boxAt(0.08, 1.25, 0.08, 'slate', x, 0, -0.75)));
  const rail = detail(merge(beam([-2, 1.25, -0.85], [2, 1.25, -0.85], 0.04, 'slate'), beam([-2, 2.1, -0.85], [2, 2.1, -0.85], 0.04, 'slate'), ...[-2, 2].map((x) => beam([x, 1.25, -0.85], [x, 2.1, -0.85], 0.04, 'slate'))));
  const far = merge(tiers.map((_, k) => boxAt(4.0, 0.45 + k * 0.4, 0.6, 'timber', 0, 0, 0.6 - k * 0.6)));
  return merge(lodPair(merge(tiers, frame), far), rail);
}

const BLEACHER_SEATS: readonly Seat[] = Array.from({ length: TIERS * PER_TIER }, (_, i) => {
  const k = Math.floor(i / PER_TIER);
  const j = i % PER_TIER;
  return { x: -1.5 + j * 1.0, y: 0.45 + k * 0.4, z: 0.6 - k * 0.6, heading: 0 };
});

function refChairBuild(): Geo {
  const legs = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => beam([sx * 0.45, 0, sz * 0.45], [sx * 0.28, 1.75, sz * 0.28], 0.06, 'ivory')));
  const rungs = detail(merge(Array.from({ length: 6 }, (_, i) => boxAt(0.6, 0.04, 0.04, 'ivoryShade', 0, 0.25 + i * 0.28, 0.45 - i * 0.03))));
  const seat = merge(boxAt(0.62, 0.08, 0.6, 'sage', 0, 1.75, 0), boxAt(0.62, 0.55, 0.06, 'sage', 0, 1.83, -0.28));
  const arms = detail(merge([-1, 1].map((s) => boxAt(0.05, 0.05, 0.5, 'ivory', s * 0.3, 2.05, 0))));
  const parasolPole = beam([0.32, 1.8, -0.3], [0.32, 3.0, -0.3], 0.03, 'slate');
  const parasol = translate(tintable(cone(0.7, 0.35, 'butter', 8)), 0.32, 2.85, -0.3);
  const farLegs = merge([-1, 1].map((s) => boxAt(0.06, 1.75, 0.8, 'ivory', s * 0.37, 0, 0)));
  return merge(lodPair(merge(legs, rungs, arms, parasolPole), farLegs), seat, parasol);
}

function waterCoolerBuild(): Geo {
  const table = merge(boxAt(1.2, 0.04, 0.6, 'ivory', 0, 0.72, 0), ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => boxAt(0.04, 0.72, 0.04, 'slate', sx * 0.55, 0, sz * 0.25))));
  const jug = merge(cyl(0.16, 0.16, 0.4, 'blue', 10), translate(cyl(0.16, 0.05, 0.08, 'blue', 10), 0, 0.4, 0), translate(cyl(0.05, 0.05, 0.04, 'ivory', 8), 0, 0.48, 0));
  const tap = detail(boxAt(0.05, 0.05, 0.08, 'slate', 0, 0.08, 0.17));
  const cups = detail(merge([0.25, 0.35, 0.45].map((x, i) => translate(cyl(0.03, 0.035, 0.08, i === 1 ? 'butter' : 'ivory', 6), x, 0, 0.1))));
  return merge(table, translate(merge(lodPair(jug, boxAt(0.32, 0.5, 0.32, 'blue', 0, 0, 0)), tap, cups), -0.25, 0.76, 0));
}

function trophy(h: number, handles = false): Geo {
  const near = merge(
    boxAt(0.12, 0.05, 0.12, 'timberDeep', 0, 0, 0),
    revolve([[0.03, 0.05], [0.025, 0.05 + h * 0.4], [0.08, 0.05 + h * 0.75], [0.09, 0.05 + h], [0.01, 0.05 + h]], 'butter', 6),
    handles ? merge([-1, 1].map((s) => beam([s * 0.08, 0.05 + h * 0.9, 0], [s * 0.12, 0.05 + h * 0.6, 0], 0.015, 'butterDeep'))) : [],
  );
  return lodPair(near, translate(rotateX(cone(0.09, h, 'butter', 4), Math.PI), 0, h + 0.05, 0));
}

function trophyTableBuild(): Geo {
  const table = merge(boxAt(1.6, 0.76, 0.7, 'ivory', 0, 0, 0), translate(tintable(boxAt(1.64, 0.25, 0.74, 'blue', 0, 0, 0)), 0, 0.5, 0));
  const cups = merge(translate(trophy(0.45, true), 0, 0.76, 0), translate(trophy(0.32), -0.45, 0.76, 0.05), translate(trophy(0.26), 0.45, 0.76, 0.05));
  const rosettes = detail(merge([-0.4, 0.4].map((x, i) => translate(rotateX(cyl(0.06, 0.06, 0.02, i === 0 ? 'coral' : 'sage', 6), Math.PI / 2), x, 0.62, 0.37))));
  return merge(table, cups, rosettes);
}

function ball(r: number, near: Col, far: Col, wSeg: number, hSeg: number): Geo {
  return lodPair(translate(sphere(r, near, wSeg, hSeg), 0, r, 0), translate(sphere(r, far, 5, 3), 0, r, 0));
}

function footballBuild(): Geo {
  const patches = detail(merge([0, 1, 2, 3, 4].map((i) => {
    const a = (i / 5) * Math.PI * 2;
    return translate(blob(0.035, 0.035, 0.012, 'ink', 4, 3), Math.sin(a) * 0.08, 0.11 + Math.cos(a) * 0.08, 0.075);
  })));
  return merge(ball(0.11, 'white', 'white', 8, 5), patches);
}

function basketballBuild(): Geo {
  const seams = detail(translate(rotateX(torus(0.121, 0.004, 'cocoa', 3, 10), Math.PI / 2), 0, 0.12, 0));
  return merge(ball(0.12, 'coralDeep', 'coralDeep', 8, 6), seams);
}

function beachBallBuild(): Geo {
  const gores = Array.from({ length: 6 }, (_, i) => {
    const g = revolve([[0.01, -0.2], [0.14, -0.14], [0.2, 0], [0.14, 0.14], [0.01, 0.2]], i % 2 === 0 ? 'coral' : 'ivory', 2, (i / 6) * Math.PI * 2, Math.PI / 3);
    return i % 2 === 0 ? tintable(g) : g;
  });
  const far = merge(Array.from({ length: 6 }, (_, i) => {
    const g = revolve([[0.01, -0.2], [0.2, 0], [0.01, 0.2]], i % 2 === 0 ? 'coral' : 'ivory', 1, (i / 6) * Math.PI * 2, Math.PI / 3);
    return i % 2 === 0 ? tintable(g) : g;
  }));
  return translate(lodPair(merge(gores), far), 0, 0.2, 0);
}

function tennisScatterBuild(): Geo {
  const spots: readonly V3[] = [[0, 0, 0], [0.4, 0, 0.3], [-0.5, 0, 0.2], [0.2, 0, -0.5], [-0.3, 0, -0.4], [0.7, 0, -0.1]];
  const near = spots.map((p) => translate(sphere(0.033, 'sageLight', 5, 3), p[0], 0.033, p[2]));
  const far = boxAt(0.5, 0.06, 0.4, 'sageLight', 0.1, 0, -0.05);
  return lodPair(merge(near), far);
}

function tugRopeBuild(): Geo {
  const rope = translate(barX(8, 0.025, 'timber', 6), 0, 0, 0);
  const far = boxAt(8, 0.05, 0.05, 'timber', 0, -0.025, 0);
  const ribbon = merge(boxAt(0.06, 0.25, 0.02, 'coral', 0, -0.25, 0), boxAt(0.08, 0.07, 0.07, 'coral', 0, -0.035, 0));
  const knots = detail(merge([-3.9, 3.9].map((x) => translate(sphere(0.05, 'timberDeep', 5, 3), x, 0, 0))));
  return merge(lodPair(rope, far), ribbon, knots);
}

function skipArcBuild(): Geo {
  const pts: V3[] = Array.from({ length: 9 }, (_, i) => {
    const a = Math.PI * (i / 8);
    return [-Math.cos(a) * 1.55, 0.95 + Math.sin(a) * 1.15, 0];
  });
  const near = merge(pts.slice(0, -1).map((p, i) => beam(p, pts[i + 1] ?? p, 0.02, 'coral')));
  const farPts = pts.filter((_, i) => i === 0 || i === 3 || i === 5 || i === 8);
  const far = merge(farPts.slice(0, -1).map((p, i) => beam(p, farPts[i + 1] ?? p, 0.03, 'coral')));
  const handles = detail(merge([-1.55, 1.55].map((x) => translate(cyl(0.025, 0.025, 0.14, 'butter', 5), x, 0.88, 0))));
  return merge(tintable(lodPair(near, far)), handles);
}

function hulaHoopBuild(): Geo {
  return tintable(lodPair(torus(0.45, 0.015, 'coral', 4, 18), torus(0.45, 0.02, 'coral', 3, 6)));
}

function bikeRackBuild(): Geo {
  const hoops = Array.from({ length: 5 }, (_, i) => {
    const x = -1.6 + i * 0.8;
    return merge(beam([x, 0, -0.3], [x, 0.7, -0.3], 0.04, 'slate'), beam([x, 0.7, -0.3], [x, 0.7, 0.3], 0.04, 'slate'), beam([x, 0.7, 0.3], [x, 0, 0.3], 0.04, 'slate'));
  });
  const far = merge(Array.from({ length: 5 }, (_, i) => boxAt(0.04, 0.72, 0.64, 'slate', -1.6 + i * 0.8, 0, 0)));
  return lodPair(merge(hoops), far);
}

export const SPORTKIT_PROPS: readonly PropDef[] = [
  prop('sport.bleachers', bleachersBuild, [4.0, 2.0], 'stall', { seats: BLEACHER_SEATS, tags: ['sports', 'seating'] }),
  prop('sport.refchair', refChairBuild, [1.0, 1.0], 'furniture', { tint: 'butter', seats: [{ x: 0, y: 1.83, z: 0.02, heading: 0 }], tags: ['sports', 'seat'] }),
  prop('sport.watercooler', waterCoolerBuild, [1.2, 0.6], 'furniture', { tags: ['sports', 'table'] }),
  prop('sport.trophytable', trophyTableBuild, [1.7, 0.8], 'furniture', { tint: 'blue', tags: ['sports', 'table'] }),
  prop('ball.football', footballBuild, [0, 0], 'clutter', { tags: ['sports', 'ball', 'clutter'] }),
  prop('ball.basketball', basketballBuild, [0, 0], 'clutter', { tags: ['sports', 'ball', 'clutter'] }),
  prop('ball.beach', beachBallBuild, [0, 0], 'clutter', { tint: 'coral', tags: ['beach', 'ball', 'clutter'] }),
  prop('ball.tennisscatter', tennisScatterBuild, [0, 0], 'clutter', { tags: ['sports', 'ball', 'clutter'] }),
  prop('sport.tugrope', tugRopeBuild, [0, 0], 'clutter', { origin: 'pivot', tags: ['sports', 'carried', 'rope'] }),
  prop('sport.skippingrope', skipArcBuild, [0, 0], 'clutter', { origin: 'pivot', tint: 'coral', tags: ['playground', 'rope', 'story'] }),
  prop('sport.hulahoop', hulaHoopBuild, [0, 0], 'clutter', { origin: 'pivot', tint: 'butter', tags: ['playground', 'carried'] }),
  prop('sport.bikerack', bikeRackBuild, [3.4, 0.7], 'furniture', { tags: ['street', 'sports'] }),
];
