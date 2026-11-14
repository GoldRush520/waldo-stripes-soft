/**
 * Chair-swing, swing boats, kiddie coaster, dodgems and the helter-skelter slide. Each moving part
 * is a dynamic prop on a motion frame and its riders sit on that same frame.
 */
import type { Vec3 } from '../../../crowd/stores';
import { CHAIRSWING_HUB, COASTER_TRACK, SWINGBOAT_PIVOT } from '../../../props/leisure';
import type { Kit } from '../../kit';
import { CHAIRSWING, COASTER, DODGEMS, HELTER, SWINGBOATS, ellipse } from './plan';
import { ride } from './riders';

export function chairSwing(k: Kit): void {
  const { x, z } = CHAIRSWING;
  k.prop('chairswing.mast', { x, z });
  const m = k.spin([x + CHAIRSWING_HUB[0], CHAIRSWING_HUB[1], z + CHAIRSWING_HUB[2]], 0.95, 0, 8);
  k.dynamic('chairswing.top', m);
  ride(k, 'chairswing.top', m, { fill: 0.7, clips: ['sit', 'sit.talk'], ages: ['teen', 'adult', 'child', 'teen'] });
  k.person({ x: x + 0.9, z: z + 3.4, heading: 0.3, clip: 'idle.watch', look: { hat: 'hat.cap', hatTint: 'coral', shirt: 'coral', pattern: 0 } });
  k.queue([x + 4.2, z + 5.6], [x + 1.1, z + 3.7], 4, { clips: ['stand', 'point', 'talk', 'idle.shift'] });
}

/** Two swing boats side by side, swinging in opposite phase. Returns the two boat motions. */
export function swingBoats(k: Kit): number[] {
  return SWINGBOATS.map((s, i) => {
    const rot = s.rot ?? 0;
    k.prop('swingboat.frame', { x: s.x, z: s.z, rot });
    k.block(s.x, s.z, 1.8, 10, rot);
    const m = k.swing([s.x + SWINGBOAT_PIVOT[0], SWINGBOAT_PIVOT[1], s.z + SWINGBOAT_PIVOT[2]], rot, 1.45, i * Math.PI, 0.72, 6);
    k.dynamic('swingboat.boat', m, { tint: i === 0 ? 'blue' : 'butter' });
    return m;
  });
}

/** The kiddie coaster: track static, cars on a looping route built from COASTER_TRACK. */
export function coaster(k: Kit): number[] {
  const { x, z } = COASTER;
  k.prop('coaster.track', { x, z });
  const route = k.loop(COASTER_TRACK.map((p): Vec3 => [p[0] + x, p[1], p[2] + z]));
  const cars: number[] = [];
  for (const train of [0, 0.5]) {
    for (let c = 0; c < 3; c++) {
      const m = k.onRoute(route, train * route.length + (2 - c) * 1.75, 2.4);
      k.dynamic('coaster.car', m, { tint: (['blue', 'coral', 'sage'] as const)[c] });
      cars.push(m);
    }
  }
  cars.slice(1).forEach((m) => ride(k, 'coaster.car', m, { fill: 0.75, clips: ['sit', 'sit.talk'], ages: ['child', 'teen', 'adult', 'child'] }));
  k.surface('deck', [[x - 9.25, z - 1.5], [x - 7.05, z - 1.5], [x - 7.05, z + 1.5], [x - 9.25, z + 1.5]], 0.75);
  k.person({ x: x - 8.4, z: z - 0.9, y: 0.75, heading: Math.PI / 2, clip: 'point', look: { hat: 'hat.cap', hatTint: 'blue', shirt: 'blue', pattern: 0 } });
  k.queue([x - 14.2, z], [x - 9.8, z], 5, { clips: ['stand', 'talk', 'idle.tap', 'point'] });
  return cars;
}

/** Dodgems: cars bumping round three overlapping loops on the arena floor. */
export function dodgems(k: Kit): void {
  const { x, z } = DODGEMS;
  k.prop('dodgem.arena', { x, z });
  const loops = [
    { pts: ellipse(x - 0.5, z, 3.6, 2.4, 14, 0.12), speed: 1.8, cars: 2 },
    { pts: ellipse(x - 1.6, z + 0.6, 2.6, 1.5, 12, 0.12, true), speed: 1.4, cars: 2 },
    { pts: ellipse(x + 0.4, z - 0.2, 2.6, 1.7, 12, 0.12), speed: 2.1, cars: 1 },
  ];
  const tints = ['coral', 'blue', 'butter', 'sage', 'coralDeep'] as const;
  let n = 0;
  for (const l of loops) {
    const route = k.loop(l.pts);
    for (let c = 0; c < l.cars; c++) {
      const m = k.onRoute(route, (c / l.cars) * route.length, l.speed);
      k.dynamic('dodgem.car', m, { tint: tints[n % tints.length] });
      ride(k, 'dodgem.car', m, { fill: 1, clips: ['sit', 'sit.talk'], ages: ['teen', 'adult', 'child'] });
      n++;
    }
  }
  k.queue([x, z + 7.6], [x, z + 4.5], 3, { clips: ['stand', 'talk', 'idle.watch'] });
}

const SLIDE_R = 2.62;
const SLIDE_TOP = 8.2;
const SLIDE_BOTTOM = 0.45;
const TURNS = 3;

/** Closed slide route: three turns down the chute, out along the run-out, back up inside the tower. */
function slideLoop(hx: number, hz: number): Vec3[] {
  const n = TURNS * 16;
  const spiral = Array.from({ length: n + 1 }, (_, i): Vec3 => {
    const t = i / n;
    const a = -TURNS * Math.PI * 2 * (1 - t);
    return [hx + Math.sin(a) * SLIDE_R, SLIDE_TOP + (SLIDE_BOTTOM - SLIDE_TOP) * t + 0.05, hz + Math.cos(a) * SLIDE_R];
  });
  return [...spiral, [hx + 2.2, SLIDE_BOTTOM + 0.05, hz + SLIDE_R], [hx + 0.7, SLIDE_BOTTOM + 0.05, hz + 0.9], [hx + 0.3, SLIDE_TOP, hz + 0.9]];
}

/** Helter-skelter with sliders spiralling down on mats; returns the slide route motions. */
export function helterSkelter(k: Kit): number[] {
  const { x, z } = HELTER;
  k.prop('fair.helterskelter', { x, z });
  const route = k.loop(slideLoop(x, z));
  const sliders = [0, 0.34, 0.67].map((f) => k.onRoute(route, f * route.length, 3.0));
  sliders.slice(1).forEach((m) => k.person({ x: 0, z: 0, motion: m, clip: 'sit.ground', age: k.rng.pick(['child', 'teen'] as const) }));
  k.queue([x + 6.4, z - 1.6], [x + 3.2, z], 4, { clips: ['stand', 'cheer', 'talk', 'idle.shift'] });
  k.person({ x: x + 3.6, z: z + 3.5, heading: -0.4, clip: 'cheer.clap', age: 'child' });
  return sliders;
}
