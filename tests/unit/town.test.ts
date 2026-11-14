import { describe, expect, it } from 'vitest';
import { heroFeatures } from '../../src/game/game';
import { blockContains } from '../../src/world/kit';
import { DISTRICTS, WORLD, isLand, pointInPolygon } from '../../src/world/layout';
import { Town } from '../../src/world/town';
import { buildTown } from '../helpers/townReport';

const town = buildTown();
const b = town.build;

describe('generated town', () => {
  it('contains the brief-scale population, activity variety and authored stories', () => {
    const c = town.counts();
    expect(c.people).toBeGreaterThan(8000);
    expect(c.vignettes).toBeGreaterThanOrEqual(100);
    expect(c.clips).toBeGreaterThanOrEqual(200);
    const used = new Set(b.people.all().map((p) => p.clip.id));
    const families = new Set([...used].map((id) => id.split('.')[0]));
    expect(families.size).toBeGreaterThanOrEqual(40);
    for (const d of DISTRICTS) expect(b.personDistrict.filter((x) => x === d.id).length, d.id).toBeGreaterThan(350);
    expect(b.warnings).toEqual([]);
  });

  it('is deterministic for a seed and different for another seed', () => {
    const again = new Town('festival-001');
    expect(again.counts()).toEqual(town.counts());
    const a = b.people.all();
    const c = again.build.people.all();
    for (const i of [0, 77, 1234, 4321, a.length - 2]) {
      expect(c[i]?.x).toBe(a[i]?.x);
      expect(c[i]?.z).toBe(a[i]?.z);
      expect(c[i]?.clip.id).toBe(a[i]?.clip.id);
      expect(c[i]?.options).toEqual(a[i]?.options);
    }
    const other = new Town('another-seed');
    const moved = other.build.people.all().filter((p, i) => p.x !== a[i]?.x || p.z !== a[i]?.z).length;
    expect(moved).toBeGreaterThan(1000);
  });

  it('has exactly one person with the full identifying combination, and partial look-alikes', () => {
    const matches = b.people.all().map((p) => heroFeatures(p, b.palette));
    expect(matches.filter((m) => m.count === 5)).toHaveLength(1);
    expect(matches[town.hero.person]?.count).toBe(5);
    expect(matches.filter((m, i) => i !== town.hero.person && m.count === 4)).toHaveLength(0);
    expect(matches.filter((m) => m.count === 2 || m.count === 3).length).toBeGreaterThan(20);
  });

  it('offers many supported hero candidates spread over every district', () => {
    const candidates = town.heroCandidates();
    expect(candidates.length).toBeGreaterThan(2000);
    const perDistrict = new Map<string, number>();
    let inside = 0;
    for (const c of candidates) {
      perDistrict.set(c.district, (perDistrict.get(c.district) ?? 0) + 1);
      if (c.x >= WORLD.minX + 8 && c.x <= WORLD.maxX - 8 && c.z >= WORLD.minZ + 8) inside++;
    }
    /* the game only uses candidates well inside the world edge; nearly all of them qualify */
    expect(inside / candidates.length).toBeGreaterThan(0.85);
    for (const d of DISTRICTS) expect(perDistrict.get(d.id) ?? 0, d.id).toBeGreaterThan(30);
    const ground = candidates.filter((c) => Math.abs(c.y) < 0.3);
    const supported = ground.filter((c) => isLand(c.x, c.z) || b.surfaces.some((s) => Math.abs(s.y - c.y) < 0.5 && pointInPolygon(c.x, c.z, s.polygon)));
    expect(supported.length / ground.length).toBeGreaterThan(0.97);
  });

  it('moves the hero without rebuilding and restores whoever stepped aside', () => {
    const fresh = new Town('festival-001');
    const people = fresh.build.people;
    const before = people.count;
    const [first, second] = fresh.heroCandidates().filter((c) => c.person >= 0);
    if (!first || !second) throw new Error('not enough candidates');
    const original = people.get(first.person);
    fresh.setHero(first, 0.5, 0.1);
    expect(people.count).toBe(before);
    expect(people.get(first.person).scale).toBeLessThan(0.01);
    expect(people.get(fresh.hero.person).x).toBe(first.x);
    fresh.setHero(second, 0.2, 0.3);
    expect(people.get(first.person)).toEqual(original);
    expect(people.get(second.person).scale).toBeLessThan(0.01);
    expect(heroFeatures(people.get(fresh.hero.person), fresh.build.palette).count).toBe(5);
  });

  it('keeps the density filler on visible, unblocked ground', () => {
    expect(town.filled).toBeGreaterThan(0);
    const people = b.people.all();
    let buried = 0;
    let blocked = 0;
    let checked = 0;
    for (let i = people.length - town.filled - 1; i < people.length - 1; i++) {
      const p = people[i];
      if (!p || p.motion >= 0) continue;
      checked++;
      if (b.surfaces.some((s) => s.y > 0.4 && Math.abs(p.y) < 0.3 && pointInPolygon(p.x, p.z, s.polygon))) buried++;
      if (b.blocks.some((blk) => blockContains(blk, p.x, p.z, -0.15))) blocked++;
    }
    expect(checked).toBeGreaterThan(100);
    expect(buried).toBe(0);
    expect(blocked / checked).toBeLessThan(0.01);
  });
});
