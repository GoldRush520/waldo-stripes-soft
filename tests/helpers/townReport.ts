/**
 * Headless town build for tests: builds the given districts exactly as the game does (no WebGL
 * needed) and reports counts, build warnings and placement problems.
 */
import { blockContains } from '../../src/world/kit';
import { type DistrictId, districtById, isLand, pointInPolygon } from '../../src/world/layout';
import { Town } from '../../src/world/town';

export interface DistrictReport {
  readonly people: number;
  readonly movers: number;
  readonly vignettes: number;
  readonly vignetteIds: readonly string[];
  readonly clipsUsed: readonly string[];
  readonly staticPlacements: number;
  readonly trianglesNear: number;
  readonly trianglesFar: number;
  readonly targetSpots: number;
  readonly warnings: readonly string[];
  /** standing people (not riding anything, at ground level) whose feet are inside a solid footprint */
  readonly insideBlocks: number;
  /** ground-level standing people closer than 0.3 m to each other */
  readonly overlaps: number;
  /** ground-level people standing outside the district polygon by more than 6 m */
  readonly strays: number;
  /** ground-level people (y < 0.3) not on land and not on a declared surface */
  readonly unsupported: number;
  readonly buildMs: number;
}

const cache = new Map<string, Town>();

export function buildTown(only?: readonly DistrictId[], seed = 'festival-001'): Town {
  const key = `${only ? only.join(',') : '*'}@${seed}`;
  let town = cache.get(key);
  if (!town) {
    /* a district on its own is the authored content; the town-wide density pass is tested separately */
    town = new Town(seed, { only, densify: only === undefined });
    cache.set(key, town);
  }
  return town;
}

export function districtReport(id: DistrictId, seed = 'festival-001'): DistrictReport {
  const town = buildTown([id], seed);
  const b = town.build;
  const def = districtById(id);
  const people = b.people.all();
  let insideBlocks = 0;
  let overlaps = 0;
  let strays = 0;
  let unsupported = 0;
  const clips = new Set<string>();
  const clipByRow = new Map<number, string>();
  for (const cid of b.poses.ids()) clipByRow.set(b.poses.clip(cid).row, cid);
  const ground: { x: number; z: number }[] = [];
  people.forEach((p, i) => {
    if (i === town.hero.person) return;
    clips.add(clipByRow.get(p.clip.row) ?? '?');
    if (p.motion >= 0) return;
    const onSurface = b.surfaces.some((s) => Math.abs(s.y - p.y) < 0.6 && pointInPolygon(p.x, p.z, s.polygon));
    if (p.y > 0.3 || p.y < -0.3) {
      if (!onSurface && p.y > 0.3) unsupported += 0;
      return;
    }
    if (!isLand(p.x, p.z) && !onSurface) unsupported++;
    if (b.blocks.some((blk) => blockContains(blk, p.x, p.z, -0.12))) insideBlocks++;
    const [ax, az] = def.anchor;
    if (!pointInPolygon(p.x, p.z, def.polygon)) {
      let near = false;
      for (const [x, z] of def.polygon) if (Math.hypot(x - p.x, z - p.z) < 6) near = true;
      const edge = def.polygon.some((a, k) => {
        const c = def.polygon[(k + 1) % def.polygon.length] as readonly [number, number];
        const dx = c[0] - a[0];
        const dz = c[1] - a[1];
        const t = Math.max(0, Math.min(1, ((p.x - a[0]) * dx + (p.z - a[1]) * dz) / (dx * dx + dz * dz || 1)));
        return Math.hypot(p.x - (a[0] + dx * t), p.z - (a[1] + dz * t)) < 6;
      });
      if (!near && !edge) strays++;
      void ax;
      void az;
    }
    ground.push({ x: p.x, z: p.z });
  });
  ground.sort((a, c) => a.x - c.x);
  for (let i = 0; i < ground.length; i++) {
    const a = ground[i] as { x: number; z: number };
    for (let j = i + 1; j < ground.length; j++) {
      const c = ground[j] as { x: number; z: number };
      if (c.x - a.x > 0.3) break;
      if (Math.hypot(c.x - a.x, c.z - a.z) < 0.3) overlaps++;
    }
  }
  const stats = b.statics.stats();
  return {
    people: people.length - 1,
    movers: people.filter((p) => p.motion >= 0).length,
    vignettes: b.vignettes.length,
    vignetteIds: b.vignettes.map((v) => v.id),
    clipsUsed: [...clips].sort(),
    staticPlacements: stats.placements,
    trianglesNear: stats.trianglesNear,
    trianglesFar: stats.trianglesFar,
    targetSpots: b.targetSpots.length,
    warnings: b.warnings,
    insideBlocks,
    overlaps,
    strays,
    unsupported,
    buildMs: town.buildMs,
  };
}
