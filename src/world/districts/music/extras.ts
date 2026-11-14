/**
 * Clock tower and its tourists, look-alikes, hero target spots and promenade walkers. Also exports
 * the keep-out test used by the density fill (parade ring, walker lanes, target spots, the aisle).
 */
import type { Vec3 } from '../../../crowd/stores';
import { type Pt, distToPolyline } from '../../layout';
import type { Kit } from '../../kit';
import { BAND, DANCE, MAYPOLE, RING, TOWER, facing } from './plan';

export const TARGETS: ReadonlyArray<readonly [number, number]> = [
  [-8, -17.5],
  [6.5, -18.5],
  [-3.5, -16.5],
  [-14, -6],
  [-17, -10],
  [-16, 14],
  [-11.5, 18],
  [-7, 30],
  [4, 18],
  [8.5, 14],
  [15.8, 28],
  [19, -2.2],
];

const LANES: ReadonlyArray<readonly Vec3[]> = [
  [[-14, 0, -20.6], [-2, 0, -21], [9.5, 0, -23.6]],
  [[12.7, 0, -4], [12.9, 0, 8], [12.7, 0, 18]],
  [[-11.5, 0, 35.2], [-2, 0, 35.4], [8.5, 0, 35.1]],
];

const lanePts: readonly Pt[][] = LANES.map((l) => l.map((p) => [p[0], p[2]] as Pt));

/** True where filler crowds must not stand. */
export function keepOut(x: number, z: number): boolean {
  const e = Math.hypot((x - RING.x) / RING.rx, (z - RING.z) / RING.rz);
  if (Math.abs(e - 1) * 12 < 2.3) return true;
  if (lanePts.some((l) => distToPolyline(x, z, l) < 1.9)) return true;
  if (TARGETS.some(([tx, tz]) => Math.hypot(x - tx, z - tz) < 1.1)) return true;
  const r = Math.hypot(x - BAND.x, z - BAND.z);
  const a = Math.atan2(x - BAND.x, z - BAND.z);
  if (r > 6.5 && r < 11.5 && Math.abs(a) < 1.0) return true;
  if (Math.abs(x - BAND.x) < 1.0 && z > BAND.z && r < 12) return true;
  if (Math.hypot(x - DANCE.x, z - DANCE.z) < 2.6 || Math.hypot(x - MAYPOLE.x, z - MAYPOLE.z) < 3.1) return true;
  return false;
}

export function walkers(k: Kit): void {
  const bags = (rng: Kit['rng']) => (rng.chance(0.3) ? [{ key: 'hold.bag', tint: rng.pick(['coral', 'blue', 'sage', 'butter'] as const) }] : rng.chance(0.12) ? [{ key: 'hold.balloon', tint: rng.pick(['coral', 'butter'] as const) }] : undefined);
  const counts = [40, 30, 30];
  LANES.forEach((lane, i) => k.walkers(lane, counts[i] ?? 20, { lanes: [0.35, 0.95], speed: [0.6, 1.2], hold: bags }));
}

export function clockTower(k: Kit): void {
  k.prop('tower.clock', { x: TOWER.x, z: TOWER.z });
  k.vignette(
    {
      id: 'clock-watch',
      title: 'Ten past ten, always',
      story: 'A tour guide raises her umbrella toward the famous clock while her group photographs it; at the back one tourist taps his wristwatch, certain the tower has stopped.',
    },
    () => {
      const guide: [number, number] = [-1.6, -10.4];
      k.person({ x: guide[0], z: guide[1], heading: 0.3, clip: 'point.sky', hold: [{ key: 'hold.umbrella', tint: 'butter' }], look: { hat: 'hat.sun', hatTint: 'coral' } });
      const group: ReadonlyArray<readonly [number, number, string]> = [
        [-2.6, -11.2, 'photo.camera'],
        [-3.3, -10.4, 'lookout'],
        [-2.9, -12.4, 'point.sky'],
        [-3.9, -11.6, 'photo.selfie'],
        [-4.4, -10.5, 'idle.watch'],
        [-2.2, -13.3, 'read.map'],
      ];
      group.forEach(([x, z, clip], i) => {
        k.person({ x, z, heading: facing(x, z, TOWER.x, TOWER.z + 1), clip, hold: i % 2 ? ['back.pack'] : ['neck.camera'], look: { hat: i % 3 === 0 ? 'hat.sun' : null } });
      });
    },
  );
}

export function lookalikes(k: Kit): void {
  k.person({ x: -6.2, z: -18.6, heading: 0.4, clip: 'talk', look: { pattern: 1, shirt: 'coral', shirt2: 'ivory', pants: 'blue', hat: 'hat.cap', hatTint: 'sage', glasses: null, longLegs: true } });
  k.person({ x: 13.6, z: 20.6, heading: -2.0, clip: 'stand.stick', hold: ['hold.stick'], age: 'elder', look: { pattern: 0, shirt: 'butter', hat: 'hat.bobble', hatTint: 'coral', glasses: 'face.glasses.round', pants: 'clay', longLegs: true } });
  k.person({ x: -15.2, z: 16.4, heading: 0.9, clip: 'cheer.clap', look: { pattern: 1, shirt: 'coral', shirt2: 'ivory', glasses: 'face.glasses.round', pants: 'cocoa', hat: 'hat.beret', hatTint: 'blue', longLegs: true } });
  k.person({ x: 2.6, z: 26.0, heading: 0.1, clip: 'lookout', look: { pattern: 2, shirt: 'coral', shirt2: 'ivory', hat: 'hat.bobble', hatTint: 'coral', glasses: null, pants: 'blue', longLegs: true } });
}

export function targetSpots(k: Kit): void {
  for (const [x, z] of TARGETS) k.targetSpot(x, z, 0, facing(x, z, BAND.x, BAND.z + 30) * 0.4);
}
