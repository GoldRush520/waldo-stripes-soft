/** PropDef factory for nature props built through `tiered`. */
import type { Col, Geo } from '../../core/geo';
import { type Rng, createRng, hashString } from '../../core/rng';
import type { PropDef } from '../registry';
import { type Q, ground, tiered } from './kit';

export type Maker = (q: Q, rng: Rng) => Geo;

export interface DefOpts {
  readonly tint?: Col;
  readonly tags?: readonly string[];
  readonly seats?: PropDef['seats'];
  /** keep the authored origin height (airborne / water props) instead of resting on y = 0 */
  readonly float?: boolean;
  readonly seed?: number;
}

/** Wrap a two-pass maker as a cached-build PropDef. Both passes get identical seeded streams. */
export function def(key: string, make: Maker, footprint: readonly [number, number], opts: DefOpts = {}): PropDef {
  const seed = opts.seed ?? hashString(key);
  const build = (): Geo => {
    const g = tiered((q) => make(q, createRng(seed)));
    return opts.float ? g : ground(g);
  };
  return {
    key,
    build,
    footprint,
    ...(opts.tint ? { defaultTint: opts.tint } : {}),
    ...(opts.seats ? { seats: opts.seats } : {}),
    tags: ['nature', ...(opts.tags ?? [])],
  };
}
