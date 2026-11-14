/**
 * The hill itself: ground paving, the three stacked terrace platforms with stone retaining-wall
 * facings, railings along every terrace edge and the six flights of stairs that join the levels.
 */
import type { Geo } from '../../../core/geo';
import { balustrade, ironRailing, retainingWall, stairs } from '../../../props/civic';
import type { Kit } from '../../kit';
import {
  BELVEDERE,
  FLIGHTS,
  FLIGHT_RISE,
  FRONT_Z,
  type FlightSpec,
  LEVEL_Y,
  PIAZZA,
  type P2,
  SPAN_X,
  flightLength,
  laneZ,
  rowZ,
  ROW_DEPTH,
  terracePolygon,
} from './plan';

/** Split [x0, x1] into runs that avoid the openings. */
export function runs(x0: number, x1: number, openings: readonly P2[]): P2[] {
  const sorted = [...openings].sort((a, b) => a[0] - b[0]);
  const out: P2[] = [];
  let x = x0;
  for (const [a, b] of sorted) {
    if (b <= x || a >= x1) continue;
    if (a - x > 0.4) out.push([x, a]);
    x = Math.max(x, b);
  }
  if (x1 - x > 0.4) out.push([x, x1]);
  return out;
}

const cache = new Map<string, Geo>();
function cached(key: string, make: () => Geo): Geo {
  let g = cache.get(key);
  if (!g) {
    g = make();
    cache.set(key, g);
  }
  return g;
}

/** x-range a flight occupies at its lower level (with cheek walls). */
function flightOpening(f: FlightSpec): P2 {
  const half = f.rot === 0 ? f.w / 2 + 0.3 : flightLength(f) / 2 + 0.1;
  return [f.x - half, f.x + half];
}

/** x-range where people step off a flight onto the upper level. */
function topOpening(f: FlightSpec): P2 {
  if (f.rot === 0) return [f.x - f.w / 2 - 0.1, f.x + f.w / 2 + 0.1];
  const xTop = f.x - flightLength(f) / 2;
  return [xTop - 0.9, xTop + 1.1];
}

function paving(k: Kit): void {
  const f1 = FRONT_Z[1];
  k.ground([[-41, f1], [42, f1], [42, 22], [-41, 22]], 'clayLight');
  k.ground([[-39, 15.8], [40, 15.8], [40, 17.6], [-39, 17.6]], 'ivory', 0.03, 0.02);
  const ring: [number, number][] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    ring.push([PIAZZA.x + Math.cos(a) * PIAZZA.r, PIAZZA.z + Math.sin(a) * PIAZZA.r * 0.8]);
  }
  k.ground(ring, 'butterLight', 0.05, 0.02);
}

function platforms(k: Kit): void {
  ([1, 2, 3] as const).forEach((level) => {
    const y0 = LEVEL_Y[level - 1];
    const y1 = LEVEL_Y[level];
    k.platform(terracePolygon(level), y0, y1, level === 2 ? 'clayLight' : 'clay', 'ground');
    const [x0, x1] = SPAN_X[level] ?? [0, 0];
    const front = rowZ(level) + ROW_DEPTH[level] / 2;
    const lz = laneZ(level);
    k.ground([[x0 + 0.3, front], [x1 - 0.3, front], [x1 - 0.3, FRONT_Z[level] - 0.5], [x0 + 0.3, FRONT_Z[level] - 0.5]], level === 2 ? 'butterLight' : 'ivoryShade', y1);
    k.ground([[x0 + 0.6, lz - 0.6], [x1 - 0.6, lz - 0.6], [x1 - 0.6, lz + 0.6], [x0 + 0.6, lz + 0.6]], 'ivory', y1 + 0.03, 0.02);
  });
}

function wallRun(k: Kit, a: number, b: number, z: number, y: number, h: number, rot = 0): void {
  const len = b - a;
  const geo = cached(`wall:${len.toFixed(2)}:${h}`, () => retainingWall(len, h));
  if (rot === 0) k.add(geo, { x: (a + b) / 2, z: z - 0.2, y });
  else k.add(geo, { x: z + (rot > 0 ? -0.2 : 0.2), z: (a + b) / 2, y, rot });
}

function walls(k: Kit): void {
  const lower = (level: 1 | 2 | 3): FlightSpec[] => FLIGHTS.filter((f) => f.from === level - 1 && f.rot === 0);
  ([1, 2, 3] as const).forEach((level) => {
    const [x0, x1] = SPAN_X[level] ?? [0, 0];
    const y = LEVEL_Y[level - 1];
    const openings: P2[] = lower(level).map(flightOpening);
    if (level === 1) openings.push([BELVEDERE.x0, BELVEDERE.x1]);
    for (const [a, b] of runs(x0, x1, openings)) wallRun(k, a, b, FRONT_Z[level], y, FLIGHT_RISE);
  });
  wallRun(k, BELVEDERE.x0, BELVEDERE.x1, BELVEDERE.z, 0, FLIGHT_RISE);
  wallRun(k, FRONT_Z[1], BELVEDERE.z, BELVEDERE.x0, 0, FLIGHT_RISE, -Math.PI / 2);
  wallRun(k, FRONT_Z[1], BELVEDERE.z, BELVEDERE.x1, 0, FLIGHT_RISE, Math.PI / 2);
}

function railRun(k: Kit, a: number, b: number, z: number, y: number, stone: boolean, rot = 0): void {
  const len = b - a;
  const geo = cached(`rail:${stone}:${len.toFixed(2)}`, () => (stone ? balustrade(len) : ironRailing(len, { color: 'blueDeep' })));
  const at = rot === 0 ? { x: (a + b) / 2, z: z - 0.2, y } : { x: z + (rot > 0 ? -0.2 : 0.2), z: (a + b) / 2, y, rot };
  k.add(geo, at);
  if (rot === 0) k.block(at.x, at.z, len, 0.4);
  else k.block(at.x, at.z, 0.4, len);
}

function railings(k: Kit): void {
  ([1, 2, 3] as const).forEach((level) => {
    const [x0, x1] = SPAN_X[level] ?? [0, 0];
    const y = LEVEL_Y[level] + 0.16;
    const openings: P2[] = FLIGHTS.filter((f) => f.from === level - 1).map(topOpening);
    if (level === 1) openings.push([BELVEDERE.x0, BELVEDERE.x1]);
    for (const [a, b] of runs(x0 + 0.2, x1 - 0.2, openings)) railRun(k, a, b, FRONT_Z[level], y, level === 1);
  });
  const y = LEVEL_Y[1] + 0.16;
  railRun(k, BELVEDERE.x0, BELVEDERE.x1, BELVEDERE.z, y, true);
  railRun(k, FRONT_Z[1] + 0.3, BELVEDERE.z - 0.2, BELVEDERE.x0, y, true, -Math.PI / 2);
  railRun(k, FRONT_Z[1] + 0.3, BELVEDERE.z - 0.2, BELVEDERE.x1, y, true, Math.PI / 2);
}

/** Lower and upper end points of a flight in local [x, y, z] (centre line). */
export function flightEnds(f: FlightSpec): { bottom: [number, number, number]; top: [number, number, number] } {
  const y0 = LEVEL_Y[f.from];
  const half = flightLength(f) / 2;
  if (f.rot === 0) return { bottom: [f.x, y0, f.z + half], top: [f.x, y0 + FLIGHT_RISE, f.z - half] };
  return { bottom: [f.x + half, y0, f.z], top: [f.x - half, y0 + FLIGHT_RISE, f.z] };
}

function flights(k: Kit): void {
  for (const f of FLIGHTS) {
    const geo = cached(`stairs:${f.w}:${f.steps}:${f.run}`, () =>
      stairs(f.w, FLIGHT_RISE, f.steps, { run: f.run, color: 'stone', cheek: f.from === 0 ? 'clayDeep' : 'clay' }).geo,
    );
    const y0 = LEVEL_Y[f.from];
    k.add(geo, { x: f.x, z: f.z, y: y0, rot: f.rot });
    const len = flightLength(f);
    const [w, d] = f.rot === 0 ? [f.w + 0.5, len] : [len, f.w + 0.5];
    k.block(f.x, f.z, w, d);
    k.surface('stairs', [[f.x - w / 2, f.z - d / 2], [f.x + w / 2, f.z - d / 2], [f.x + w / 2, f.z + d / 2], [f.x - w / 2, f.z + d / 2]], y0 + FLIGHT_RISE / 2);
  }
}

export function buildHill(k: Kit): void {
  paving(k);
  platforms(k);
  walls(k);
  railings(k);
  flights(k);
}
