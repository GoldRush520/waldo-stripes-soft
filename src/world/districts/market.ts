/**
 * Fish & produce market — the representative district.
 *
 * Plan (district-local metres, +z toward the quay): a continuous terrace of shop houses closes the
 * north side, three back-to-back double rows of striped stalls run east-west with shopping aisles
 * between them, two cross aisles and a small round plaza break the rows, and the fish row faces
 * the quay. People are staged as vendors, customers, queues, aisle walkers and authored incidents.
 */
import { house } from '../../props/arch/house';
import type { SignKind } from '../../props/arch/types';
import { GOODS_KINDS, type GoodsKind } from '../../props/street/goods';
import { stall } from '../../props/street/stall';
import type { Kit } from '../kit';
import { CLOTHS, ROOFS, WALLS, treeGeo } from './shared';

const X0 = -31;
const X1 = 35;
const CROSS: ReadonlyArray<readonly [number, number]> = [
  [-13.5, -9.5],
  [10.5, 14.5],
];
const PLAZA = { x: 0.5, z: 2.2, r: 6.2 };

/** rows: z of the stall centre and the way it faces (0 = toward +z, PI = toward -z) */
const ROWS: ReadonlyArray<{ z: number; rot: number; goods: readonly GoodsKind[] }> = [
  { z: -7.6, rot: 0, goods: ['bread', 'pastries', 'cheese', 'sausages', 'jars', 'eggs'] },
  { z: -2.4, rot: Math.PI, goods: ['oranges', 'apples', 'melons', 'tomatoes', 'cabbages', 'lemons'] },
  { z: -0.8, rot: 0, goods: ['flowers', 'spices', 'pottery', 'cloth', 'hats'] },
  { z: 4.6, rot: Math.PI, goods: ['carrots', 'leeks', 'cabbages', 'lemons', 'flowers', 'apples'] },
  { z: 6.2, rot: 0, goods: ['books', 'toys', 'balloons', 'hats', 'pottery'] },
  { z: 11.6, rot: Math.PI, goods: ['fish', 'crabs', 'oysters', 'fish', 'crabs'] },
];

const inCross = (x: number, w: number): boolean => CROSS.some(([a, b]) => x + w / 2 > a && x - w / 2 < b);
const inPlaza = (x: number, z: number, w: number): boolean => Math.hypot(Math.max(0, Math.abs(x - PLAZA.x) - w / 2), z - PLAZA.z) < PLAZA.r;
const known = (kinds: readonly GoodsKind[]): GoodsKind[] => kinds.filter((g) => GOODS_KINDS.includes(g));

function paving(k: Kit): void {
  k.ground([[-38, -17], [44, -17], [44, 16], [-38, 16]], 'clayLight');
  for (const z of [-5, 1.9, 8.9]) k.ground([[X0 - 2, z - 1.5], [X1 + 2, z - 1.5], [X1 + 2, z + 1.5], [X0 - 2, z + 1.5]], 'ivory', 0.03, 0.02);
  for (const [a, b] of CROSS) k.ground([[a, -10.5], [b, -10.5], [b, 13.5], [a, 13.5]], 'ivory', 0.03, 0.02);
  const ring: [number, number][] = [];
  for (let i = 0; i < 28; i++) ring.push([PLAZA.x + Math.cos((i / 28) * 6.2832) * PLAZA.r, PLAZA.z + Math.sin((i / 28) * 6.2832) * PLAZA.r]);
  k.ground(ring, 'butterLight', 0.05, 0.02);
  const inner = ring.map(([x, z]) => [PLAZA.x + (x - PLAZA.x) * 0.55, PLAZA.z + (z - PLAZA.z) * 0.55] as [number, number]);
  k.ground(inner, 'ivory', 0.07, 0.02);
}

function terrace(k: Kit): void {
  const signs: readonly SignKind[] = ['pretzel', 'fish', 'cheese', 'flower', 'teacup', 'wine', 'book', 'hat', 'key', 'boot'];
  let x = -37;
  let i = 0;
  while (x < 41) {
    const w = k.rng.range(6.2, 8.8);
    const floors = k.rng.pick([2, 3, 3, 4]);
    const h = house({
      w,
      d: 7.5,
      floors,
      wall: WALLS[i % WALLS.length],
      roof: k.rng.pick(['gable', 'gable', 'mansard', 'hip', 'flat'] as const),
      roofColor: ROOFS[(i * 2 + 1) % ROOFS.length],
      ridge: 'x',
      front: {
        shop: { awning: k.rng.pick(['straight', 'scalloped', 'dome'] as const), sign: signs[i % signs.length] },
        balconies: floors > 2 ? [k.rng.pick([1, 2])] : [],
        balconyFlowers: true,
        windowBoxes: true,
        shutters: k.rng.chance(0.6),
      },
      left: { party: i > 0 },
      right: { party: true },
      back: { simple: true },
      tint: CLOTHS[i % CLOTHS.length],
      seed: 400 + i,
    });
    const cx = x + w / 2;
    k.add(h.geo, { x: cx, z: -13.3 });
    k.block(cx, -13.3, w, 7.5);
    for (const b of h.balconies) {
      if (k.rng.chance(0.75)) k.person({ x: cx + b.x, z: -13.3 + b.z + 0.25, y: b.y, heading: b.heading, clip: k.rng.pick(['wave', 'lookout', 'stand', 'point']) });
    }
    x += w;
    i++;
  }
}

function stalls(k: Kit): void {
  ROWS.forEach((row, r) => {
    let x = X0;
    let n = 0;
    while (x < X1) {
      const w = k.rng.pick([2.4, 2.4, 3, 3.6]);
      const cx = x + w / 2;
      if (inCross(cx, w) || inPlaza(cx, row.z, w)) {
        x += 0.6;
        continue;
      }
      const goods = known(row.goods);
      const g = goods.length ? [goods[n % goods.length] as GoodsKind, goods[(n + 1) % goods.length] as GoodsKind] : [];
      const s = stall({ width: w, awning: k.rng.pick(['flat', 'pitched', 'scallop', 'pitched', 'umbrella'] as const), goods: g, seed: r * 100 + n });
      const at = { x: cx, z: row.z, rot: row.rot };
      k.add(s.geo, { ...at, tint: CLOTHS[(r * 3 + n) % CLOTHS.length] });
      const counter = k.rel(at, 0, 0.36);
      k.block(counter.x, counter.z, s.footprint[0], 0.78, row.rot);
      const v = k.rel(at, s.vendorSpot.x, s.vendorSpot.z, s.vendorSpot.heading);
      k.person({ ...v, clip: k.rng.pick(['talk', 'wave', 'point', 'stand', 'talk']), hold: ['upper.apron'], look: { hat: k.rng.chance(0.5) ? k.rng.pick(['hat.boater', 'hat.cap', 'hat.beret']) : null } });
      for (const c of s.customerSpots) {
        if (!k.rng.chance(0.62)) continue;
        const p = k.rel(at, c.x + k.rng.range(-0.12, 0.12), c.z + k.rng.range(0, 0.25), c.heading);
        if (!k.isFree(p.x, p.z, 0.3)) continue;
        k.person({
          ...p,
          clip: k.rng.pick(['stand', 'point', 'talk', 'lookout', 'stand']),
          age: k.rng.chance(0.14) ? 'child' : k.rng.chance(0.15) ? 'elder' : 'adult',
          hold: k.rng.chance(0.4) ? [{ key: 'hold.bag', tint: k.rng.pick(CLOTHS) }] : [],
        });
      }
      x += w + 0.18;
      n++;
    }
  });
}

function flows(k: Kit): void {
  const bags = (rng: Kit['rng']) => (rng.chance(0.45) ? [{ key: 'hold.bag', tint: rng.pick(CLOTHS) }] : rng.chance(0.12) ? [{ key: 'hold.balloon', tint: rng.pick(CLOTHS) }] : undefined);
  for (const z of [-5, 1.9, 8.9]) {
    k.walkers([[X0 - 3, 0, z], [-12, 0, z + 0.3], [12, 0, z - 0.3], [X1 + 3, 0, z]], 30, { lanes: [0.35, 0.95], speed: [0.6, 1.15], hold: bags });
  }
  k.walkers([[X0 - 4, 0, -10.2], [0, 0, -10.6], [X1 + 4, 0, -10.2]], 34, { lanes: [0.5, 1.2], hold: bags });
  k.walkers([[X0 - 4, 0, 14.4], [0, 0, 14.8], [X1 + 4, 0, 14.4]], 30, { lanes: [0.5, 1.3], hold: bags });
  for (const [a, b] of CROSS) {
    const x = (a + b) / 2;
    k.walkers([[x, 0, -10], [x + 0.3, 0, 2], [x, 0, 14]], 16, { lanes: [0.4, 1.1], speed: [0.7, 1.2], hold: bags });
  }
  /* porters carrying crates through the back lane */
  const lane = k.street([[X0 - 3, 0, 13.2], [-6, 0, 13.4], [X1 + 3, 0, 13.2]], 0.3);
  for (let i = 0; i < 6; i++) {
    const m = k.onRoute(lane, i * 2.2, 0.95);
    k.person({ x: 0, z: 0, motion: m, clip: 'carry', speed: 0.95 / 1.3, hold: ['carry.crate', 'upper.apron'], look: { hat: 'hat.cap', hatTint: 'blue', longLegs: true } });
  }
}

function plaza(k: Kit): void {
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.4;
    k.add(treeGeo('pottedOrange', i % 3), { x: PLAZA.x + Math.cos(a) * (PLAZA.r - 0.9), z: PLAZA.z + Math.sin(a) * (PLAZA.r - 0.9) });
  }
  k.vignette({ id: 'balloon-seller', title: 'The balloon seller', story: 'Children mob a balloon seller while one lost balloon drifts off and a small boy points after it.' }, () => {
    const cx = PLAZA.x - 1.6;
    const cz = PLAZA.z + 0.4;
    k.person({ x: cx, z: cz, heading: 0.4, clip: 'wave', hold: [{ key: 'hold.balloon', tint: 'coral' }, { key: 'hold.umbrella', tint: 'butter' }], look: { hat: 'hat.top', hatTint: 'coral', pattern: 6, shirt: 'butter', shirt2: 'ivory' } });
    for (let i = 0; i < 6; i++) {
      const a = -0.9 + i * 0.55;
      k.person({ x: cx + Math.sin(a) * 1.25, z: cz + Math.cos(a) * 1.25, face: [cx, cz], age: 'child', clip: k.rng.pick(['cheer', 'cheer', 'point', 'wave']), hold: i % 3 === 0 ? [{ key: 'hold.balloon', tint: k.rng.pick(CLOTHS) }] : [] });
    }
    k.person({ x: cx + 2.4, z: cz - 0.6, heading: -1.2, age: 'child', clip: 'point', look: { shirt: 'blue', pattern: 0 } });
    k.person({ x: cx + 2.9, z: cz - 0.2, face: [cx + 2.4, cz - 0.6], clip: 'lookout' });
  });
  k.vignette({ id: 'family-photo', title: 'Say cheese', story: 'A family waves stiffly at a photographer who has backed into a pile of oranges.' }, () => {
    const cx = PLAZA.x + 2.4;
    const cz = PLAZA.z + 2.2;
    for (let i = 0; i < 5; i++) k.person({ x: cx + (i - 2) * 0.5, z: cz + (i % 2) * 0.35, heading: Math.PI, clip: i % 2 ? 'wave' : 'cheer', age: i === 2 ? 'child' : i === 4 ? 'elder' : 'adult' });
    k.person({ x: cx, z: cz - 2.6, heading: 0, clip: 'lookout', hold: ['back.pack'], look: { hat: 'hat.sun', hatTint: 'ivory' } });
  });
  k.group(PLAZA.x - 0.4, PLAZA.z - 3.6, 4);
  k.group(PLAZA.x + 3.6, PLAZA.z - 2.2, 3);
  k.targetSpot(PLAZA.x + 4.4, PLAZA.z + 0.4, 0, 0.6);
}

function incidents(k: Kit): void {
  k.vignette({ id: 'haggle', title: 'The great cheese haggle', story: 'A customer and a cheesemonger argue over a wheel of cheese while a growing queue cranes to see.' }, () => {
    k.person({ x: -22, z: -6.1, heading: 0, clip: 'point', look: { hat: 'hat.boater', hatTint: 'coral' } });
    k.person({ x: -22.2, z: -5.2, heading: Math.PI, clip: 'talk', hold: [{ key: 'hold.bag', tint: 'sage' }] });
    k.queue([-17.5, -5.0], [-21.3, -5.0], 6, { clips: ['lookout', 'stand', 'talk', 'lookout', 'point'] });
  });
  k.vignette({ id: 'lost-tourists', title: 'Which way is the harbour?', story: 'Four tourists each point in a different direction while their guide shades his eyes at a signpost.' }, () => {
    const cx = 22;
    const cz = 1.9;
    [0.3, 1.9, 3.4, 4.9].forEach((a, i) => {
      k.person({ x: cx + Math.sin(a) * 0.9, z: cz + Math.cos(a) * 0.9, heading: a + Math.PI * 0.8, clip: 'point', hold: i % 2 ? ['back.pack'] : [], look: { hat: i % 2 ? 'hat.sun' : 'hat.cap', glasses: 'face.sunglasses' } });
    });
    k.person({ x: cx, z: cz, heading: 0.2, clip: 'lookout', hold: [{ key: 'hold.umbrella', tint: 'blue' }] });
  });
  k.vignette({ id: 'fish-cheer', title: 'Catch of the day', story: 'A crowd cheers the fishmonger who holds court behind the longest fish stall on the quay side.' }, () => {
    for (let i = 0; i < 9; i++) {
      const x = -4 + (i % 5) * 0.62 + (i > 4 ? 0.3 : 0);
      k.person({ x, z: 9.6 - (i > 4 ? 0.7 : 0), heading: 0, clip: k.rng.pick(['cheer', 'cheer', 'wave', 'point']), age: k.rng.chance(0.25) ? 'child' : 'adult' });
    }
  });
  /* partial look-alikes: each shares only some of the hero's features */
  k.person({ x: -26.5, z: 1.9, heading: 1.2, clip: 'stand', look: { pattern: 1, shirt: 'coral', shirt2: 'ivory', hat: 'hat.cap', hatTint: 'blue', glasses: null, pants: 'clayDeep', longLegs: true } });
  k.person({ x: 17.5, z: -5.2, heading: -0.6, clip: 'talk', look: { pattern: 1, shirt: 'blue', shirt2: 'ivory', hat: 'hat.bobble', hatTint: 'blue', glasses: 'face.glasses.round', pants: 'cocoa', longLegs: true } });
  k.person({ x: 29.4, z: 8.8, heading: 2.2, clip: 'stand.stick', hold: ['hold.stick'], age: 'elder', look: { pattern: 0, shirt: 'sage', hat: 'hat.beret', hatTint: 'coral', pants: 'blue', longLegs: true } });
  k.targetSpot(-18.6, 1.6, 0, 0.4);
  k.targetSpot(6.4, -5.3, 0, -0.5);
  k.targetSpot(27.5, 2.4, 0, 2.6);
  k.targetSpot(-27.2, 9.3, 0, 1.1);
}

function edges(k: Kit): void {
  for (let i = 0; i < 9; i++) {
    const x = X0 - 2 + i * 8.6;
    k.add(treeGeo(i % 3 === 0 ? 'blossom' : 'lollipop', i % 4), { x, z: 15.3, tint: i % 3 === 0 ? 'coralLight' : undefined });
    k.block(x, 15.3, 0.6, 0.6);
  }
  for (let i = 0; i < 4; i++) {
    const h = house({ w: 7, d: 7, floors: 2 + (i % 2), wall: WALLS[(i + 3) % WALLS.length], roof: 'gable', roofColor: ROOFS[i % ROOFS.length], front: { shop: i % 2 === 0, windowBoxes: true }, tint: CLOTHS[i % CLOTHS.length], seed: 470 + i });
    k.add(h.geo, { x: 40.2, z: -6 + i * 6.6, rot: -Math.PI / 2 });
    k.block(40.2, -6 + i * 6.6, 7, 7, -Math.PI / 2);
  }
}

export function buildMarket(k: Kit): void {
  paving(k);
  terrace(k);
  stalls(k);
  plaza(k);
  incidents(k);
  flows(k);
  edges(k);
}
