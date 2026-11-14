/**
 * Master plan of the hillside (district-local metres, +z south toward the camera).
 *
 * The hill rises northward in three terraces stacked like a ziggurat: each `k.platform` runs from
 * its front retaining wall back to the north edge, and the upper ones are slightly narrower so the
 * east / west ends step down too. Houses stand at the back of each terrace with a lane in front;
 * stairs climb in alleys between the houses (or along the wall face) to the next level.
 */
export type P2 = readonly [number, number];

/** Floor heights of the ground strip and the three terraces. */
export const LEVEL_Y = [0, 3, 6, 9] as const;
export type Level = 0 | 1 | 2 | 3;

/** z of each terrace's front (south) retaining wall; index = level. */
export const FRONT_Z = [22, 10.5, -0.5, -11] as const;
export const BACK_Z = -21.6;

/** x extent of each level (terraces step in at the ends). */
export const SPAN_X: readonly P2[] = [
  [-38.5, 39.5],
  [-38.5, 39.5],
  [-36, 37],
  [-33.5, 34.5],
];

/** The belvedere: a bastion jutting from the first terrace over the ground piazza. */
export const BELVEDERE = { x0: -2, x1: 8, z: FRONT_Z[1] + 2.6 } as const;

export function terracePolygon(level: 1 | 2 | 3): P2[] {
  const [x0, x1] = SPAN_X[level] ?? [0, 0];
  const f = FRONT_Z[level];
  if (level === 1) {
    return [
      [x0, BACK_Z],
      [x1, BACK_Z],
      [x1, f],
      [BELVEDERE.x1, f],
      [BELVEDERE.x1, BELVEDERE.z],
      [BELVEDERE.x0, BELVEDERE.z],
      [BELVEDERE.x0, f],
      [x0, f],
    ];
  }
  return [
    [x0, BACK_Z],
    [x1, BACK_Z],
    [x1, f],
    [x0, f],
  ];
}

/** A flight of stairs. rot 0 climbs toward -z (top edge on the upper level's front wall). */
export interface FlightSpec {
  readonly id: string;
  /** lower level */
  readonly from: 0 | 1 | 2;
  /** centre of the flight */
  readonly x: number;
  readonly z: number;
  readonly rot: number;
  readonly w: number;
  readonly steps: number;
  readonly run: number;
}

const RISE = 3;
const flightLen = (steps: number, run: number): number => steps * run;

/** Straight flight whose top edge sits on the front wall of level `from + 1`. */
function straight(id: string, from: 0 | 1 | 2, x: number, w: number, steps = 10, run = 0.32): FlightSpec {
  const top = FRONT_Z[from + 1] ?? 0;
  return { id, from, x, z: top + flightLen(steps, run) / 2, rot: 0, w, steps, run };
}

/** Flight running along the wall face, climbing toward -x. */
function lateral(id: string, from: 0 | 1 | 2, xTop: number, w: number, steps = 11, run = 0.32): FlightSpec {
  const wall = FRONT_Z[from + 1] ?? 0;
  return { id, from, x: xTop + flightLen(steps, run) / 2, z: wall + w / 2 + 0.26, rot: Math.PI / 2, w, steps, run };
}

export const FLIGHTS: readonly FlightSpec[] = [
  straight('grand', 0, -12, 3.4, 10, 0.34),
  lateral('east', 0, 27.6, 1.6),
  straight('cat-alley', 1, -24, 1.6),
  straight('fig-alley', 1, 14, 1.8),
  straight('teapot-alley', 2, -6, 1.6),
  straight('kite-alley', 2, 24, 1.8),
];

export const FLIGHT_RISE = RISE;

export function flightLength(f: FlightSpec): number {
  return flightLen(f.steps, f.run);
}

/** Gaps in the house row of each terrace (alleys, breathing spaces, the water-tower slot). */
export const ROW_GAPS: Readonly<Record<1 | 2 | 3, readonly P2[]>> = {
  1: [
    [-25.5, -22.5],
    [-5.4, -3.8],
    [12.4, 15.6],
    [30, 31.8],
  ],
  2: [
    [-27.2, -25.2],
    [-7.5, -4.5],
    [22.4, 25.6],
  ],
  3: [
    [-16.8, -11.2],
    [9.4, 11.2],
  ],
};

/** House depth per terrace. */
export const ROW_DEPTH: Readonly<Record<1 | 2 | 3, number>> = { 1: 5.6, 2: 5.6, 3: 6.0 };

/** z of the house row centre on a terrace (backs 0.25 m off the next wall / the north edge). */
export function rowZ(level: 1 | 2 | 3): number {
  const back = level === 3 ? BACK_Z + 0.4 : (FRONT_Z[level + 1] ?? 0) + 0.25;
  return back + ROW_DEPTH[level] / 2;
}

/** Lane centre (z) in front of a terrace's houses. */
export function laneZ(level: 1 | 2 | 3): number {
  const front = rowZ(level) + ROW_DEPTH[level] / 2;
  return (front + FRONT_Z[level]) / 2;
}

/** Ground-level piazza at the foot of the grand stairs. */
export const PIAZZA = { x: -12, z: 17.2, r: 5.2 } as const;
