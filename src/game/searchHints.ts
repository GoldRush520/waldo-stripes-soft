import { createRng } from '../core/rng';
import type { Pt } from '../world/layout';

export interface SearchPoint {
  readonly x: number;
  readonly z: number;
}

export interface SearchArea {
  readonly minX: number;
  readonly maxX: number;
  readonly minZ: number;
  readonly maxZ: number;
  readonly count: number;
}

const FIRST_COUNT = 96;
const FINAL_COUNT = 8;
const REMAINING_SHARE = 0.5;

/** Clip the district outline to the four sides of the current search rectangle. */
export function hintBoundary(area: SearchArea, district?: readonly Pt[]): readonly Pt[] {
  if (!district) return [[area.minX, area.minZ], [area.maxX, area.minZ], [area.maxX, area.maxZ], [area.minX, area.maxZ]];
  let points = district.slice();
  for (const [axis, limit, direction] of [[0, area.minX, 1], [0, area.maxX, -1], [1, area.minZ, 1], [1, area.maxZ, -1]] as const) {
    const clipped: Pt[] = [];
    let previous = points.at(-1);
    for (const point of points) {
      if (!previous) break;
      const a = direction * (previous[axis] - limit), b = direction * (point[axis] - limit);
      if ((a < 0) !== (b < 0)) {
        const t = a / (a - b);
        clipped.push([previous[0] + t*(point[0]-previous[0]), previous[1] + t*(point[1]-previous[1])]);
      }
      if (b >= 0) clipped.push(point);
      previous = point;
    }
    points = clipped;
  }
  return points;
}

export function searchAreas(hero: SearchPoint, candidates: readonly SearchPoint[], seed: string): SearchArea[] {
  const rng = createRng(seed).fork('search-hints');
  const shareX = rng.range(0.25, 0.75);
  const shareZ = rng.range(0.25, 0.75);
  const distances = [0, ...candidates.map((point) => {
    const dx = point.x - hero.x;
    const dz = point.z - hero.z;
    return Math.max(-dx / shareX, dx / (1 - shareX), -dz / shareZ, dz / (1 - shareZ));
  })].sort((left, right) => left - right);

  const areas: SearchArea[] = [];
  let wanted = Math.min(FIRST_COUNT, distances.length);
  let previousCount = Infinity;
  while (wanted > 0) {
    let count = wanted;
    while (count > 1 && distances[count - 1] === distances[count]) count--;
    const boundary = distances[count - 1];
    while (distances[count] === boundary) count++;
    if (count >= previousCount) break;

    const next = distances[count] ?? Infinity;
    const minSpan = next > 0 ? Math.min(0.5, next / 2) : 0;
    const span = Math.max(minSpan, boundary + Math.min(0.01, (next - boundary) / 2));
    areas.push({
      minX: hero.x - span * shareX, maxX: hero.x + span * (1 - shareX),
      minZ: hero.z - span * shareZ, maxZ: hero.z + span * (1 - shareZ), count,
    });
    if (count <= FINAL_COUNT) break;
    previousCount = count;
    wanted = Math.ceil(count * REMAINING_SHARE);
  }
  return areas;
}
