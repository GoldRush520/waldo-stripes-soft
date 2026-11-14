/**
 * The big wheel (landmark) and the carousel. Every moving part rides one motion frame and its riders
 * reference the very same frame, so they stay locked to their gondola / horse.
 */
import type { Vec3 } from '../../../crowd/stores';
import { FERRIS_HUB, FERRIS_PIVOTS, FERRIS_RADIUS } from '../../../props/leisure';
import type { Kit } from '../../kit';
import { CLOTHS } from '../shared';
import { CAROUSEL, WHEEL } from './plan';
import { ride } from './riders';

/** Wheel angular speed (rad/s); the axle and every gondola share it. */
const WHEEL_SPEED = 0.075;
/** Wheel plane yaw: the frame is placed unrotated, so the wheel faces the camera (+z). */
const WHEEL_YAW = 0;
/** The gondola that carries the kid whose balloon got tied on (see the vignette). */
const BALLOON_GONDOLA = 3;

export function wheelHub(): Vec3 {
  return [WHEEL.x + FERRIS_HUB[0], FERRIS_HUB[1], WHEEL.z + FERRIS_HUB[2]];
}

/** Motion of gondola i: a point on the rim circle with the pivot's own phase angle. */
function gondola(k: Kit, i: number): number {
  const p = FERRIS_PIVOTS[i] ?? [0, -FERRIS_RADIUS, 0];
  const m = k.wheel(wheelHub(), WHEEL_YAW, WHEEL_SPEED, Math.atan2(p[1], p[0]), FERRIS_RADIUS);
  k.dynamic('ferris.gondola', m, { tint: CLOTHS[i % CLOTHS.length] });
  return m;
}

function wheelQueue(k: Kit): void {
  const { x, z } = WHEEL;
  for (let i = 0; i < 4; i++) k.person({ x: x + 2.6 - i * 0.75, z: z + 4.9 + k.rng.range(-0.08, 0.08), heading: -Math.PI / 2, clip: k.rng.pick(['stand', 'talk', 'idle.shift', 'idle.watch']) });
  for (let i = 0; i < 7; i++) k.person({ x: x - 2.4 + i * 0.78, z: z + 5.9 + k.rng.range(-0.08, 0.08), heading: Math.PI / 2, clip: k.rng.pick(['stand', 'talk', 'lookout', 'idle.tap', 'point.sky']), age: k.rng.chance(0.25) ? 'child' : 'adult' });
  /* attendant on the loading deck, ticket buyer at the kiosk window */
  k.person({ x: x + 1.7, z: z + 1.6, y: 0.45, heading: -Math.PI / 2, clip: 'point', look: { hat: 'hat.cap', hatTint: 'coral', shirt: 'coral', pattern: 0 } });
  k.person({ x: x + 4.6, z: z + 4.45, heading: Math.PI, clip: 'vend.coins' });
}

/** Builds the wheel; returns the motion of the balloon gondola (riders added by its vignette). */
export function bigWheel(k: Kit): number {
  const { x, z } = WHEEL;
  k.prop('ferris.frame', { x, z });
  k.surface('deck', [[x - 3.5, z - 2.5], [x + 3.5, z - 2.5], [x + 3.5, z + 2.5], [x - 3.5, z + 2.5]], 0.45);
  k.dynamic('ferris.wheel', k.axle(wheelHub(), WHEEL_YAW, WHEEL_SPEED, 0, FERRIS_RADIUS + 3));
  let balloon = -1;
  FERRIS_PIVOTS.forEach((_p, i) => {
    const m = gondola(k, i);
    if (i === BALLOON_GONDOLA) balloon = m;
    else ride(k, 'ferris.gondola', m, { fill: i % 4 === 0 ? 0.5 : 0.85, clips: ['sit', 'sit.talk', 'sit', 'sit.crossed'] });
  });
  wheelQueue(k);
  return balloon;
}

/** Vignette: a balloon tied to a gondola rides round and round while the family points up. */
export function wheelBalloon(k: Kit, m: number): void {
  k.vignette(
    { id: 'wheel-balloon', title: 'The balloon that went round', story: "A boy tied his balloon to the big wheel's gondola for safe keeping; now it rides every turn while his family below points up at it." },
    () => {
      k.dynamic('balloon.single', m, { x: 0.9, y: -1.25, z: 0.55, tint: 'coral' });
      ride(k, 'ferris.gondola', m, { fill: 1, clips: ['sit.talk'], ages: ['child', 'adult'] });
      const bx = WHEEL.x - 4.4;
      const bz = WHEEL.z + 4.6;
      k.person({ x: bx, z: bz, heading: Math.PI + 0.3, clip: 'point.sky', hold: [{ key: 'hold.bag', tint: 'sage' }] });
      k.person({ x: bx - 0.7, z: bz + 0.35, heading: Math.PI + 0.5, clip: 'point.sky', age: 'child' });
      k.person({ x: bx + 0.6, z: bz + 0.5, heading: Math.PI - 0.2, clip: 'talk.laugh', age: 'elder', hold: ['hold.stick'], look: { hat: 'hat.sun', hatTint: 'butter' } });
    },
  );
}

const MOUNT_SEATS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function carousel(k: Kit): void {
  const { x, z } = CAROUSEL;
  k.prop('carousel.base', { x, z });
  const m = k.spin([x, 0, z], 0.42, 0, 7);
  k.dynamic('carousel.platform', m);
  ride(k, 'carousel.platform', m, { seats: MOUNT_SEATS, fill: 0.8, clips: ['sit', 'sit.talk', 'sit'], ages: ['child', 'child', 'teen', 'adult'] });
  k.queue([x + 9.2, z - 9.2], [x + 6.0, z - 6.0], 4, { clips: ['stand', 'talk', 'idle.shift'] });
  k.vignette(
    { id: 'carousel-dad', title: 'Hold on tight', story: 'A dad clings to the carousel pole beside his fearless toddler while mum films every rotation and grandma waves each time they pass.' },
    () => {
      ride(k, 'carousel.platform', m, { seats: [0], fill: 1, clips: ['sit.talk'], ages: ['child'] });
      const a = 0.16;
      k.person({ x: Math.sin(a) * 4.15, y: 0.35, z: Math.cos(a) * 4.15, heading: a + Math.PI / 2 + 0.6, motion: m, clip: 'idle.arms', look: { shirt: 'sage', pattern: 4, shirt2: 'ivory' } });
      k.person({ x: x + 6.6, z: z + 0.8, heading: -Math.PI / 2, clip: 'photo.camera', hold: ['hold.camera'], look: { hat: 'hat.sun', hatTint: 'coral', lower: 'lower.skirt' } });
      k.person({ x: x + 6.5, z: z - 0.6, heading: -Math.PI / 2 + 0.2, clip: 'wave', age: 'elder', look: { hairStyle: 'hair.bun' } });
    },
  );
}
