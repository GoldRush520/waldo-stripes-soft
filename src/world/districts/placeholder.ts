/**
 * Temporary stand-in for districts that have not been authored yet: a loose scatter of real kit
 * houses, trees, walkers and small groups so the overview and performance tests are meaningful.
 */
import { house } from '../../props/arch/house';
import { treeGeo } from './shared';
import type { Kit } from '../kit';
import { DISTRICTS, isLand, pointInPolygon } from '../layout';

const WALLS = ['ivory', 'ivoryShade', 'butterLight', 'blueLight', 'coralLight', 'sageLight', 'clayLight'] as const;
const ROOFS = ['clay', 'coral', 'butter', 'blue', 'sage', 'clayDeep'] as const;

export function buildPlaceholder(k: Kit): void {
  const d = k.district;
  if (d.id === 'canal') return;
  const rng = k.rng;
  const xs = d.polygon.map((p) => p[0]);
  const zs = d.polygon.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);
  const canal = DISTRICTS[0]?.polygon ?? [];
  const inside = (wx: number, wz: number): boolean =>
    pointInPolygon(wx, wz, d.polygon) && isLand(wx, wz) && !pointInPolygon(wx, wz, canal);
  const open = d.id === 'sports' || d.id === 'beach' || d.id === 'gardens' || d.id === 'harbor';
  const houses = Math.round(((maxX - minX) * (maxZ - minZ)) / (open ? 620 : 230));
  const placed: { x: number; z: number; r: number }[] = [];
  for (let i = 0; i < houses * 4 && placed.length < houses; i++) {
    const wx = rng.range(minX + 6, maxX - 6);
    const wz = rng.range(minZ + 6, maxZ - 6);
    if (!inside(wx, wz) || placed.some((p) => Math.hypot(p.x - wx, p.z - wz) < p.r + 7)) continue;
    const w = rng.range(6, 10);
    const dp = rng.range(6, 9);
    const h = house({
      w,
      d: dp,
      floors: rng.int(1, d.id === 'rooftops' || d.id === 'cafe' ? 4 : 3),
      wall: rng.pick(WALLS),
      roof: rng.pick(['gable', 'hip', 'gable', 'flat', 'mansard'] as const),
      roofColor: rng.pick(ROOFS),
      front: { shop: rng.chance(0.4), windowBoxes: true },
      tint: rng.pick(['coral', 'butter', 'blue', 'sage'] as const),
      seed: rng.int(1, 1e6),
    });
    const [lx, lz] = k.local(wx, wz);
    const rot = rng.pick([0, Math.PI / 2, -Math.PI / 2, Math.PI]) + rng.range(-0.06, 0.06);
    k.add(h.geo, { x: lx, z: lz, rot });
    k.block(lx, lz, w, dp, rot);
    placed.push({ x: wx, z: wz, r: Math.max(w, dp) * 0.62 });
  }
  const trees = Math.round(houses * (open ? 2.2 : 0.8));
  for (let i = 0; i < trees; i++) {
    const wx = rng.range(minX + 3, maxX - 3);
    const wz = rng.range(minZ + 3, maxZ - 3);
    if (!inside(wx, wz) || placed.some((p) => Math.hypot(p.x - wx, p.z - wz) < p.r + 1.5)) continue;
    const [lx, lz] = k.local(wx, wz);
    k.add(treeGeo(rng.pick(['round', 'lollipop', 'blossom', 'cypress', 'birch'] as const), rng.int(0, 3)), { x: lx, z: lz, rot: rng.range(0, 6.28) });
    k.block(lx, lz, 0.7, 0.7);
  }
  const want = Math.round(((maxX - minX) * (maxZ - minZ)) / 34);
  let made = 0;
  for (let i = 0; i < want * 3 && made < want; i++) {
    const wx = rng.range(minX + 3, maxX - 3);
    const wz = rng.range(minZ + 3, maxZ - 3);
    if (!inside(wx, wz)) continue;
    const [lx, lz] = k.local(wx, wz);
    if (!k.isFree(lx, lz, 1.3)) continue;
    made += k.group(lx, lz, rng.int(2, 5), { clips: ['talk', 'stand', 'wave', 'point', 'cheer', 'lookout', 'talk'] }).length;
  }
}
