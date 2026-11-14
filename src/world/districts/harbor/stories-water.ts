/**
 * Microstories on the water and the jetties: the old boot, the octopus and the oblivious angler, the
 * rowing gig out of sync, the dog that commands a kayak, the lighthouse cake, the floating wedding,
 * the judges' barge, a hat overboard, the missed water taxi, the seal show and the lighthouse painter.
 */
import { propGeo } from '../../../props/registry';
import { type Ctx, claim } from './ctx';
import { bootOnLine, floatingHat, proppedRod } from './geo';
import { moor, ride } from './boats';
import type { ParadeUnits } from './parade';
import { BW_X, BW_Z, HIP, JETTIES, JETTY_Y, PARADE, PATH_Y, TEE, WATER, act, holdOne, holds, opt } from './plan';

const Y = JETTY_Y;

function boot(c: Ctx): void {
  const k = c.k;
  const j = JETTIES[0];
  if (!j) return;
  const x = j.x;
  const z = j.len - 0.55;
  k.vignette({ id: 'old-boot', title: 'The catch of the day', story: 'A proud fisherman at the end of the west jetty hauls up his prize: a dripping old boot. His wife laughs, a boy points, and the cat waits for a fish that will never come.' }, () => {
    const f = k.person({ x, z, y: Y, heading: 0, clip: act('fish.haul', 'point.down', 'point'), look: { hat: opt('hat.sailor', 'hat.cap'), hatTint: 'blueDeep', pattern: 0, shirt: 'butter' }, hold: holds('beard.full', 'upper.overalls') });
    k.searchable(f, 'the fisherman with the old boot');
    k.add(proppedRod(), { x: x + 0.5, z: z - 0.1, y: Y });
    claim(c, { x0: x - 1.6, z0: j.len - 0.2, x1: x + 1.6, z1: j.len + 3.2 });
    k.dynamic(bootOnLine(1.3), k.swing([x + 0.5, Y + 2.2, z + 1.8], 0, 0.55, 0, 0.22, 3));
    k.person({ x: x - 0.6, z: z - 0.5, y: Y, heading: 0.5, clip: act('talk.laugh', 'cheer'), look: { lower: 'lower.dress', hat: 'hat.sun' } });
    k.person({ x: x + 0.65, z: z - 0.9, y: Y, heading: -0.3, age: 'child', clip: act('point.down', 'point') });
    k.prop('animal.cat.sit', { x: x - 0.25, z: z - 1.4, y: Y, rot: 0.2 });
    k.prop('icebucket', { x: x + 0.5, z: z - 0.55, y: Y });
  });
}

function octopus(c: Ctx): void {
  const k = c.k;
  const j = JETTIES[2];
  if (!j) return;
  const x = j.x;
  const z = j.len - 0.6;
  k.vignette({ id: 'octopus', title: 'Something is biting', story: 'An angler on the east jetty dozes over his rod while a curious octopus rises right beside him and reaches for his bait tin. Everyone behind him is pointing; he has not noticed a thing.' }, () => {
    k.add(propGeo('cafe.stool'), { x, z, y: Y });
    const a = k.person({ x, z: z + 0.05, y: Y + 0.45 - HIP, heading: 0.15, clip: act('fish.sit', 'sit.asleep', 'sit'), look: { hat: opt('hat.bucket', 'hat.sun'), hatTint: 'sage' }, hold: holds('upper.waistcoat', 'hold.fishingrod') });
    k.searchable(a, 'the angler who has not seen the octopus');
    k.dynamic('animal.octopus', k.bob([x + 1.1, WATER, z + 1.4], -0.7, 0.45, 0, 0.12, 0.05, 2));
    claim(c, { x0: x - 1.6, z0: j.len - 0.2, x1: x + 2.6, z1: j.len + 3 });
    k.prop('harbour.fishCrate', { x: x + 0.6, z: z - 0.1, y: Y, rot: 0.3 });
    k.person({ x: x - 0.5, z: z - 1.6, y: Y, heading: 0.4, clip: act('point.across', 'point'), age: 'child', hold: holds('hold.kidnet') });
    k.person({ x: x + 0.5, z: z - 1.9, y: Y, heading: 0.2, clip: act('comedy.startle', 'point') });
    k.person({ x: x - 0.2, z: z - 2.7, y: Y, heading: 0.1, clip: act('photo.camera', 'lookout'), hold: holds('neck.camera') });
  });
}

function hatOverboard(c: Ctx): void {
  const k = c.k;
  const j = JETTIES[1];
  if (!j) return;
  const x = j.x - 0.55;
  const z = 7.6;
  k.vignette({ id: 'hat-overboard', title: 'Hat overboard', story: 'A gust has taken a straw boater into the harbour. Its owner lies flat on the jetty stretching for it while a friend anchors his ankles and a small dog supervises.' }, () => {
    claim(c, { x0: x - 2.3, z0: z - 1.6, x1: x - 0.3, z1: z + 1.6 });
    k.dynamic(floatingHat(), k.bob([x - 1.35, WATER, z + 0.3], 0, 0.8, 0, 0.04, 0.1, 1));
    k.person({ x: x + 0.2, z, y: Y, heading: -Math.PI / 2, clip: act('lie.front', 'point.down', 'point'), look: { hat: null, pattern: 2, shirt: 'ivory', shirt2: 'blue' } });
    k.person({ x: x + 1.15, z: z + 0.15, y: Y, heading: -Math.PI / 2, clip: act('kid.tug', 'point.down', 'point') });
    k.prop('animal.dog.terrier.sit', { x: x + 0.9, z: z + 0.85, y: Y, rot: -1.2 });
    k.person({ x: x + 1.0, z: z - 1.0, y: Y, heading: -2.4, clip: act('talk.laugh', 'cheer') });
  });
}

function missedTaxi(c: Ctx): void {
  const k = c.k;
  k.vignette({ id: 'missed-taxi', title: 'The water taxi has left', story: 'Passengers with suitcases wait on the T-head landing stage. The water taxi has joined the parade instead, and a late traveller waves his hat at it in despair.' }, () => {
    const z = TEE.z;
    for (let i = 0; i < 6; i++) {
      const x = TEE.x - 3.4 + i * 0.85;
      k.person({ x, z: z - 0.35, y: Y, heading: 0.3 + (i % 2) * 0.4, clip: k.rng.pick([act('queue.impatient', 'stand'), act('idle.watch', 'stand'), act('queue.tiptoe', 'lookout')]), hold: i % 2 ? holdOne('hold.suitcase.small', 'hold.bag') : holds('back.rucksack') });
      if (i % 2 === 0) k.prop(i % 4 ? 'luggage.suitcase.m' : 'luggage.suitcase.l', { x: x + 0.38, z: z + 0.35, y: Y, rot: 0.2, tint: k.rng.pick(['coral', 'blue', 'butter'] as const) });
    }
    k.person({ x: TEE.x + 2.6, z: z + 0.3, y: Y, heading: 0.6, clip: act('greet.bigwave', 'wave'), look: { hat: 'hat.top', hatTint: 'blueDeep' }, hold: ['hold.umbrella'] });
  });
}

function sealShow(c: Ctx): void {
  const k = c.k;
  k.vignette({ id: 'seal-show', title: 'The seal steals the show', story: 'A seal on its rock balances a beach ball while the people walking out to the lighthouse stop to clap and photograph it.' }, () => {
    k.dynamic('ball.beach', k.toss([BW_X + 4.4, WATER + 1.25, 30.6], 0, 2.4, 0, 0.05, 0.5));
    for (let i = 0; i < 5; i++) {
      k.person({ x: BW_X + 0.45 - (i % 2) * 0.6, z: 28.9 + i * 0.75, y: PATH_Y, heading: Math.PI / 2 + k.rng.range(-0.3, 0.3), clip: k.rng.pick([act('cheer.clap', 'cheer'), act('photo.camera', 'lookout'), 'point', act('cheer.jump', 'cheer')]), age: i === 2 ? 'child' : 'adult' });
    }
  });
}

function painter(c: Ctx): void {
  const k = c.k;
  k.vignette({ id: 'lighthouse-painter', title: 'A model sitter', story: 'An artist on the breakwater paints the lighthouse, unaware that a gull has settled on her hat to pose. Two passers-by whisper about which one is the real subject.' }, () => {
    const x = -44.5;
    const z = BW_Z + 0.3;
    k.person({ x, z, y: PATH_Y, heading: Math.PI / 2, clip: act('clean.window', 'garden.prune', 'point'), look: { hat: 'hat.beret', hatTint: 'coral' }, hold: holds('upper.smock', 'hold.paintbrush', 'holdL.palette') });
    k.prop('craft.easel', { x: x + 0.8, z, y: PATH_Y, rot: -Math.PI / 2 });
    k.prop('animal.gull.standing', { x, z, y: PATH_Y + 1.78, rot: 0.6 });
    k.person({ x: x - 1.1, z: z - 0.35, y: PATH_Y, heading: 1.2, clip: act('talk.whisper', 'talk') });
    k.person({ x: x - 1.3, z: z + 0.45, y: PATH_Y, heading: 1.9, clip: act('idle.behind', 'stand'), age: 'elder' });
  });
}

function paradeStories(c: Ctx, p: ParadeUnits): void {
  const k = c.k;
  const gig = p.m.get('gig') ?? -1;
  k.vignette({ id: 'rowing-gig', title: 'Stroke! Stroke? Stroke...', story: 'The harbour rowing club gig joins the parade: four rowers, four different rhythms, one of them facing the wrong way, and a cox bellowing through cupped hands.' }, () => {
    const crew: ReadonlyArray<readonly [number, number, string, number]> = [
      [1.5, Math.PI, act('row.pull', 'sit'), 0],
      [0.65, Math.PI, act('row.pull', 'sit'), 0.5],
      [-0.2, 0, act('row.easy', 'sit'), 0.2],
      [-1.05, Math.PI, act('row.pull', 'sit.talk', 'sit'), 0.8],
    ];
    crew.forEach(([z, heading, clip, phase], i) => {
      k.person({ x: 0, z, y: 0.12 - HIP, heading, motion: gig, clip, phase, blob: 0, look: { pattern: 1, shirt: 'blue', shirt2: 'ivory', hat: null } });
      k.dynamic('boat.oar', gig, { x: i % 2 ? -0.38 : 0.38, y: 0.42, z: z + 0.2, rot: i % 2 ? Math.PI + 0.2 : -0.2 });
    });
    k.person({ x: 0, z: -1.85, y: 0.12 - HIP, heading: 0, motion: gig, clip: act('talk.animated', 'point'), blob: 0, look: { hat: 'hat.cap', hatTint: 'coral' }, hold: holds('neck.whistle') });
  });
  const kayak = p.m.get('kayak') ?? -1;
  k.vignette({ id: 'kayak-captain', title: 'Captain Biscuit', story: 'A terrier stands proudly at the bow of a kayak like a figurehead, while its owner does all the paddling.' }, () => {
    k.person({ x: 0, z: -0.1, y: -0.03 - HIP, heading: 0, motion: kayak, clip: act('kayak.paddle', 'sit'), blob: 0, hold: holds('upper.lifejacket', 'hold.paddle') });
    k.dynamic('animal.dog.terrier.stand', kayak, { x: 0, y: 0.18, z: 1.05 });
  });
  const cake = p.m.get('cakeFloat') ?? -1;
  k.vignette({ id: 'cake-float', title: 'Let them eat lighthouse', story: 'The bakery float carries a giant lighthouse cake; the baker guards it with a cake slice while a gull has already landed on the top tier.' }, () => {
    const jobs: ReadonlyArray<readonly [string, string]> = [[act('serve.tray', 'wave'), 'hold.tray.pastries'], ['wave', 'hold.baguette'], [act('eat.sandwich', 'cheer'), 'hold.cake'], [act('greet.bigwave', 'wave'), 'hold.rollingpin']];
    ride(c, 'boat.float.lighthouseCake', cake, (i) => {
      const [clip, held] = jobs[i % jobs.length] ?? ['wave', 'hold.cake'];
      return { clip, hold: holds('upper.chefjacket', held), look: { hat: opt('hat.baker', 'hat.toque'), hatTint: 'ivory' } };
    });
    k.dynamic('animal.gull.standing', cake, { x: 0, y: 3.6, z: 0.2 });
  });
  const flower = p.m.get('flowerFloat') ?? -1;
  k.vignette({ id: 'floating-wedding', title: 'Just married, just afloat', story: 'A bride and groom kiss under the flower arch of the last float while their guests throw petals and the best man fishes the ring out of his pockets one at a time.' }, () => {
    k.person({ x: -0.3, z: 0.1, y: 0.35, heading: Math.PI / 2, motion: flower, clip: act('greet.kiss', 'greet.hug', 'wave'), blob: 0, look: { lower: 'lower.dress.long', shirt: 'ivory', pattern: 0, hairStyle: 'hair.bun', hat: opt('hat.flowercrown'), hatTint: 'coralLight' }, hold: holdOne('hold.bouquet') });
    k.person({ x: 0.3, z: 0.1, y: 0.35, heading: -Math.PI / 2, motion: flower, clip: act('greet.kiss', 'greet.hug', 'wave'), blob: 0, look: { shirt: 'ink', pattern: 0, hat: 'hat.top', hatTint: 'ink', lower: opt('lower.coattails'), longLegs: true }, hold: holds('upper.bowtie') });
    k.seated('boat.float.flowerArch', { x: 0, z: 0 }, { motion: flower, place: false, fill: 1, clips: [act('cheer.clap', 'cheer'), act('cheer.jump', 'cheer'), 'wave', act('talk.shrug', 'talk')] });
  });
}

function judges(c: Ctx): void {
  const k = c.k;
  k.vignette({ id: 'judges', title: 'The parade judges', story: 'Three judges stand on a moored barge inside the parade loop holding up scores: one enthusiastic, one stern, and one fast asleep against the planters.' }, () => {
    const m = moor(c, 'boat.barge', PARADE.cx, PARADE.cz, Math.PI / 2, { fill: 0 });
    if (m < 0) return;
    k.person({ x: 0, z: -4, y: 0.35, heading: 0, motion: m, clip: act('cheer.jump', 'cheer'), blob: 0, look: { hat: 'hat.boater', hatTint: 'coral' }, hold: holds('hold.placard') });
    k.person({ x: 0.5, z: 3.4, y: 0.35, heading: 0, motion: m, clip: act('idle.arms', 'stand'), blob: 0, look: { hat: 'hat.top', hatTint: 'blueDeep', glasses: opt('face.monocle') }, hold: holds('hold.placard') });
    k.person({ x: -0.5, z: 3.4, y: 0.33, heading: 0, motion: m, clip: act('sit.asleep', 'sit'), blob: 0, look: { hat: 'hat.sun', hatTint: 'butter' } });
  });
}

export function waterStories(c: Ctx, p: ParadeUnits): void {
  boot(c);
  octopus(c);
  hatOverboard(c);
  missedTaxi(c);
  sealShow(c);
  painter(c);
  paradeStories(c, p);
  judges(c);
}
