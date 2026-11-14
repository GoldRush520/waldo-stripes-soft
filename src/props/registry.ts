/**
 * Prop registry contract.
 *
 * A prop is a named, reusable procedural mesh. Conventions every prop must follow:
 *  - units are metres; an adult person is 1.7 m tall, a door is ~2.1 m, a chair seat is 0.45 m
 *  - the prop rests on y = 0, is centred on x/z, and its "front" faces +z
 *  - colours come only from palette tokens in src/core/palette.ts (C.*)
 *  - parts that should vary per placement (awning cloth, hull, umbrella, petals) carry tint mask 1
 *    via `tintable()`; `defaultTint` is used when a placement gives no tint
 *  - `footprint` is the solid ground rectangle [width x, depth z] used for exclusion / placement
 *  - keep triangle counts modest: small ≤ 200, medium ≤ 800, large landmark pieces ≤ 4000
 *
 * Libraries export `PROPS: readonly PropDef[]`; src/props/index.ts gathers them.
 */
import type { Geo } from '../core/geo';
import type { Col } from '../core/geo';

export interface PropDef {
  /** unique dotted key, e.g. "stall.fish", "boat.row", "tree.round" */
  readonly key: string;
  /** builds the mesh; called once and cached */
  readonly build: () => Geo;
  /** solid ground footprint [width along x, depth along z] in metres; [0,0] = walk-through */
  readonly footprint: readonly [number, number];
  /** tint used for tint-masked vertices when a placement does not supply one */
  readonly defaultTint?: Col;
  /** render material: 'solid' (default, opaque vertex colours), 'glass' (translucent panes) or 'water' */
  readonly material?: 'solid' | 'glass' | 'water';
  /** free-form tags for galleries / procedural fill (e.g. "market", "seat", "clutter") */
  readonly tags?: readonly string[];
  /** seat anchors in prop space: people using a `sit.*` activity can be snapped here */
  readonly seats?: ReadonlyArray<{ readonly x: number; readonly y: number; readonly z: number; readonly heading: number }>;
}

const defs = new Map<string, PropDef>();
const cache = new Map<string, Geo>();

const collisions: string[] = [];

/**
 * Register a library. If two libraries define the same key, the first keeps the plain key and the
 * later one is registered as `<library>:<key>`; collisions are reported instead of breaking the build.
 */
export function registerProps(list: readonly PropDef[], library = 'lib'): void {
  for (const def of list) {
    if (defs.has(def.key)) {
      const alt = `${library}:${def.key}`;
      if (defs.has(alt)) throw new Error(`Duplicate prop key: ${alt}`);
      collisions.push(alt);
      defs.set(alt, { ...def, key: alt });
      continue;
    }
    defs.set(def.key, def);
  }
}

export function propKeyCollisions(): readonly string[] {
  return collisions;
}

export function hasProp(key: string): boolean {
  return defs.has(key);
}

export function propDef(key: string): PropDef {
  const def = defs.get(key);
  if (!def) throw new Error(`Unknown prop: ${key}`);
  return def;
}

export function propGeo(key: string): Geo {
  const hit = cache.get(key);
  if (hit) return hit;
  const geo = propDef(key).build();
  cache.set(key, geo);
  return geo;
}

export function allPropKeys(): string[] {
  return [...defs.keys()].sort();
}
