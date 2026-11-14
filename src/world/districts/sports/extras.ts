/**
 * Secondary activity clusters that keep every crop of the strip busy: the rest of both football
 * teams and their coaches, hopscotch and skipping, a fitness boot camp, picnics and an extra
 * three-on-three at the far end of the basketball court.
 */
import type { Kit } from '../../kit';
import { clip, gear } from './catalog';
import { HOOPS, PITCH, TEAM_A, TEAM_B, rect } from './plan';

function teams(k: Kit): void {
  const extra: ReadonlyArray<readonly [number, number, 'A' | 'B', string]> = [
    [-21.2, 1.6, 'A', clip('football.header', 'cheer.jump')],
    [-18.4, -6.0, 'A', clip('football.juggle', 'idle.hips')],
    [-14.2, 0.6, 'B', clip('football.kick', 'point')],
    [-12.4, -2.6, 'A', clip('idle.hips', 'stand')],
    [-6.2, 3.4, 'A', clip('point.across', 'point')],
    [-5.8, -4.8, 'B', clip('idle.watch', 'lookout')],
  ];
  for (const [x, z, t, c] of extra) k.person({ x, z, face: [PITCH.cx, PITCH.cz], clip: c, look: t === 'A' ? TEAM_A : TEAM_B });
  const coach = { shirt: 'ivory', pattern: 0, pants: 'blueDeep', longSleeves: true, hat: 'hat.cap', hatTint: 'blue' } as const;
  k.person({ x: -19.8, z: 5.9, heading: Math.PI, clip: clip('referee.whistle', 'point'), hold: gear('neck.whistle'), look: coach });
  k.person({ x: -9.6, z: 5.9, heading: Math.PI, clip: clip('comedy.facepalm', 'talk.shrug'), hold: gear('neck.whistle'), look: { ...coach, hatTint: 'butter' } });
  k.person({ x: -14.0, z: -7.2, heading: 0.2, clip: clip('referee.whistle', 'point'), hold: gear('neck.whistle'), look: { shirt: 'butterDeep', pattern: 0, pants: 'blueDeep', longLegs: false } });
}

function playLawn(k: Kit): void {
  k.prop('playground.hopscotch', { x: -31.4, z: 3.6, y: 0.05 });
  k.person({ x: -31.4, z: 2.6, heading: 0, age: 'child', clip: clip('kid.hop', 'cheer.jump') });
  k.person({ x: -31.0, z: 5.7, heading: Math.PI, age: 'child', clip: clip('cheer.clap', 'cheer') });
  k.person({ x: -31.9, z: 5.9, heading: Math.PI + 0.3, age: 'child', clip: clip('queue.tiptoe', 'stand') });
}

function skipping(k: Kit): void {
  const c = { x: 10.6, z: -1.2 };
  k.vignette({ id: 'double-dutch', title: 'Skip, skip, splat', story: 'Two girls turn a long rope for their friend while a fourth, counting loudly, waits for the perfect moment to jump in.' }, () => {
    const m = k.axle([c.x, 0.95, c.z], Math.PI / 2, 5.6, 0, 3);
    k.dynamic('sport.skippingrope', m, { y: -0.95, rot: Math.PI / 2, tint: 'coral' });
    k.person({ x: c.x - 1.7, z: c.z, heading: Math.PI / 2, age: 'child', clip: clip('idle.arms', 'stand') });
    k.person({ x: c.x + 1.7, z: c.z, heading: -Math.PI / 2, age: 'child', clip: clip('idle.arms', 'stand') });
    k.person({ x: c.x, z: c.z, heading: 0, age: 'child', clip: clip('skiprope.jump', 'kid.hop', 'cheer.jump'), look: { hairStyle: 'hair.pigtails' } });
    k.person({ x: c.x + 0.4, z: c.z + 1.3, heading: Math.PI + 0.3, age: 'child', clip: clip('skiprope.step', 'kid.hop', 'cheer') });
  });
}

function bootcamp(k: Kit): void {
  const moves = [clip('starjump.jump', 'cheer.jump'), clip('pushup.rep', 'lie.front'), clip('stretch.lunge', 'idle.stretch'), clip('starjump.jump', 'cheer'), clip('pushup.slow', 'sit.ground'), clip('stretch.reach', 'idle.stretch')];
  moves.forEach((c, i) => k.person({ x: HOOPS.x0 + 0.8 + i * 1.45, z: 5.2 + (i % 2) * 0.35, heading: 0, clip: c, look: { pants: 'slate', longLegs: i % 2 === 0, shirt: i % 3 ? 'sageLight' : 'coralLight', pattern: 0 } }));
  k.person({ x: HOOPS.x0 + 4.4, z: 6.6, heading: Math.PI, clip: clip('referee.whistle', 'cheer.fistpump'), hold: gear('neck.whistle'), look: { shirt: 'coralDeep', pattern: 0, hat: 'hat.visor', hatTint: 'butter' } });
}

function picnics(k: Kit): void {
  const spots: ReadonlyArray<readonly [number, number]> = [
    [13.4, 5.6],
    [-50.4, 5.2],
  ];
  spots.forEach(([x, z], i) => {
    k.ground(rect(x - 0.9, z - 0.7, x + 0.9, z + 0.7), i ? 'coralLight' : 'blueLight', 0.03, 0.015);
    k.person({ x: x - 0.5, z: z - 0.3, heading: 0.8, clip: clip('sit.ground', 'sit') });
    k.person({ x: x + 0.5, z: z - 0.2, heading: -0.9, clip: clip('sit.eat', 'sit.ground') });
    k.person({ x, z: z + 0.4, heading: Math.PI, age: 'child', clip: clip('eat.sandwich', 'sit.ground') });
  });
}

function hoopsGame(k: Kit): void {
  const cx = HOOPS.x0 + 2.6;
  const plays = [clip('basket.dribble', 'idle.hips'), clip('sway.hands-up', 'cheer'), clip('idle.hips', 'stand'), clip('point.across', 'point')];
  [[0, -5.4], [1.2, -4.4], [-0.8, -3.4], [1.6, -6.6]].forEach(([dx, z], i) => {
    k.person({ x: cx + (dx ?? 0), z: z ?? -5, face: [HOOPS.hoop.x, HOOPS.hoop.z], age: 'teen', clip: plays[i] ?? 'stand', look: i % 2 ? TEAM_A : { shirt: 'coral', pattern: 0, pants: 'blueDeep', longLegs: false } });
  });
  k.prop('ball.basketball', { x: cx + 0.4, z: -5.0 });
}

export function buildExtras(k: Kit): void {
  teams(k);
  playLawn(k);
  skipping(k);
  bootcamp(k);
  picnics(k);
  hoopsGame(k);
}
