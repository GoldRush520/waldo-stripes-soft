/** Construction yard materials: timber, heaps, bricks, mixer, ladders, cones and barriers. */
import {
  type Geo,
  box,
  cone,
  detail,
  dome,
  farOnly,
  lathe,
  merge,
  profile,
  rotateX,
  rotateY,
  rotateZ,
  sphere,
  tintable,
  translate,
} from '../../core/geo';
import { createRng } from '../../core/rng';
import type { PropDef } from '../registry';
import { PI, at, lodPair, lyingX, prop, rod, stretch } from './kit';

export type TimberKind = 'planks' | 'logs' | 'beams';

function plankStack(seed: number): Geo {
  const rng = createRng(seed);
  const near: Geo[] = [];
  const far: Geo[] = [];
  for (let layer = 0; layer < 4; layer++) {
    const y = 0.1 + layer * 0.08;
    for (let i = 0; i < 5; i++) {
      const len = 2.4 + rng.range(-0.15, 0.15);
      near.push(at(box(len, 0.04, 0.18, i % 2 === 0 ? 'butterLight' : 'sand'), rng.range(-0.06, 0.06), y, -0.44 + i * 0.22));
    }
    near.push(at(box(0.08, 0.04, 1.1, 'timberDeep'), -0.9, y - 0.04, 0), at(box(0.08, 0.04, 1.1, 'timberDeep'), 0.9, y - 0.04, 0));
    far.push(at(box(2.4, 0.04, 1.08, 'butterLight'), 0, y, 0));
  }
  return merge(at(box(2.2, 0.06, 0.9, 'timberDeep'), 0, 0, 0), detail(merge(near)), farOnly(merge(far)));
}

function logStack(seed: number): Geo {
  const rng = createRng(seed);
  const r = 0.14;
  const near: Geo[] = [];
  const rows = [4, 3, 2, 1];
  rows.forEach((count, row) => {
    for (let i = 0; i < count; i++) {
      const x = (i - (count - 1) / 2) * r * 2.02;
      const y = r + row * r * 1.72;
      const len = 2.0 + rng.range(-0.2, 0.2);
      const log = merge(lyingX(r, len, 'timber', 7), lyingX(r * 0.8, len + 0.02, 'butterLight', 7));
      near.push(translate(rotateY(log, PI / 2), x, y, rng.range(-0.06, 0.06)));
    }
  });
  const w = 4 * r * 2.02;
  const top = r * 2 + 3 * r * 1.72;
  const far = profile([[-w / 2, 0], [w / 2, 0], [r, top], [-r, top]], 2.0, 'timber');
  return merge(detail(merge(near)), farOnly(far));
}

function beamStack(seed: number): Geo {
  const rng = createRng(seed);
  const near: Geo[] = [];
  for (let layer = 0; layer < 3; layer++) {
    const cross = layer % 2 === 1;
    for (let i = 0; i < 4; i++) {
      const len = 2.2 + rng.range(-0.1, 0.1);
      const b = box(cross ? 0.16 : len, 0.16, cross ? len : 0.16, 'timber');
      const off = -0.36 + i * 0.24;
      near.push(at(b, cross ? off : rng.range(-0.05, 0.05), layer * 0.16, cross ? rng.range(-0.05, 0.05) : off));
    }
  }
  const far = merge(box(2.2, 0.16, 0.88, 'timber'), at(box(0.88, 0.16, 2.2, 'timber'), 0, 0.16, 0), at(box(2.2, 0.16, 0.88, 'timber'), 0, 0.32, 0));
  return merge(detail(merge(near)), farOnly(far));
}

/** Seeded timber stack: planks on bearers, a pyramid of logs, or criss-crossed beams. */
export function timberStack(seed: number, kind: TimberKind = 'planks'): Geo {
  if (kind === 'logs') return logStack(seed);
  if (kind === 'beams') return beamStack(seed);
  return plankStack(seed);
}

function sawdustHeap(): Geo {
  const near = merge(stretch(dome(1, 'sand', 9, 4), 0.6, 0.28, 0.5), stretch(dome(1, 'butterLight', 6, 3), 0.25, 0.12, 0.2, 0.55, 0, 0.25));
  const chips = merge([0, 1, 2, 3].map((i) => at(box(0.08, 0.01, 0.03, 'timber'), -0.5 + i * 0.3, 0, 0.5 - (i % 2) * 0.2, i)));
  return merge(detail(near), detail(chips), farOnly(stretch(dome(1, 'sand', 5, 2), 0.6, 0.28, 0.5)));
}

function brickPallet(): Geo {
  const pallet = merge(box(1.0, 0.06, 1.0, 'timber'), at(box(1.0, 0.04, 1.0, 'timberDeep'), 0, 0.08, 0));
  const near: Geo[] = [
    at(box(0.1, 0.06, 1.0, 'timberDeep'), -0.4, 0.04, 0),
    at(box(0.1, 0.06, 1.0, 'timberDeep'), 0.4, 0.04, 0),
  ];
  for (let i = 0; i < 8; i++) {
    const w = i % 2 === 0 ? 0.96 : 0.92;
    near.push(at(box(w, 0.075, i % 2 === 0 ? 0.92 : 0.96, i % 3 === 0 ? 'coralDeep' : 'clayDeep'), 0, 0.12 + i * 0.08, 0));
  }
  const strap = merge(at(box(0.04, 0.68, 0.98, 'blue'), 0.2, 0.12, 0), at(box(0.04, 0.68, 0.98, 'blue'), -0.2, 0.12, 0));
  return merge(farOnly(box(1.0, 0.12, 1.0, 'timber')), detail(merge(pallet)), detail(merge(near)), detail(strap), farOnly(at(box(0.94, 0.64, 0.94, 'clayDeep'), 0, 0.12, 0)));
}

function sandHeap(): Geo {
  const heap = lathe([[0.9, 0], [0.75, 0.18], [0.45, 0.42], [0.15, 0.55], [0.0001, 0.57]], 'sand', 12);
  const heapFar = lathe([[0.9, 0], [0.4, 0.42], [0.0001, 0.57]], 'sand', 6);
  const shovel = merge(
    at(rotateZ(box(0.22, 0.28, 0.02, 'slate'), 0.3), 0.3, 0.35, 0.15),
    rod([0.25, 0.6, 0.15], [0.05, 1.3, 0.15], 0.035, 'timber'),
    rod([-0.03, 1.32, 0.15], [0.13, 1.28, 0.15], 0.03, 'timber'),
  );
  return merge(lodPair(heap, heapFar), detail(shovel));
}

function cementMixer(): Geo {
  const drumShape = lathe([[0.22, 0], [0.42, 0.22], [0.44, 0.42], [0.3, 0.68], [0.18, 0.8], [0.16, 0.84]], 'coral', 12);
  const drumFar = lathe([[0.22, 0], [0.44, 0.32], [0.16, 0.84]], 'coral', 6);
  const band = lathe([[0.46, 0.3], [0.46, 0.4]], 'ivory', 12);
  const tilt = (g: Geo): Geo => translate(rotateZ(g, -0.65), -0.15, 0.62, 0);
  const frame = merge(
    rod([-0.6, 0.35, 0], [0.6, 0.35, 0], 0.08, 'butterDeep'),
    rod([-0.2, 0.35, 0], [-0.1, 0.8, 0], 0.07, 'butterDeep'),
    rod([0.55, 0.35, 0], [0.75, 0, 0], 0.06, 'butterDeep'),
    rod([0.55, 0.65, -0.15], [0.9, 0.95, -0.15], 0.04, 'slate'),
    at(box(0.4, 0.3, 0.32, 'sage'), 0.35, 0.4, 0),
  );
  const wheel = rotateY(lyingX(0.2, 0.08, 'ink', 8), PI / 2);
  const wheels = detail(merge(at(wheel, -0.5, 0.2, -0.3), at(wheel, -0.5, 0.2, 0.3)));
  const farBase = farOnly(merge(at(box(1.2, 0.08, 0.1, 'butterDeep'), 0, 0.31, 0), at(box(0.08, 0.4, 0.68, 'ink'), -0.5, 0, 0), at(box(0.4, 0.3, 0.32, 'sage'), 0.35, 0.4, 0)));
  return merge(lodPair(tintable(tilt(drumShape)), tintable(tilt(drumFar))), detail(tilt(band)), frame, wheels, farBase);
}

/** Straight ladder standing in the x-y plane: two rails and `rungs` rungs 0.28 m apart. */
export function ladder(rungs: number): Geo {
  const n = Math.max(2, Math.round(rungs));
  const h = (n + 1) * 0.28;
  const rails = merge(at(box(0.06, h, 0.05, 'timber'), -0.22, 0, 0), at(box(0.06, h, 0.05, 'timber'), 0.22, 0, 0));
  const steps: Geo[] = [];
  for (let i = 1; i <= n; i++) steps.push(at(box(0.4, 0.035, 0.04, 'timberDeep'), 0, i * 0.28, 0));
  return merge(detail(rails), detail(merge(steps)), farOnly(box(0.5, h, 0.04, 'timber')));
}

/** Ladder leaning back (toward -z, onto a wall) at `angle` radians from vertical; foot stays at z = 0. */
export function leaningLadder(rungs: number, angle = 0.27): Geo {
  const lean = rotateX(translate(ladder(rungs), 0, 0, 0.025), -angle);
  const h = (Math.max(2, Math.round(rungs)) + 1) * 0.28;
  return translate(lean, 0, 0.0, (h * Math.sin(angle)) / 2);
}

/** A-frame step ladder with `rungs` treads, hinged at the top, feet spread ~0.7 m. */
export function stepLadder(rungs: number): Geo {
  const n = Math.max(2, Math.round(rungs));
  const len = (n + 1) * 0.28;
  const a = 0.26;
  const side = (s: number): Geo => {
    const steps: Geo[] = [];
    for (let i = 1; i <= n; i++) steps.push(at(box(0.44, 0.03, s > 0 ? 0.1 : 0.04, 'timberDeep'), 0, i * 0.28, 0));
    const rails = merge(at(box(0.05, len, 0.05, 'butterDeep'), -0.24, 0, 0), at(box(0.05, len, 0.05, 'butterDeep'), 0.24, 0, 0));
    const g = merge(detail(merge(rails, s > 0 ? merge(steps) : merge(steps.slice(0, 1)))), farOnly(box(0.52, len, 0.04, 'butterDeep')));
    return rotateX(g, s * a);
  };
  const top = len * Math.cos(a);
  const spread = len * Math.sin(a);
  const cap = detail(at(box(0.56, 0.06, 0.18, 'coral'), 0, top - 0.02, 0));
  const ties = detail(merge(rod([-0.22, 0.45, spread * 0.6], [-0.22, 0.45, -spread * 0.6], 0.015, 'ink'), rod([0.22, 0.45, spread * 0.6], [0.22, 0.45, -spread * 0.6], 0.015, 'ink')));
  return merge(translate(side(1), 0, 0, -spread / 2), translate(side(-1), 0, 0, spread / 2), cap, ties);
}

function trafficCone(): Geo {
  const near = merge(
    tintable(cone(0.15, 0.62, 'coral', 10)),
    at(lathe([[0.104, 0.22], [0.072, 0.36]], 'ivory', 10), 0, 0, 0),
    box(0.36, 0.03, 0.36, 'coralDeep'),
  );
  return lodPair(near, tintable(cone(0.16, 0.62, 'coral', 5)));
}

function stripedBarrier(): Geo {
  const board = (n: number): Geo => {
    const parts: Geo[] = [];
    const w = 1.6 / n;
    for (let i = 0; i < n; i++) {
      const p = at(box(w, 0.26, 0.04, i % 2 === 0 ? 'coral' : 'ivory'), -0.8 + w * (i + 0.5), 0.72, 0);
      parts.push(i % 2 === 0 ? tintable(p) : p);
    }
    return merge(parts);
  };
  const leg = (x: number): Geo => merge(rod([x - 0.05, 0, -0.3], [x, 1.0, 0], 0.05, 'slate'), rod([x + 0.05, 0, 0.3], [x, 1.0, 0], 0.05, 'slate'), detail(at(box(0.12, 0.05, 0.7, 'ink'), x, 0, 0)));
  const lamp = detail(merge(translate(sphere(0.07, 'butter', 6, 4), 0.6, 1.1, 0), rod([0.6, 0.98, 0], [0.6, 1.04, 0], 0.04, 'ink')));
  const legFar = farOnly(merge(at(box(0.06, 1.0, 0.6, 'slate'), -0.6, 0, 0), at(box(0.06, 1.0, 0.6, 'slate'), 0.6, 0, 0)));
  return merge(lodPair(board(8), board(3)), leg(-0.6), leg(0.6), lamp, legFar);
}

export const CRAFT_MATERIALS: readonly PropDef[] = [
  prop('craft.timberPlanks', [2.5, 1.1], { budget: 'stall', tags: ['construction', 'timber'] }, () => timberStack(11, 'planks')),
  prop('craft.timberLogs', [1.2, 2.2], { budget: 'stall', tags: ['construction', 'timber'] }, () => timberStack(12, 'logs')),
  prop('craft.timberBeams', [2.2, 2.2], { budget: 'stall', tags: ['construction', 'timber'] }, () => timberStack(13, 'beams')),
  prop('craft.sawdustHeap', [1.2, 1.0], { budget: 'clutter', tags: ['construction', 'heap'] }, sawdustHeap),
  prop('craft.brickPallet', [1.0, 1.0], { budget: 'furniture', tags: ['construction'] }, brickPallet),
  prop('craft.sandHeap', [1.8, 1.8], { budget: 'furniture', tags: ['construction', 'heap'] }, sandHeap),
  prop('craft.cementMixer', [1.4, 0.8], { budget: 'stall', tint: 'coral', tags: ['construction'] }, cementMixer),
  prop('craft.ladderLean5', [0.5, 0.5], { budget: 'clutter', tags: ['construction', 'ladder', 'against-wall'] }, () => leaningLadder(5)),
  prop('craft.ladderLean9', [0.5, 0.8], { budget: 'furniture', tags: ['construction', 'ladder', 'against-wall'] }, () => leaningLadder(9)),
  prop('craft.ladderLean13', [0.5, 1.1], { budget: 'furniture', tags: ['construction', 'ladder', 'against-wall'] }, () => leaningLadder(13)),
  prop('craft.stepLadder4', [0.55, 0.45], { budget: 'furniture', tint: 'coral', tags: ['construction', 'ladder'] }, () => stepLadder(4)),
  prop('craft.stepLadder6', [0.55, 0.6], { budget: 'furniture', tint: 'coral', tags: ['construction', 'ladder'] }, () => stepLadder(6)),
  prop('craft.trafficCone', [0.36, 0.36], { budget: 'clutter', tint: 'coral', tags: ['construction', 'clutter'] }, trafficCone),
  prop('craft.barrier', [1.6, 0.7], { budget: 'furniture', tint: 'coral', tags: ['construction'] }, stripedBarrier),
];
