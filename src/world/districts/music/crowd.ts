/**
 * Density pass: after the authored scenes, small sociable groups and lone listeners fill the
 * remaining open paving, avoiding the parade ring, walker lanes, target spots and the aisle.
 */
import { pointInPolygon } from '../../layout';
import type { Kit } from '../../kit';
import { keepOut } from './extras';
import { BAND, facing } from './plan';

type Poly = ReadonlyArray<readonly [number, number]>;

const AREA: Poly = [
  [-10.4, -32.4],
  [9.6, -38.6],
  [21.2, -38.6],
  [21.2, 35.2],
  [-12.4, 35.2],
  [-23.6, 20.3],
  [-20.3, -8.2],
];

const CHAT = ['talk', 'talk', 'stand', 'talk.laugh', 'talk.nod', 'idle.phone', 'point', 'wave', 'eat.icecream', 'drink.cup', 'idle.shift', 'photo.camera'] as const;
const LISTEN = ['cheer.clap', 'sway.wave', 'sway.hands-up', 'stand', 'idle.watch', 'groove.hip-clap', 'cheer'] as const;

function bounds(p: Poly): [number, number, number, number] {
  const xs = p.map((q) => q[0]);
  const zs = p.map((q) => q[1]);
  return [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
}

/** Scatter groups of 1–4 over free, allowed ground. Returns the number of people placed. */
function groups(k: Kit, poly: Poly, count: number): number {
  const [x0, x1, z0, z1] = bounds(poly);
  let made = 0;
  for (let tries = 0; tries < count * 14 && made < count; tries++) {
    const x = k.rng.range(x0, x1);
    const z = k.rng.range(z0, z1);
    const n = Math.min(count - made, k.rng.int(1, 4));
    const r = 0.45 + n * 0.11;
    if (!pointInPolygon(x, z, poly) || keepOut(x, z) || !k.isFree(x, z, r + 0.35)) continue;
    made += k.group(x, z, n, { clips: CHAT, age: k.rng.chance(0.12) ? 'child' : 'adult' }).length;
  }
  return made;
}

/** Lone standing listeners facing the bandstand inside the parade ring. */
function listeners(k: Kit, count: number): number {
  let made = 0;
  for (let tries = 0; tries < count * 14 && made < count; tries++) {
    const a = k.rng.range(-Math.PI, Math.PI);
    const r = k.rng.range(4.6, 12);
    const x = BAND.x + Math.sin(a) * r;
    const z = BAND.z + Math.cos(a) * r;
    if (keepOut(x, z) || !k.isFree(x, z, 0.42)) continue;
    k.person({ x, z, heading: facing(x, z, BAND.x, BAND.z) + k.rng.range(-0.25, 0.25), clip: k.rng.pick(LISTEN), age: k.rng.chance(0.15) ? 'child' : 'adult' });
    made++;
  }
  return made;
}

export function densityFill(k: Kit, groupCount: number, listenerCount: number): void {
  listeners(k, listenerCount);
  groups(k, AREA, groupCount);
}
