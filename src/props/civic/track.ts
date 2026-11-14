/**
 * Tram track segments (metre gauge): paving band, rails and sleepers. Rails and sleepers are
 * near-only detail; the far tier keeps the paving band plus flat rail stripes.
 */
import { type Col, type Geo, beam, box, merge, prism, quad, rotateY, translate } from '../../core/geo';
import { type P2, boxAt, lod, range, steps } from './util';

export interface TrackOpts {
  readonly gauge?: number;
  /** paving band colour */
  readonly bed?: Col;
  readonly rail?: Col;
}

export interface CurveResult {
  readonly geo: Geo;
  /** end point [x, z] in prop space (start is the origin, heading +x) */
  readonly end: P2;
  /** heading at the end (0 faces +z; start heading is PI/2) */
  readonly heading: number;
}

const RAIL_Y = 0.02;

/** Straight track along x, centred on the origin. */
export function tramTrack(length: number, opts: TrackOpts = {}): Geo {
  const g = opts.gauge ?? 1.0;
  const rail = opts.rail ?? 'slate';
  const n = Math.max(2, Math.round(length / 0.6));
  const always = [boxAt(length, RAIL_Y, g + 0.9, opts.bed ?? 'clayLight', 0, 0, 0)];
  const near = [
    ...[-g / 2, g / 2].map((z) => boxAt(length, 0.045, 0.06, rail, 0, RAIL_Y, z)),
    ...range(n).map((i) => boxAt(0.18, 0.02, g + 0.45, 'timberDeep', -length / 2 + ((i + 0.5) * length) / n, RAIL_Y, 0)),
  ];
  const far = [-g / 2, g / 2].map((z) => translate(quad(length, 0.08, rail), 0, RAIL_Y + 0.02, z));
  return merge(always, lod(near, far));
}

function arcPoints(R: number, angle: number, n: number): P2[] {
  return steps(0, angle, n).map((t): P2 => [R * Math.sin(t), -R + R * Math.cos(t)]);
}

/**
 * Curved track starting at the origin heading +x and turning toward -z (left) around a centre at
 * (0, 0, -radius). `angle` in radians.
 */
export function tramCurve(radius: number, angle: number, opts: TrackOpts = {}): CurveResult {
  const g = opts.gauge ?? 1.0;
  const rail = opts.rail ?? 'slate';
  const n = Math.max(3, Math.ceil((radius * angle) / 1.2));
  const outer = arcPoints(radius + g / 2 + 0.45, angle, n);
  const inner = arcPoints(radius - g / 2 - 0.45, angle, n).reverse();
  const bed = prism([...outer, ...inner], RAIL_Y, opts.bed ?? 'clayLight');
  const railLine = (r: number): Geo[] => {
    const pts = arcPoints(r, angle, n);
    return range(n).map((i) => {
      const a = pts[i] ?? [0, 0];
      const b = pts[i + 1] ?? a;
      return beam([a[0], RAIL_Y + 0.025, a[1]], [b[0], RAIL_Y + 0.025, b[1]], 0.055, rail);
    });
  };
  const sleepers = range(Math.max(2, Math.round((radius * angle) / 0.6))).map((i, _, all) => {
    const t = ((i + 0.5) / all.length) * angle;
    return translate(rotateY(box(0.18, 0.02, g + 0.45, 'timberDeep'), t), radius * Math.sin(t), RAIL_Y, -radius + radius * Math.cos(t));
  });
  const far = [radius - g / 2, radius + g / 2].map((r) => {
    const o = arcPoints(r + 0.04, angle, Math.max(2, Math.ceil(n / 2)));
    const i = arcPoints(r - 0.04, angle, Math.max(2, Math.ceil(n / 2))).reverse();
    return translate(prism([...o, ...i], 0.01, rail), 0, RAIL_Y + 0.02, 0);
  });
  const geo = merge(bed, lod([...railLine(radius - g / 2), ...railLine(radius + g / 2), ...sleepers], far));
  return {
    geo,
    end: [radius * Math.sin(angle), -radius + radius * Math.cos(angle)],
    heading: Math.PI / 2 + angle,
  };
}
