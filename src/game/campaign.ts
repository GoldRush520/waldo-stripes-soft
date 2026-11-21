import { districtById, WORLD, type DistrictId, type Pt } from '../world/layout';
import { VIEW_ELEVATION, type ViewSpec } from './composition';

export const STAGES = [
  ['canal', '运河桥'], ['craft', '手工作坊'], ['market', '鱼市'], ['sports', '运动场'],
  ['music', '音乐广场'], ['rooftops', '屋顶露台'], ['cafe', '咖啡街'], ['tram', '电车站'],
  ['funfair', '游乐场'], ['gardens', '植物园'], ['beach', '海滩'], ['harbor', '港口'],
  [null, '全镇挑战'],
] as const satisfies readonly (readonly [DistrictId | null, string])[];
export const FINAL_STAGE = STAGES.length;
const key = (n: number) => `renhai.campaign.v1.best.${n}`;

/** Each stage owns a single record. A completed predecessor is the unlock token. */
export class Campaign {
  readonly best = new Map<number, number>();
  stage: number;
  saved = true;

  constructor(private readonly storage: Storage | null, requested: number) {
    try {
      for (let n = 1; n <= FINAL_STAGE; n++) {
        const time = Number(storage?.getItem(key(n)));
        if (!Number.isSafeInteger(time) || time <= 0) break;
        this.best.set(n, time);
      }
    } catch { this.saved = false; }
    this.stage = this.canPlay(requested) ? requested : this.unlocked;
  }

  get unlocked(): number { return Math.min(FINAL_STAGE, this.best.size + 1); }
  get name(): string { return STAGES[this.stage - 1]![1]; }
  get district() {
    const id = STAGES[this.stage - 1]![0];
    return id ? districtById(id) : null;
  }
  canPlay(n: number): boolean { return Number.isInteger(n) && n >= 1 && n <= this.unlocked; }

  finish(ms: number, playedAd: boolean): void {
    if (playedAd) return;
    const time = Math.min(this.best.get(this.stage) ?? Infinity, Math.max(1, Math.round(ms)));
    this.best.set(this.stage, time);
    try {
      if (!this.storage) throw new Error('storage unavailable');
      const previous = Number(this.storage.getItem(key(this.stage)));
      const best = previous > 0 && Number.isSafeInteger(previous) ? Math.min(previous, time) : time;
      this.storage.setItem(key(this.stage), String(best));
      this.best.set(this.stage, best);
      this.saved = true;
    } catch { this.saved = false; }
  }
}

export function loadCampaign(): Campaign {
  let storage: Storage | null = null;
  try { storage = window.localStorage; } catch { /* Play in memory when storage is blocked. */ }
  const url = new URL(location.href);
  if (url.searchParams.has('stage')) {
    url.searchParams.delete('stage');
    history.replaceState(history.state, '', url);
  }
  return new Campaign(storage, 0);
}

const townOutline: readonly Pt[] = [
  [WORLD.minX, WORLD.minZ], [WORLD.maxX, WORLD.minZ], [WORLD.maxX, WORLD.maxZ], [WORLD.minX, WORLD.maxZ],
];

/** Camera-plane bounds include headroom for roofs, rides and elevated hiding places. */
export function stageFrame(polygon: readonly Pt[] | undefined, azimuth: number) {
  const ca = Math.cos(azimuth), sa = Math.sin(azimuth), se = Math.sin(VIEW_ELEVATION);
  const points = polygon ?? townOutline;
  const right = points.map(([x,z]) => ca*x - sa*z);
  const down = points.map(([x,z]) => (sa*x + ca*z)*se);
  const left = Math.min(...right)-3, top = Math.min(...down)-17;
  const width = Math.max(...right)+3-left, height = Math.max(...down)+3-top;
  return {
    fit(w: number, h: number) { return Math.min(w/width, h/height); },
    constrain(view: ViewSpec, w: number, h: number) {
      const axis = (v: number, start: number, size: number, screen: number) => {
        const inset = Math.min(size/2, screen/(2*view.ppm));
        return Math.max(start+inset, Math.min(start+size-inset, v));
      };
      const r = axis(ca*view.x-sa*view.z, left, width, w);
      const d = axis((sa*view.x+ca*view.z)*se, top, height, h)/se;
      return {x: ca*r + sa*d, z: -sa*r + ca*d};
    },
  };
}
