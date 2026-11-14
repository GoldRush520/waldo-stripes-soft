/**
 * More microstories: the sand-sculpture judging, the rock-pool pinch, the donkey rides and the
 * donkey that will not budge, the ice-cream gull on the promenade, the tea dance and the angler on
 * the pier, the pedalo going in circles; plus the partial hero look-alikes.
 */
import { cone, merge, sphere, translate } from '../../../core/geo';
import type { Kit } from '../../kit';
import { CLIP } from './clips';
import { PIER, SAND_Y, SEA_Y, SWIM_Y, WADE_Y, promBand, sandZ, shoreZ, waterZ } from './frame';
import { gaitSpeed } from './gait';
import { HOLD, hold, opt } from './holds';
import { seatProp } from './place';
import { PEDALO_SPIN } from './sea';
import { zone } from './zones';

const Y = SAND_Y;

function sculptures(k: Kit): void {
  const zn = zone('sculpture');
  k.vignette({ id: 'sand-sculpture', title: 'The judge deliberates', story: 'A judge with a clipboard ponders a giant sand turtle against a sand mermaid while a terrier quietly digs away the mermaid’s tail.' }, () => {
    const tx = zn.x0 + 3.5;
    const mx = zn.x1 - 3;
    k.prop('sandsculpture.turtle', { x: tx, z: sandZ(tx, 0.42), y: Y, rot: 0.2 });
    k.prop('sandsculpture.mermaid', { x: mx, z: sandZ(mx, 0.45), y: Y, rot: -0.3 });
    k.prop('animal.dog.terrier.stand', { x: mx + 0.5, z: sandZ(mx, 0.45) + 1.3, y: Y, rot: Math.PI + 0.4 });
    const jx = (tx + mx) / 2;
    k.person({ x: jx, z: sandZ(jx, 0.3), y: Y, heading: 0.1, clip: CLIP.readPaper, hold: hold(HOLD.clipboard), look: { hat: opt('hat.boater'), hatTint: 'blue', longLegs: true, pants: 'ivoryShade' } });
    k.person({ x: tx - 1.6, z: sandZ(tx, 0.42) + 0.8, y: Y, face: [tx, sandZ(tx, 0.42)], clip: CLIP.crouch, hold: hold(HOLD.spade) });
    k.person({ x: mx - 1.0, z: sandZ(mx, 0.45) + 0.9, y: Y, face: [mx, sandZ(mx, 0.45)], clip: CLIP.idleHips, look: { lower: opt('lower.sarong') } });
    for (let i = 0; i < 7; i++) {
      const x = zn.x0 + 1.2 + i * 1.5;
      k.person({ x, z: sandZ(x, 0.66) + k.rng.range(-0.2, 0.2), y: Y, heading: Math.PI + k.rng.range(-0.4, 0.4), clip: k.rng.pick([CLIP.photo, CLIP.clap, CLIP.point, CLIP.talk]), age: k.rng.chance(0.3) ? 'child' : 'adult' });
    }
  });
}

function rockpool(k: Kit): void {
  const zn = zone('rockpool');
  const x = (zn.x0 + zn.x1) / 2;
  const z = sandZ(x, 0.7);
  k.vignette({ id: 'rockpool-pinch', title: 'Pinched!', story: 'Children peer into a rock pool while their father hops on one foot, a small crab still attached to his toe.' }, () => {
    k.prop('beach.rockpool', { x, z, y: Y });
    k.prop('beach.rockpool.water', { x, z, y: Y });
    for (const a of [0.4, 1.4, 2.4]) k.person({ x: x + Math.sin(a) * 1.7, z: z + Math.cos(a) * 1.7, y: Y, face: [x, z], clip: a > 2 ? CLIP.pointDown : CLIP.crouch, age: 'child' });
    k.person({ x: x - 2.4, z: z + 0.6, y: Y, heading: 0.5, clip: CLIP.hop, look: { longLegs: false, hat: opt('hat.bucket'), hatTint: 'sage' } });
    k.prop('animal.crab', { x: x - 2.15, z: z + 0.95, y: Y, rot: 2 });
    k.person({ x: x - 3.4, z: z + 1.6, y: Y, face: [x - 2.4, z + 0.6], clip: CLIP.laugh });
    k.prop('animal.crab', { x: x + 1.5, z: z - 1.3, y: Y, rot: 0.6 });
  });
}

function donkeys(k: Kit): void {
  const zn = zone('donkeys');
  const riderY = 0.92 - 0.47 * 0.65;
  const route = k.loop([
    [zn.x0 + 2, Y, sandZ(zn.x0 + 2, zn.t0 + 0.05)],
    [zn.x1 - 8, Y, sandZ(zn.x1 - 8, zn.t0 + 0.05)],
    [zn.x1 - 8, Y, sandZ(zn.x1 - 8, zn.t1 - 0.05)],
    [zn.x0 + 2, Y, sandZ(zn.x0 + 2, zn.t1 - 0.05)],
  ]);
  for (let i = 0; i < 4; i++) {
    const m = k.onRoute(route, (i / 4) * route.length, 0.6);
    k.dynamic('animal.donkey.panniers', m);
    k.person({ x: 0, z: 0, y: riderY, motion: m, clip: k.rng.pick([CLIP.sit, CLIP.wave, CLIP.rideCheer]), age: 'child', look: { scale: 0.65 } });
    k.person({ x: 0.75, z: 0.3, motion: m, clip: CLIP.walk, speed: gaitSpeed(CLIP.walk, 0.6), hold: hold(HOLD.apron), look: { hat: opt('hat.straw.wide'), hatTint: 'butter' } });
  }
  k.vignette({ id: 'stubborn-donkey', title: 'The donkey that won’t', story: 'One donkey has planted its hooves: the handler hauls on the rope, a small rider bounces in vain and the queue of children for the next ride grows restless.' }, () => {
    const x = zn.x1 - 3.2;
    const z = sandZ(x, (zn.t0 + zn.t1) / 2);
    const sway = k.bob([x, Y, z], -Math.PI / 2, 0.7, 0, 0.015, 0.04, 2);
    k.dynamic('animal.donkey.panniers', sway);
    k.block(x, z, 0.95, 0.5);
    k.person({ x: 0, z: 0, y: riderY, motion: sway, clip: CLIP.rideCheer, age: 'child', look: { scale: 0.62 } });
    k.person({ x: x - 1.3, z: z + 0.1, y: Y, face: [x, z], clip: CLIP.tug, hold: hold(HOLD.rope), look: { hat: opt('hat.straw.wide'), hatTint: 'coral' } });
    k.person({ x: x + 1.2, z: z + 0.3, y: Y, face: [x, z], clip: CLIP.facepalm });
    k.prop('sign.chalk.aframe', { x: x - 1.4, z: z + 2.6, y: Y });
    k.queue([x + 2.4, z + 2.8], [x - 1.0, z + 2.8], 4, { y: Y, clips: [CLIP.impatient, CLIP.tiptoe, CLIP.impatient, CLIP.stand] });
  });
}

function gullIceCream(k: Kit): void {
  const x = -28;
  const [north] = promBand(x);
  const kz = north + 1.0;
  k.vignette({ id: 'gull-icecream', title: 'Daylight robbery', story: 'A gull flaps off over the promenade with a whole ice-cream cone while the girl who bought it wails and her father points helplessly at the sky.' }, () => {
    k.prop('beach.icecreamkiosk', { x, z: kz });
    k.person({ x: x + 1.75, z: kz + 0.2, heading: 0.4, clip: CLIP.laugh, hold: hold(HOLD.apron), look: { hat: opt('hat.sailor'), hatTint: 'ivory' } });
    k.queue([x - 4.4, kz + 1.45], [x - 0.6, kz + 1.45], 4, { clips: [CLIP.stand, CLIP.eatIce, CLIP.idlePhone, CLIP.lookout] });
    const cz = shoreZ(x) - 1.05;
    k.person({ x: x + 0.6, z: cz, heading: 0.3, clip: CLIP.tantrum, age: 'child', look: { lower: opt('lower.dress'), shirt: 'butter', pattern: 0 } });
    k.person({ x: x + 1.5, z: cz - 0.3, heading: 0.6, clip: CLIP.pointSky, look: { hat: opt('hat.cap'), hatTint: 'blue' } });
    const loop = k.loop([[x - 1, 3.6, cz - 2], [x + 4, 4.2, cz - 1], [x + 6, 4.8, cz + 3], [x + 1, 4.2, cz + 2]]);
    const m = k.onRoute(loop, 0, 2.4);
    k.dynamic('animal.gull.flying', m);
    const cone3 = merge(translate(cone(0.05, 0.16, 'butterDeep', 6), 0, -0.2, 0.18), translate(sphere(0.06, 'coralLight', 6, 4), 0, -0.02, 0.18));
    k.dynamic(cone3, m, { tint: 'butter' });
    k.prop('animal.gull.standing', { x: x + 3.2, z: shoreZ(x + 3.2) - 0.12, y: 1.02, rot: Math.PI });
  });
}

function teaDance(k: Kit): void {
  const h = PIER.head;
  const z = h.z1 - 2.2;
  k.vignette({ id: 'tea-dance', title: 'Tea dance on the pier', story: 'An accordionist plays outside the pavilion while two elderly couples waltz on the pier head and a deck-chair audience either claps along or nods off.' }, () => {
    const acc = k.person({ x: PIER.x, z: z - 0.6, y: PIER.deckY, heading: 0, clip: CLIP.accordion, hold: hold(HOLD.accordion), look: { hat: opt('hat.boater'), hatTint: 'coral' } });
    k.searchable(acc, 'the pier accordionist');
    for (const cx of [PIER.x - 2.6, PIER.x + 2.6]) {
      k.person({ x: cx, z: z + 0.1, y: PIER.deckY, heading: Math.PI, clip: CLIP.waltzLead, age: 'elder', look: { longLegs: true } });
      k.person({ x: cx, z: z + 0.55, y: PIER.deckY, heading: 0, clip: CLIP.waltzFollow, age: 'elder', look: { lower: opt('lower.dress.long'), longLegs: true } });
    }
    seatProp(k, 'beach.deckchair', { x: h.x0 + 1.2, z: z + 0.4, y: PIER.deckY, rot: Math.PI / 2, tint: 'blue' }, { clips: [CLIP.sitAsleep], fill: 1, age: 'elder' });
    seatProp(k, 'beach.deckchair', { x: h.x0 + 1.2, z: z - 1.0, y: PIER.deckY, rot: Math.PI / 2, tint: 'coral' }, { clips: [CLIP.sitTalk], fill: 1, age: 'elder' });
    seatProp(k, 'beach.deckchair', { x: h.x1 - 1.8, z: z - 0.9, y: PIER.deckY, rot: -Math.PI / 2, tint: 'butter' }, { clips: [CLIP.sitTalk], fill: 1, age: 'elder' });
    k.person({ x: PIER.x + 4.6, z: z + 1.0, y: PIER.deckY, face: [PIER.x, z], clip: CLIP.clap });
  });
}

function angler(k: Kit): void {
  const h = PIER.head;
  k.vignette({ id: 'got-away', title: 'The one that got away', story: 'An angler reels in an empty hook as the fish he was after leaps clear behind him, spotted only by a small boy and an interested gull.' }, () => {
    k.person({ x: h.x0 + 0.55, z: 32.5, y: PIER.deckY, heading: -Math.PI / 2, clip: CLIP.fishHaul, hold: hold(HOLD.rod), look: { hat: opt('hat.bucket'), hatTint: 'sage', glasses: null } });
    k.person({ x: h.x0 + 1.2, z: 33.4, y: PIER.deckY, heading: -1.9, clip: CLIP.point, age: 'child' });
    const m = k.toss([h.x0 - 2.2, SEA_Y, 33.8], 0.3, 0.45, 0, 1.4, 1.6);
    k.dynamic('animal.fish.jumping', m);
    k.prop('animal.gull.standing', { x: h.x0 + 0.12, z: 31.2, y: PIER.deckY + 1.05, rot: -Math.PI / 2 });
  });
}

function pedaloCircles(k: Kit): void {
  const [x, d] = PEDALO_SPIN;
  const z = waterZ(x) + d;
  k.vignette({ id: 'pedalo-circles', title: 'Going in circles', story: 'A couple on a pedal boat pedal furiously in opposite directions, so the boat turns slow circles while each blames the other.' }, () => {
    const m = k.spin([x, SEA_Y, z], 0.35, 0, 4);
    k.dynamic('boat.pedalo', m, { x: 1.6, rot: 0, tint: 'coral' });
    k.seated('boat.pedalo', { x: 1.6, z: 0 }, { motion: m, place: false, clips: [CLIP.animated, CLIP.shrug], fill: 1 });
    k.person({ x: x - 3, z: z + 1.5, y: SWIM_Y, face: [x, z], clip: CLIP.treadWave, blob: 0 });
  });
}

function lookAlikes(k: Kit): void {
  k.person({ x: -38.6, z: shoreZ(-38.6) - 0.6, heading: 0.2, clip: CLIP.lookout, look: { pattern: 1, shirt: 'coral', shirt2: 'ivory', hat: opt('hat.sun'), hatTint: 'ivory', glasses: null, pants: 'clayDeep', longLegs: true } });
  k.person({ x: 12.4, z: sandZ(12.4, 0.12) - 0.2, y: Y, heading: -0.4, clip: CLIP.stand, look: { pattern: 0, shirt: 'blue', hat: 'hat.bobble', hatTint: 'coral', glasses: 'face.glasses.round', pants: 'blue', longLegs: false } });
  k.person({ x: PIER.x + 1.9, z: 17.5, y: PIER.deckY, heading: 1.3, clip: CLIP.standStick, hold: ['hold.stick'], age: 'elder', look: { pattern: 1, shirt: 'blue', shirt2: 'ivory', hat: opt('hat.fedora'), hatTint: 'clay', glasses: 'face.glasses.round', pants: 'cocoa', longLegs: true } });
  k.person({ x: -36, z: waterZ(-36) + 2.2, y: WADE_Y, heading: 0.3, clip: CLIP.splash, blob: 0, look: { pattern: 1, shirt: 'coral', shirt2: 'ivory', hat: 'hat.bobble', hatTint: 'coral', glasses: null, pants: 'sage', longLegs: false } });
  k.person({ x: 31.5, z: shoreZ(31.5) - 2.9, heading: 0.1, clip: CLIP.readMap, look: { pattern: 6, shirt: 'coral', shirt2: 'ivory', hat: 'hat.beanie', hatTint: 'coral', glasses: 'face.glasses.round', pants: 'slate', longLegs: true } });
}

export function buildMoreStories(k: Kit): void {
  sculptures(k);
  rockpool(k);
  donkeys(k);
  gullIceCream(k);
  teaDance(k);
  angler(k);
  pedaloCircles(k);
  lookAlikes(k);
}
