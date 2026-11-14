/**
 * House roofs in house space: picks the canonical frame (ridge along x or z), builds the shell,
 * then seats chimneys (with pots), dormers on the street-facing slope and gable-end oculi.
 */
import { type Col, type Geo, merge, rotateY, translate } from '../../core/geo';
import type { Rng } from '../../core/rng';
import { HALF_PI, bx, fit, slots } from './kit';
import { type Canon, type Shell, gableShell, hipShell, mansardShell, shedShell, triPrism } from './roofShapes';
import { chimney, chimneyCol } from './chimney';
import { flatRoof } from './roofFlat';
import type { RoofKind, TerraceInfo } from './types';
import { windowUnit } from './windows';

export interface RoofSpec {
  readonly kind: RoofKind;
  readonly w: number;
  readonly d: number;
  readonly H: number;
  readonly floorH: number;
  readonly ridge: 'x' | 'z';
  readonly col: Col;
  readonly wall: Col;
  readonly trim: Col;
  readonly party: { readonly front: boolean; readonly back: boolean; readonly left: boolean; readonly right: boolean };
  /** gable-end oculus allowed per side (not blank / party) */
  readonly open: { readonly front: boolean; readonly back: boolean; readonly left: boolean; readonly right: boolean };
  readonly dormers: number;
  readonly chimneys: number;
  readonly terrace: boolean;
  readonly terraceGarden: boolean;
}

export interface RoofResult {
  readonly geo: Geo;
  readonly topY: number;
  readonly terrace?: TerraceInfo;
}

function rotated(spec: RoofSpec): boolean {
  if (spec.kind === 'mansard' || spec.kind === 'flat') return false;
  if (spec.kind === 'hip') return false;
  return spec.ridge === 'z';
}

function canonOf(spec: RoofSpec, rot: boolean): Canon {
  const endL = rot ? spec.party.front : spec.party.left;
  const endR = rot ? spec.party.back : spec.party.right;
  const slopeF = rot ? spec.party.right : spec.party.front;
  const slopeB = rot ? spec.party.left : spec.party.back;
  return {
    L: rot ? spec.d : spec.w,
    D: rot ? spec.w : spec.d,
    H: spec.H,
    col: spec.col,
    wall: spec.wall,
    ohL: endL ? 0 : 0.3,
    ohR: endR ? 0 : 0.3,
    ohF: slopeF ? 0 : 0.35,
    ohB: slopeB ? 0 : 0.35,
    floorH: spec.floorH,
  };
}

function shellOf(spec: RoofSpec, c: Canon, rot: boolean): Shell {
  switch (spec.kind) {
    case 'gable':
      return gableShell(c);
    case 'shed':
      return shedShell(c);
    case 'hip':
      return hipShell(c);
    default:
      return mansardShell(c, rot ? spec.party.front : spec.party.left, rot ? spec.party.back : spec.party.right);
  }
}

function chimneysOf(spec: RoofSpec, c: Canon, shell: Shell, rng: Rng): { geo: Geo[]; top: number } {
  const geo: Geo[] = [];
  let top = shell.top;
  const sides = rng.shuffle([-1, 1]);
  for (let i = 0; i < spec.chimneys; i++) {
    const s = sides[i % 2] ?? 1;
    const x = s * (c.L / 2 - 0.6) * rng.range(0.55, 1);
    const z = rng.range(-0.25, 0.25) * (c.D / 2);
    const t = shell.surface(x, z) + rng.range(0.6, 1.0);
    top = Math.max(top, t + 0.4);
    geo.push(chimney(x, z, spec.H - 0.3, t, chimneyCol(spec.wall), rng));
  }
  return { geo, top };
}

function dormer(u: number, zf: number, yb: number, run: number, spec: RoofSpec, rng: Rng): Geo {
  const dw = 1.15;
  const dh = 1.45;
  const depth = run + 0.4;
  const body = bx(dw, dh, depth, spec.wall, u, yb, zf - depth / 2);
  const cap = fit(triPrism(spec.col), [dw + 0.24, 0.55, depth + 0.15], [u, yb + dh, zf - depth / 2 + 0.075]);
  const win = translate(windowUnit({ w: 0.62, h: 0.9, trim: spec.trim, style: 'square' }, rng), u, yb + 0.3, zf);
  return merge(body, cap, win);
}

function dormersOf(spec: RoofSpec, c: Canon, shell: Shell, rng: Rng, rot: boolean): Geo[] {
  if (rot || spec.dormers <= 0 || spec.kind === 'shed') return [];
  const us = slots(spec.dormers, c.L - 1.6);
  if (spec.kind === 'mansard') {
    const ms = shell as ReturnType<typeof mansardShell>;
    const zf = ms.Dp / 2 - ms.run * 0.25 + 0.05;
    return us.map((u) => dormer(u, zf, spec.H + 0.35, ms.run, spec, rng));
  }
  const zf = c.D / 2 - 0.9;
  const yb = shell.surface(0, zf) - 0.25;
  const run = 1.8 / Math.max(0.3, (shell.surface(0, 0) - shell.surface(0, c.D / 2)) / (c.D / 2));
  return us.map((u) => dormer(u, zf, yb, Math.min(run, c.D / 2), spec, rng));
}

function oculi(spec: RoofSpec, rng: Rng): Geo[] {
  if (spec.kind !== 'gable') return [];
  const ends: ReadonlyArray<readonly [boolean, number, number, number]> =
    spec.ridge === 'x'
      ? [
          [spec.open.left, -spec.w / 2, 0, -HALF_PI],
          [spec.open.right, spec.w / 2, 0, HALF_PI],
        ]
      : [
          [spec.open.front, 0, spec.d / 2, 0],
          [spec.open.back, 0, -spec.d / 2, Math.PI],
        ];
  const span = spec.ridge === 'x' ? spec.d : spec.w;
  if (span < 3.6) return [];
  const win = windowUnit({ style: 'round', w: 0.7, trim: spec.trim }, rng);
  return ends.filter(([ok]) => ok).map(([, x, z, ry]) => fit(win, [1, 1, 1], [x, spec.H + 0.35, z], 0, ry));
}

export function buildRoof(spec: RoofSpec, rng: Rng): RoofResult {
  if (spec.kind === 'flat') return flatRoof(spec, rng);
  const rot = rotated(spec);
  const c = canonOf(spec, rot);
  const shell = shellOf(spec, c, rot);
  const ch = chimneysOf(spec, c, shell, rng);
  const local = merge(shell.geo, ch.geo, dormersOf(spec, c, shell, rng, rot));
  const geo = merge(rot ? rotateY(local, HALF_PI) : local, oculi(spec, rng));
  return { geo, topY: ch.top };
}
