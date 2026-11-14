/** The lily pond: stone rim, water, lilies, ducks and a regatta of toy sailing boats. */
import { type Geo, merge, prism, rbox, rotateY, translate } from '../../../core/geo';
import type { Vec3 } from '../../../crowd/stores';
import type { Kit } from '../../kit';
import { POND, ellipse, seatedOn } from './plan';

const RIM_N = 28;
let rimGeo: Geo | undefined;
let bedGeo: Geo | undefined;
let waterGeo: Geo | undefined;

function rim(): Geo {
  rimGeo ??= merge(
    Array.from({ length: RIM_N }, (_, i) => {
      const a = ((i + 0.5) / RIM_N) * Math.PI * 2;
      const x = Math.cos(a) * (POND.rx + 0.2);
      const z = Math.sin(a) * (POND.rz + 0.2);
      const tx = -Math.sin(a) * (POND.rx + 0.2);
      const tz = Math.cos(a) * (POND.rz + 0.2);
      const len = (Math.hypot(tx, tz) * Math.PI * 2) / RIM_N + 0.06;
      return translate(rotateY(rbox(len, 0.34, 0.42, 0.06, i % 2 ? 'ivory' : 'ivoryShade'), -Math.atan2(tz, tx)), x, 0, z);
    }),
  );
  return rimGeo;
}

function basin(k: Kit): void {
  bedGeo ??= prism(ellipse(0, 0, POND.rx, POND.rz, 28), 0.03, 'blueDeep');
  waterGeo ??= prism(ellipse(0, 0, POND.rx + 0.05, POND.rz + 0.05, 28), 0.04, 'blue');
  k.add(rim(), { x: POND.x, z: POND.z });
  k.add(bedGeo, { x: POND.x, z: POND.z, y: 0.08 }, { cast: false });
  k.add(waterGeo, { x: POND.x, z: POND.z, y: POND.waterY - 0.04 }, { kind: 'water', cast: false });
  k.block(POND.x, POND.z, POND.rx * 1.9, POND.rz * 1.25);
  k.block(POND.x, POND.z, POND.rx * 1.3, POND.rz * 1.9);
  k.block(POND.x, POND.z, POND.rx * 1.7, POND.rz * 1.65);
}

function plants(k: Kit): void {
  const y = POND.waterY;
  const pads: ReadonlyArray<readonly [number, number, number]> = [
    [-5.6, 1.6, 0.2],
    [-6.4, -0.8, 1.1],
    [5.2, -2.2, 2.3],
    [6.6, 0.6, 0.7],
    [2.4, 3.4, 1.9],
    [-1.8, -3.6, 2.8],
  ];
  for (const [dx, dz, r] of pads) k.prop('plant.lilypads', { x: POND.x + dx, z: POND.z + dz, y, rot: r });
  k.prop('animal.frog.lilypad', { x: POND.x + 3.4, z: POND.z + 3.1, y, rot: 2.6 });
  k.prop('rock.m', { x: POND.x + 4.6, z: POND.z - 0.6 });
  k.prop('animal.heron', { x: POND.x + 4.6, z: POND.z - 0.6, y: 0.58, rot: -2.2 });
  for (const [dx, dz] of [
    [-9.4, -1.6],
    [-9.2, 2.4],
    [9.3, 2.0],
    [9.4, -2.6],
  ] as const) {
    k.prop('plant.reeds', { x: POND.x + dx, z: POND.z + dz, rot: dx });
  }
}

/** A small looping course on the water for a floating thing. */
function course(k: Kit, cx: number, cz: number, rx: number, rz: number): ReturnType<Kit['loop']> {
  const pts: Vec3[] = ellipse(POND.x + cx, POND.z + cz, rx, rz, 10).map(([x, z]): Vec3 => [x, POND.waterY, z]);
  return k.loop(pts);
}

function floaters(k: Kit): void {
  const ducks = course(k, 1.5, 1.2, 4.6, 2.2);
  for (let i = 0; i < 3; i++) k.dynamic('animal.duck', k.onRoute(ducks, i * 0.7, 0.32, { bob: 0.02 }), {});
  const swan = course(k, -1, 0.5, 5.8, 3.4);
  k.dynamic('animal.swan', k.onRoute(swan, 4, 0.22, { bob: 0.015 }), {});
}

function regatta(k: Kit): void {
  k.vignette({ id: 'toy-boats', title: 'The toy-boat regatta', story: 'Children on the pond rim steer little sailing boats with long canes, cheering as one boat noses ahead and another drifts straight at the unimpressed heron.' }, () => {
    const tints = ['coral', 'blue', 'butter', 'sage'] as const;
    const lanes: ReadonlyArray<readonly [number, number, number, number]> = [
      [-3.2, -1.8, 1.8, 1.1],
      [-0.4, -0.9, 2.2, 1.4],
      [2.6, -1.2, 1.5, 1.2],
      [3.6, 0.2, 1.1, 0.8],
    ];
    lanes.forEach(([cx, cz, rx, rz], i) => {
      const m = k.onRoute(course(k, cx, cz, rx, rz), i * 1.3, 0.45 + i * 0.06, { bob: 0.02 });
      k.dynamic('boat.toySail', m, { tint: tints[i % tints.length], scale: 1.4 });
    });
    const rimZ = POND.z - POND.rz - 0.55;
    [-4.2, -2.6, -0.6, 1.4, 3.2].forEach((dx, i) => {
      k.person({
        x: POND.x + dx,
        z: rimZ - (i % 2) * 0.25,
        heading: k.rng.range(-0.4, 0.4),
        age: 'child',
        clip: i % 2 ? 'point' : 'cheer.jump',
        hold: i === 2 ? [] : ['hold.stick'],
        look: { hat: i === 3 ? 'hat.sailor' : null, shirt: tints[i % tints.length] },
      });
    });
    k.person({ x: POND.x - 3.4, z: rimZ - 1.4, heading: 0.2, clip: 'cheer.clap' });
    k.person({ x: POND.x + 2.4, z: rimZ - 1.5, heading: -0.3, clip: 'photo.camera', hold: ['back.pack'] });
    k.person({ x: POND.x + 5.6, z: rimZ + 0.3, heading: -0.7, clip: 'point', age: 'elder', look: { hat: 'hat.boater', hatTint: 'blue' } });
  });
}

function edges(k: Kit): void {
  seatedOn(k, 'bench.park', { x: POND.x - 11.4, z: POND.z + 0.4, rot: Math.PI / 2 }, { fill: 0.7, clips: ['sit', 'sit.read', 'sit.asleep'] });
  seatedOn(k, 'bench.park', { x: POND.x + 11.4, z: POND.z + 0.4, rot: -Math.PI / 2 }, { fill: 0.7, clips: ['sit', 'sit.talk', 'sit.eat'] });
  for (const [dx, dz] of [
    [-10.6, -4.6],
    [10.6, -4.6],
  ] as const) {
    k.prop('lamp.swan', { x: POND.x + dx, z: POND.z + dz });
  }
  k.person({ x: POND.x - 6.4, z: POND.z + POND.rz + 1.1, heading: Math.PI, clip: 'point', age: 'child' });
  k.person({ x: POND.x - 5.8, z: POND.z + POND.rz + 1.6, heading: Math.PI - 0.3, clip: 'talk' });
  k.person({ x: POND.x + 6.2, z: POND.z + POND.rz + 1.0, heading: Math.PI + 0.2, clip: 'eat.icecream', age: 'child' });
  k.group(POND.x + 9.4, POND.z + 5.2, 3, { clips: ['talk', 'talk.laugh', 'idle.arms'] });
}

export function pond(k: Kit): void {
  basin(k);
  plants(k);
  floaters(k);
  regatta(k);
  edges(k);
}
