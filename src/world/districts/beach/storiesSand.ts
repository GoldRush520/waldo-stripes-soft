/**
 * Microstories on the sand: the buried dad, the sandcastle versus the tide, the runaway umbrella,
 * the sleeping lifeguard and the drifting lilo, and the volleyball face-plant.
 */
import { blob, merge, rotateZ, translate } from '../../../core/geo';
import { propGeo } from '../../../props/registry';
import type { Kit } from '../../kit';
import { CLIP } from './clips';
import { SAND_Y, SEA_Y, sandZ, shoreRot, waterZ } from './frame';
import { gaitSpeed } from './gait';
import { HOLD, hold, opt } from './holds';
import { zone } from './zones';

const Y = SAND_Y;

function buriedDad(k: Kit): void {
  const x = -9;
  const z = sandZ(x, 0.34);
  k.vignette({ id: 'buried-dad', title: 'Buried to the neck', story: 'A dad buried up to his chin chats on regardless while his children sculpt him a sand body with tiny toes and a crab heads for his nose.' }, () => {
    const dad = k.person({ x, z, y: Y - 1.42, heading: 0.15, clip: CLIP.talk, blob: 0, look: { hat: opt('hat.sun'), hatTint: 'butter', glasses: 'face.sunglasses' } });
    k.searchable(dad, 'the buried dad');
    const body = merge(
      translate(blob(0.55, 0.22, 0.42, 'sand', 10, 5), 0, 0, 0.1),
      translate(blob(0.42, 0.26, 0.85, 'sand', 10, 5), 0, 0, 1.1),
      translate(blob(0.16, 0.14, 0.2, 'sand', 6, 4), -0.18, 0.05, 2.0),
      translate(blob(0.16, 0.14, 0.2, 'sand', 6, 4), 0.18, 0.05, 2.0),
    );
    k.add(body, { x, z, y: Y, rot: 0.15 });
    k.person({ x: x - 1.0, z: z + 1.3, y: Y, face: [x, z + 1.1], clip: CLIP.dig, age: 'child', hold: hold(HOLD.spade) });
    k.person({ x: x + 0.95, z: z + 0.9, y: Y, face: [x, z + 1.0], clip: CLIP.crouch, age: 'child', hold: hold(HOLD.bucket) });
    k.person({ x: x + 0.7, z: z + 3.0, y: Y, face: [x, z], clip: CLIP.photo, look: { hat: opt('hat.straw.wide'), hatTint: 'coral' }, hold: hold(HOLD.camera) });
    k.person({ x: x - 1.6, z: z - 0.4, y: Y, face: [x, z], clip: CLIP.laugh });
    k.prop('animal.crab', { x: x - 0.55, z: z + 0.25, y: Y, rot: 1.2 });
    k.prop('beach.bucketspade', { x: x + 1.3, z: z + 1.9, y: Y });
  });
}

function sandcastle(k: Kit): void {
  const x = 2;
  const z = sandZ(x, 0.86);
  const rot = shoreRot(x);
  k.vignette({ id: 'tide-defence', title: 'Defending the castle', story: 'A sandcastle architect stands between her masterpiece and the incoming tide, bailing with a bucket, while the neighbouring castle has already been washed flat.' }, () => {
    k.prop('sandcastle.large', { x, z, y: Y, rot });
    k.prop('sandcastle.collapsed', { x: x + 3.4, z: z + 0.6, y: Y, rot: 0.4 });
    const hero = k.person({ x: x + 0.2, z: z + 1.75, y: Y, heading: rot, clip: CLIP.pour, hold: hold([HOLD.bucket, HOLD.spade]), look: { hat: opt('hat.bucket'), hatTint: 'butter', pants: 'coral', longLegs: false } });
    k.searchable(hero, 'the sandcastle architect');
    k.person({ x: x - 1.6, z: z + 1.3, y: Y, heading: rot + 0.4, clip: CLIP.dig, age: 'child', hold: hold(HOLD.spade) });
    k.person({ x: x - 1.2, z: z - 1.6, y: Y, face: [x, z], clip: CLIP.fistpump, age: 'child' });
    k.person({ x: x + 4.4, z: z - 0.4, y: Y, face: [x + 3.4, z + 0.6], clip: CLIP.tantrum, age: 'child' });
    k.person({ x: x + 5.3, z: z - 0.9, y: Y, face: [x + 4.4, z - 0.4], clip: CLIP.shrug });
    /* the foaming edge of the tide creeping in */
    const foam = merge(translate(blob(2.6, 0.06, 0.35, 'ivory', 10, 3), 0, 0, 0), translate(blob(1.6, 0.05, 0.25, 'blueLight', 8, 3), 0.8, 0, 0.4));
    const m = k.bob([x + 1, Y + 0.02, waterZ(x + 1) - 0.4], rot, 0.35, 0, 0.03, 0.02, 4);
    k.dynamic(foam, m, { tint: 'ivory' });
  });
}

function umbrellaChase(k: Kit): void {
  const z0 = zone('umbrella-chase');
  const tA = z0.t0 + 0.05;
  const tB = z0.t1 - 0.05;
  const route = k.loop([
    [z0.x0 + 1.5, Y, sandZ(z0.x0 + 1.5, tA)],
    [(z0.x0 + z0.x1) / 2, Y, sandZ((z0.x0 + z0.x1) / 2, tA + 0.03)],
    [z0.x1 - 1.5, Y, sandZ(z0.x1 - 1.5, tA)],
    [z0.x1 - 1.5, Y, sandZ(z0.x1 - 1.5, tB)],
    [z0.x0 + 1.5, Y, sandZ(z0.x0 + 1.5, tB)],
  ]);
  const v = 1.7;
  k.vignette({ id: 'runaway-umbrella', title: 'Gone with the wind', story: 'A gust has snatched a striped beach umbrella and sent it cartwheeling along the sand, its owner, a small boy and a delighted terrier in hot pursuit.' }, () => {
    const um = k.onRoute(route, 12, v, { bob: 0.12 });
    k.dynamic(translate(rotateZ(propGeo('umbrella.beach'), 1.25), 0, 0.62, 0), um, { rot: Math.PI / 2, tint: 'coral' });
    const owner = k.onRoute(route, 9.6, v);
    k.person({ x: 0, z: 0, motion: owner, clip: CLIP.chase, speed: gaitSpeed(CLIP.chase, v), blob: 0, look: { hat: null, pants: 'blue', longLegs: false, pattern: 0, shirt: 'butter' } });
    const kid = k.onRoute(route, 7.8, v, { lateral: 0.7 });
    k.person({ x: 0, z: 0, motion: kid, clip: CLIP.chase, speed: gaitSpeed(CLIP.chase, v, 0.65), age: 'child', blob: 0 });
    const dog = k.onRoute(route, 10.8, v, { lateral: -0.5 });
    k.dynamic('animal.dog.terrier.run', dog);
    const mid = (z0.x0 + z0.x1) / 2;
    k.person({ x: mid - 3, z: sandZ(mid - 3, z0.t0 - 0.06), y: Y, heading: 0.2, clip: CLIP.point, look: { hat: opt('hat.sun'), hatTint: 'ivory' } });
    k.person({ x: mid + 4, z: sandZ(mid + 4, z0.t0 - 0.07), y: Y, heading: -0.3, clip: CLIP.laugh });
    k.prop('beach.towel', { x: z0.x0 + 2.5, z: sandZ(z0.x0 + 2.5, z0.t1 + 0.07), y: Y, rot: 0.1, tint: 'coral' });
    k.person({ x: z0.x0 + 2.5, z: sandZ(z0.x0 + 2.5, z0.t1 + 0.07), y: Y, heading: Math.PI, clip: CLIP.lieFront, blob: 0 });
  });
}

function lifeguard(k: Kit): void {
  const zn = zone('lifeguard');
  const x = (zn.x0 + zn.x1) / 2;
  const z = sandZ(x, 0.72);
  k.vignette({ id: 'sleeping-lifeguard', title: 'Asleep on duty', story: 'The lifeguard dozes in his tower while a boy tugs at the ladder and points out to sea, where a snoozing sunbather on a lilo drifts past the buoy line.' }, () => {
    k.prop('beach.lifeguardtower', { x, z, y: Y });
    const guard = k.person({ x, z: z + 0.1, y: Y + 2.62 - 0.47, heading: 0, clip: CLIP.sitAsleep, blob: 0, look: { hat: opt('hat.visor'), hatTint: 'coral', shirt: 'coral', pattern: 0 }, hold: hold(HOLD.whistle) });
    k.searchable(guard, 'the sleeping lifeguard');
    k.prop('beach.rescuerack', { x: x + 2.4, z: z - 0.4, y: Y, rot: 0.2 });
    k.prop('beach.lifeguardflag', { x: x - 1.6, z: z + 1.4, y: Y });
    k.person({ x: x + 0.25, z: z + 2.0, y: Y, heading: 0.3, clip: CLIP.pointAcross, age: 'child' });
    k.person({ x: x - 1.1, z: z + 2.5, y: Y, heading: 0.1, clip: CLIP.bigwave, look: { hat: opt('hat.straw.wide'), hatTint: 'sage' } });
    const lx = x + 4;
    const lz = waterZ(lx) + 23;
    const m = k.bob([lx, SEA_Y, lz], 0.5, 0.5, 0.2, 0.05, 0.05, 4);
    k.dynamic('beach.lilo', m, { tint: 'butter' });
    k.person({ x: 0, z: 0.1, y: 0.2, heading: 0, motion: m, clip: CLIP.sunbathe, blob: 0, look: { glasses: 'face.sunglasses', longLegs: false } });
  });
}

function volleyball(k: Kit): void {
  const zn = zone('volleyball');
  const x = (zn.x0 + zn.x1) / 2;
  const z = sandZ(x, (zn.t0 + zn.t1) / 2);
  const rot = shoreRot(x);
  k.vignette({ id: 'volleyball', title: 'Diving for nothing', story: 'A volleyball player throws himself full length for a ball that is already sailing over his head, to the glee of the opposing pair and the crowd on the sideline.' }, () => {
    k.prop('beach.volleyballnet', { x, z, y: Y, rot });
    const m = k.toss([x, Y + 2.2, z], rot + Math.PI / 2, 0.38, 0.1, 6, 2.6);
    k.dynamic('ball.beach', m, { tint: 'butter' });
    const north: ReadonlyArray<readonly [number, number, string]> = [[-2.2, -2.6, CLIP.spike], [2.4, -3.2, CLIP.bump]];
    for (const [dx, dz, clip] of north) {
      const p = k.rel({ x, z, rot }, dx, dz, 0);
      k.person({ ...p, y: Y, clip, look: { shirt: 'blue', pattern: 0, longLegs: false, hat: opt('hat.visor'), hatTint: 'blue' } });
    }
    const flop = k.rel({ x, z, rot }, 1.6, 2.8, Math.PI);
    k.person({ ...flop, y: Y, clip: CLIP.slip, look: { shirt: 'coral', pattern: 0, longLegs: false } });
    const mate = k.rel({ x, z, rot }, -2.6, 3.4, Math.PI);
    k.person({ ...mate, y: Y, clip: CLIP.facepalm, look: { shirt: 'coral', pattern: 0, longLegs: false } });
    for (let i = 0; i < 12; i++) {
      const side = i < 6 ? -1 : 1;
      const p = k.rel({ x, z, rot }, side * (8.9 + (i % 2) * 0.8), -3.6 + (i % 6) * 1.45, side > 0 ? -Math.PI / 2 : Math.PI / 2);
      k.person({ ...p, y: Y, clip: k.rng.pick([CLIP.clap, CLIP.cheer, CLIP.sitGround, CLIP.fistpump, CLIP.sitGround]), age: k.rng.chance(0.3) ? 'child' : 'adult', look: { longLegs: false } });
    }
    const ref = k.rel({ x, z, rot }, 5.4, -0.3, -Math.PI / 2);
    k.person({ ...ref, y: Y, clip: CLIP.referee, hold: hold(HOLD.whistle), look: { shirt: 'ivory', shirt2: 'cocoa', pattern: 2, hat: opt('hat.cap'), hatTint: 'ivory' } });
  });
}

export function buildSandStories(k: Kit): void {
  buriedDad(k);
  sandcastle(k);
  umbrellaChase(k);
  lifeguard(k);
  volleyball(k);
}
