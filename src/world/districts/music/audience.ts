/**
 * The audience: gently curved rows of bistro chairs (front) and park benches (back) facing the
 * bandstand, a centre aisle to its steps, standing fans on the flanks and children on the ground.
 * Seats are walk-through props so their sitters are not counted inside solid footprints.
 */
import { propDef } from '../../../props/registry';
import type { Kit } from '../../kit';
import { BAND, facing } from './plan';

interface Row {
  readonly r: number;
  readonly key: 'cafe.chair.bistro' | 'bench.park.long';
  readonly span: number;
  readonly step: number;
  readonly maxA: number;
}

const ROWS: readonly Row[] = [
  { r: 7.2, key: 'cafe.chair.bistro', span: 0.42, step: 0.64, maxA: 0.9 },
  { r: 8.3, key: 'cafe.chair.bistro', span: 0.42, step: 0.64, maxA: 0.92 },
  { r: 9.5, key: 'bench.park.long', span: 2.2, step: 2.45, maxA: 0.9 },
  { r: 10.7, key: 'bench.park.long', span: 2.2, step: 2.45, maxA: 0.88 },
];

const SIT = ['sit', 'sit', 'sit.crossed', 'sit.talk', 'sit.talk', 'sit.eat', 'sit.read'] as const;

/** The bench the dozing-listener vignette owns: row index, side (+1 east / -1 west), slot index. */
export const DOZE = { row: 2, side: 1, slot: 1 } as const;

export interface Seat {
  readonly x: number;
  readonly z: number;
  readonly rot: number;
}

export function seatAt(row: Row, side: number, slot: number): Seat | null {
  const a0 = 0.11 + row.span / 2 / row.r;
  const a = side * (a0 + (slot * row.step) / row.r);
  if (Math.abs(a) > row.maxA) return null;
  return { x: BAND.x + Math.sin(a) * row.r, z: BAND.z + Math.cos(a) * row.r, rot: a + Math.PI };
}

export function dozeSeat(): { row: Row; seat: Seat } {
  const row = ROWS[DOZE.row] as Row;
  const seat = seatAt(row, DOZE.side, DOZE.slot);
  if (!seat) throw new Error('music: dozing bench slot is outside the audience arc');
  return { row, seat };
}

function placeRow(k: Kit, row: Row, ri: number): void {
  for (const side of [-1, 1]) {
    for (let slot = 0; ; slot++) {
      const seat = seatAt(row, side, slot);
      if (!seat) break;
      if (ri === DOZE.row && side === DOZE.side && slot === DOZE.slot) continue;
      k.prop(row.key, seat, { walkThrough: true });
      k.seated(row.key, seat, { place: false, clips: SIT, fill: 0.86, age: k.rng.chance(0.14) ? 'child' : k.rng.chance(0.15) ? 'elder' : 'adult' });
    }
  }
}

function flanks(k: Kit): void {
  const clips = ['cheer.clap', 'sway.hands-up', 'sway.wave', 'stand', 'groove.hip-clap', 'idle.watch'] as const;
  for (const side of [-1, 1]) {
    for (let i = 0; i < 9; i++) {
      const a = side * (1.08 + (i % 3) * 0.1 + k.rng.range(-0.02, 0.02));
      const r = 7.4 + Math.floor(i / 3) * 0.95;
      const x = BAND.x + Math.sin(a) * r;
      const z = BAND.z + Math.cos(a) * r;
      k.person({ x, z, heading: facing(x, z, BAND.x, BAND.z), clip: k.rng.pick(clips), age: k.rng.chance(0.2) ? 'child' : 'adult' });
    }
  }
  for (let i = 0; i < 6; i++) {
    const a = -0.32 - i * 0.09;
    const x = BAND.x + Math.sin(a) * 5.9;
    const z = BAND.z + Math.cos(a) * 5.9;
    k.person({ x, z, heading: facing(x, z, BAND.x, BAND.z), clip: 'sit.ground', age: 'child' });
  }
}

export function audience(k: Kit): void {
  ROWS.forEach((row, ri) => placeRow(k, row, ri));
  flanks(k);
}

export function dozingListener(k: Kit): void {
  k.vignette(
    {
      id: 'dozing-listener',
      title: 'Asleep in the third row',
      story: 'Halfway through the overture a gentleman has nodded off on his bench; his wife elbows him and the boy beside them giggles behind a programme.',
    },
    () => {
      const { row, seat } = dozeSeat();
      k.prop(row.key, seat, { walkThrough: true });
      const clips = ['sit.asleep', 'sit.talk', 'sit.read'] as const;
      (propDef(row.key).seats ?? []).forEach((st, i) => {
        const p = k.rel(seat, st.x, st.z, st.heading);
        k.person({ ...p, y: st.y - 0.47, clip: clips[i % clips.length], age: i === 2 ? 'child' : i === 0 ? 'elder' : 'adult' });
      });
    },
  );
}
