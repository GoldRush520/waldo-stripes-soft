/** South lawns: the gazebo wedding, picnics, the plant sale, croquet, kites and the tethered balloon. */
import { type Geo, beam, merge } from '../../../core/geo';
import { GOODS_KINDS, type GoodsKind, stall } from '../../../props/street';
import type { Kit } from '../../kit';
import { CLOTHS } from '../shared';
import { BALLOON, GAZEBO, ellipse } from './plan';

const lineCache = new Map<string, Geo>();

/** A thin kite line from the hand (origin) up to the kite. */
function kiteLine(dx: number, dy: number, dz: number): Geo {
  const key = `${dx}:${dy}:${dz}`;
  let g = lineCache.get(key);
  if (!g) {
    g = merge(beam([0, 0, 0], [dx, dy, dz], 0.025, 'ivoryDeep'));
    lineCache.set(key, g);
  }
  return g;
}

function kite(k: Kit, x: number, z: number, key: 'air.kite.diamond' | 'air.kite.box', tint: (typeof CLOTHS)[number], phase: number, clip = 'point.sky'): number {
  const id = k.person({ x, z, heading: Math.PI + k.rng.range(-0.3, 0.3), clip, age: k.rng.chance(0.4) ? 'child' : 'adult' });
  const m = k.swing([x, 1.5, z], 0, 0.35, phase, 0.12, 9);
  k.dynamic(key, m, { x: 0.8, y: 6.2, z: -4.6, tint });
  k.dynamic(kiteLine(0.8, 6.2, -4.6), m, { tint: 'ivory' });
  return id;
}

function picnic(k: Kit, x: number, z: number, n: number, tint: (typeof CLOTHS)[number]): void {
  const rot = k.rng.range(-0.4, 0.4);
  k.prop('beach.picnic', { x, z, rot, tint });
  const start = k.rng.range(0, Math.PI * 2);
  for (let i = 0; i < n; i++) {
    const a = start + (i / n) * Math.PI * 2;
    k.person({ x: x + Math.sin(a) * 1.25, z: z + Math.cos(a) * 1.25, face: [x, z], clip: k.rng.pick(['sit.ground', 'sit.ground', 'sit.eat', 'sit.talk']), age: k.rng.chance(0.3) ? 'child' : 'adult' });
  }
}

function wedding(k: Kit): void {
  k.vignette({ id: 'garden-wedding', title: 'The gazebo wedding', story: 'A bride and groom kiss under the striped gazebo while the guests cheer and throw petals, the photographer backs into a rose bush and the flower girl has wandered off to chase a butterfly.' }, () => {
    k.prop('gazebo', { x: GAZEBO.x, z: GAZEBO.z, tint: 'coral' }, { walkThrough: true });
    k.surface('deck', ellipse(GAZEBO.x, GAZEBO.z, 2.3, 2.3, 6), 0.3);
    k.seated('gazebo', { x: GAZEBO.x, z: GAZEBO.z }, { place: false, fill: 0.6, clips: ['sit', 'sit.talk'] });
    const bride = k.person({ x: GAZEBO.x - 0.35, z: GAZEBO.z + 1.2, y: 0.3, heading: Math.PI / 2, clip: 'greet.kiss', look: { lower: 'lower.dress.long', shirt: 'white', pattern: 0, hat: 'hat.flowercrown', hatTint: 'coralLight', hairStyle: 'hair.bun' } });
    k.searchable(bride, 'the bride');
    k.person({ x: GAZEBO.x + 0.35, z: GAZEBO.z + 1.2, y: 0.3, heading: -Math.PI / 2, clip: 'greet.kiss', hold: ['upper.bowtie'], look: { shirt: 'ink', pattern: 0, pants: 'ink', hat: 'hat.top', hatTint: 'ink' } });
    for (let i = 0; i < 9; i++) {
      const a = -1.1 + i * 0.275;
      const r = 4.0 + (i % 2) * 0.8;
      k.person({ x: GAZEBO.x + Math.sin(a) * r, z: GAZEBO.z + Math.cos(a) * r, face: [GAZEBO.x, GAZEBO.z], clip: k.rng.pick(['cheer', 'cheer.clap', 'wave', 'photo.selfie']), look: { hat: k.rng.chance(0.4) ? 'hat.party' : null } });
    }
    k.prop('plant.rosebush', { x: GAZEBO.x + 4.6, z: GAZEBO.z + 3.4 });
    k.person({ x: GAZEBO.x + 3.9, z: GAZEBO.z + 3.0, face: [GAZEBO.x, GAZEBO.z], clip: 'photo.tripod' });
    k.person({ x: GAZEBO.x - 4.6, z: GAZEBO.z + 3.4, heading: -2.2, clip: 'point.sky', age: 'child', look: { lower: 'lower.dress', shirt: 'coralLight', hat: 'hat.flowercrown' } });
    k.prop('animal.butterflies', { x: GAZEBO.x - 5.4, z: GAZEBO.z + 2.6, y: 1.5 });
  });
}

function plantSale(k: Kit): void {
  const goods = (['flowers', 'flowers', 'pottery', 'jars'] as GoodsKind[]).filter((g) => GOODS_KINDS.includes(g));
  [-29, -26.2, -23.4, -20.6].forEach((x, i) => {
    const g = goods.length ? [goods[i % goods.length] as GoodsKind] : [];
    const s = stall({ width: 2.4, awning: i % 2 ? 'scallop' : 'pitched', goods: g, seed: 900 + i });
    const at = { x, z: 9.6, rot: 0 };
    k.add(s.geo, { ...at, tint: CLOTHS[(i + 2) % CLOTHS.length] });
    k.block(x, 9.6 + 0.36, s.footprint[0], 0.78);
    const v = k.rel(at, s.vendorSpot.x, s.vendorSpot.z, s.vendorSpot.heading);
    k.person({ ...v, clip: k.rng.pick(['vend.hawk', 'vend.handover', 'vend.arrange']), hold: [{ key: 'upper.apron', tint: 'sage' }], look: { hat: 'hat.sun', hatTint: 'butter' } });
    for (const c of s.customerSpots) {
      const p = k.rel(at, c.x + k.rng.range(-0.1, 0.1), c.z + k.rng.range(0, 0.2), c.heading);
      if (!k.isFree(p.x, p.z, 0.3)) continue;
      k.person({ ...p, clip: k.rng.pick(['point', 'talk', 'vend.coins', 'stand']), hold: k.rng.chance(0.4) ? [{ key: 'hold.bag', tint: k.rng.pick(CLOTHS) }] : [] });
    }
  });
  k.prop('cart.flower', { x: -17.4, z: 9.8, rot: -0.3 });
  k.prop('board.notice', { x: -31, z: 11.2, rot: 0.6 });
}

function croquet(k: Kit): void {
  k.vignette({ id: 'croquet', title: 'A fierce game of croquet', story: 'Four elderly croquet players take the game extremely seriously, one lining up a shot with great ceremony while a dog trots off with the ball.' }, () => {
    const cx = -19;
    const cz = 1.6;
    k.prop('ball.tennisscatter', { x: cx, z: cz });
    k.person({ x: cx - 0.9, z: cz - 0.3, heading: 1.3, clip: 'point.down', age: 'elder', hold: ['hold.stick', 'upper.waistcoat'], look: { shirt: 'ivory', pants: 'ivory', hat: 'hat.boater', hatTint: 'ivory' } });
    k.person({ x: cx + 1.6, z: cz - 1.4, face: [cx, cz], clip: 'idle.behind', age: 'elder', look: { shirt: 'ivory', hat: 'hat.sun', hatTint: 'ivory' } });
    k.person({ x: cx + 2.2, z: cz + 0.6, face: [cx, cz], clip: 'idle.watch', age: 'elder', hold: ['hold.stick'], look: { shirt: 'blueLight', hat: 'hat.boater', hatTint: 'blue' } });
    k.person({ x: cx - 2.2, z: cz + 1.1, face: [cx, cz], clip: 'talk.whisper', age: 'elder' });
    k.prop('animal.dog.poodle.run', { x: cx + 3.4, z: cz + 2.4, rot: 2.4 });
    k.person({ x: cx + 4.4, z: cz + 2.0, face: [cx + 3.4, cz + 2.4], clip: 'point', age: 'child' });
  });
}

function balloon(k: Kit): void {
  k.vignette({ id: 'balloon', title: 'Up, up and not quite away', story: 'Two passengers wave grandly from the tethered balloon, which bobs proudly on its tether going absolutely nowhere, while the queue for the next go cranes upward and the operator checks his watch.' }, () => {
    const m = k.bob([BALLOON.x, 0, BALLOON.z], 0, 0.35, 0, 0.12, 0.02, 10);
    k.dynamic('air.balloon', m, { tint: 'coral' });
    k.block(BALLOON.x, BALLOON.z, 1.4, 1.4);
    k.seated('air.balloon', { x: 0, z: 0 }, { motion: m, place: false, fill: 1, clips: ['wave', 'greet.bigwave'] });
    k.person({ x: BALLOON.x - 1.8, z: BALLOON.z + 1.2, heading: 0.6, clip: 'idle.watch', look: { hat: 'hat.sailor', hatTint: 'blue' } });
    k.queue([BALLOON.x - 9, BALLOON.z + 3.4], [BALLOON.x - 2.2, BALLOON.z + 1.8], 8, { clips: ['lookout', 'point.sky', 'stand', 'talk'] });
  });
  k.prop('sign.chalk.aframe', { x: BALLOON.x - 2.6, z: BALLOON.z + 3.0 });
}

function kites(k: Kit): void {
  const tints = ['coral', 'blue', 'butter', 'sage', 'coralDeep'] as const;
  [-8, -4.2, 4, 7.6].forEach((x, i) => kite(k, x, 25.5 + (i % 2) * 1.2, i % 2 ? 'air.kite.box' : 'air.kite.diamond', tints[i % tints.length], i * 0.7));
  k.vignette({ id: 'kite-tangle', title: 'Tangled lines', story: 'Two kite flyers have crossed lines and are each sure the other should let go, while a third kite hangs in the big tree and its small owner points at it in silent outrage.' }, () => {
    kite(k, 11.6, 26.4, 'air.kite.diamond', 'coral', 0.1, 'talk.animated');
    kite(k, 12.6, 26.6, 'air.kite.diamond', 'blue', 0.15, 'talk.shrug');
    k.prop('tree.round.m', { x: 17.8, z: 28.3 });
    k.prop('air.kite.box', { x: 17.4, z: 28.2, y: 5.2, tint: 'butter' });
    k.person({ x: 17.0, z: 26.6, face: [17.6, 28.3], clip: 'point.sky', age: 'child' });
    k.person({ x: 18.6, z: 26.4, face: [17.8, 28.3], clip: 'talk.shrug' });
  });
}

function school(k: Kit): void {
  k.vignette({ id: 'school-trip', title: 'Follow the leader', story: 'A teacher leads a crocodile of schoolchildren two by two toward the pond, while the last pair has stopped to stare at a squirrel.' }, () => {
    k.person({ x: -6.6, z: 17.6, heading: 0.9, clip: 'point', hold: ['neck.whistle'], look: { hat: 'hat.sun', hatTint: 'coral', lower: 'lower.skirt.long' } });
    for (let i = 0; i < 8; i++) {
      const row = Math.floor(i / 2);
      const side = i % 2 ? 0.45 : -0.45;
      const last = row === 3;
      k.person({ x: -7.6 - row * 0.85 + side * 0.6, z: 18.4 + row * 0.55 + side, heading: last ? -2.4 : 0.9, clip: last ? 'point' : 'stand', age: 'child', look: { hat: 'hat.cap', hatTint: 'butter' } });
    }
    k.prop('animal.squirrel', { x: -11.6, z: 18.6, rot: 1 });
  });
}

function iceCream(k: Kit): void {
  k.prop('cart.icecream', { x: 3.6, z: 17.4, rot: -Math.PI / 2, tint: 'coral' });
  k.person({ x: 4.6, z: 17.4, heading: -Math.PI / 2, clip: 'vend.handover', look: { hat: 'hat.sailor', hatTint: 'coral', shirt: 'ivory', pattern: 2 } });
  k.queue([2.0, 23.2], [2.4, 18.6], 6, { clips: ['stand', 'eat.icecream', 'talk', 'lookout'] });
}

export function leisure(k: Kit): void {
  wedding(k);
  plantSale(k);
  croquet(k);
  balloon(k);
  kites(k);
  school(k);
  iceCream(k);
  const tints = ['coral', 'blue', 'butter', 'sage'] as const;
  const blankets: ReadonlyArray<readonly [number, number, number]> = [
    [-27, 26.2, 3],
    [-22.6, 27.2, 4],
    [-18.2, 25.6, 3],
    [-13.6, 26.8, 4],
    [10.8, 16.4, 3],
    [15.2, 18.6, 4],
    [20.4, 16.2, 3],
    [24.6, 19.6, 3],
    [14, 22.8, 4],
    [21.2, 23.6, 3],
  ];
  blankets.forEach(([x, z, n], i) => picnic(k, x, z, n, tints[i % tints.length]));
}
