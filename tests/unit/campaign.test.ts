import { describe, expect, it } from 'vitest';
import { Campaign, FINAL_STAGE, STAGES, stageFrame } from '../../src/game/campaign';
import { projectPoint, VIEW_ELEVATION } from '../../src/game/composition';
import { hintBoundary } from '../../src/game/searchHints';
import { districtById } from '../../src/world/layout';

function storage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    key: index => [...values.keys()][index] ?? null,
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: key => { values.delete(key); }, clear: () => values.clear(),
  };
}

describe('campaign saves', () => {
  it('resumes only sequential clean wins and preserves faster times when replayed', () => {
    const disk = storage();
    for (let n = 1; n <= FINAL_STAGE; n++) {
      const game = new Campaign(disk, 0);
      expect(game.stage).toBe(n);
      game.finish(100, true);
      expect(new Campaign(disk, 0).stage).toBe(n);
      game.finish(300, false);
    }
    const replay = new Campaign(disk, 1);
    replay.finish(500, false);
    replay.finish(50, true);
    expect(new Campaign(disk, 0).best.get(1)).toBe(300);
    expect(new Campaign(disk, 0).stage).toBe(13);
  });

  it('rejects a skipped stage, invalid data and a locked selection', () => {
    const disk = storage();
    disk.setItem('renhai.campaign.v1.best.1', 'NaN');
    disk.setItem('renhai.campaign.v1.best.2', '15');
    expect(new Campaign(disk, 13).stage).toBe(1);
  });

  it('reports a failed local write', () => {
    const game = new Campaign(null, 0);
    game.finish(500, false);
    expect(game.saved).toBe(false);
  });
});

describe('district framing', () => {
  it.each(STAGES.slice(0, 12))('fits the whole %s outline at minimum zoom', (id) => {
    const polygon = districtById(id!).polygon;
    const w = 792, h = 355, angle = -0.45;
    const frame = stageFrame(polygon, angle);
    const view = {x: 0, z: 0, ppm:frame.fit(w,h), elevation:VIEW_ELEVATION, azimuth:angle};
    Object.assign(view, frame.constrain(view,w,h));
    for (const [x,z] of polygon) {
      const p = projectPoint(view,w,h,x,0,z);
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(w);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(h);
    }
  });
  it('clips the search area to the diagonal district edge', () => {
    const outline = hintBoundary({minX: 2, maxX: 8, minZ: 2, maxZ: 8, count: 5}, [[0,0],[10,0],[0,10]]);
    for (const [x,z] of outline) expect(x+z).toBeLessThanOrEqual(10);
    expect(outline.length).toBeGreaterThanOrEqual(3);
  });
});
