/**
 * Z-fighting detector (development tool). Builds the town headlessly, collects every static
 * triangle that can face the game camera and reports pairs that lie in the same plane (within TOL),
 * face the same way, overlap, and are drawn in the same depth class — the surfaces the depth
 * buffer cannot order, which flicker while panning. Pairs inside one placement are included.
 *
 * Usage: npm run zfight -- [seed ...]     (exit code 1 when anything is found)
 */
import { VIEW_ELEVATION } from '../src/game/composition';
import { bakedLods } from '../src/world/staticWorld';
import { Town } from '../src/world/town';

/** surfaces closer than this along their normal are treated as coincident */
const TOL = 0.0004;
/** overlaps narrower than this are ignored (shared edges, sub-pixel slivers) */
const INSET = 0.015;
const CELL = 2;
/** colour difference (0..1 per channel) below which a fight cannot be seen */
const COLOUR_TOL = 0.02;
/** the game picks one azimuth per visit inside this range (see BASE_AZIMUTH in game.ts) */
const AZIMUTHS = [-0.68, -0.38, -0.08];
const TO_CAMERA = AZIMUTHS.map((a) => [Math.cos(VIEW_ELEVATION) * Math.sin(a), Math.sin(VIEW_ELEVATION), Math.cos(VIEW_ELEVATION) * Math.cos(a)] as const);

interface Tri {
  readonly p: number;
  readonly v: readonly number[];
  readonly nx: number;
  readonly ny: number;
  readonly nz: number;
  readonly d: number;
  /** average vertex colour after tint */
  readonly col: readonly [number, number, number];
  readonly min: readonly [number, number, number];
  readonly max: readonly [number, number, number];
}

/** Overlap of two coplanar triangles, tested in the plane's own 2D frame with a small inset. */
function overlap(s: Tri, t: Tri): boolean {
  const ax = Math.abs(s.nx) < 0.9 ? 1 : 0;
  const ay = ax === 1 ? 0 : 1;
  let ux = ay * s.nz;
  let uy = -ax * s.nz;
  let uz = ax * s.ny - ay * s.nx;
  const ul = Math.hypot(ux, uy, uz);
  ux /= ul;
  uy /= ul;
  uz /= ul;
  const wx = s.ny * uz - s.nz * uy;
  const wy = s.nz * ux - s.nx * uz;
  const wz = s.nx * uy - s.ny * ux;
  const flat = (q: Tri): number[][] => [0, 3, 6].map((o) => {
    const x = q.v[o] as number;
    const y = q.v[o + 1] as number;
    const z = q.v[o + 2] as number;
    return [x * ux + y * uy + z * uz, x * wx + y * wy + z * wz];
  });
  const A = flat(s);
  const B = flat(t);
  for (const [P, Q] of [[A, B], [B, A]] as const) {
    for (let i = 0; i < 3; i++) {
      const p0 = P[i] as number[];
      const p1 = P[(i + 1) % 3] as number[];
      const ex = (p1[1] as number) - (p0[1] as number);
      const ey = -((p1[0] as number) - (p0[0] as number));
      const el = Math.hypot(ex, ey) || 1;
      let minP = Infinity;
      let maxP = -Infinity;
      let minQ = Infinity;
      let maxQ = -Infinity;
      for (const c of P) {
        const k = ((c[0] as number) * ex + (c[1] as number) * ey) / el;
        minP = Math.min(minP, k);
        maxP = Math.max(maxP, k);
      }
      for (const c of Q) {
        const k = ((c[0] as number) * ex + (c[1] as number) * ey) / el;
        minQ = Math.min(minQ, k);
        maxQ = Math.max(maxQ, k);
      }
      if (maxP < minQ + INSET || maxQ < minP + INSET) return false;
    }
  }
  return true;
}

function analyse(seed: string): number {
  const town = new Town(seed, { traceStatics: true });
  const log = town.build.statics.traceLog;
  const tris: Tri[] = [];
  log.forEach((pl, p) => {
    if (pl.depth === 'glass') return;
    const g = bakedLods(pl.geo).near;
    const pos = g.pos;
    const world = (i: number): [number, number, number] => {
      const x = (pos[i * 3] as number) * pl.scale;
      const y = (pos[i * 3 + 1] as number) * pl.scale;
      const z = (pos[i * 3 + 2] as number) * pl.scale;
      return [x * pl.cos + z * pl.sin + pl.x, y + pl.y, -x * pl.sin + z * pl.cos + pl.z];
    };
    for (let t = 0; t < g.idx.length; t += 3) {
      const a = world(g.idx[t] as number);
      const b = world(g.idx[t + 1] as number);
      const c = world(g.idx[t + 2] as number);
      const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]] as const;
      const e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]] as const;
      let nx = e1[1] * e2[2] - e1[2] * e2[1];
      let ny = e1[2] * e2[0] - e1[0] * e2[2];
      let nz = e1[0] * e2[1] - e1[1] * e2[0];
      const len = Math.hypot(nx, ny, nz);
      if (len / 2 < 0.0004) continue;
      nx /= len;
      ny /= len;
      nz /= len;
      if (!TO_CAMERA.some((v) => nx * v[0] + ny * v[1] + nz * v[2] > 0.02)) continue;
      const col: [number, number, number] = [0, 0, 0];
      for (let k = 0; k < 3; k++) {
        const vi = g.idx[t + k] as number;
        const mask = pl.tint ? (g.fx[vi * 2] as number) : 0;
        for (let ch = 0; ch < 3; ch++) {
          const base = g.col[vi * 3 + ch] as number;
          col[ch] = (col[ch] as number) + (base + (((pl.tint?.[ch] ?? base) as number) - base) * mask) / 3;
        }
      }
      tris.push({
        p,
        col,
        v: [...a, ...b, ...c],
        nx,
        ny,
        nz,
        d: nx * a[0] + ny * a[1] + nz * a[2],
        min: [Math.min(a[0], b[0], c[0]), Math.min(a[1], b[1], c[1]), Math.min(a[2], b[2], c[2])],
        max: [Math.max(a[0], b[0], c[0]), Math.max(a[1], b[1], c[1]), Math.max(a[2], b[2], c[2])],
      });
    }
  });

  const grid = new Map<string, number[]>();
  tris.forEach((t, i) => {
    for (let gx = Math.floor(t.min[0] / CELL); gx <= Math.floor(t.max[0] / CELL); gx++) {
      for (let gy = Math.floor(t.min[1] / CELL); gy <= Math.floor(t.max[1] / CELL); gy++) {
        for (let gz = Math.floor(t.min[2] / CELL); gz <= Math.floor(t.max[2] / CELL); gz++) {
          const k = `${gx},${gy},${gz}`;
          const list = grid.get(k);
          if (list) list.push(i);
          else grid.set(k, [i]);
        }
      }
    }
  });

  const pairs = new Map<string, { n: number; sample: string; cells: Set<string> }>();
  for (const [key, list] of grid) {
    for (let i = 0; i < list.length; i++) {
      const s = tris[list[i] as number] as Tri;
      const sp = log[s.p] as (typeof log)[number];
      for (let j = i + 1; j < list.length; j++) {
        const t = tris[list[j] as number] as Tri;
        if (s.nx * t.nx + s.ny * t.ny + s.nz * t.nz < 0.99995) continue;
        if (Math.abs(t.d - s.d) > 0.05) continue;
        const tp = log[t.p] as (typeof log)[number];
        if (sp.depth !== tp.depth) continue;
        if (s.max[0] < t.min[0] || t.max[0] < s.min[0] || s.max[1] < t.min[1] || t.max[1] < s.min[1] || s.max[2] < t.min[2] || t.max[2] < s.min[2]) continue;
        let coplanar = true;
        for (let o = 0; o < 9 && coplanar; o += 3) {
          const dist = s.nx * (t.v[o] as number) + s.ny * (t.v[o + 1] as number) + s.nz * (t.v[o + 2] as number) - s.d;
          if (Math.abs(dist) > TOL) coplanar = false;
        }
        /* same colour on the same plane: whichever wins, the picture is identical */
        if (Math.max(Math.abs(s.col[0] - t.col[0]), Math.abs(s.col[1] - t.col[1]), Math.abs(s.col[2] - t.col[2])) < COLOUR_TOL) continue;
        if (!coplanar || !overlap(s, t)) continue;
        const la = s.p === t.p ? `${sp.label} (within one placement)` : sp.label;
        const lb = s.p === t.p ? '' : tp.label;
        const pk = lb === '' ? la : la < lb ? `${la}  ×  ${lb}` : `${lb}  ×  ${la}`;
        let e = pairs.get(pk);
        if (!e) {
          const facing = Math.abs(s.ny) > 0.9 ? 'flat' : Math.abs(s.ny) < 0.1 ? 'wall' : 'slope';
          e = { n: 0, sample: `${facing} at (${((s.min[0] + s.max[0]) / 2).toFixed(1)}, ${((s.min[1] + s.max[1]) / 2).toFixed(3)}, ${((s.min[2] + s.max[2]) / 2).toFixed(1)})`, cells: new Set() };
          pairs.set(pk, e);
        }
        e.n++;
        e.cells.add(key);
      }
    }
  }
  const sorted = [...pairs.entries()].sort((a, b) => b[1].cells.size - a[1].cells.size);
  let cells = 0;
  for (const [, e] of sorted) cells += e.cells.size;
  process.stdout.write(`seed ${seed}: ${log.length} placements, ${tris.length} camera-facing triangles, ${sorted.length} fighting pairs, ${cells} affected 2 m cells\n`);
  for (const [k, e] of sorted.slice(0, 60)) process.stdout.write(`${String(e.cells.size).padStart(5)} cells ${String(e.n).padStart(7)} tri-pairs  ${k}   e.g. ${e.sample}\n`);
  town.dispose();
  return sorted.length;
}

const seeds = process.argv.slice(2);
let found = 0;
for (const seed of seeds.length > 0 ? seeds : ['festival-001']) found += analyse(seed);
process.exitCode = found > 0 ? 1 : 0;
