/**
 * Clay tennis court (centre x 29.5, long axis east-west) with umpire, ball kid and a sleepy
 * benchful of spectators, then a fenced basketball half-court at the east end of the strip.
 */
import type { Kit } from '../../kit';
import { clip, gear } from './catalog';
import { HOOPS, TENNIS, TENNIS_BALL, rect, seatProp, tossYaw } from './plan';

const HALF_L = TENNIS.len / 2;

function tennisCourt(k: Kit): void {
  const { cx, cz } = TENNIS;
  k.ground(rect(cx - HALF_L - 1.4, cz - 6.4, cx + HALF_L + 1.4, cz + 6.4), 'clay', 0.03, 0.02);
  k.prop('sport.tenniscourt', { x: cx, z: cz, y: 0.05, rot: Math.PI / 2 });
  k.prop('sport.tennisnet', { x: cx, z: cz, y: 0.05, rot: Math.PI / 2 });
  k.prop('ball.tennisscatter', { x: cx - HALF_L - 0.6, z: cz + 4.6, y: 0.05 });
  k.prop('ball.tennisscatter', { x: cx + HALF_L + 0.7, z: cz - 4.4, y: 0.05, rot: 2 });
  for (const z of [-6.2, 2.4]) k.prop('fence.rail4', { x: HOOPS.x0 - 0.6, z, rot: Math.PI / 2 });
}

function rally(k: Kit): void {
  const { cx, cz } = TENNIS;
  k.vignette({ id: 'tennis-rally', title: 'The endless rally', story: 'The rally has gone on so long that one spectator has nodded off on the bench, the umpire is checking his watch and the ball kid has sat down.' }, () => {
    const a: readonly [number, number] = [cx - HALF_L + 1.2, cz + 1.6];
    const b: readonly [number, number] = [cx + HALF_L - 1.0, cz - 1.4];
    const swing = clip('tennis.forehand', 'tennis.swing', 'point.across', 'point');
    k.person({ x: a[0], z: a[1], face: [b[0], b[1]], clip: swing, look: { shirt: 'white', pattern: 0, pants: 'white', longLegs: false, hat: 'hat.cap', hatTint: 'coral' } });
    k.person({ x: b[0], z: b[1], face: [a[0], a[1]], clip: clip('tennis.serve', 'idle.hips', 'stand'), look: { shirt: 'ivory', shirt2: 'blue', pattern: 6, lower: 'lower.skirt', hairStyle: 'hair.ponytail' } });
    const m = k.toss([(a[0] + b[0]) / 2, 1.0, (a[1] + b[1]) / 2], tossYaw(a, b), 4.4, 0.3, Math.hypot(b[0] - a[0], b[1] - a[1]) / 2 - 0.6, 2.0);
    k.dynamic(TENNIS_BALL, m);
    k.seated('sport.refchair', { x: cx, z: cz - 7.3 }, { clips: [clip('idle.watch', 'lookout')] });
    doubles(k);
    k.person({ x: cx + 0.7, z: cz + 6.0, heading: Math.PI, age: 'teen', clip: clip('sit.ground', 'sit'), look: { shirt: 'sage', pattern: 0, hat: 'hat.cap', hatTint: 'sage' } });
    for (const dx of [-9.2, -4.4, 4.4, 9.2]) {
      seatProp(k, 'sport.bleachers', { x: cx + dx, z: -8.55 }, [-0.35, 1.2], { fill: 0.85, clips: [clip('sit.asleep', 'sit'), 'sit', clip('sit.talk', 'sit'), clip('sit.eat', 'sit'), clip('cheer.clap', 'cheer')], hold: (i) => (i % 5 === 0 ? gear(['hold.icecream', 'hold.drink']) : []) });
    }
  });
}

/** A second pair on the near half of each end and ball kids crouched at the net posts and corners. */
function doubles(k: Kit): void {
  const { cx, cz } = TENNIS;
  const kit = { shirt: 'white', pattern: 0, pants: 'white', longLegs: false } as const;
  k.person({ x: cx - 6.0, z: cz - 2.6, face: [cx + 6, cz], clip: clip('idle.hips', 'stand'), look: { ...kit, hat: 'hat.visor', hatTint: 'blue' } });
  k.person({ x: cx + 6.2, z: cz + 2.8, face: [cx - 6, cz], clip: clip('idle.watch', 'lookout'), look: { ...kit, shirt: 'ivory', lower: 'lower.skirt' } });
  for (const [x, z] of [[cx - 0.7, cz - 6.0], [cx - HALF_L - 0.9, cz - 5.4], [cx + HALF_L + 0.9, cz + 5.2]] as const) {
    k.person({ x, z, face: [cx, cz], age: 'teen', clip: clip('kid.crouch', 'point.down'), look: { shirt: 'sage', pattern: 0, hat: 'hat.cap', hatTint: 'sage' } });
  }
}

function hoops(k: Kit): void {
  const h = HOOPS.hoop;
  k.ground(rect(HOOPS.x0, -8.2, HOOPS.x1, 4.4), 'blueLight', 0.03, 0.02);
  k.ground(rect(h.x - 4.6, h.z - 1.9, h.x + 0.6, h.z + 1.9), 'coralLight', 0.05, 0.015);
  k.prop('sport.basketballhoop', { x: h.x, z: h.z, rot: -Math.PI / 2 });
  k.vignette({ id: 'hoop-shot', title: 'Smallest on court', story: 'Two lanky teenagers leap to block a shot that has already left the hands of a tiny girl, and it is dropping cleanly through the hoop.' }, () => {
    const from: readonly [number, number] = [h.x - 5.4, h.z + 0.4];
    const rim: readonly [number, number] = [h.x - 0.3, h.z];
    const girl = k.person({ x: from[0], z: from[1], face: [rim[0], rim[1]], age: 'child', clip: clip('basket.shot', 'cheer.jump'), look: { shirt: 'coralDeep', pattern: 0, hairStyle: 'hair.ponytail', pants: 'blueDeep' } });
    k.searchable(girl, 'the tiny basketball star');
    k.person({ x: from[0] + 1.3, z: from[1] - 0.5, face: [from[0], from[1]], age: 'teen', clip: clip('sway.hands-up', 'cheer'), look: { scale: 1.06 } });
    k.person({ x: from[0] + 1.1, z: from[1] + 0.9, face: [from[0], from[1]], age: 'teen', clip: clip('sway.hands-up', 'cheer.jump', 'cheer'), look: { scale: 1.08 } });
    const m = k.toss([(from[0] + rim[0]) / 2, 2.5, (from[1] + rim[1]) / 2], tossYaw(from, rim), 1.9, 0, Math.hypot(rim[0] - from[0], rim[1] - from[1]) / 2, 1.5);
    k.dynamic('ball.basketball', m);
    k.person({ x: h.x - 2.2, z: h.z - 3.0, face: [h.x - 0.3, h.z], clip: clip('cheer.clap', 'cheer'), age: 'teen' });
  });
  k.prop('ball.basketball', { x: HOOPS.x0 + 1.0, z: 3.4 });
  k.group(HOOPS.x0 + 2.2, 2.6, 3, { clips: ['talk', clip('idle.hips', 'stand'), clip('drink.bottle', 'talk')] });
  seatProp(k, 'sport.bleachers', { x: 47.8, z: -8.55 }, [-0.35, 1.2], { fill: 0.8, clips: [clip('cheer.clap', 'cheer'), 'sit', clip('sit.talk', 'sit'), clip('drink.bottle', 'sit')] });
  k.person({ x: 50.0, z: -6.6, heading: -0.4, age: 'teen', clip: clip('idle.phone', 'stand'), hold: gear('back.pack') });
}

export function buildCourts(k: Kit): void {
  tennisCourt(k);
  rally(k);
  hoops(k);
}
