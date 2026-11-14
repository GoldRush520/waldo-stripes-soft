/** PropDefs: trees (each ≤ 240 near / ≤ 90 far triangles). */
import type { Col } from '../../core/geo';
import type { PropDef } from '../registry';
import { type TreeKind, tree, treeFootprint } from './trees';

interface TreeSpec {
  readonly key: string;
  readonly kind: TreeKind;
  readonly h: number;
  readonly seed: number;
  readonly tint: Col;
  readonly tags?: readonly string[];
}

const SPECS: readonly TreeSpec[] = [
  { key: 'tree.round.s', kind: 'round', h: 4.5, seed: 11, tint: 'sage' },
  { key: 'tree.round.m', kind: 'round', h: 6.5, seed: 12, tint: 'sage' },
  { key: 'tree.round.l', kind: 'round', h: 9, seed: 13, tint: 'sage' },
  { key: 'tree.lollipop', kind: 'lollipop', h: 4, seed: 21, tint: 'sage', tags: ['street'] },
  { key: 'tree.cypress', kind: 'cypress', h: 7.5, seed: 31, tint: 'sageDeep' },
  { key: 'tree.pine.umbrella', kind: 'umbrellaPine', h: 7.5, seed: 41, tint: 'sage' },
  { key: 'tree.palm.short', kind: 'palm', h: 5.5, seed: 51, tint: 'sage', tags: ['seaside'] },
  { key: 'tree.palm.tall', kind: 'palm', h: 8.5, seed: 52, tint: 'sage', tags: ['seaside'] },
  { key: 'tree.willow', kind: 'willow', h: 7, seed: 61, tint: 'sageLight', tags: ['waterside'] },
  { key: 'tree.blossom', kind: 'blossom', h: 5.5, seed: 71, tint: 'coralLight', tags: ['blossom'] },
  { key: 'tree.blossom.ivory', kind: 'blossom', h: 5, seed: 72, tint: 'ivory', tags: ['blossom'] },
  { key: 'tree.blossom.butter', kind: 'blossom', h: 5.2, seed: 73, tint: 'butterLight', tags: ['blossom'] },
  { key: 'tree.fruit.orange', kind: 'orange', h: 3.6, seed: 81, tint: 'sage', tags: ['orchard'] },
  { key: 'tree.fruit.lemon', kind: 'lemon', h: 3.4, seed: 82, tint: 'sage', tags: ['orchard'] },
  { key: 'tree.birch', kind: 'birch', h: 6.5, seed: 91, tint: 'sageLight' },
  { key: 'tree.cube', kind: 'cube', h: 3.8, seed: 101, tint: 'sage', tags: ['street', 'clipped'] },
  { key: 'tree.espalier', kind: 'espalier', h: 2.2, seed: 111, tint: 'sage', tags: ['wall'] },
  { key: 'tree.bare', kind: 'bare', h: 5, seed: 121, tint: 'sage', tags: ['sculptural'] },
  { key: 'tree.potted.orange', kind: 'pottedOrange', h: 1.7, seed: 131, tint: 'sage', tags: ['potted', 'terrace'] },
  { key: 'tree.potted.lemon', kind: 'pottedLemon', h: 1.6, seed: 132, tint: 'sage', tags: ['potted', 'terrace'] },
  { key: 'tree.potted.olive', kind: 'pottedOlive', h: 1.8, seed: 141, tint: 'sageLight', tags: ['potted', 'terrace'] },
  { key: 'tree.potted.bay', kind: 'bayBall', h: 1.5, seed: 151, tint: 'sage', tags: ['potted', 'terrace', 'clipped'] },
];

export const TREE_PROPS: readonly PropDef[] = SPECS.map((s) => ({
  key: s.key,
  build: () => tree({ kind: s.kind, h: s.h, seed: s.seed }),
  footprint: treeFootprint(s.kind, s.h),
  defaultTint: s.tint,
  tags: ['nature', 'tree', ...(s.tags ?? [])],
}));
