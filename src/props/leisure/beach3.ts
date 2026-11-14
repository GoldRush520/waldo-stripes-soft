/**
 * Promenade and water's-edge fixtures: lifeguard tower, rescue-board rack, changing screen,
 * ice-cream kiosk, coin telescope, shelter, railing, shower, buoy line, diving raft, rod holders.
 * "beach.buoyline" and "beach.diveraft" sit on the y = 0 waterline (place them at water level).
 */
import { type Geo, beam, blob, cone, cyl, detail, gable, merge, rotateX, rotateY, rotateZ, scale, sphere, tintable, translate } from '../../core/geo';
import type { PropDef } from '../registry';
import { type Seat, barX, boxAt, bulbs, lodPair, post, prop, revolve, rope, softBox, stripesX } from './kit';

function lifeguardTowerBuild(): Geo {
  const h = 2.2;
  const legs = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => beam([sx * 0.85, 0, sz * 0.85], [sx * 0.6, h, sz * 0.6], 0.1, 'ivory')));
  const braces = detail(merge([-1, 1].map((sz) => merge(beam([-0.8, 0.3, sz * 0.8], [0.65, h - 0.1, sz * 0.62], 0.05, 'ivoryShade'), beam([0.8, 0.3, sz * 0.8], [-0.65, h - 0.1, sz * 0.62], 0.05, 'ivoryShade')))));
  const deck = merge(boxAt(1.5, 0.1, 1.5, 'timber', 0, h, 0), boxAt(0.4, 0.3, 0.4, 'ivoryShade', 0, h + 0.1, 0.1));
  const cabin = merge(boxAt(1.3, 1.0, 1.1, 'butter', 0, h + 0.1, -0.15), translate(stripesX(1.3, 0.3, 0.03, 7, 'coral', 'ivory'), 0, h + 0.75, 0.42));
  const roof = translate(gable(1.6, 0.5, 1.6, 'coral'), 0, h + 1.65, 0);
  const posts = [-1, 1].map((s) => boxAt(0.06, 0.55, 0.06, 'ivory', s * 0.6, h + 1.1, 0.6));
  const ladder = merge([-1, 1].map((s) => beam([s * 0.22, 0, 1.6], [s * 0.22, h, 0.75], 0.05, 'timber')));
  const rungs = detail(merge(Array.from({ length: 7 }, (_, i) => {
    const t = (i + 1) / 8;
    return boxAt(0.44, 0.03, 0.05, 'timber', 0, h * t, 1.6 - 0.85 * t);
  })));
  const rails = detail(merge([-1, 1].map((s) => beam([s * 0.72, h + 0.95, 0.72], [s * 0.72, h + 0.95, -0.7], 0.04, 'ivory')), beam([-0.72, h + 0.95, 0.72], [0.72, h + 0.95, 0.72], 0.04, 'ivory')));
  const planks = detail(merge(Array.from({ length: 5 }, (_, i) => boxAt(1.48, 0.01, 0.03, 'timberDeep', 0, h + 0.1, -0.6 + i * 0.3))));
  const buoy = detail(translate(rotateX(scale(blob(1, 1, 1, 'coral', 8, 4), 0.25, 0.25, 0.07), Math.PI / 2), 0.66, h + 0.7, 0.4));
  const far = merge([-1, 1].map((sz) => boxAt(1.6, h, 0.1, 'ivory', 0, 0, sz * 0.72)));
  return merge(lodPair(merge(legs, braces, ladder, rungs), far), deck, cabin, roof, posts, rails, buoy, planks);
}

function rescueRackBuild(): Geo {
  const frame = merge([-1, 1].map((s) => merge(beam([s * 0.9, 0, -0.3], [s * 0.9, 1.4, 0], 0.07, 'timber'), beam([s * 0.9, 0, 0.3], [s * 0.9, 1.4, 0], 0.07, 'timber'))));
  const bars = [0.5, 1.0].map((y) => translate(barX(2.0, 0.035, 'timberDeep', 6), 0, y, 0));
  const boards = [0.55, 1.05].map((y) => tintable(translate(scale(blob(1, 1, 1, 'coral', 8, 4), 1.4, 0.05, 0.28), 0, y + 0.08, 0)));
  const stripe = detail(merge([0.55, 1.05].map((y) => boxAt(2.6, 0.02, 0.06, 'ivory', 0, y + 0.12, 0))));
  const far = merge([0.55, 1.05].map((y) => tintable(boxAt(2.8, 0.1, 0.5, 'coral', 0, y + 0.03, 0))));
  return merge(lodPair(merge(frame, bars, boards, stripe), merge(far, boxAt(1.9, 1.4, 0.08, 'timber', 0, 0, 0))));
}

function changingScreenBuild(): Geo {
  const panels = [-1, 0, 1].map((i) => {
    const panel = merge(lodPair(stripesX(0.6, 1.5, 0.03, 4, 'blue', 'ivory'), stripesX(0.6, 1.5, 0.03, 2, 'blue', 'ivory')), detail(boxAt(0.62, 0.05, 0.04, 'timber', 0, 1.5, 0)));
    return translate(rotateY(translate(panel, 0, 0.12, 0), i * 0.45), i * 0.58, 0, Math.abs(i) * -0.15);
  });
  const feet = detail(merge([-0.9, -0.3, 0.3, 0.9].map((x) => boxAt(0.04, 0.12, 0.25, 'timberDeep', x, 0, -0.07))));
  const towel = detail(merge(boxAt(0.4, 0.4, 0.02, 'butter', 0.1, 1.25, 0.03), boxAt(0.4, 0.03, 0.06, 'butter', 0.1, 1.64, 0)));
  return merge(panels, feet, towel);
}

function kioskBuild(): Geo {
  const body = merge(softBox(2.4, 2.4, 1.8, 0.06, 'ivory'), translate(stripesX(2.4, 0.9, 0.03, 9, 'coral', 'ivory'), 0, 0.05, 0.915));
  const hatch = merge(boxAt(1.6, 0.9, 0.05, 'blueLight', 0, 1.15, 0.9), boxAt(1.8, 0.08, 0.35, 'timber', 0, 1.05, 1.05));
  const awning = translate(rotateX(stripesX(2.6, 0.06, 0.9, 9, 'coral', 'ivory'), 0.35), 0, 2.15, 1.25);
  const roof = boxAt(2.6, 0.15, 2.0, 'clay', 0, 2.4, 0);
  const coneBody = translate(rotateX(cone(0.38, 1.3, 'butter', 10), Math.PI), 0, 3.85, 0);
  const scoops = merge(translate(sphere(0.42, 'coralLight', 10, 6), 0, 4.05, 0), translate(sphere(0.32, 'ivory', 8, 5), 0.05, 4.45, 0.03));
  const far = merge(translate(rotateX(cone(0.38, 1.3, 'butter', 5), Math.PI), 0, 3.85, 0), translate(sphere(0.42, 'coralLight', 5, 3), 0, 4.1, 0));
  const flake = detail(beam([0.1, 4.5, 0], [0.25, 4.95, 0.05], 0.06, 'cocoa'));
  const sprinkles = detail(merge(Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return boxAt(0.05, 0.02, 0.02, i % 2 === 0 ? 'blue' : 'butter', Math.sin(a) * 0.3, 4.3, Math.cos(a) * 0.3);
  })));
  const sign = merge(boxAt(1.6, 0.35, 0.06, 'blue', 0, 2.0, 0.93), detail(boxAt(1.2, 0.18, 0.08, 'ivory', 0, 2.08, 0.93)));
  const waffle = detail(merge(Array.from({ length: 4 }, (_, i) => rotateY(boxAt(0.02, 1.0, 0.02, 'butterDeep', 0, 2.75, 0.3), (i / 4) * Math.PI * 2))));
  const lights = bulbs(Array.from({ length: 10 }, (_, i) => [-1.15 + i * 0.255, 1.92, 1.68] as const));
  return merge(body, hatch, awning, roof, lodPair(merge(coneBody, scoops, waffle), far), flake, sprinkles, sign, lights);
}

function telescopeBuild(): Geo {
  const pedestal = lodPair(revolve([[0.18, 0], [0.1, 0.1], [0.07, 1.0], [0.1, 1.05], [0.01, 1.05]], 'blueDeep', 8), boxAt(0.18, 1.05, 0.18, 'blueDeep', 0, 0, 0));
  const barrel = translate(rotateX(cyl(0.08, 0.11, 0.6, 'blue', 8), 1.35), 0, 1.25, -0.2);
  const head = merge(boxAt(0.22, 0.25, 0.22, 'blueDeep', 0, 1.05, 0), lodPair(barrel, translate(rotateX(boxAt(0.18, 0.6, 0.18, 'blue', 0, 0, 0), 1.35), 0, 1.25, -0.2)));
  const eyes = detail(boxAt(0.16, 0.06, 0.08, 'slate', 0, 1.2, -0.14));
  const coin = detail(boxAt(0.05, 0.08, 0.02, 'butter', 0, 1.15, 0.115));
  return merge(pedestal, head, eyes, coin);
}

function shelterBuild(): Geo {
  const w = 4;
  const d = 2;
  const posts = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => boxAt(0.12, 2.5, 0.12, 'ivory', sx * (w / 2 - 0.1), 0, sz * (d / 2 - 0.1))));
  const back = merge(boxAt(w - 0.2, 1.4, 0.08, 'sage', 0, 0.9, -d / 2 + 0.1), detail(boxAt(w - 0.4, 0.8, 0.02, 'blueLight', 0, 1.3, -d / 2 + 0.15)));
  const roof = translate(lodPair(stripedRoof(w + 0.4, d + 0.4, 11), stripedRoof(w + 0.4, d + 0.4, 5)), 0, 2.5, 0);
  const bench = merge(boxAt(w - 0.5, 0.06, 0.45, 'timber', 0, 0.42, -0.45), boxAt(w - 0.5, 0.4, 0.05, 'timber', 0, 0.5, -0.7), detail(merge([-1.4, 0, 1.4].map((x) => boxAt(0.05, 0.42, 0.4, 'slate', x, 0, -0.45)))));
  const lights = bulbs(Array.from({ length: 12 }, (_, i) => [-1.9 + i * (3.8 / 11), 2.4, d / 2 + 0.05] as const));
  const valance = detail(merge(Array.from({ length: 10 }, (_, i) => boxAt(0.36, 0.18, 0.04, i % 2 === 0 ? 'coral' : 'ivory', -1.8 + i * 0.4, 2.32, d / 2 + 0.2))));
  return merge(posts, back, roof, bench, valance, lights);
}

function stripedRoof(w: number, d: number, n: number): Geo {
  const slope = stripesX(w, 0.07, d / 2 + 0.05, n, 'coral', 'ivory');
  return merge(translate(rotateX(slope, 0.35), 0, 0.2, d / 4), translate(rotateX(slope, -0.35), 0, 0.2, -d / 4));
}

const SHELTER_SEATS: readonly Seat[] = [-1.35, -0.45, 0.45, 1.35].map((x) => ({ x, y: 0.48, z: -0.4, heading: 0 }));

/** Striped promenade railing of any length along x, centred: posts every ≤ 1.5 m, coral/ivory bands. */
export function promenadeRailing(len: number): Geo {
  const n = Math.max(1, Math.ceil(len / 1.5));
  const xs = Array.from({ length: n + 1 }, (_, i) => -len / 2 + (i * len) / n);
  const posts = xs.map((x) => boxAt(0.08, 1.0, 0.08, 'ivory', x, 0, 0));
  const n2 = Math.max(3, Math.round(len / 0.5) | 1);
  const top = (k: number): Geo => translate(stripesX(len, 0.07, 0.07, k, 'coral', 'ivory'), 0, 0.95, 0);
  const mid = detail(boxAt(len, 0.04, 0.04, 'ivoryShade', 0, 0.5, 0));
  const caps = detail(merge(xs.map((x) => boxAt(0.12, 0.06, 0.12, 'ivory', x, 1.0, 0))));
  return merge(merge(posts), lodPair(top(n2), top(Math.max(3, Math.round(len / 1.4) | 1))), mid, caps);
}

function showerBuild(): Geo {
  const tray = boxAt(0.9, 0.06, 0.9, 'stone', 0, 0, 0);
  const pole = lodPair(post(0, -0.35, 2.3, 0.04, 'blue', 6), boxAt(0.08, 2.3, 0.08, 'blue', 0, 0, -0.35));
  const arm = beam([0, 2.25, -0.35], [0, 2.25, 0.05], 0.05, 'blue');
  const head = translate(cone(0.12, 0.08, 'ivoryDeep', 8), 0, 2.15, 0.05);
  const button = detail(boxAt(0.06, 0.06, 0.04, 'coral', 0, 1.2, -0.3));
  const slats = detail(merge(Array.from({ length: 5 }, (_, i) => boxAt(0.85, 0.02, 0.1, 'timber', 0, 0.06, -0.35 + i * 0.175))));
  return merge(tray, pole, arm, head, button, slats);
}

/** Swim-buoy line of any length along x on the y = 0 waterline: floats every ~0.6 m on a rope. */
export function buoyLine(len: number): Geo {
  const n = Math.max(2, Math.round(len / 0.8));
  const floats = Array.from({ length: n + 1 }, (_, i) => translate(sphere(0.11, i % 2 === 0 ? 'coral' : 'ivory', 5, 3), -len / 2 + (i * len) / n, 0.02, 0));
  const far = boxAt(len, 0.12, 0.12, 'coral', 0, -0.04, 0);
  const line = rope([-len / 2, 0.02, 0], [len / 2, 0.02, 0], 0.02, 'ivoryDeep');
  return merge(lodPair(merge(floats), far), line);
}

function raftBuild(): Geo {
  const deck = boxAt(3.0, 0.12, 3.0, 'timber', 0, 0.25, 0);
  const planks = detail(merge(Array.from({ length: 9 }, (_, i) => boxAt(0.02, 0.01, 3.0, 'timberDeep', -1.33 + i * 0.33, 0.37, 0))));
  const drums = lodPair(
    merge([-1, 1].flatMap((sx) => [-1, 1].map((sz) => translate(rotateZ(cyl(0.3, 0.3, 1.0, 'blue', 8), Math.PI / 2), sx * 0.6 + 0.5, 0.0, sz * 0.9)))),
    merge([-1, 1].flatMap((sz) => [boxAt(2.2, 0.55, 0.55, 'blue', 0, -0.28, sz * 0.9)])),
  );
  const ladder = lodPair(
    merge([-1, 1].map((s) => beam([s * 0.22, -0.6, 1.55], [s * 0.22, 0.9, 1.55], 0.04, 'slate')), [-0.3, 0, 0.3].map((y) => boxAt(0.44, 0.03, 0.04, 'slate', 0, y, 1.55))),
    boxAt(0.44, 1.5, 0.04, 'slate', 0, -0.6, 1.55),
  );
  const cleats = detail(merge([-1, 1].flatMap((sx) => [-1, 1].map((sz) => translate(cyl(0.05, 0.06, 0.12, 'slate', 6), sx * 1.3, 0.37, sz * 1.3)))));
  const edge = tintable(merge([-1, 1].flatMap((s) => [boxAt(3.04, 0.1, 0.08, 'coral', 0, 0.27, s * 1.5), boxAt(0.08, 0.1, 3.04, 'coral', s * 1.5, 0.27, 0)])));
  const flag = merge(boxAt(0.05, 1.4, 0.05, 'ivory', -1.4, 0.37, -1.4), boxAt(0.5, 0.3, 0.02, 'butter', -1.13, 1.45, -1.4));
  return merge(deck, planks, drums, ladder, edge, flag, cleats);
}

const RAFT_SEATS: readonly Seat[] = [
  { x: -0.8, y: 0.37, z: -0.6, heading: 0 },
  { x: 0.8, y: 0.37, z: -0.6, heading: 0 },
  { x: -0.6, y: 0.37, z: 0.9, heading: Math.PI },
  { x: 0.7, y: 0.37, z: 0.9, heading: 0 },
];

function rodHoldersBuild(): Geo {
  const rail = merge(boxAt(1.6, 0.08, 0.1, 'timber', 0, 1.0, 0), [-0.7, 0.7].map((x) => boxAt(0.1, 1.0, 0.1, 'timberDeep', x, 0, 0)));
  const tubes = detail(merge([-0.45, 0, 0.45].map((x) => translate(rotateX(cyl(0.035, 0.035, 0.3, 'slate', 6), -0.35), x, 0.85, 0.08))));
  const rods = detail(merge([-0.45, 0, 0.45].map((x, i) => merge(beam([x, 0.85, 0.08], [x + (i - 1) * 0.2, 3.0, 1.0], 0.02, 'cocoa'), translate(rotateZ(cyl(0.04, 0.04, 0.05, 'slate', 6), Math.PI / 2), x - 0.02, 1.05, 0.15)))));
  const lines = detail(merge([-0.45, 0, 0.45].map((x, i) => beam([x + (i - 1) * 0.2, 3.0, 1.0], [x + (i - 1) * 0.25, -0.5, 2.2], 0.006, 'ivoryDeep'))));
  const far = merge([-0.45, 0, 0.45].map((x, i) => beam([x, 0.85, 0.08], [x + (i - 1) * 0.2, 3.0, 1.0], 0.04, 'cocoa')));
  const bucket = revolve([[0.12, 0], [0.15, 0.25], [0.01, 0.25]], 'butter', 8);
  return merge(rail, tubes, lodPair(merge(rods, lines), far), translate(lodPair(bucket, cone(0.15, 0.25, 'butter', 4)), 0.5, 0, -0.3));
}

export const BEACH3_PROPS: readonly PropDef[] = [
  prop('beach.lifeguardtower', lifeguardTowerBuild, [1.8, 2.0], 'stall', { seats: [{ x: 0, y: 2.62, z: 0.1, heading: 0 }], tags: ['beach', 'lookout'] }),
  prop('beach.rescuerack', rescueRackBuild, [2.0, 0.7], 'furniture', { tint: 'coral', tags: ['beach'] }),
  prop('beach.changingscreen', changingScreenBuild, [1.8, 0.5], 'furniture', { tint: 'blue', tags: ['beach'] }),
  prop('beach.icecreamkiosk', kioskBuild, [2.6, 2.0], 'stall', { tags: ['beach', 'food', 'kiosk'] }),
  prop('beach.telescope', telescopeBuild, [0.4, 0.4], 'clutter', { tags: ['beach', 'promenade'] }),
  prop('beach.shelter', shelterBuild, [4.4, 2.4], 'stall', { seats: SHELTER_SEATS, tags: ['beach', 'promenade', 'seating'] }),
  prop('beach.railing', () => promenadeRailing(4), [4, 0.12], 'furniture', { tags: ['beach', 'promenade', 'parametric'] }),
  prop('beach.shower', showerBuild, [0.9, 0.9], 'furniture', { tags: ['beach'] }),
  prop('beach.buoyline', () => buoyLine(10), [0, 0], 'furniture', { origin: 'waterline', tags: ['beach', 'water', 'parametric'] }),
  prop('beach.diveraft', raftBuild, [3.1, 3.1], 'stall', {
    origin: 'waterline',
    seats: RAFT_SEATS,
    seatKind: 'feet',
    tags: ['beach', 'water', 'float', 'stand'],
  }),
  prop('pier.rodholders', rodHoldersBuild, [1.6, 0.3], 'furniture', { origin: 'sunk', tags: ['beach', 'pier', 'fishing'] }),
];
