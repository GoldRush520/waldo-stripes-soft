/** Gardens ground: a paved street margin, sage lawns, gravel walks and planted panels. */
import type { Kit } from '../../kit';
import { BALLOON, GAZEBO, KITCHEN, MAZE, MEADOW, POND, PROMENADE, TOPIARY, ellipse, rect } from './plan';
import type { P2 } from './plan';

const OUTER: readonly P2[] = [
  [-48, -30],
  [43, -30],
  [43, 32],
  [-34, 32],
  [-34, 10],
  [-48, 10],
];

const LAWN: readonly P2[] = [
  [-45.5, -27.5],
  [40.5, -27.5],
  [40.5, 29.5],
  [-31.5, 29.5],
  [-31.5, 7.5],
  [-45.5, 7.5],
];

/** A straight walk of a given width between two points (as a quad). */
function walk(a: P2, b: P2, w: number): P2[] {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const len = Math.hypot(dx, dz) || 1;
  const nx = (-dz / len) * (w / 2);
  const nz = (dx / len) * (w / 2);
  return [
    [a[0] + nx, a[1] + nz],
    [b[0] + nx, b[1] + nz],
    [b[0] - nx, b[1] - nz],
    [a[0] - nx, a[1] - nz],
  ];
}

function paths(k: Kit): void {
  const y = 0.07;
  const t = 0.02;
  k.ground(rect(PROMENADE.x0 - 0.5, PROMENADE.z - PROMENADE.half, PROMENADE.x1 + 0.5, PROMENADE.z + PROMENADE.half), 'ivory', y, t);
  k.ground(rect(-1.6, PROMENADE.z + PROMENADE.half, 1.6, POND.z - POND.rz - 2), 'ivory', y, t);
  k.ground(rect(-1.3, POND.z + POND.rz + 2, 1.3, 29.5), 'ivory', y, t);
  k.ground(walk([-6, 12], [GAZEBO.x + 2.5, GAZEBO.z - 1.5], 2), 'ivory', y, t);
  k.ground(walk([6, 12], [BALLOON.x - 3, BALLOON.z - 1], 2), 'ivory', y, t);
  k.ground(rect(MEADOW.x1 + 0.5, PROMENADE.z + PROMENADE.half, MEADOW.x1 + 2.3, 7.4), 'ivory', y, t);
  k.ground(rect(KITCHEN.x0, KITCHEN.z1 + 0.2, -24.4, KITCHEN.z1 + 1.8), 'ivory', y, t);
  k.ground(rect(-24.4, KITCHEN.z0, -22.6, PROMENADE.z - PROMENADE.half), 'ivory', y, t);
  k.ground(rect(31.6, MAZE.z1, 33.4, PROMENADE.z - PROMENADE.half), 'ivory', y, t);
}

function panels(k: Kit): void {
  const y = 0.05;
  const t = 0.02;
  k.ground(ellipse(POND.x, POND.z, POND.rx + 2.4, POND.rz + 2.4, 28), 'butterLight', y, t);
  k.ground(rect(MAZE.x0 - 0.4, MAZE.z0 - 0.4, MAZE.x1 + 0.4, MAZE.z1 + 0.4), 'butterLight', y, t);
  k.ground(rect(TOPIARY.x0, TOPIARY.z0, TOPIARY.x1, TOPIARY.z1), 'sage', y, t);
  k.ground(rect(MEADOW.x0, MEADOW.z0, MEADOW.x1, MEADOW.z1), 'sage', y, t);
  k.ground(ellipse(GAZEBO.x, GAZEBO.z, 4.6, 4.2, 20), 'butterLight', y, t);
  k.ground(ellipse(BALLOON.x, BALLOON.z, 4.2, 3.6, 20), 'butterLight', y, t);
  for (const [x0, z0, x1, z1] of [
    [-44.5, -26.8, -37.5, -20.6],
    [-36.5, -26.8, -24.8, -14],
  ] as const) {
    k.ground(rect(x0, z0, x1, z1), 'sageDeep', y, t);
  }
  /* picnic lawn panels in a slightly deeper sage so the blankets read */
  k.ground(rect(-29, 23.6, -9, 28.8), 'sage', y, t);
  k.ground(rect(9, 14.5, 27, 28.8), 'sage', y, t);
}

export function groundworks(k: Kit): void {
  k.ground(OUTER, 'clayLight');
  k.ground(LAWN, 'sageLight', 0.03, 0.02);
  paths(k);
  panels(k);
}
