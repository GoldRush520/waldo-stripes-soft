/**
 * Café terraces: tables with bistro chairs and seated diners (hips on the chair seats via
 * `k.seated`), laid table-tops at y = 0.75, parasols and waiters. Chairs are walk-through so the
 * seated diners never count as standing inside a solid footprint; the table itself is solid.
 */
import type { Col } from '../../../core/geo';
import type { Rng } from '../../../core/rng';
import { TABLE_TOP_Y } from '../../../props/street/cafe-furniture';
import type { Hold, Kit } from '../../kit';
import { clip, opts } from './catalog';

export const TOPS = ['tabletop.coffee2', 'tabletop.tea', 'tabletop.breakfast', 'tabletop.wine', 'tabletop.tea', 'tabletop.coffee2'] as const;
const CHAIR_TINTS: readonly Col[] = ['coral', 'blue', 'sage', 'butter'];
const PARASOL_TINTS: readonly Col[] = ['coral', 'blue', 'butter', 'sage'];

export function dinerClips(): string[] {
  return [clip('sit.eat', 'sit'), clip('sit.talk', 'sit'), clip('sit.talk', 'sit'), clip('sit.crossed', 'sit'), 'sit'];
}

export interface TableOpts {
  readonly chairs?: number;
  /** table-top set key, or null for a bare table */
  readonly top?: string | null;
  readonly fill?: number;
  readonly square?: boolean;
  readonly clips?: readonly string[];
  readonly chairTint?: Col;
  /** start angle of the first chair (radians, local) */
  readonly turn?: number;
  readonly y?: number;
  readonly hold?: (rng: Rng) => readonly Hold[] | undefined;
}

/** One café table with chairs round it; returns the seated diners' ids. */
export function table(k: Kit, x: number, z: number, o: TableOpts = {}): number[] {
  const y = o.y ?? 0;
  const n = o.chairs ?? 2;
  const turn = o.turn ?? 0;
  const tint = o.chairTint ?? k.rng.pick(CHAIR_TINTS);
  k.prop(o.square ? 'cafe.table.square' : 'cafe.table.round', { x, z, y, rot: turn });
  const top = o.top === undefined ? k.rng.pick(TOPS) : o.top;
  if (top) k.prop(top, { x, z, y: y + TABLE_TOP_Y, rot: turn + k.rng.range(-0.3, 0.3) });
  const ids: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = turn + (i / n) * Math.PI * 2;
    const at = { x: x + Math.sin(a) * 0.64, z: z + Math.cos(a) * 0.64, y, rot: a + Math.PI, tint };
    k.prop('cafe.chair.bistro', at, { walkThrough: true });
    ids.push(...k.seated('cafe.chair.bistro', at, { place: false, fill: o.fill ?? 0.82, clips: o.clips ?? dinerClips(), hold: o.hold }));
  }
  return ids;
}

/** Parasol standing between chairs (offset from the table centre so it never spears a table-top). */
export function parasolBy(k: Kit, x: number, z: number, turn = 0, tint?: Col): void {
  const a = turn + Math.PI / 4;
  k.prop('parasol.open', { x: x + Math.sin(a) * 0.82, z: z + Math.cos(a) * 0.82, tint: tint ?? k.rng.pick(PARASOL_TINTS) });
}

/**
 * A terrace of tables in loose staggered rows inside a local rectangle (centre, size, rotation).
 * `parasols` is the share of tables that get a parasol.
 */
export function terrace(
  k: Kit,
  c: { x: number; z: number; rot?: number },
  cols: number,
  rows: number,
  o: { gap?: readonly [number, number]; parasols?: number; chairs?: readonly number[]; fill?: number; skip?: (i: number, j: number) => boolean } = {},
): number[] {
  const [gx, gz] = o.gap ?? [2.3, 2.3];
  const ids: number[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      if (o.skip?.(i, j)) continue;
      const lx = (i - (cols - 1) / 2) * gx + (j % 2 ? gx * 0.22 : 0) + k.rng.range(-0.15, 0.15);
      const lz = (j - (rows - 1) / 2) * gz + k.rng.range(-0.12, 0.12);
      const p = k.rel({ x: c.x, z: c.z, rot: c.rot }, lx, lz);
      const chairs = k.rng.pick(o.chairs ?? [2, 2, 3, 4]);
      const turn = (c.rot ?? 0) + (chairs === 4 ? Math.PI / 4 : chairs === 2 ? Math.PI / 2 : 0) + k.rng.range(-0.25, 0.25);
      ids.push(...table(k, p.x, p.z, { chairs, turn, square: k.rng.chance(0.25), fill: o.fill }));
      if (k.rng.chance(o.parasols ?? 0.5)) parasolBy(k, p.x, p.z, turn + Math.PI / (chairs * 2) - Math.PI / 4);
    }
  }
  return ids;
}

/** Standing waiter (apron, white shirt) doing table service. */
export function waiter(k: Kit, x: number, z: number, face: readonly [number, number], kind: 'order' | 'pour' | 'tray' | 'wipe' = 'order'): number {
  const ids: Record<typeof kind, string> = {
    order: clip('serve.order', 'talk'),
    pour: clip('serve.pour', 'talk'),
    tray: clip('serve.tray', 'stand'),
    wipe: clip('serve.wipe', 'point'),
  };
  return k.person({
    x,
    z,
    face,
    clip: ids[kind],
    hold: opts('upper.apron'),
    look: { shirt: 'ivory', pattern: 0, pants: 'ink', longLegs: true, hat: null, glasses: null },
  });
}

/** Waiters weaving between tables on a small loop, trays held high. */
export function weavingWaiters(k: Kit, loop: ReadonlyArray<readonly [number, number, number]>, count: number): number[] {
  const route = k.loop(loop);
  return k.walkers(route, count, {
    clip: clip('carry.trayup', 'walk.brisk', 'walk'),
    speed: [0.7, 0.95],
    childShare: 0,
    hold: () => opts('upper.apron'),
  });
}
