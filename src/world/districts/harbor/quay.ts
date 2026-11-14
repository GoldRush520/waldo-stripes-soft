/**
 * The quay itself: paving bands, the stone quay wall with steps and mooring rings, the terrace of
 * harbour houses with shopfronts and balconies, the boathouse, the harbour lookout, the two cranes,
 * lamps, festival bunting and benches. Returns nothing; people on balconies are staged here because
 * they belong to the houses that create them.
 */
import { house } from '../../../props/arch/house';
import type { RoofKind, SignKind } from '../../../props/arch/types';
import { civicMeta } from '../../../props/civic/index';
import { propGeo } from '../../../props/registry';
import type { Kit } from '../../kit';
import { CLOTHS, ROOFS, WALLS } from '../shared';
import { ALLEYS, BOATHOUSE, CRANES, FRONT_Z, HOUSE_D, HOUSE_Z, HOUSES_X0, HOUSES_X1, LANE_Z, LOOKOUT, STEP_XS, act } from './plan';

export function paving(k: Kit): void {
  k.ground([[-56, -12.2], [46, -12.2], [50, -0.1], [-56, -0.1]], 'clayLight');
  k.ground([[-50, LANE_Z - 1.1], [38, LANE_Z - 1.1], [38, LANE_Z + 1.1], [-50, LANE_Z + 1.1]], 'ivory', 0.03, 0.02);
  k.ground([[-42, -1.95], [46, -1.95], [46, -1.75], [-42, -1.75]], 'stone', 0.03, 0.02);
  for (const [a, b] of ALLEYS) k.ground([[a + 0.4, -12], [b - 0.4, -12], [b - 0.4, LANE_Z - 1.1], [a + 0.4, LANE_Z - 1.1]], 'ivory', 0.03, 0.02);
}

/** Quay wall pieces (8 m) along z = 0 with three flights of steps down to the water. */
export function quayWall(k: Kit): void {
  for (let i = 0; i < 11; i++) {
    const x = -38.6 + i * 8;
    k.prop(STEP_XS.some((s) => Math.abs(s - x) < 0.1) ? 'quay.steps8' : 'quay.wall8', { x, z: -0.75 }, { walkThrough: true });
  }
  k.prop('quay.wall8', { x: 46.3, z: -0.72 }, { walkThrough: true });
  k.prop('quay.wall8', { x: -53, z: -0.75 }, { walkThrough: true });
}

const SIGNS: readonly SignKind[] = ['fish', 'anchor', 'teacup', 'icecream', 'wine', 'hat', 'boot', 'key', 'music', 'cheese', 'anchor', 'fish', 'teacup'];
const ROOF_KINDS: readonly RoofKind[] = ['gable', 'gable', 'hip', 'mansard', 'flat', 'gable'];

function inAlley(x0: number, x1: number): readonly [number, number] | undefined {
  return ALLEYS.find(([a, b]) => x1 > a && x0 < b);
}

/** One harbour house; stages a waving neighbour on most balconies and a shopkeeper at the door. */
function harbourHouse(k: Kit, cx: number, w: number, i: number): void {
  const floors = k.rng.pick([2, 3, 3, 2, 4]);
  const roof = ROOF_KINDS[i % ROOF_KINDS.length] ?? 'gable';
  const h = house({
    w,
    d: HOUSE_D,
    floors,
    wall: WALLS[(i * 3) % WALLS.length],
    roof,
    roofColor: ROOFS[(i * 2 + 1) % ROOFS.length],
    ridge: 'x',
    front: {
      shop: i % 4 === 3 ? false : { awning: k.rng.pick(['straight', 'scalloped', 'dome'] as const), sign: SIGNS[i % SIGNS.length] },
      door: i % 4 === 3 ? 'panelled' : undefined,
      balconies: floors > 2 ? [floors - 1] : [],
      balconyFlowers: true,
      windowBoxes: true,
      shutters: k.rng.chance(0.6),
    },
    left: { party: i > 0 },
    right: { party: true },
    back: { simple: true },
    terraceGarden: roof === 'flat',
    tint: CLOTHS[i % CLOTHS.length],
    seed: 900 + i,
  });
  k.add(h.geo, { x: cx, z: HOUSE_Z });
  k.block(cx, HOUSE_Z, w, HOUSE_D);
  for (const b of h.balconies) {
    if (!k.rng.chance(0.8)) continue;
    k.person({ x: cx + b.x, z: HOUSE_Z + b.z + 0.2, y: b.y, heading: 0, clip: k.rng.pick([act('greet.bigwave', 'wave'), 'wave', act('cheer.clap', 'cheer'), act('photo.camera', 'lookout')]) });
  }
  const door = h.doors[0];
  if (door && i % 2 === 0 && k.isFree(cx + door.x, HOUSE_Z + door.z + 0.45, 0.35)) {
    k.person({ x: cx + door.x, z: HOUSE_Z + door.z + 0.45, heading: 0.2, clip: k.rng.pick([act('idle.hips', 'stand'), act('vend.hawk', 'talk'), act('idle.arms', 'stand')]), hold: ['upper.apron'] });
  }
  if (h.terrace && i % 2 === 1) {
    const t = h.terrace;
    k.surface('roof', [[cx - t.w / 2, HOUSE_Z - t.d / 2], [cx + t.w / 2, HOUSE_Z - t.d / 2], [cx + t.w / 2, HOUSE_Z + t.d / 2], [cx - t.w / 2, HOUSE_Z + t.d / 2]], t.y);
    k.person({ x: cx - 0.6, z: HOUSE_Z + t.d / 2 - 0.6, y: t.y, heading: 0, clip: act('greet.bigwave', 'wave') });
    k.person({ x: cx + 0.7, z: HOUSE_Z + t.d / 2 - 0.8, y: t.y, heading: -0.3, clip: act('photo.camera', 'point') });
  }
}

export function houses(k: Kit): void {
  let x = HOUSES_X0;
  let i = 0;
  while (x < HOUSES_X1 - 4) {
    const w = Math.min(k.rng.range(5.6, 8.2), HOUSES_X1 - x);
    const alley = inAlley(x, x + w);
    if (alley) {
      x = alley[1];
      continue;
    }
    harbourHouse(k, x + w / 2, w, i);
    x += w;
    i++;
  }
}

export function boathouse(k: Kit): void {
  k.prop('boathouse', { x: BOATHOUSE.x, z: BOATHOUSE.z, tint: 'blue' });
}

/** Harbour lookout tower; returns the platform height and the local x span of its front rim. */
export function lookout(k: Kit): { y: number; x0: number; x1: number; z: number } {
  const m = civicMeta('tower.lookout');
  k.prop('tower.lookout', { x: LOOKOUT.x, z: LOOKOUT.z }, { walkThrough: true });
  const p = m.platform;
  k.block(LOOKOUT.x + (p.x0 + p.x1) / 2, LOOKOUT.z, p.x1 - p.x0, p.z1 - p.z0);
  k.block(LOOKOUT.x + (p.x1 + m.stairFoot[0]) / 2, LOOKOUT.z + m.stairFoot[1], m.stairFoot[0] - p.x1, 1.1);
  k.surface('deck', [[LOOKOUT.x + p.x0, LOOKOUT.z + p.z0], [LOOKOUT.x + p.x1, LOOKOUT.z + p.z0], [LOOKOUT.x + p.x1, LOOKOUT.z + p.z1], [LOOKOUT.x + p.x0, LOOKOUT.z + p.z1]], m.platformY);
  return { y: m.platformY, x0: LOOKOUT.x + p.x0 + 0.25, x1: LOOKOUT.x + p.x1 - 0.25, z: LOOKOUT.z + p.z1 - 0.28 };
}

export function cranes(k: Kit): void {
  for (const c of CRANES) k.prop('harbour.crane', { x: c.x, z: c.z });
}

/** Lamps, bunting and flags along the quay edge (pole bases are blocked so nobody stands in them). */
export function dressing(k: Kit): void {
  for (const x of [-41, -24, -9.5, 8.5, 17.5, 27, 35]) k.prop('lamp.classic', { x, z: -2.55 });
  for (const x of [-36, -18, 12, 37]) {
    k.prop('bunting.poles.10m', { x, z: -1.2 });
    k.block(x - 5, -1.2, 0.25, 0.25);
    k.block(x + 5, -1.2, 0.25, 0.25);
  }
  k.prop('flag.poles.triple', { x: -9, z: -6.0 });
  k.prop('harbour.wheelSign', { x: 4.6, z: -6.2 });
  k.prop('harbour.tideBoard', { x: -27.2, z: -0.35, rot: Math.PI });
  for (const x of [-34, -2, 18.5, 33]) k.prop('harbour.lifeRingPost', { x, z: -1.95 });
}

const CLUTTER = ['harbour.lobsterPots', 'barrel', 'crate.stack', 'harbour.ropeCoil', 'sandwich.board', 'barrel.open.fish', 'planter.box', 'sack.pile', 'harbour.fishCrates'] as const;

/** Working clutter tucked against the house fronts between the benches and the ice-cream cart. */
export function clutter(k: Kit): void {
  const keep = [...BENCH_XS, 19.4, -9];
  let i = k.rng.int(0, CLUTTER.length - 1);
  for (let x = HOUSES_X0 + 1.5; x < HOUSES_X1 - 1; x += k.rng.range(3.2, 4.6)) {
    if (keep.some((b) => Math.abs(b - x) < 1.9) || ALLEYS.some(([a, b]) => x > a - 0.6 && x < b + 0.6)) continue;
    k.prop(CLUTTER[i % CLUTTER.length] ?? 'barrel', { x, z: FRONT_Z + 0.45, rot: k.rng.range(-0.15, 0.15) });
    i++;
  }
}

const BENCH_XS: readonly number[] = [-37.5, -27, -19.5, -6.5, 9.5, 28.5];

/** Benches against the house fronts, facing the water, with seated people (the seat itself is not blocked). */
export function benches(k: Kit): void {
  for (const x of BENCH_XS) {
    const at = { x, z: FRONT_Z + 0.75 };
    k.add(propGeo('bench.park'), at);
    k.seated('bench.park', at, { place: false, fill: 0.75, clips: ['sit', act('sit.talk', 'sit'), act('sit.eat', 'sit'), act('sit.read', 'sit')] });
  }
}
