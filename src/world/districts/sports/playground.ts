/**
 * The fenced playground (x ≈ -52.5 … -29.5): swings, see-saw and roundabout that really move with
 * their riders locked to them, plus slide, sandbox, climbing dome, spring riders and monkey bars,
 * parents on benches round the edge.
 */
import { SEESAW_PIVOT, SWING_PIVOTS } from '../../../props/leisure/index';
import type { Kit } from '../../kit';
import { clip, gear, rideClip } from './catalog';
import { PLAY, rect, ride, seatProp } from './plan';

const SWINGS = { x: -46.4, z: -7.1 };
const SEESAW = { x: -46.2, z: -1.6 };
const ROUND = { x: -40.4, z: -1.8 };
const SLIDE = { x: -33.6, z: 0.6 };
const SAND = { x: -47.6, z: 3.6 };
const DOME = { x: -36.6, z: -6.9 };

function ground(k: Kit): void {
  k.ground(rect(PLAY.x0, -9.4, PLAY.x1, 6.4), 'butterLight', 0.03, 0.02);
  k.ground(rect(-44.2, -4.4, -36.6, 0.8), 'clayLight', 0.05, 0.02);
  for (const z of [-7.4, -3.4, 3.4]) {
    k.prop('fence.picket4', { x: PLAY.x0, z, rot: Math.PI / 2 });
    k.prop('fence.picket4', { x: PLAY.x1, z, rot: Math.PI / 2 });
  }
}

function swings(k: Kit): void {
  k.prop('swing.frame', SWINGS);
  k.vignette({ id: 'swing-high', title: 'Higher, higher!', story: 'One girl swings so high her dad covers his eyes while her brother on the next swing hardly moves and complains.' }, () => {
    SWING_PIVOTS.forEach((p, i) => {
      const amp = i === 1 ? 0.95 : i === 2 ? 0.16 : 0.45 + i * 0.08;
      const m = k.swing([SWINGS.x + p[0], p[1], SWINGS.z + p[2]], 0, 2.25, i * 1.7, amp, 3);
      k.dynamic('swing.seat', m, { tint: i % 2 ? 'blue' : 'coral' });
      ride(k, 'swing.seat', { x: 0, z: 0 }, m, { age: 'child', clips: [i === 1 ? rideClip('sit', 'swing.pump') : rideClip('sit', 'swing.gentle')] });
    });
    k.person({ x: SWINGS.x - 0.6, z: SWINGS.z + 2.4, heading: Math.PI, clip: clip('idle.watch', 'lookout'), look: { hat: 'hat.cap', hatTint: 'sage' } });
    k.person({ x: SWINGS.x + 0.4, z: SWINGS.z + 2.5, heading: Math.PI + 0.3, clip: clip('point.across', 'point') });
    k.person({ x: SWINGS.x + 1.6, z: SWINGS.z + 2.3, heading: Math.PI - 0.2, age: 'child', clip: clip('talk.shrug', 'talk') });
  });
}

function seesaw(k: Kit): void {
  k.prop('seesaw.base', SEESAW);
  k.vignette({ id: 'seesaw-grandad', title: 'Grandad on the see-saw', story: 'A grandad has taken the see-saw seriously against his tiny granddaughter, and grandma referees from the side.' }, () => {
    const m = k.rock([SEESAW.x + SEESAW_PIVOT[0], SEESAW_PIVOT[1], SEESAW.z + SEESAW_PIVOT[2]], 0, 1.7, 0.4, 0.24, 2.6);
    k.dynamic('seesaw.plank', m, { tint: 'butter' });
    /* plank seats: x = -1.6 faces +x, x = 1.6 faces -x (see SEESAW_SEATS) */
    k.person({ x: -1.6, z: 0, y: 0.08 - 0.47 * 0.56, heading: Math.PI / 2, motion: m, age: 'child', clip: rideClip('sit', 'seesaw.bounce'), look: { scale: 0.56 }, blob: 0 });
    k.person({ x: 1.6, z: 0, y: 0.08 - 0.47, heading: -Math.PI / 2, motion: m, age: 'elder', clip: rideClip('sit', 'seesaw.bounce'), look: { hat: 'hat.boater', hatTint: 'blue', scale: 1, build: 1.2 }, blob: 0 });
    k.person({ x: SEESAW.x, z: SEESAW.z + 1.5, heading: Math.PI, age: 'elder', clip: clip('cheer.clap', 'cheer'), look: { lower: 'lower.skirt.long' }, hold: gear({ keys: ['hold.bag'], tint: 'coral' }) });
  });
}

function roundabout(k: Kit): void {
  k.vignette({ id: 'dizzy-roundabout', title: 'Round and round', story: 'A dad spins the roundabout full of shrieking kids while one dizzy boy who just got off sits on the ground seeing stars.' }, () => {
    const m = k.spin([ROUND.x, 0, ROUND.z], 1.3, 0, 2);
    k.dynamic('playground.roundabout', m, { tint: 'coral' });
    k.block(ROUND.x, ROUND.z, 2.5, 2.5);
    ride(k, 'playground.roundabout', { x: 0, z: 0 }, m, { age: 'child', clips: [rideClip('sit', 'ride.scream'), rideClip('sit', 'ride.cheer')] });
    k.person({ x: ROUND.x + 1.75, z: ROUND.z + 0.6, face: [ROUND.x, ROUND.z], clip: clip('comedy.fist', 'point'), look: { hat: 'hat.beanie', hatTint: 'butter' } });
    k.person({ x: ROUND.x - 1.1, z: ROUND.z + 1.9, heading: 0.4, age: 'child', clip: clip('sit.ground', 'sit'), y: 0 });
    k.person({ x: ROUND.x - 1.9, z: ROUND.z + 2.2, face: [ROUND.x - 1.1, ROUND.z + 1.9], age: 'child', clip: clip('talk.laugh', 'point') });
  });
}

function slide(k: Kit): void {
  k.prop('playground.slide', SLIDE);
  k.vignette({ id: 'slide-dad', title: 'Dad is stuck', story: 'A grown-up has wedged himself halfway down the slide; the queue of children on the ladder points and giggles.' }, () => {
    k.person({ x: SLIDE.x, z: SLIDE.z + 0.15, y: 1.18 - 0.47, heading: 0, clip: clip('slide.down', 'sit'), look: { hat: 'hat.sun', hatTint: 'butter', build: 1.2 }, blob: 0 });
    k.queue([SLIDE.x - 0.1, SLIDE.z - 5.2], [SLIDE.x, SLIDE.z - 1.6], 4, { clips: [clip('queue.impatient', 'point'), clip('talk.laugh', 'cheer'), 'point', clip('queue.tiptoe', 'stand')], spacing: 0.62 });
    k.person({ x: SLIDE.x + 1.4, z: SLIDE.z + 2.6, face: [SLIDE.x, SLIDE.z + 0.4], clip: clip('photo.camera', 'point'), look: { lower: 'lower.dress' } });
  });
}

function sandbox(k: Kit): void {
  k.prop('playground.sandbox', SAND, { walkThrough: true });
  k.vignette({ id: 'sandcastle', title: 'The sandcastle stomp', story: 'Two children put the last tower on their castle as a toddler, arms raised, waddles in to flatten it.' }, () => {
    k.person({ x: SAND.x - 0.6, z: SAND.z + 0.1, y: 0.2, heading: 0.6, age: 'child', clip: clip('sit.ground', 'sit') });
    k.person({ x: SAND.x + 0.5, z: SAND.z - 0.4, y: 0.2, heading: -0.4, age: 'child', clip: clip('sit.ground', 'sit') });
    k.person({ x: SAND.x + 0.4, z: SAND.z + 0.7, y: 0.2, heading: Math.PI + 0.6, age: 'child', clip: clip('kid.tantrum', 'sway.hands-up'), look: { scale: 0.52 } });
    k.person({ x: SAND.x + 1.9, z: SAND.z + 1.6, face: [SAND.x, SAND.z], clip: clip('point.down', 'point'), age: 'adult' });
  });
  k.surface('sand', rect(SAND.x - 1.1, SAND.z - 1.1, SAND.x + 1.1, SAND.z + 1.1), 0.2);
}

function equipment(k: Kit): void {
  k.prop('playground.climbdome', DOME);
  [[-0.2, 1.9], [1.1, 1.2], [-1.2, 0.9]].forEach(([dx, y], i) => {
    k.person({ x: DOME.x + (dx ?? 0), z: DOME.z + 0.5 - i * 0.6, y: y ?? 1, heading: i * 2, age: 'child', clip: i === 0 ? clip('cheer.fistpump', 'cheer') : clip('ladder.climb', 'wave'), blob: 0 });
  });
  k.prop('playground.monkeybars', { x: -38.4, z: 4.2 });
  k.person({ x: -38.4, z: 4.2, y: 0.65, heading: Math.PI / 2, age: 'child', clip: clip('monkeybars.swing', 'sway.hands-up'), blob: 0 });
  ride(k, 'springrider.duck', { x: -43.6, z: 3.6 }, undefined, { age: 'child', clips: [clip('cheer', 'wave')] });
  k.prop('springrider.duck', { x: -43.6, z: 3.6 }, { walkThrough: true });
  ride(k, 'springrider.horse', { x: -42.2, z: 4.4, rot: -0.4 }, undefined, { age: 'child', clips: ['wave'] });
  k.prop('springrider.horse', { x: -42.2, z: 4.4, rot: -0.4 }, { walkThrough: true });
}

function parents(k: Kit): void {
  seatProp(k, 'bench.park.long', { x: -40.6, z: -8.9 }, [-0.24, 0.12], { clips: [clip('sit.talk', 'sit'), clip('sit.read', 'sit'), 'sit', clip('idle.phone', 'sit')], fill: 0.8 });
  seatProp(k, 'bench.park', { x: -51.4, z: -1.2, rot: Math.PI / 2 }, [-0.24, 0.12], { clips: [clip('sit.talk', 'sit'), clip('sit.eat', 'sit')] });
  seatProp(k, 'bench.park', { x: -30.6, z: -3.8, rot: -Math.PI / 2 }, [-0.24, 0.12], { clips: [clip('sit.crossed', 'sit'), clip('sit.asleep', 'sit')] });
  k.prop('cart.pram', { x: -49.8, z: -1.6, rot: 1.2 });
  k.prop('bin.litter', { x: -51.6, z: 1.1 });
  k.group(-37.2, 2.4, 3, { clips: ['talk', clip('talk.laugh', 'talk'), clip('idle.hips', 'stand')] });
  k.group(-49.6, -4.6, 2, { clips: ['talk', clip('idle.watch', 'lookout')] });
  k.person({ x: -44.8, z: 1.8, heading: 2.6, clip: clip('push.pram', 'stand'), age: 'adult' });
}

export function buildPlayground(k: Kit): void {
  ground(k);
  swings(k);
  seesaw(k);
  roundabout(k);
  slide(k);
  sandbox(k);
  equipment(k);
  parents(k);
}
