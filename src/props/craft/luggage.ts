/** Tram-station luggage: single pieces (tint-masked shells, ivory straps). */
import {
  type Col,
  type Geo,
  blob,
  box,
  capsule,
  cone,
  cyl,
  detail,
  dome,
  farOnly,
  merge,
  profile,
  rbox,
  rotateX,
  rotateZ,
  sphere,
  tintable,
  translate,
} from '../../core/geo';
import type { PropDef } from '../registry';
import { PI, at, lodPair, lyingX, prop, rod } from './kit';

export type SuitcaseSize = 's' | 'm' | 'l';

/** [width x, height y, depth z] of an upright suitcase. */
export const SUITCASE_DIMS: Readonly<Record<SuitcaseSize, readonly [number, number, number]>> = {
  s: [0.4, 0.55, 0.2],
  m: [0.45, 0.68, 0.25],
  l: [0.52, 0.8, 0.3],
};

/** Suitcase standing on its end (or lying on its back when `flat`): tint-masked shell, ivory strap. */
export function suitcase(size: SuitcaseSize, flat = false, shell: Col = 'coral'): Geo {
  const [w, h, d] = SUITCASE_DIMS[size];
  const body = tintable(lodPair(rbox(w, h, d, 0.04, shell), box(w, h, d, shell)));
  const strap = at(box(0.06, h + 0.02, d + 0.02, 'ivory'), w * 0.22, -0.01, 0);
  const handle = detail(at(box(0.16, 0.04, 0.04, 'cocoa'), 0, h - 0.01, 0));
  const upright = translate(merge(body, strap, handle), 0, 0.01, 0);
  if (!flat) return upright;
  return translate(rotateX(upright, -PI / 2), 0, d / 2 + 0.01, h / 2);
}

function steamerTrunk(): Geo {
  const body = tintable(box(1.0, 0.5, 0.55, 'blue'));
  const lid = tintable(at(box(1.02, 0.1, 0.57, 'blue'), 0, 0.5, 0));
  const slats = merge([-0.3, 0, 0.3].map((x) => at(box(0.06, 0.62, 0.61, 'timber'), x, 0, 0)));
  const corner = box(0.07, 0.07, 0.07, 'butter');
  const corners: Geo[] = [];
  for (const x of [-0.49, 0.49]) for (const y of [0, 0.55]) for (const z of [-0.27, 0.27]) corners.push(at(corner, x, y, z));
  const fittings = merge(
    at(box(0.08, 0.1, 0.03, 'butter'), 0, 0.42, 0.29),
    at(box(0.03, 0.05, 0.16, 'cocoa'), -0.52, 0.3, 0),
    at(box(0.03, 0.05, 0.16, 'cocoa'), 0.52, 0.3, 0),
  );
  return merge(body, lid, slats, detail(merge(corners)), detail(fittings));
}

function hatBoxes(): Geo {
  const spec: ReadonlyArray<readonly [number, number, boolean]> = [[0.28, 0.22, true], [0.23, 0.2, false], [0.18, 0.18, true]];
  const near: Geo[] = [];
  const far: Geo[] = [];
  let y = 0;
  spec.forEach(([r, h, tinted], i) => {
    const bodyCol: Col = tinted ? 'coral' : 'butter';
    const body = at(cyl(r, r, h - 0.05, bodyCol, 10), 0, y, 0);
    near.push(tinted ? tintable(body) : body, at(cyl(r + 0.012, r + 0.012, 0.05, 'ivory', 10), 0, y + h - 0.05, 0));
    const f = at(cyl(r, r, h, i % 2 === 0 ? 'coral' : 'ivory', 6), 0, y, 0);
    far.push(i % 2 === 0 ? tintable(f) : f);
    y += h;
  });
  const bow = detail(merge(translate(blob(0.06, 0.03, 0.04, 'blue', 6, 3), 0.05, y + 0.02, 0), translate(blob(0.06, 0.03, 0.04, 'blue', 6, 3), -0.05, y + 0.02, 0)));
  return merge(detail(merge(near)), farOnly(merge(far)), bow);
}

function duffel(): Geo {
  const bag = tintable(translate(rotateZ(capsule(0.17, 0.75, 'sage', 6), PI / 2), 0.375, 0.17, 0));
  const band = at(lyingX(0.175, 0.08, 'ivory', 8), 0, 0.17, 0);
  const strap = rod([-0.2, 0.33, 0], [0.2, 0.33, 0], 0.03, 'cocoa');
  const far = tintable(at(lyingX(0.16, 0.72, 'sage', 6), 0, 0.16, 0));
  return merge(lodPair(merge(bag, band), far), strap);
}

function rucksack(): Geo {
  const body = tintable(lodPair(rbox(0.34, 0.48, 0.22, 0.05, 'blue'), box(0.34, 0.48, 0.22, 'blue')));
  const flap = at(rotateX(box(0.32, 0.16, 0.04, 'ivory'), 0.15), 0, 0.36, 0.1);
  const pocket = detail(at(box(0.22, 0.14, 0.05, 'blueDeep'), 0, 0.08, 0.12));
  return merge(body, flap, pocket);
}

function picnicHamper(): Geo {
  const body = box(0.55, 0.3, 0.38, 'butterDeep');
  const lid = at(box(0.57, 0.06, 0.4, 'butter'), 0, 0.3, 0);
  const cloth = detail(merge(at(box(0.16, 0.05, 0.06, 'coral'), -0.12, 0.27, 0.19), at(box(0.16, 0.05, 0.06, 'ivory'), 0.04, 0.27, 0.19)));
  const handle = (x: number): Geo => merge(rod([x, 0.36, -0.06], [x, 0.46, -0.06], 0.02, 'cocoa'), rod([x, 0.36, 0.06], [x, 0.46, 0.06], 0.02, 'cocoa'), rod([x, 0.46, -0.06], [x, 0.46, 0.06], 0.02, 'cocoa'));
  const straps = detail(merge(at(box(0.04, 0.08, 0.02, 'cocoa'), -0.15, 0.25, 0.2), at(box(0.04, 0.08, 0.02, 'cocoa'), 0.15, 0.25, 0.2)));
  return merge(body, lid, cloth, handle(-0.15), handle(0.15), straps);
}

function birdCage(): Geo {
  const base = merge(cyl(0.2, 0.2, 0.05, 'butter', 8), farOnly(cyl(0.18, 0.18, 0.4, 'ivory', 6)));
  const bars: Geo[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * PI * 2;
    bars.push(rod([Math.cos(a) * 0.18, 0.05, Math.sin(a) * 0.18], [Math.cos(a) * 0.18, 0.4, Math.sin(a) * 0.18], 0.012, 'butter'));
  }
  const top = merge(at(dome(0.19, 'butter', 8, 2), 0, 0.4, 0), rod([0, 0.58, 0], [0, 0.68, 0], 0.02, 'butter'));
  const bird = tintable(merge(translate(blob(0.05, 0.045, 0.08, 'blue', 6, 4), 0, 0.22, 0), translate(sphere(0.035, 'blue', 6, 4), 0, 0.28, 0.06)));
  const beak = at(rotateX(cone(0.012, 0.03, 'butter', 4), PI / 2), 0, 0.28, 0.09);
  const perch = rod([-0.17, 0.17, 0], [0.17, 0.17, 0], 0.012, 'timber');
  return merge(base, detail(merge(bars, top, bird, beak, perch)), farOnly(at(cone(0.19, 0.25, 'butter', 6), 0, 0.4, 0)));
}

const CELLO_OUTLINE: ReadonlyArray<readonly [number, number]> = [
  [0, 0], [0.18, 0.02], [0.24, 0.2], [0.23, 0.42], [0.16, 0.56], [0.18, 0.72], [0.15, 0.86], [0.07, 0.95], [0.06, 1.25], [0.08, 1.32],
  [-0.08, 1.32], [-0.06, 1.25], [-0.07, 0.95], [-0.15, 0.86], [-0.18, 0.72], [-0.16, 0.56], [-0.23, 0.42], [-0.24, 0.2], [-0.18, 0.02],
];

function celloCase(): Geo {
  const near = profile(CELLO_OUTLINE, 0.26, 'coral');
  const far = profile([[-0.22, 0], [0.22, 0], [0.24, 0.5], [0.08, 0.95], [0.07, 1.32], [-0.07, 1.32], [-0.08, 0.95], [-0.24, 0.5]], 0.26, 'coral');
  const latches = detail(merge(at(box(0.05, 0.04, 0.03, 'butter'), 0.2, 0.4, 0.13), at(box(0.05, 0.04, 0.03, 'butter'), -0.2, 0.4, 0.13), at(box(0.04, 0.1, 0.04, 'cocoa'), 0.2, 0.7, 0)));
  return merge(tintable(lodPair(near, far)), latches);
}

function golfBag(): Geo {
  const near = merge(
    tintable(cyl(0.13, 0.13, 0.85, 'sage', 10)),
    at(cyl(0.135, 0.135, 0.06, 'ivory', 10, false), 0, 0.15, 0),
    at(cyl(0.135, 0.135, 0.06, 'ivory', 10, false), 0, 0.75, 0),
  );
  const far = merge(tintable(cyl(0.13, 0.13, 0.85, 'sage', 6)), at(cyl(0.135, 0.135, 0.06, 'ivory', 6, false), 0, 0.75, 0));
  const clubs = detail(merge([[-0.05, 0.03], [0.05, -0.02], [0.0, 0.06]].map(([x, z], i) =>
    merge(rod([x ?? 0, 0.8, z ?? 0], [(x ?? 0) * 2, 1.1, (z ?? 0) * 2], 0.015, 'slate'), at(box(0.08, 0.05, 0.04, i === 1 ? 'butter' : 'slate'), (x ?? 0) * 2, 1.1, (z ?? 0) * 2)))));
  const stand = detail(merge(rod([0, 0.55, -0.12], [0.1, 0, -0.35], 0.02, 'slate'), rod([0, 0.55, -0.12], [-0.1, 0, -0.35], 0.02, 'slate'), at(box(0.05, 0.5, 0.03, 'cocoa'), 0, 0.2, 0.13)));
  return merge(lodPair(near, far), clubs, stand);
}

function rolledCarpet(): Geo {
  const near = merge(
    tintable(lyingX(0.14, 2.2, 'coral', 10)),
    [-0.7, 0, 0.7].map((x) => at(lyingX(0.15, 0.12, 'ivory', 6), x, 0, 0)),
    lyingX(0.06, 2.24, 'cocoa', 6),
  );
  const far = merge(tintable(lyingX(0.14, 2.2, 'coral', 5)), lyingX(0.15, 0.2, 'ivory', 5));
  return translate(lodPair(near, far), 0, 0.14, 0);
}

function cratedStatue(): Geo {
  const post = box(0.08, 1.7, 0.08, 'timber');
  const posts: Geo[] = [];
  for (const x of [-0.41, 0.41]) for (const z of [-0.36, 0.36]) posts.push(at(post, x, 0, z));
  const slats: Geo[] = [];
  for (const y of [0.25, 1.1]) {
    slats.push(at(box(0.9, 0.14, 0.04, 'timberDeep'), 0, y, 0.39), at(box(0.9, 0.14, 0.04, 'timberDeep'), 0, y, -0.39));
    slats.push(at(box(0.04, 0.14, 0.82, 'timberDeep'), 0.44, y, 0), at(box(0.04, 0.14, 0.82, 'timberDeep'), -0.44, y, 0));
  }
  const statue = merge(
    at(box(0.36, 0.08, 0.36, 'stone'), 0, 0.02, 0),
    at(box(0.26, 0.8, 0.18, 'ivory'), 0, 0.1, 0),
    translate(blob(0.2, 0.3, 0.13, 'ivory', 6, 4), 0, 1.15, 0),
    translate(sphere(0.12, 'ivory', 6, 4), 0, 1.6, 0),
  );
  const label = at(box(0.3, 0.2, 0.02, 'butterLight'), 0.15, 0.5, 0.41);
  const far = merge(box(0.9, 1.4, 0.8, 'timber'), at(box(0.3, 0.3, 0.26, 'ivory'), 0, 1.4, 0));
  return merge(detail(merge(posts, slats, statue, label)), farOnly(far));
}

export const LUGGAGE_PROPS: readonly PropDef[] = [
  ...(['s', 'm', 'l'] as const).flatMap((s) => {
    const [w, h, d] = SUITCASE_DIMS[s];
    return [
      prop(`luggage.suitcase.${s}`, [w, d], { budget: 'clutter', tint: 'coral', tags: ['luggage', 'station'] }, () => suitcase(s)),
      prop(`luggage.suitcase.${s}Flat`, [w, h], { budget: 'clutter', tint: 'blue', tags: ['luggage', 'station'] }, () => suitcase(s, true)),
    ];
  }),
  prop('luggage.steamerTrunk', [1.0, 0.6], { budget: 'furniture', tint: 'blue', tags: ['luggage', 'station'] }, steamerTrunk),
  prop('luggage.hatBoxes', [0.6, 0.6], { budget: 'furniture', tint: 'coral', tags: ['luggage', 'station'] }, hatBoxes),
  prop('luggage.duffel', [0.75, 0.35], { budget: 'clutter', tint: 'sage', tags: ['luggage', 'station'] }, duffel),
  prop('luggage.rucksack', [0.35, 0.25], { budget: 'clutter', tint: 'blue', tags: ['luggage', 'station'] }, rucksack),
  prop('luggage.picnicHamper', [0.55, 0.4], { budget: 'clutter', tags: ['luggage', 'picnic'] }, picnicHamper),
  prop('luggage.birdCage', [0.4, 0.4], { budget: 'furniture', tint: 'blue', tags: ['luggage', 'station', 'animal'] }, birdCage),
  prop('luggage.celloCase', [0.48, 0.26], { budget: 'clutter', tint: 'butterDeep', tags: ['luggage', 'station', 'music'] }, celloCase),
  prop('luggage.golfBag', [0.3, 0.4], { budget: 'furniture', tint: 'sage', tags: ['luggage', 'station'] }, golfBag),
  prop('luggage.carpetRoll', [2.2, 0.3], { budget: 'clutter', tint: 'coral', tags: ['luggage', 'station'] }, rolledCarpet),
  prop('luggage.cratedStatue', [0.9, 0.8], { budget: 'furniture', tags: ['luggage', 'station', 'crate'] }, cratedStatue),
];
