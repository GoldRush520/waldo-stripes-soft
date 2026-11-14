/**
 * Microstories on the quay: net menders with a toddler caught in the net, a sea-shanty session, the
 * gull that steals a fish, the toppling fish boxes, the crane's swinging cargo, the ice-cream stalker
 * gull, the harbourmaster looking the wrong way, and the boatyard's fresh paint.
 */
import type { Ctx } from './ctx';
import { cargoLoad, stolenFish } from './geo';
import { CRANES, FRONT_Z, act, holdOne, holds, opt } from './plan';

function nets(c: Ctx): void {
  const k = c.k;
  k.vignette({ id: 'net-menders', title: 'Mending the big net', story: 'Three net menders sit round a heap of net on the quay, gossiping as they work, not noticing that a toddler has wrapped himself up in it like a parcel.' }, () => {
    k.prop('harbour.netFrame', { x: -37.6, z: -2.95 });
    k.prop('harbour.netHeap', { x: -38.4, z: -1.0 });
    const cx = -38.4;
    const cz = -1.0;
    [2.2, 3.4, 4.4].forEach((a, i) => {
      k.person({ x: cx + Math.sin(a) * 1.15, z: cz + Math.cos(a) * 1.15, face: [cx, cz], hold: i === 1 ? holds('upper.apron', 'hold.landingnet') : ['upper.apron'], clip: i === 1 ? act('net.quay', 'sit.ground') : act('sit.ground', 'sit'), age: i === 2 ? 'elder' : 'adult', look: { hat: opt('hat.headscarf', 'hat.sun'), hatTint: i ? 'blue' : 'coral' } });
    });
    k.person({ x: cx + 0.95, z: cz + 0.2, heading: 0.4, age: 'child', clip: act('kid.tantrum', 'sit.ground', 'cheer') });
    k.person({ x: cx + 2.0, z: cz - 0.6, heading: -1.2, clip: act('talk.laugh', 'cheer'), age: 'elder', hold: ['hold.stick'] });
  });
}

function shanty(c: Ctx): void {
  const k = c.k;
  k.vignette({ id: 'sea-shanty', title: 'What shall we do with the drunken sailor', story: 'An old sailor squeezes his accordion on an upturned barrel while two old salts bellow a shanty, a girl dances a jig and a sheepdog howls along.' }, () => {
    const x = -17.4;
    const z = -1.35;
    k.prop('barrel', { x: x - 0.9, z: z + 0.4 });
    const s = k.person({ x, z, heading: 0.1, clip: act('accordion.polka', 'accordion.squeeze', 'talk.animated'), look: { hat: opt('hat.sailor', 'hat.cap'), hatTint: 'ivory', pattern: 1, shirt: 'blueDeep', shirt2: 'ivory' }, hold: holds('beard.full', 'carry.accordion') });
    k.searchable(s, 'the accordion sailor');
    k.person({ x: x + 1.0, z: z - 0.3, heading: -0.5, clip: act('singer.wide', 'cheer'), age: 'elder', hold: holds('beard.wizard') });
    k.person({ x: x + 1.7, z: z - 0.1, heading: -0.7, clip: act('singer.heart', 'cheer.fistpump', 'cheer'), hold: holds('neck.bandana') });
    k.person({ x: x + 0.6, z: z + 0.75, heading: 0.3, age: 'child', clip: act('jig.kick', 'jig.hands-hips', 'cheer.jump', 'cheer'), look: { lower: 'lower.skirt' } });
    k.prop('animal.dog.sheepdog.sit', { x: x - 0.7, z: z - 0.6, rot: 0.5 });
    k.person({ x: x + 2.4, z: z + 0.5, heading: -1.6, clip: act('cheer.clap', 'cheer') });
  });
}

function gullThief(c: Ctx): void {
  const k = c.k;
  k.vignette({ id: 'gull-thief', title: 'Fish thief!', story: 'While the fishmonger shouts his prices, a gull flaps off with the best fish from his crate. A boy points up, a cat leaps too late and a second gull sizes up the next crate.' }, () => {
    const x = 13.6;
    const z = -1.6;
    k.prop('harbour.fishCrates', { x, z: z + 0.5 });
    k.prop('crate.fish', { x: x + 1.15, z: z + 0.6, rot: 0.2 });
    k.prop('fishbox.ice', { x: x - 1.1, z: z + 0.7 });
    const loop = k.loop([[x - 1.8, 3.2, z], [x, 3.8, z - 1.6], [x + 1.8, 3.2, z], [x, 2.8, z + 1.8]]);
    const m = k.onRoute(loop, 0, 1.6);
    k.dynamic('animal.gull.flying', m);
    k.dynamic(stolenFish(), m, { y: -0.05, z: 0.18, rot: Math.PI / 2 });
    k.prop('animal.gull.standing', { x: x + 1.15, z: z + 0.6, y: 0.42, rot: -0.8 });
    k.person({ x: x - 0.2, z: z - 0.75, heading: Math.PI + 0.3, clip: act('vend.hawk', 'talk'), hold: holds('upper.apron', 'hold.fish.long'), look: { hat: 'hat.cap', hatTint: 'blue', longSleeves: true } });
    k.person({ x: x - 1.5, z: z - 0.8, heading: 0.3, age: 'child', clip: act('point.sky', 'point') });
    k.prop('animal.cat.pounce', { x: x + 0.3, z: z + 1.25, rot: 1.2 });
    k.person({ x: x + 1.6, z: z - 0.9, heading: Math.PI - 0.4, clip: act('talk.haggle', 'talk'), hold: [{ key: 'hold.bag', tint: 'sage' }] });
  });
}

function fishboxes(c: Ctx): void {
  const k = c.k;
  k.vignette({ id: 'fishbox-topple', title: 'One box too many', story: 'A porter has stacked the fish boxes one too high; the tower leans, fish slither out, the porter slips and the fishwife covers her eyes while the harbour cat moves in.' }, () => {
    const x = 5.4;
    const z = -1.35;
    k.prop('fishboxes.toppling', { x, z });
    k.person({ x: x - 1.0, z: z - 0.5, heading: 0.9, clip: act('comedy.slip', 'comedy.trip', 'point.down', 'point'), look: { hat: 'hat.cap', hatTint: 'butter' }, hold: holds('upper.overalls') });
    k.person({ x: x + 1.2, z: z - 0.8, heading: -0.8, clip: act('comedy.facepalm', 'talk.shrug', 'talk'), hold: ['upper.apron'], look: { lower: 'lower.skirt.long', hat: opt('hat.headscarf', 'hat.sun') } });
    k.prop('animal.cat.walk', { x: x + 0.6, z: z + 0.7, rot: -1.6 });
  });
}

function craneSwing(c: Ctx, tug: number): void {
  const k = c.k;
  const cr = CRANES[1];
  k.vignette({ id: 'crane-swing', title: 'Mind your heads!', story: 'The quay crane lowers a net of crates onto the tug, but the load swings like a pendulum: the foreman points, the winch man cranks harder and the tug\'s deckhand ducks.' }, () => {
    k.prop('harbour.winch', { x: cr.x + 1.4, z: cr.z - 0.2, rot: -Math.PI / 2 });
    k.dynamic(cargoLoad(2.4), k.swing([cr.x, 5.1, cr.z + 6.6], 0, 0.45, 0, 0.32, 4));
    k.person({ x: cr.x + 2.1, z: cr.z - 0.3, heading: -Math.PI / 2, clip: act('organ.crank', 'vend.arrange', 'idle.arms'), look: { hat: 'hat.hard', hatTint: 'butter' }, hold: holds('upper.hivis') });
    k.person({ x: cr.x - 1.3, z: cr.z + 0.9, heading: 0.3, clip: act('point.sky', 'point'), look: { hat: 'hat.hard', hatTint: 'coral' }, hold: holds('upper.hivis', 'hold.megaphone') });
    k.person({ x: cr.x - 2.2, z: cr.z + 1.4, heading: 0.6, clip: act('comedy.startle', 'point') });
    if (tug >= 0) k.person({ x: 0.85, z: 1.6, y: 0.45, heading: 0, motion: tug, clip: act('comedy.startle', 'point.sky', 'point'), blob: 0, hold: holds('upper.lifejacket') });
  });
}

function iceCream(c: Ctx): void {
  const k = c.k;
  k.vignette({ id: 'icecream-gull', title: 'The patient gull', story: 'A long queue snakes from the ice-cream cart; the boy at the front has just got a towering cone and a gull on the bollard beside him is already measuring the distance.' }, () => {
    const x = 19.4;
    const z = FRONT_Z + 0.65;
    k.prop('cart.icecream', { x, z });
    k.person({ x: x - 1.25, z, heading: 0.5, clip: act('serve.order', 'vend.handover', 'talk'), look: { hat: 'hat.boater', hatTint: 'coral', pattern: 2, shirt: 'ivory', shirt2: 'coral' } });
    k.person({ x: x + 0.3, z: z + 0.95, heading: 0.6, age: 'child', clip: act('eat.icecream', 'cheer'), hold: holds('hold.icecream') });
    k.prop('harbour.bollard', { x: x + 1.15, z: z + 1.1 });
    k.prop('animal.gull.standing', { x: x + 1.15, z: z + 1.1, y: 0.6, rot: -1.4 });
    k.queue([x + 6.0, z + 1.0], [x + 0.6, z + 1.0], 7, { clips: [act('queue.shuffle', 'stand'), act('queue.impatient', 'stand'), act('idle.phone', 'stand'), 'talk'] });
  });
}

function painters(c: Ctx): void {
  const k = c.k;
  k.vignette({ id: 'fresh-paint', title: 'Fresh paint', story: 'In the boatyard two painters give an upturned rowboat a coat of coral while a small helper paints the dog, and a passer-by discovers the wet bench.' }, () => {
    const x = -52.2;
    const z = -6.2;
    k.prop('boat.rowUpturned', { x, z, rot: Math.PI / 2, tint: 'coral' });
    k.prop('craft.paintCanOpen', { x: x + 1.2, z: z + 1.05 });
    k.person({ x: x - 0.8, z: z + 1.05, heading: Math.PI, clip: act('clean.window', 'garden.prune', 'point'), hold: holds('upper.overalls', 'hold.paintroller'), look: { hat: 'hat.cap', hatTint: 'ivory' } });
    k.person({ x: x + 0.7, z: z + 1.0, heading: Math.PI + 0.2, clip: act('clean.window', 'garden.water', 'point'), hold: holds('upper.smock', 'hold.paintbrush') });
    k.person({ x: x + 1.9, z: z + 1.5, heading: -1.0, age: 'child', clip: act('kid.crouch', 'sit.ground') });
    k.prop('animal.dog.dachshund.stand', { x: x + 2.6, z: z + 1.7, rot: -1.2, tint: 'coral' });
    k.prop('bench.park', { x: x + 1.2, z: -3.0, rot: Math.PI / 2 });
    k.person({ x: x + 1.95, z: -3.4, heading: 1.2, clip: act('comedy.facepalm', 'talk.shrug', 'talk'), look: { pants: 'ivoryShade', longLegs: true } });
  });
}

/** The harbourmaster on the lookout, telescope trained on the town while children tug at him. */
function lookoutStory(c: Ctx, rim: { y: number; x0: number; x1: number; z: number }): void {
  const k = c.k;
  k.vignette({ id: 'wrong-way', title: 'Nothing to report', story: 'High on the lookout the harbourmaster studies the rooftops through his telescope, back turned on the whole boat parade, while two children tug his coat and point at the water.' }, () => {
    k.prop('roof.telescope', { x: rim.x0 + 0.5, z: rim.z, y: rim.y, rot: Math.PI });
    k.person({ x: rim.x0 + 1.15, z: rim.z, y: rim.y, heading: Math.PI, clip: act('lookout', 'idle.behind'), look: { hat: opt('hat.officer', 'hat.sailor'), hatTint: 'blueDeep', longSleeves: true }, hold: holdOne('neck.binoculars') });
    k.person({ x: rim.x0 + 1.8, z: rim.z, y: rim.y, heading: 0.2, age: 'child', clip: act('point.across', 'point') });
    k.person({ x: rim.x0 + 2.4, z: rim.z, y: rim.y, heading: -0.4, age: 'child', clip: act('kid.tug', 'cheer.jump', 'cheer') });
    k.person({ x: rim.x1, z: rim.z, y: rim.y, heading: 0, clip: act('photo.camera', 'wave') });
  });
}

export function quayStories(c: Ctx, rim: { y: number; x0: number; x1: number; z: number }, tug: number): void {
  nets(c);
  shanty(c);
  gullThief(c);
  fishboxes(c);
  craneSwing(c, tug);
  iceCream(c);
  painters(c);
  lookoutStory(c, rim);
}
