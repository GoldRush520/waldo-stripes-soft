/** The hedge maze in the north-east corner, with its lost visitor waving a flag above the hedges. */
import { type Geo, beam, box, detail, merge, tintable, translate } from '../../../core/geo';
import { hedgeRun } from '../../../props/nature';
import type { Kit } from '../../kit';
import { MAZE, type P2, blockLine } from './plan';

const H = 1.8;
const W = 0.7;
const ENTRANCE = { x: 32.5, half: 0.9 } as const;
const CENTRE = { x: 32.5, z: -18 } as const;

/** Wall polylines: three nested rings with staggered gaps plus one dead-end stub. */
const WALLS: readonly (readonly P2[])[] = [
  [
    [ENTRANCE.x - ENTRANCE.half, MAZE.z1],
    [MAZE.x0, MAZE.z1],
    [MAZE.x0, MAZE.z0],
    [MAZE.x1, MAZE.z0],
    [MAZE.x1, MAZE.z1],
    [ENTRANCE.x + ENTRANCE.half, MAZE.z1],
  ],
  [
    [28.5, -24.3],
    [27.7, -24.3],
    [27.7, -11.7],
    [37.3, -11.7],
    [37.3, -24.3],
    [30.3, -24.3],
  ],
  [
    [35.1, -17.2],
    [35.1, -13.9],
    [29.9, -13.9],
    [29.9, -22.1],
    [35.1, -22.1],
    [35.1, -19],
  ],
  [
    [MAZE.x0, -18],
    [27.7, -18],
  ],
  [
    [32.5, -24.3],
    [32.5, -22.1],
  ],
];

let mazeGeo: Geo | undefined;
let flagGeo: Geo | undefined;

function walls(): Geo {
  mazeGeo ??= merge(WALLS.map((pts) => hedgeRun(pts, H, W, 'flat')));
  return mazeGeo;
}

/** A coral-and-ivory flag on a 2.4 m cane, origin at the gripping hand. */
function flag(): Geo {
  flagGeo ??= merge(
    beam([0, -0.5, 0], [0, 2.3, 0], 0.035, 'timberDeep'),
    tintable(translate(box(0.62, 0.22, 0.03, 'coral'), 0.33, 2.02, 0)),
    translate(box(0.62, 0.2, 0.03, 'ivory'), 0.33, 1.82, 0),
    detail(translate(box(0.07, 0.07, 0.07, 'butter'), 0, 2.32, 0)),
  );
  return flagGeo;
}

function hedges(k: Kit): void {
  k.add(walls(), { x: 0, z: 0, tint: 'sageDeep' });
  for (const pts of WALLS) blockLine(k, pts, W);
  k.prop('statue.plinth', { x: CENTRE.x, z: CENTRE.z });
  k.prop('topiary.ballstack', { x: ENTRANCE.x - 1.7, z: MAZE.z1 + 0.6 });
  k.prop('topiary.ballstack', { x: ENTRANCE.x + 1.7, z: MAZE.z1 + 0.6 });
  k.prop('signpost.arrows', { x: ENTRANCE.x + 2.9, z: MAZE.z1 + 1.1, rot: -0.4 });
}

function lost(k: Kit): void {
  k.vignette({ id: 'lost-in-maze', title: 'Lost in the maze', story: 'Deep in a dead end of the hedge maze, a lost visitor waves a flag high above the hedges while the people at the entrance point and laugh, and a couple who reached the centre long ago wave back.' }, () => {
    const x = 26.6;
    const z = -16.4;
    const lostId = k.person({ x, z, heading: 0.3, clip: 'wave', look: { hat: 'hat.sun', hatTint: 'butter', shirt: 'blue', pattern: 0, glasses: 'face.glasses.round' } });
    k.searchable(lostId, 'the visitor lost in the maze');
    const m = k.swing([x + 0.2, 1.55, z + 0.1], 0, 0.8, 0.2, 0.32, 3);
    k.dynamic(flag(), m, { tint: 'coral' });
    k.person({ x: ENTRANCE.x - 0.5, z: MAZE.z1 + 1.2, heading: Math.PI + 0.5, clip: 'point.sky' });
    k.person({ x: ENTRANCE.x + 0.4, z: MAZE.z1 + 1.5, heading: Math.PI + 0.3, clip: 'talk.laugh' });
    k.person({ x: ENTRANCE.x + 1.1, z: MAZE.z1 + 2.2, heading: Math.PI - 0.2, clip: 'cheer.clap', age: 'child' });
    k.person({ x: CENTRE.x - 1.2, z: CENTRE.z + 2.2, heading: -0.9, clip: 'wave' });
    k.person({ x: CENTRE.x + 0.9, z: CENTRE.z + 2.4, heading: -0.6, clip: 'cheer' });
  });
  k.person({ x: 34.2, z: -25.4, heading: 0.2, clip: 'read.maplost', age: 'elder', look: { hat: 'hat.beret', hatTint: 'clay' } });
  k.person({ x: 36.2, z: -12.8, heading: -1.8, clip: 'lookout', age: 'child' });
  k.person({ x: 28.8, z: -20.5, heading: 3.0, clip: 'idle.watch' });
  k.person({ x: 38.4, z: -21, heading: Math.PI, clip: 'talk.shrug', hold: ['back.pack'] });
}

export function maze(k: Kit): void {
  hedges(k);
  lost(k);
}
