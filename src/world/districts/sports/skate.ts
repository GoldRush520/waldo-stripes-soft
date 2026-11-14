/**
 * Skate & wheels corner at the narrow west tail (x ≈ -78 … -56): mini-ramp with a skater riding
 * the transitions, kick-scooter kids circling, the trampoline, bike rack and drinking fountain.
 */
import type { Vec3 } from '../../../crowd/stores';
import type { Kit } from '../../kit';
import { clip, gear, rideClip, strideOf } from './catalog';
import { SKATE, ride } from './plan';

/** Height of the mini-ramp surface at local x (prop space; see rampProfile in playground2). */
function rampY(x: number): number {
  const ax = Math.abs(x);
  if (ax <= 1.4) return 0.05;
  const d = Math.min(ax - 1.4, 1.15);
  return 1.2 - Math.sqrt(1.15 * 1.15 - d * d);
}

function ramp(k: Kit): void {
  const r = SKATE.ramp;
  k.prop('playground.skateramp', r);
  for (const s of [-1, 1]) k.surface('deck', [[r.x + s * 2.55, r.z - 1.5], [r.x + s * 3, r.z - 1.5], [r.x + s * 3, r.z + 1.5], [r.x + s * 2.55, r.z + 1.5]], 1.2);
  /* a closed loop that runs down one transition and up the other, turning on the coping */
  const xs = Array.from({ length: 13 }, (_, i) => -2.5 + (i / 12) * 5);
  const out: Vec3[] = xs.map((x) => [r.x + x, rampY(x), r.z + 0.35]);
  const back: Vec3[] = [...xs].reverse().map((x) => [r.x + x, rampY(x), r.z - 0.35]);
  const route = k.loop([...out, ...back]);
  const m = k.onRoute(route, 0, 3.1);
  k.dynamic('vehicle.skateboard', m);
  ride(k, 'vehicle.skateboard', { x: 0, z: 0 }, m, { age: 'teen', clips: [clip('skate.crouch', 'idle.arms')], look: () => ({ hat: 'hat.cap', hatTint: 'blue' }) });
  k.person({ x: r.x + 2.8, z: r.z - 0.6, y: 1.2, heading: -Math.PI / 2, age: 'teen', clip: clip('idle.hips', 'stand'), look: { hat: 'hat.beanie', hatTint: 'coral' } });
  k.person({ x: r.x - 2.8, z: r.z + 0.5, y: 1.2, heading: Math.PI / 2, age: 'teen', clip: clip('cheer.fistpump', 'cheer') });
}

function bail(k: Kit): void {
  const r = SKATE.ramp;
  k.vignette({ id: 'skate-bail', title: 'Nailed it (not)', story: 'A skater lies sprawled at the foot of the ramp, his board rolling away, while his friend films it and another laughs too hard to stand.' }, () => {
    k.person({ x: r.x + 4.0, z: r.z + 2.7, heading: 1.2, age: 'teen', clip: clip('lie.front', 'clown.pratfall', 'sit.ground'), look: { hat: 'hat.cap', hatTint: 'butter' } });
    k.prop('vehicle.skateboard', { x: r.x + 5.6, z: r.z + 3.6, rot: 0.9 }, { walkThrough: true });
    k.person({ x: r.x + 2.2, z: r.z + 3.6, face: [r.x + 4, r.z + 2.7], age: 'teen', clip: clip('photo.camera', 'photo.selfie', 'point') });
    k.person({ x: r.x + 3.3, z: r.z + 4.4, face: [r.x + 4, r.z + 2.7], age: 'teen', clip: clip('talk.laugh', 'cheer') });
    k.person({ x: r.x + 6.2, z: r.z + 2.4, face: [r.x + 5.6, r.z + 3.6], age: 'child', clip: clip('point.down', 'point') });
  });
}

function scooters(k: Kit): void {
  const ring = Array.from({ length: 16 }, (_, i): Vec3 => {
    const a = (i / 16) * Math.PI * 2;
    return [-65.5 + Math.cos(a) * 6.2, 0, 0.2 + Math.sin(a) * 1.5];
  });
  const route = k.loop(ring);
  [0, 7, 14, 21].forEach((s0, i) => {
    const v = 1.9 + i * 0.15;
    const m = k.onRoute(route, s0, v);
    const ridden = i === 3 ? rideClip('sit', 'bike.pedal') : rideClip('stand', 'scooter.glide');
    const key = i === 3 ? 'vehicle.tricycle' : 'vehicle.kickScooter';
    k.dynamic(key, m, { tint: i % 2 ? 'butter' : 'blue' });
    ride(k, key, { x: 0, z: 0 }, m, { age: 'child', clips: [ridden], speed: v / strideOf(ridden) });
  });
  k.group(-65.5, 0.2, 3, { clips: ['talk', clip('talk.laugh', 'talk'), 'point'] });
}

function trampoline(k: Kit): void {
  const t = SKATE.tramp;
  k.prop('playground.trampoline', t);
  k.vignette({ id: 'trampoline', title: 'Boing!', story: 'A girl bounces sky-high on the trampoline while her mum, phone raised, tries and fails to keep her in frame.' }, () => {
    const m = k.toss([t.x, 0.78, t.z], 0, 3.4, 0, 0, 1.1);
    const girl = k.person({ x: 0, z: 0, motion: m, age: 'child', clip: clip('cheer.jump', 'sway.hands-up', 'cheer'), look: { hairStyle: 'hair.pigtails', shirt: 'butter', pattern: 3, shirt2: 'coral' } });
    k.searchable(girl, 'the trampoline girl');
    k.person({ x: t.x + 1.4, z: t.z + 2.4, face: [t.x, t.z], clip: clip('photo.selfie', 'photo.camera', 'point.sky') });
    k.queue([t.x - 1.4, t.z + 4.6], [t.x - 0.6, t.z + 1.9], 3, { clips: ['stand', clip('idle.tap', 'stand'), 'talk'], spacing: 0.62 });
  });
}

function amenities(k: Kit): void {
  k.prop('sport.bikerack', { x: -60.2, z: -9.0 });
  for (const [i, x] of [-61.4, -60.6, -59.0].entries()) k.prop(i === 1 ? 'vehicle.bicycleBasket' : 'vehicle.bicycle', { x, z: -8.9, rot: Math.PI }, { walkThrough: true });
  k.prop('fountain.drinking', { x: -57.4, z: -1.8 });
  k.person({ x: -57.4, z: -1.15, heading: Math.PI, age: 'child', clip: clip('drink.bottle', 'drink.cup', 'stand') });
  k.prop('bin.litter', { x: -58.2, z: 2.6 });
  k.group(-59.0, -5.2, 4, { clips: ['talk', clip('talk.laugh', 'talk'), clip('idle.phone', 'stand'), 'point'] });
  k.person({ x: -70.6, z: -1.6, heading: 0.6, age: 'teen', clip: clip('idle.arms', 'stand'), hold: gear('back.pack') });
}

export function buildSkate(k: Kit): void {
  k.ground(
    [
      [-79, -9.4],
      [SKATE.x1, -9.4],
      [SKATE.x1, 3.2],
      [-74.4, 3.2],
    ],
    'ivoryShade',
    0.03,
    0.02,
  );
  ramp(k);
  bail(k);
  scooters(k);
  trampoline(k);
  amenities(k);
}
