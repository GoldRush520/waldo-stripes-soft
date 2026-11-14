/**
 * Everyday roof-terrace life for every roof not taken by an authored story: laundry, sunbathers,
 * tomato gardens, pigeon coops, card tables, gramophone dances and gossip round the wash table,
 * plus washing lines strung from roof to neighbouring roof.
 */
import { laundryLine } from '../../../props/street/festival-lines';
import type { Kit } from '../../kit';
import { CLOTHS } from '../shared';
import { clip, holds } from './cast';
import type { Roof } from './houses';

type Scene = 'laundry' | 'sunbathe' | 'garden' | 'coop' | 'cards' | 'dance' | 'gossip';
const SCENES: readonly Scene[] = ['laundry', 'sunbathe', 'garden', 'coop', 'cards', 'dance', 'gossip'];

/** Roof-local point (u east, v south of the house centre) at terrace height. */
export function onRoof(r: Roof, u: number, v: number, rot = 0): { x: number; z: number; y: number; rot: number } {
  return { x: r.x + u, z: r.z + v, y: r.y, rot };
}

/** Front-centre standing area that never meets the hatch, planters, pergola or a chimney. */
export function roofCentre(r: Roof): { u: number; v: number } {
  return { u: -0.3, v: r.garden ? 0.3 : 0.6 };
}

/** The roof's post spot for washing lines on the left / right side. */
export function postSpot(r: Roof, side: -1 | 1): { u: number; v: number } {
  return { u: side * (r.w / 2 - 0.35), v: r.d / 2 - 1.25 };
}

export function stand(k: Kit, r: Roof, u: number, v: number, c: string, opts: { face?: readonly [number, number]; heading?: number; child?: boolean } = {}): number {
  const cu = Math.max(-r.w / 2 + 0.35, Math.min(r.w / 2 - 0.35, u));
  const cv = Math.max(-r.d / 2 + 0.35, Math.min(r.d / 2 - 0.35, v));
  const p = onRoof(r, cu, cv);
  return k.person({
    x: p.x,
    z: p.z,
    y: r.y,
    clip: c,
    heading: opts.heading,
    face: opts.face ? [r.x + opts.face[0], r.z + opts.face[1]] : undefined,
    age: opts.child ? 'child' : k.rng.chance(0.12) ? 'elder' : 'adult',
  });
}

function laundry(k: Kit, r: Roof): void {
  const a = postSpot(r, -1);
  const b = { u: r.w / 2 - 1.3, v: a.v };
  k.prop('roof.clothesProp', onRoof(r, a.u, a.v));
  k.prop('roof.clothesProp', onRoof(r, b.u, b.v));
  const line = laundryLine([r.x + a.u + 0.15, r.y + 2.95, r.z + a.v], [r.x + b.u + 0.15, r.y + 2.95, r.z + b.v], { seed: `roof.${r.id}` });
  k.add(line.geo, { x: 0, z: 0 });
  stand(k, r, -0.4, a.v + 0.75, clip('laundry.peg', 'point'), { heading: Math.PI + 0.3 });
  stand(k, r, 0.9, a.v + 1.05, clip('laundry.shake', 'wave'), { heading: 0.4 });
  stand(k, r, -1.4, a.v - 1.3, clip('talk'), { face: [-0.4, a.v + 0.75], child: k.rng.chance(0.4) });
}

function sunbathe(k: Kit, r: Roof): void {
  const c = roofCentre(r);
  k.seated('roof.deckChairs', onRoof(r, c.u, c.v), { fill: 1, clips: [clip('sit.asleep', 'sit'), clip('sit.read', 'sit')] });
  k.prop('roof.waterBarrel', onRoof(r, c.u + 1.6, c.v - 1.2));
  stand(k, r, c.u - 0.2, c.v - 1.4, clip('serve.tray', 'carry', 'talk'), { heading: 0 });
  stand(k, r, c.u + 1.4, c.v + 0.2, clip('idle.stretch', 'stand'), { heading: -0.3 });
}

function garden(k: Kit, r: Roof): void {
  const c = roofCentre(r);
  k.prop('roof.tomatoRow', onRoof(r, c.u, c.v - 0.9));
  k.prop('roof.waterBarrel', onRoof(r, c.u + 1.6, c.v - 0.9));
  k.person({ x: r.x + c.u - 0.4, z: r.z + c.v - 0.2, y: r.y, heading: Math.PI, clip: clip('garden.water', 'point'), hold: holds('hold.wateringcan', 'upper.apron') });
  k.person({ x: r.x + c.u + 0.6, z: r.z + c.v + 0.3, y: r.y, heading: Math.PI - 0.3, clip: clip('garden.prune', 'point'), hold: holds('hold.shears') });
  stand(k, r, c.u - 1.6, c.v + 0.5, clip('talk.nod', 'talk'), { face: [c.u, c.v] });
}

function coop(k: Kit, r: Roof): void {
  const c = roofCentre(r);
  k.prop('roof.pigeonCoop', onRoof(r, c.u + 0.4, c.v - 0.9), {});
  k.prop('animal.pigeon.peck', onRoof(r, c.u - 0.7, c.v + 0.4, 0.8));
  k.prop('animal.pigeon.stand', onRoof(r, c.u + 1.2, c.v + 0.5, -0.6));
  stand(k, r, c.u - 0.6, c.v - 0.1, clip('wave'), { heading: 2.8 });
  stand(k, r, c.u + 0.3, c.v + 0.9, clip('point.sky', 'point'), { heading: 0.3, child: true });
  stand(k, r, c.u - 1.7, c.v + 0.8, clip('lookout'), { heading: 0.5 });
}

function cards(k: Kit, r: Roof): void {
  const c = roofCentre(r);
  k.seated('roof.picnicTable', onRoof(r, c.u, c.v - 0.3), { fill: 0.85, clips: [clip('sit.talk', 'sit'), clip('sit.eat', 'sit'), 'sit'] });
  stand(k, r, c.u + 1.5, c.v - 0.3, clip('talk.laugh', 'talk'), { face: [c.u, c.v - 0.3] });
}

function dance(k: Kit, r: Roof): void {
  const c = roofCentre(r);
  k.prop('music.gramophone', onRoof(r, c.u - 1.5, c.v - 1.1, 0.4));
  stand(k, r, c.u - 0.2, c.v, clip('waltz.lead', 'wave'), { face: [c.u + 0.25, c.v] });
  stand(k, r, c.u + 0.25, c.v, clip('waltz.follow', 'cheer'), { face: [c.u - 0.2, c.v] });
  stand(k, r, c.u + 1.4, c.v - 1.1, clip('cheer.clap', 'cheer'), { face: [c.u, c.v] });
  stand(k, r, c.u - 1.5, c.v + 0.6, clip('sway.wave', 'wave'), { face: [c.u, c.v], child: true });
}

function gossip(k: Kit, r: Roof): void {
  const c = roofCentre(r);
  k.prop('roof.washTable', onRoof(r, c.u + 0.6, c.v - 1.2), {});
  const talk = [clip('talk.whisper', 'talk'), clip('talk.animated', 'talk'), clip('talk.shrug', 'point')];
  [[-1.0, 0.3], [0.1, 0.9], [-0.2, -0.4]].forEach(([u = 0, v = 0], i) => stand(k, r, c.u + u, c.v + v, talk[i] ?? 'talk', { face: [c.u - 0.4, c.v + 0.2] }));
  stand(k, r, c.u + 0.9, c.v - 0.5, clip('clean.window', 'stand'), { heading: Math.PI });
}

/** An open roof kept clear at its front-left corner (a fair hero spot): two people enjoy the view. */
function view(k: Kit, r: Roof): void {
  stand(k, r, r.w / 2 - 1.4, r.d / 2 - 0.6, 'lookout', { heading: 0.2 });
  stand(k, r, r.w / 2 - 2.2, r.d / 2 - 1.0, clip('point'), { heading: -0.3 });
  stand(k, r, 0.2, -0.4, clip('idle.stretch', 'talk'), { heading: 0.6 });
  k.prop('roof.waterBarrel', onRoof(r, 0.9, -r.d / 2 + 0.7));
}

/** Front-left standing spot of an open roof (local x, z, y). */
export function openSpot(r: Roof): { x: number; z: number; y: number } {
  return { x: r.x - r.w / 2 + 1.0, z: r.z + r.d / 2 - 0.6, y: r.y };
}

const DRESSING = ['roof.chimneyPots', 'roof.skylight', 'roof.dovecote', 'roof.weathercock', 'roof.watertank'] as const;

function dressing(k: Kit, r: Roof): void {
  if (r.garden || r.w < 5) return;
  const key = k.rng.pick(DRESSING);
  k.prop(key, onRoof(r, r.w / 2 - 1.3, -r.d / 2 + 1.0, k.rng.range(-0.3, 0.3)));
}

/** Dress every free roof; returns the ids of the open roofs kept clear for hero spots. */
export function roofLife(k: Kit, roofs: readonly Roof[], taken: ReadonlySet<number>): Set<number> {
  const offset = k.rng.int(0, SCENES.length - 1);
  const open = new Set<number>();
  roofs.forEach((r, i) => {
    if (taken.has(r.id)) return;
    if (!r.garden && r.w >= 4.8 && (i + offset) % 4 === 0) {
      view(k, r);
      open.add(r.id);
      return;
    }
    const scene = r.garden ? (i % 2 ? 'garden' : 'gossip') : (SCENES[(i + offset) % SCENES.length] ?? 'gossip');
    if (scene === 'laundry') laundry(k, r);
    else if (scene === 'sunbathe') sunbathe(k, r);
    else if (scene === 'garden') garden(k, r);
    else if (scene === 'coop') coop(k, r);
    else if (scene === 'cards') cards(k, r);
    else if (scene === 'dance') dance(k, r);
    else gossip(k, r);
    if (scene !== 'laundry') dressing(k, r);
  });
  return open;
}

/** Washing lines strung between neighbouring roofs of a row (and over the narrow passages). */
export function crossLines(k: Kit, roofs: readonly Roof[], taken: ReadonlySet<number>): void {
  const sorted = [...roofs].sort((a, b) => a.level - b.level || a.x - b.x);
  for (let i = 1; i < sorted.length; i++) {
    const a = sorted[i - 1];
    const b = sorted[i];
    if (!a || !b || a.level !== b.level || a.garden || b.garden || taken.has(a.id) || taken.has(b.id)) continue;
    const gap = b.x - b.w / 2 - (a.x + a.w / 2);
    if (gap > 2.4 || Math.abs(a.y - b.y) > 3.2 || !k.rng.chance(0.5)) continue;
    const pa = postSpot(a, 1);
    const pb = postSpot(b, -1);
    k.prop('roof.clothesProp', onRoof(a, pa.u, pa.v + 0.9));
    k.prop('roof.clothesProp', onRoof(b, pb.u, pb.v + 0.9));
    const line = laundryLine([a.x + pa.u + 0.15, a.y + 2.95, a.z + pa.v + 0.9], [b.x + pb.u + 0.15, b.y + 2.95, b.z + pb.v + 0.9], { seed: `cross.${a.id}` });
    k.add(line.geo, { x: 0, z: 0, tint: CLOTHS[i % CLOTHS.length] });
  }
}

