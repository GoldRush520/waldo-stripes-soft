/** The promenade (pergola walk and rose arches) and the topiary lawn with its runaway rabbit. */
import type { Kit } from '../../kit';
import { PROMENADE, TOPIARY, ellipse, seatedOn } from './plan';

const PERGOLA_X = [-15.1, -12.3, -9.5, -6.7, -3.9] as const;
const ARCH_X = [4.5, 7.5, 10.5, 13.5, 16.5, 19.5] as const;

function promenade(k: Kit): void {
  const z = PROMENADE.z;
  for (const x of PERGOLA_X) k.prop('arbour.pergola', { x, z, rot: Math.PI / 2 });
  ARCH_X.forEach((x, i) => k.prop('arbour.rose', { x, z, rot: Math.PI / 2, tint: i % 2 ? 'coral' : 'coralLight' }));
  for (const x of [-40, -30, -20.5, 3, 22.5, 30, 37]) k.prop('lamp.classic', { x, z: z - PROMENADE.half - 0.4 });
  for (const x of [-27, -12, 24.5, 34.5]) k.prop('hedge.flowers.3', { x, z: z + PROMENADE.half + 0.5, tint: x > 0 ? 'butter' : 'coral' });
  for (const x of [-35.5, -2.6, 2.6, 27.4]) k.prop('planter.urn', { x, z: z + PROMENADE.half + 0.5, tint: 'coral' });
}

/** Topiary figures in two loose rows; [key, x, z, rot]. One rabbit slot stands empty. */
const FIGURES: ReadonlyArray<readonly [string, number, number, number]> = [
  ['topiary.peacock', 15.6, 0.8, 0.3],
  ['topiary.elephant', 19.8, 1.0, -0.4],
  ['topiary.teapot', 24.2, 0.8, 0],
  ['topiary.knight', 28.6, 1.0, 0],
  ['topiary.swan', 33, 0.9, 0.5],
  ['topiary.snail', 37.2, 1.2, -0.3],
  ['topiary.cone', 15.2, 7.6, 0],
  ['topiary.rabbit', 18.6, 7.6, 0.2],
  ['topiary.rabbit', 25.4, 7.6, -0.2],
  ['topiary.spiral', 29.2, 7.8, 0],
  ['topiary.cube', 33.2, 7.6, 0.4],
  ['topiary.ballstack', 37, 7.8, 0],
];

function figures(k: Kit): void {
  for (const [key, x, z, rot] of FIGURES) k.prop(key, { x, z, rot });
  k.ground(ellipse(22, 7.6, 0.6, 0.5, 10), 'clayDeep', 0.07, 0.02);
}

function escaped(k: Kit): void {
  k.vignette({ id: 'escaped-topiary', title: 'The topiary that got away', story: 'A clipped rabbit has pulled its roots out of the row and is legging it across the lawn; its gardener, shears in hand, tries to talk it round while a child cheers it on and the empty hole waits behind them.' }, () => {
    k.prop('topiary.escaped', { x: 23.6, z: 11.0, rot: 0.7 });
    const gardener = k.person({ x: 21.7, z: 11.9, face: [23.6, 11], clip: 'talk.animated', hold: [{ key: 'upper.overalls', tint: 'sage' }], look: { hat: 'hat.straw.wide', hatTint: 'butter', shirt: 'sageLight', pattern: 0 } });
    k.searchable(gardener, 'the gardener chasing the topiary');
    k.person({ x: 25.6, z: 12.2, face: [23.6, 11], clip: 'cheer.jump', age: 'child' });
    k.person({ x: 20.2, z: 9.9, face: [23.6, 11], clip: 'point', age: 'elder', look: { hat: 'hat.boater', hatTint: 'coral' } });
    k.person({ x: 22.4, z: 9.4, face: [22, 7.6], clip: 'talk.shrug' });
  });
}

function twin(k: Kit): void {
  k.vignette({ id: 'topiary-twin', title: 'Strike a pose', story: 'A man copies the heroic pose of the topiary knight exactly while his friend takes the photo and a passing child imitates them both.' }, () => {
    k.person({ x: 30.0, z: 2.1, heading: 0, clip: 'statue.hero', look: { hat: 'hat.cap', hatTint: 'blue' } });
    k.person({ x: 29.4, z: 4.9, heading: Math.PI, clip: 'photo.camera', hold: ['back.pack'] });
    k.person({ x: 31.4, z: 3.4, heading: -0.4, clip: 'statue.thinker', age: 'child' });
  });
}

function umbrellaBench(k: Kit): void {
  k.vignette({ id: 'umbrella-bench', title: 'Watering day', story: 'A gardener waters the flower bed with great enthusiasm, soaking the bench behind it, where one reader has calmly opened an umbrella and his neighbour has not noticed yet.' }, () => {
    k.prop('garden.flowerbed', { x: 9, z: -1.6, tint: 'coral' });
    k.prop('bench.park', { x: 9, z: -3.4 }, { walkThrough: true });
    k.person({ x: 8.6, z: -3.4, y: -0.02, heading: 0, clip: 'sit.read', hold: [{ key: 'hold.umbrella', tint: 'blue' }], look: { hat: 'hat.top', hatTint: 'ink' } });
    k.person({ x: 9.5, z: -3.4, y: -0.02, heading: 0, clip: 'sit.eat' });
    k.person({ x: 9.2, z: 0.2, heading: Math.PI, clip: 'garden.water', hold: [{ key: 'upper.apron', tint: 'butter' }], look: { hat: 'hat.cap', hatTint: 'sage' } });
    k.person({ x: 11.4, z: -0.2, heading: -1.9, clip: 'talk.laugh', age: 'teen' });
  });
}

function taiChi(k: Kit): void {
  k.vignette({ id: 'tai-chi', title: 'Morning tai chi', story: 'A tai chi class moves in perfect slow unison on the lawn, all except one latecomer at the back still pulling on his jumper.' }, () => {
    const x0 = 15;
    const z0 = 3.6;
    k.person({ x: x0 + 3.2, z: z0 + 2.3, heading: Math.PI, clip: 'sway.hands-up', look: { shirt: 'ivory', pants: 'ivory', hat: null } });
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) {
        const late = r === 0 && c === 3;
        k.person({ x: x0 + c * 1.6 + r * 0.8, z: z0 + r * 1.3 - 0.6, heading: 0, clip: late ? 'idle.stretch' : 'sway.hands-up', age: k.rng.chance(0.3) ? 'elder' : 'adult' });
      }
    }
  });
}

export function lawns(k: Kit): void {
  promenade(k);
  figures(k);
  escaped(k);
  twin(k);
  umbrellaBench(k);
  taiChi(k);
  k.fill([[TOPIARY.x0 + 0.5, 9.5], [TOPIARY.x1 - 0.5, 9.5], [TOPIARY.x1 - 0.5, TOPIARY.z1 - 0.3], [TOPIARY.x0 + 0.5, TOPIARY.z1 - 0.3]], 14, { clips: ['talk', 'point', 'photo.camera', 'lookout', 'talk.laugh'] });
  seatedOn(k, 'bench.park', { x: 38.6, z: 4.4, rot: -Math.PI / 2 }, { fill: 0.9, clips: ['sit', 'sit.talk'] });
}
