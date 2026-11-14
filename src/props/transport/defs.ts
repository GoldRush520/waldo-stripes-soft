/**
 * PropDef factory for the transport library: wraps a two-tier builder and encodes the metadata
 * the engine and tests rely on as tags.
 *
 * Tags written here:
 *  - family: `boat` | `harbour` | `wheeled` | `tram`
 *  - `lod:<class>` budget class (clutter 150/40, furniture 300/80, small 900/300, medium 1200/350,
 *    large 3000/900 full/far triangles)
 *  - `waterline` when y = 0 is the waterline (the prop floats and dips below y = 0)
 *  - `seat:hip` / `seat:feet` for each kind present, plus `seatKinds:<k,k,...>` giving the kind of
 *    every seat in index order (needed when a prop mixes riders and standing / pushing people)
 *  - `push` + `handle:x,y,z` for pushed / pulled things (handle grip centre in prop space)
 *  - `footprint:base` when the solid footprint is only the base of a tall overhanging prop
 *  - `pivot` for moving parts whose origin is their pivot
 */
import type { Col, Geo } from '../../core/geo';
import type { PropDef } from '../registry';
import { type Q, type V3, tiered } from './kit';

export type Family = 'boat' | 'harbour' | 'wheeled' | 'tram';
export type SizeClass = 'clutter' | 'furniture' | 'small' | 'medium' | 'large';
export type SeatKind = 'hip' | 'feet';

export interface Seat {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly heading: number;
  readonly kind: SeatKind;
}

export const BUDGETS: Readonly<Record<SizeClass, readonly [number, number]>> = {
  clutter: [150, 40],
  furniture: [300, 80],
  small: [900, 300],
  medium: [1200, 350],
  large: [3000, 900],
};

export interface TransportSpec {
  readonly key: string;
  readonly build: (q: Q) => Geo;
  readonly footprint: readonly [number, number];
  readonly family: Family;
  readonly size: SizeClass;
  readonly tint?: Col;
  readonly seats?: readonly Seat[];
  readonly handle?: V3;
  readonly waterline?: boolean;
  readonly baseFootprint?: boolean;
  readonly pivot?: boolean;
  readonly tags?: readonly string[];
}

const r3 = (v: number): string => String(Math.round(v * 1000) / 1000);

export function hip(x: number, y: number, z: number, heading = 0): Seat {
  return { x, y, z, heading, kind: 'hip' };
}

export function feet(x: number, y: number, z: number, heading = 0): Seat {
  return { x, y, z, heading, kind: 'feet' };
}

function seatTags(seats: readonly Seat[]): string[] {
  if (seats.length === 0) return [];
  const kinds = [...new Set(seats.map((s) => s.kind))].map((k) => `seat:${k}`);
  return [...kinds, `seatKinds:${seats.map((s) => s.kind).join(',')}`];
}

export function def(s: TransportSpec): PropDef {
  const seats = s.seats ?? [];
  const tags = [
    'transport',
    s.family,
    `lod:${s.size}`,
    ...(s.waterline ? ['waterline'] : []),
    ...seatTags(seats),
    ...(s.handle ? ['push', `handle:${s.handle.map(r3).join(',')}`] : []),
    ...(s.baseFootprint ? ['footprint:base'] : []),
    ...(s.pivot ? ['pivot'] : []),
    ...(s.tags ?? []),
  ];
  return {
    key: s.key,
    build: () => tiered(s.build),
    footprint: s.footprint,
    ...(s.tint ? { defaultTint: s.tint } : {}),
    tags,
    ...(seats.length > 0
      ? { seats: seats.map(({ x, y, z, heading }) => ({ x, y, z, heading })) }
      : {}),
  };
}

/** Seat kinds in index order, recovered from a PropDef's tags. */
export function seatKindsOf(p: PropDef): SeatKind[] {
  const tag = (p.tags ?? []).find((t) => t.startsWith('seatKinds:'));
  if (!tag) return [];
  return tag
    .slice('seatKinds:'.length)
    .split(',')
    .map((k) => (k === 'feet' ? 'feet' : 'hip'));
}
