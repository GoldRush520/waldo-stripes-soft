import { describe, expect, it } from 'vitest';
import { type SearchArea, type SearchPoint, searchAreas } from '../../src/game/searchHints';

function contains(area: SearchArea, point: SearchPoint): boolean {
  return point.x >= area.minX && point.x <= area.maxX && point.z >= area.minZ && point.z <= area.maxZ;
}

describe('searchAreas', () => {
  it('drops about half of the candidates without excluding the hero or expanding the area', () => {
    const hero = { x: 1.2, z: -4.5 };
    const people = Array.from({ length: 600 }, (_, index) => ({
      x: Math.cos(index * 2.4) * (index + 1) / 10,
      z: Math.sin(index * 2.4) * (index + 1) / 10,
    }));
    const areas = searchAreas(hero, people, 'hint-test');
    expect(areas.map((area) => area.count)).toEqual([96, 48, 24, 12, 6]);
    expect(searchAreas(hero, people, 'hint-test')).toEqual(areas);
    areas.forEach((area, index) => {
      expect(contains(area, hero)).toBe(true);
      expect(people.filter((person) => contains(area, person)).length + 1).toBe(area.count);
      if (index === 0) return;
      const previous = areas[index - 1];
      expect(contains(previous, { x: area.minX, z: area.minZ })).toBe(true);
      expect(contains(previous, { x: area.maxX, z: area.maxZ })).toBe(true);
    });
  });

  it('stops at the smallest distinct area when colocated candidates cannot be separated', () => {
    const hero = { x: 2, z: 3 };
    const people = Array.from({ length: 12 }, () => ({ ...hero }));
    const areas = searchAreas(hero, people, 'overlap');
    expect(areas.map((area) => area.count)).toEqual([13]);
    expect(contains(areas[0], hero)).toBe(true);
    expect(searchAreas(hero, [], 'sparse')[0].count).toBe(1);
  });
});
