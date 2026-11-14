/**
 * Roof-terrace microstories, part 1: the cat foreman of the laundry, the runaway sheet, the pigeon
 * picnic raid, the teapot passed across an alley, the cat-plank crossing and the band practice.
 */
import { laundryLine } from '../../../props/street/festival-lines';
import type { Kit } from '../../kit';
import { clip, holds, opt } from './cast';
import { sheetDrape, teapot } from './geo';
import { PAIRED_GAPS, type Roof, claimRoof, flankingRoofs } from './houses';
import { LEVEL_Y, laneZ } from './plan';
import { onRoof, postSpot, roofCentre, stand } from './roofLife';

export type Taken = Set<number>;

function line(k: Kit, r: Roof, seed: string): { a: { u: number; v: number }; b: { u: number; v: number } } {
  const a = postSpot(r, -1);
  const b = { u: r.w / 2 - 1.3, v: a.v };
  k.prop('roof.clothesProp', onRoof(r, a.u, a.v));
  k.prop('roof.clothesProp', onRoof(r, b.u, b.v));
  k.add(laundryLine([r.x + a.u + 0.15, r.y + 2.95, r.z + a.v], [r.x + b.u + 0.15, r.y + 2.95, r.z + b.v], { seed }).geo, { x: 0, z: 0 });
  return { a, b };
}

function catLaundry(k: Kit, roofs: readonly Roof[], taken: Taken): void {
  const r = claimRoof(roofs, taken, 2, 31);
  k.vignette({ id: 'cat-foreman', title: 'The laundry foreman', story: 'A ginger cat on the parapet supervises every peg while its owner hangs out the week’s washing.' }, () => {
    const { a } = line(k, r, 'cat-foreman');
    const front = r.d / 2 + 0.1;
    k.prop('animal.cat.sit', { x: r.x + 0.2, z: r.z + front, y: r.parapetY, rot: Math.PI });
    k.person({ x: r.x - 0.3, z: r.z + a.v + 0.7, y: r.y, heading: Math.PI, clip: clip('laundry.peg', 'point'), hold: holds('upper.apron'), look: { hat: opt('hat.headscarf', 'hat.beanie'), hatTint: 'butter', lower: opt('lower.skirt.long') } });
    stand(k, r, 1.1, a.v + 1.4, clip('point'), { face: [0.2, front], child: true });
    k.prop('roof.deckChairs', onRoof(r, -1.0, a.v - 1.25 > -r.d / 2 + 1.8 ? a.v - 1.25 : a.v + 1.7, 0.3));
    k.prop('basket.wicker', onRoof(r, 0.6, a.v + 0.5));
  });
}

function runawaySheet(k: Kit, roofs: readonly Roof[], taken: Taken): void {
  const r = claimRoof(roofs, taken, 1, 4);
  const lz = laneZ(1);
  const y = LEVEL_Y[1];
  k.vignette({ id: 'runaway-sheet', title: 'The ghost of the first terrace', story: 'A gust snatched a sheet off a roof line and wrapped it round a passer-by, who now staggers about the lane like a ghost.' }, () => {
    const { a } = line(k, r, 'runaway-sheet');
    k.person({ x: r.x + 0.4, z: r.z + r.d / 2 - 0.45, y: r.y, heading: 0, clip: clip('point.down', 'point'), look: { hat: 'hat.sun', hatTint: 'coral' } });
    stand(k, r, -0.9, a.v + 0.8, clip('talk.shrug', 'wave'), { heading: 0.4 });
    const gx = r.x + 0.6;
    const gz = lz + 0.4;
    const ghost = k.person({ x: gx, z: gz, y, heading: 0.3, clip: clip('wave'), speed: 1.4 });
    k.add(sheetDrape(), { x: gx, z: gz, y, rot: 0.3 });
    k.searchable(ghost, 'the sheet ghost');
    k.person({ x: gx - 1.3, z: gz + 0.6, y, face: [gx, gz], age: 'child', clip: clip('talk.laugh', 'cheer') });
    k.person({ x: gx - 1.9, z: gz + 0.1, y, face: [gx, gz], age: 'child', clip: clip('cheer.jump', 'cheer') });
    k.person({ x: gx + 1.5, z: gz + 0.5, y, face: [gx, gz], age: 'elder', clip: 'stand.stick', hold: holds('hold.stick') });
    k.prop('animal.dog.terrier.stand', { x: gx + 0.9, z: gz + 1.0, y, rot: -2.2 });
  });
}

function pigeonPicnic(k: Kit, roofs: readonly Roof[], taken: Taken): void {
  const r = claimRoof(roofs, taken, 2, 9);
  k.vignette({ id: 'pigeon-picnic', title: 'Picnic raid', story: 'A rooftop picnic is ambushed by a flock of pigeons that lands on the cake while the family flaps and shoos.' }, () => {
    const c = roofCentre(r);
    const t = onRoof(r, c.u, c.v - 0.4);
    k.seated('roof.picnicTable', t, { fill: 1, clips: [clip('sit.talk', 'sit'), 'sit', clip('sit.eat', 'sit')] });
    k.prop('animal.pigeon.flock', { x: t.x, z: t.z, y: t.y + 0.78 });
    k.prop('animal.pigeon.peck', { x: t.x + 1.1, z: t.z + 1.2, y: t.y, rot: 2 });
    const spin = k.spin([t.x, t.y + 2.4, t.z], 1.6, 0, 3);
    for (let i = 0; i < 3; i++) {
      const ang = (i / 3) * Math.PI * 2;
      k.dynamic('animal.gull.flying', spin, { x: Math.cos(ang) * 1.3, y: i * 0.25, z: Math.sin(ang) * 1.3, rot: -ang, tint: 'stone', scale: 0.7 });
    }
    k.person({ x: t.x - 1.6, z: t.z + 0.3, y: r.y, face: [t.x, t.z], clip: 'wave', hold: holds({ key: 'hold.umbrella', tint: 'blue' }, 'holdL.sandwich') });
    k.person({ x: t.x + 1.5, z: t.z + 0.9, y: r.y, face: [t.x, t.z], age: 'child', clip: 'cheer' });
  });
}

function teapotPass(k: Kit, roofs: readonly Roof[], taken: Taken): void {
  const [west, east] = flankingRoofs(roofs, taken, PAIRED_GAPS[1] ?? { level: 2, x0: -7.5, x1: -4.5 });
  k.vignette({ id: 'teapot-pass', title: 'Tea across the alley', story: 'Two neighbours lob a full teapot back and forth across the alley gap at tea time, while a climber below freezes mid-stair.' }, () => {
    const v = 1.0;
    const xa = west.x + west.w / 2 - 0.4;
    const xb = east.x - east.w / 2 + 0.4;
    const z = west.z + v;
    k.person({ x: xa, z, y: west.y, heading: Math.PI / 2, clip: clip('point.across', 'point'), hold: holds('hold.teacup'), look: { hat: 'hat.beret', hatTint: 'sage' } });
    k.person({ x: xb, z, y: east.y, heading: -Math.PI / 2, clip: clip('cheer'), hold: holds('hold.mug', 'upper.cardigan'), look: { lower: opt('lower.dress') } });
    const y = Math.max(west.y, east.y) + 1.25;
    const toss = k.toss([(xa + xb) / 2, y, z], 0, 1.1, 0, (xb - xa) / 2 - 0.35, 0.7);
    k.dynamic(teapot(), toss, {});
    k.prop('cafe.table.round', { x: east.x - east.w / 2 + 1.4, z: z - 1.1, y: east.y });
    k.person({ x: east.x - east.w / 2 + 2.2, z: z - 0.6, y: east.y, heading: -1.2, clip: clip('idle.watch', 'lookout'), age: 'elder' });
    k.person({ x: -6, z: -7.35, y: LEVEL_Y[2], heading: Math.PI, clip: 'lookout', hold: holds('hold.bag') });
  });
}

function catPlank(k: Kit, roofs: readonly Roof[], taken: Taken): void {
  const [west, east] = flankingRoofs(roofs, taken, PAIRED_GAPS[0] ?? { level: 1, x0: -25.5, x1: -22.5 });
  k.vignette({ id: 'cat-plank', title: 'The cat-plank crossing', story: 'Two children tightrope across a plank between roofs behind a strolling cat, while a mother on the far roof waves frantically.' }, () => {
    const mid = (west.x + west.w / 2 + east.x - east.w / 2) / 2;
    const y = Math.max(west.parapetY, east.parapetY) + 0.02;
    const z = west.z + 0.4;
    k.prop('roof.catPlank', { x: mid, z, y });
    k.prop('animal.cat.walk', { x: mid + 0.9, z, y: y + 0.05, rot: Math.PI / 2 });
    const kid = k.person({ x: mid + 0.15, z, y: y + 0.05, heading: Math.PI / 2, age: 'child', clip: clip('tightrope.balance', 'wave'), look: { hat: 'hat.cap', hatTint: 'blue' } });
    k.person({ x: mid - 0.75, z, y: y + 0.05, heading: Math.PI / 2, age: 'child', clip: clip('tightrope.walk', 'tightrope.balance', 'wave') });
    k.searchable(kid, 'the plank walker');
    k.person({ x: east.x - east.w / 2 + 1.3, z: z + 0.5, y: east.y, face: [mid, z], clip: 'wave', look: { lower: opt('lower.dress') } });
    k.person({ x: west.x + west.w / 2 - 1.2, z: z + 0.6, y: west.y, face: [mid, z], age: 'child', clip: 'cheer' });
  });
}

function bandPractice(k: Kit, roofs: readonly Roof[], taken: Taken): void {
  const r = claimRoof(roofs, taken, 2, -17);
  const below = claimRoof(roofs, taken, 1, -16);
  k.vignette({ id: 'band-practice', title: 'Band practice', story: 'The rooftop brass band rehearses at full blast; the dog howls along and the neighbour on the roof below shakes a fist.' }, () => {
    const c = roofCentre(r);
    const s = onRoof(r, c.u, c.v - 0.6);
    k.seated('roof.bandStools', s, { fill: 1, clips: [clip('accordion.squeeze', 'sit'), clip('cello.bow', 'sit'), 'sit'] });
    k.prop('music.tuba', onRoof(r, c.u + 1.9, c.v - 1.3));
    k.person({ x: s.x - 0.6, z: s.z + 1.2, y: r.y, heading: 0, clip: clip('trumpet.fanfare', 'trumpet.play', 'cheer'), hold: holds('hold.trumpet', 'upper.bandjacket') });
    k.person({ x: s.x + 0.6, z: s.z + 1.2, y: r.y, heading: 0, clip: clip('trombone.slide', 'wave'), hold: holds('hold.trombone', 'upper.bandjacket') });
    k.prop('animal.dog.dachshund.sit', { x: s.x + 1.4, z: s.z + 1.3, y: r.y, rot: 0.4 });
    const bc = roofCentre(below);
    k.person({ x: below.x + bc.u, z: below.z + bc.v, y: below.y, face: [s.x, s.z], clip: 'point', hold: holds('hold.newspaper', 'upper.waistcoat'), look: { hat: 'hat.top', hatTint: 'blueDeep' } });
    k.prop('animal.cat.sleep', onRoof(below, bc.u + 1.0, bc.v + 0.4));
    stand(k, below, bc.u - 1.2, bc.v - 0.4, clip('talk.shrug', 'talk'), { face: [bc.u, bc.v] });
  });
}

export function roofStories(k: Kit, roofs: readonly Roof[], taken: Taken): void {
  catPlank(k, roofs, taken);
  teapotPass(k, roofs, taken);
  catLaundry(k, roofs, taken);
  runawaySheet(k, roofs, taken);
  pigeonPicnic(k, roofs, taken);
  bandPractice(k, roofs, taken);
}
