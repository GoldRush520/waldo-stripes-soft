/**
 * Mini football pitch (centre x -14): a match in progress, goalkeepers, referee, bleachers of fans
 * along the north touchline (facing the camera), substitutes' bench and the ice-cream cart that
 * costs the west goalkeeper a goal.
 */
import type { Kit } from '../../kit';
import { clip, gait, gear, strideOf } from './catalog';
import { PITCH, TEAM_A, TEAM_B, rect, seatProp, tossYaw } from './plan';

const X0 = PITCH.cx - PITCH.w / 2;
const X1 = PITCH.cx + PITCH.w / 2;
const CART = { x: -21.6, z: 6.55 };

function field(k: Kit): void {
  k.ground(rect(X0 - 1.8, PITCH.cz - PITCH.d / 2 - 0.7, X1 + 1.8, PITCH.cz + PITCH.d / 2 + 0.7), 'sage', 0.03, 0.02);
  k.prop('sport.pitchlines', { x: PITCH.cx, z: PITCH.cz, y: 0.05 });
  k.prop('sport.goal', { x: X0, z: PITCH.cz, rot: Math.PI / 2 });
  k.prop('sport.goal', { x: X1, z: PITCH.cz, rot: -Math.PI / 2 });
  for (const x of [X0, X1]) for (const z of [PITCH.cz - PITCH.d / 2, PITCH.cz + PITCH.d / 2]) k.prop('sport.cornerflag', { x, z });
  k.prop('sport.scoreboard', { x: X0 - 0.4, z: -8.9 });
  k.prop('sport.watercooler', { x: X1 - 0.8, z: PITCH.cz + PITCH.d / 2 + 1.2, rot: Math.PI });
}

function fans(k: Kit): void {
  const scarf = (i: number) => (i % 3 === 0 ? gear({ keys: ['hold.flag', 'hold.pennant', 'hold.balloon'], tint: i % 2 ? 'blue' : 'butter' }) : []);
  [-20, -14, -8].forEach((x, b) => {
    seatProp(k, 'sport.bleachers', { x, z: -8.55 }, [-0.35, 1.2], {
      fill: 0.88,
      clips: [clip('cheer', 'wave'), clip('cheer.clap', 'cheer'), clip('cheer.fistpump', 'cheer'), 'sit', clip('sit.eat', 'sit'), clip('sit.talk', 'sit')],
      look: (i) => (i % 2 === b % 2 ? { shirt: 'blue', shirt2: 'ivory', pattern: 2 } : { shirt: 'butter', shirt2: 'coral', pattern: 5 }),
      hold: scarf,
    });
  });
  /* standing fans at both ends of the stand */
  k.group(X0 + 0.6, -7.6, 3, { clips: [clip('cheer.jump', 'cheer'), 'cheer', 'point'] });
  k.group(X1 - 0.2, -7.8, 4, { clips: ['cheer', clip('cheer.clap', 'cheer'), 'wave', 'talk'] });
}

function match(k: Kit): void {
  const players: ReadonlyArray<readonly [number, number, 'A' | 'B']> = [
    [-19.6, -3.2, 'A'],
    [-17.2, 2.4, 'B'],
    [-15.4, -1.6, 'A'],
    [-13.6, 3.6, 'B'],
    [-11.6, -4.2, 'B'],
    [-16.6, -5.0, 'B'],
  ];
  const kick = [clip('football.kick', 'kick', 'sport.kick', 'point'), clip('football.dribble', 'run.idle', 'cheer'), clip('point.across', 'point'), clip('idle.hips', 'stand')];
  players.forEach(([x, z, t], i) => {
    k.person({ x, z, face: [PITCH.cx - 3, PITCH.cz], clip: kick[i % kick.length] ?? 'stand', look: t === 'A' ? TEAM_A : TEAM_B, age: i === 3 ? 'teen' : 'adult' });
  });
  /* east goalkeeper waiting for the play to come back */
  k.person({ x: X1 - 0.8, z: PITCH.cz + 0.3, heading: -Math.PI / 2, clip: clip('goalie.ready', 'idle.hips', 'stand'), look: { shirt: 'coral', pattern: 0, pants: 'blueDeep', longSleeves: true, hat: 'hat.cap', hatTint: 'coral' } });
  k.vignette({ id: 'referee-card', title: 'No, not you!', story: 'The referee books the wrong player, who protests with open arms while the real culprit whistles innocently behind him.' }, () => {
    k.person({ x: -16.0, z: 3.9, heading: -0.6, clip: clip('referee.card', 'point'), hold: gear('neck.whistle'), look: { shirt: 'blueDeep', pattern: 0, pants: 'blueDeep', longLegs: false, hat: 'hat.cap', hatTint: 'blueDeep' } });
    k.person({ x: -16.8, z: 4.5, heading: 2.4, clip: clip('talk.shrug', 'talk.animated', 'talk'), look: TEAM_B });
    k.person({ x: -17.9, z: 4.8, heading: 0.3, clip: clip('idle.behind', 'idle.tap', 'lookout'), look: TEAM_A });
  });
}

function goalieIceCream(k: Kit): void {
  k.prop('cart.icecream', { ...CART, rot: Math.PI });
  k.vignette({ id: 'goalie-icecream', title: 'Eyes on the cone', story: 'The goalkeeper has turned to wave at the ice-cream cart just as the striker\'s shot sails into the net behind him.' }, () => {
    const keeper: readonly [number, number] = [X0 + 0.9, PITCH.cz + 0.2];
    k.person({ x: keeper[0], z: keeper[1], face: [CART.x, CART.z], clip: clip('greet.bigwave', 'wave'), look: { shirt: 'sage', pattern: 0, pants: 'cocoa', longSleeves: true, hat: 'hat.cap', hatTint: 'sage' } });
    const striker: readonly [number, number] = [X0 + 6.2, PITCH.cz - 1.2];
    k.person({ x: striker[0], z: striker[1], face: [X0, PITCH.cz], clip: clip('football.kick', 'kick', 'cheer.fistpump', 'point'), look: TEAM_B });
    k.person({ x: striker[0] + 1.4, z: striker[1] + 1.8, face: [X0, PITCH.cz], clip: clip('cheer.jump', 'cheer'), look: TEAM_B });
    k.person({ x: X0 + 3.4, z: PITCH.cz + 2.6, face: [keeper[0], keeper[1]], clip: clip('point.across', 'point'), look: TEAM_A });
    const goal: readonly [number, number] = [X0 - 0.2, PITCH.cz - 0.4];
    const m = k.toss([(striker[0] + goal[0]) / 2, 0, (striker[1] + goal[1]) / 2], tossYaw(striker, goal), 2.4, 0, Math.hypot(goal[0] - striker[0], goal[1] - striker[1]) / 2, 1.5);
    k.dynamic('ball.football', m);
    k.person({ x: CART.x, z: CART.z + 0.75, heading: Math.PI, clip: clip('vend.handover', 'vend.hawk', 'wave'), hold: gear('upper.apron'), look: { hat: 'hat.sailor', hatTint: 'ivory' } });
    k.queue([CART.x + 3.6, CART.z - 0.9], [CART.x + 0.6, CART.z - 0.75], 3, { clips: ['stand', clip('eat.icecream', 'talk'), 'lookout'], spacing: 0.7 });
    const boy = k.person({ x: CART.x - 1.6, z: CART.z - 1.1, heading: 0.8, age: 'child', clip: clip('eat.icecream', 'cheer'), look: { shirt: 'coralLight', pattern: 3, shirt2: 'ivory' } });
    k.searchable(boy, 'the boy with the triple cone');
  });
}

function dogThief(k: Kit): void {
  k.vignette({ id: 'dog-football', title: 'Who let the dog on?', story: 'A terrier has stolen the match ball and leads half the players and a puffing referee in circles round the east half.' }, () => {
    const cx = PITCH.cx + 5.2;
    const cz = PITCH.cz - 0.2;
    const ring = Array.from({ length: 14 }, (_, i): [number, number, number] => {
      const a = (i / 14) * Math.PI * 2;
      return [cx + Math.cos(a) * 3.3, 0, cz + Math.sin(a) * 2.6];
    });
    const route = k.loop(ring);
    const speed = 2.4;
    const dog = k.onRoute(route, 0, speed);
    k.dynamic('animal.dog.terrier.run', dog);
    k.dynamic('ball.football', dog, { z: 0.34, y: 0.06, scale: 0.85 });
    const run = gait('comedy.chase', 'sprint.run', 'jog.run');
    [1.5, 2.6, 3.9, 5.4].forEach((gap, i) => {
      const m = k.onRoute(route, route.length - gap, speed);
      k.person({ x: 0, z: 0, motion: m, clip: run, speed: speed / strideOf(run), look: i === 3 ? { shirt: 'blueDeep', pattern: 0, pants: 'blueDeep', longLegs: false } : i % 2 ? TEAM_A : TEAM_B, age: i === 0 ? 'teen' : 'adult' });
    });
    k.person({ x: cx + 1.2, z: cz + 4.0, face: [cx, cz], clip: clip('talk.laugh', 'point'), look: TEAM_A });
  });
}

function bench(k: Kit): void {
  seatProp(k, 'bench.park.long', { x: -15.4, z: 6.45, rot: Math.PI }, [-0.24, 0.12], { clips: [clip('sit.talk', 'sit'), 'sit', clip('drink.bottle', 'sit')], look: () => TEAM_A, hold: (i) => (i === 0 ? gear(['hold.icecream']) : []) });
  k.person({ x: -12.8, z: 6.1, heading: Math.PI, clip: clip('point.across', 'point'), look: { shirt: 'ivory', pattern: 0, pants: 'blueDeep', longSleeves: true, hat: 'hat.cap', hatTint: 'blue' } });
}

export function buildPitch(k: Kit): void {
  field(k);
  fans(k);
  match(k);
  goalieIceCream(k);
  dogThief(k);
  bench(k);
}
