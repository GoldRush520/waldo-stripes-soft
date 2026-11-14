/**
 * Microstories on the banks and the iron bridge: the heron eyeing the anglers' catch, the snoozing
 * angler, ducklings stopping traffic, the swan raiding a picnic, the painter and his critics, the
 * bank café, the accordion waltz on the iron bridge and the toy-boat launch. Also the hero's
 * look-alikes and the open target spots.
 */
import type { Kit } from '../../kit';
import { WATER_Y } from '../../layout';
import { CLOTHS } from '../shared';
import { type BridgeSite, deckPerson, onBridge, site } from './bridges';
import { clip, opt } from './catalog';
import { alongHeading, at, faceWater } from './frame';
import { anglers, seatOn } from './life';
import { ANGLERS, CAFE, LAND_TARGETS, TOY_BOATS } from './spots';

const P = (k: Kit, s: number, d: number): [number, number] => {
  const q = at(k, s, d);
  return [q.x, q.z];
};

function heron(k: Kit): void {
  const a = ANGLERS[0];
  if (!a) return;
  k.vignette({ id: 'heron-catch', title: 'The patient heron', story: 'Three anglers stare at their floats while a heron stands right behind them, quietly helping itself from their bucket of fish; only a small boy has noticed.' }, () => {
    anglers(k, a.s, a.side, a.n);
    const [hx, hz] = P(k, a.s + 2.3, a.side * 6.5);
    k.prop('animal.heron', { x: hx, z: hz, rot: alongHeading(a.s, false) });
    const [cx, cz] = P(k, a.s + 1.9, a.side * 6.9);
    k.prop('harbour.fishCrate', { x: cx, z: cz, rot: 0.4 });
    const [bx, bz] = P(k, a.s + 2.4, a.side * 7.9);
    k.person({ x: bx, z: bz, face: [hx, hz], clip: 'point', age: 'child' });
  });
}

function snoozer(k: Kit): void {
  const a = ANGLERS[1];
  if (!a) return;
  k.vignette({ id: 'snoozing-angler', title: 'Something is biting', story: 'An angler has dozed off on his stool with his line bobbing furiously, while his neighbour frantically points at it.' }, () => {
    anglers(k, a.s, a.side, a.n, true);
    const [x, z] = P(k, a.s - 0.6, a.side * 6.9);
    k.person({ x, z, heading: faceWater(a.s, a.side), clip: clip('point.down', 'point'), look: { hat: opt('hat.bucket', 'hat.sun'), hatTint: 'sage' } });
    const [dx, dz] = P(k, a.s + 0.4, a.side * 4.3);
    k.dynamic('animal.duck', k.bob([dx, WATER_Y, dz], 1.2, 0.8, 0, 0.03, 0.03, 1.5));
  });
}

function ducklings(k: Kit): void {
  k.vignette({ id: 'duckling-crossing', title: 'Ducks have right of way', story: 'A mother duck marches her ducklings across the busy west promenade to the water; a cyclist, a pram and a crowd all stop dead to let them pass.' }, () => {
    const s = 20.5;
    const [x, z] = P(k, s, -7.3);
    k.prop('animal.ducklings', { x, z, rot: faceWater(s, -1) }, { walkThrough: true });
    const [bx, bz] = P(k, s - 1.6, -7.5);
    k.prop('vehicle.bicycle', { x: bx, z: bz, rot: alongHeading(s, true) });
    const [rx, rz] = P(k, s - 1.7, -8.3);
    k.person({ x: rx, z: rz, face: [x, z], clip: clip('idle.hips', 'stand'), look: { hat: opt('hat.cycling', 'hat.cap'), hatTint: 'coral' } });
    const [px, pz] = P(k, s + 1.6, -7.5);
    k.prop('cart.pram', { x: px, z: pz, rot: alongHeading(s, false) });
    const [mx, mz] = P(k, s + 1.7, -8.4);
    k.person({ x: mx, z: mz, face: [x, z], clip: 'lookout' });
    [[0.7, -6.3, 'point', 'child'], [-0.5, -8.6, 'cheer', 'elder'], [0.9, -8.7, clip('cheer.clap', 'cheer'), 'adult']].forEach(([ds, d, c, age]) => {
      const [qx, qz] = P(k, s + Number(ds), Number(d));
      k.person({ x: qx, z: qz, face: [x, z], clip: String(c), age: age as 'child' | 'elder' | 'adult' });
    });
  });
}

function swanPicnic(k: Kit): void {
  k.vignette({ id: 'swan-picnic', title: 'The picnic raider', story: 'A swan has climbed out onto the east bank and is advancing on a picnic blanket; one picnicker fends it off with an umbrella while the others flee with the sandwiches.' }, () => {
    const s = 84.2;
    const [bx, bz] = P(k, s, 7.4);
    k.prop('beach.picnic', { x: bx, z: bz, rot: 0.3 });
    const [hx, hz] = P(k, s + 0.7, 7.1);
    k.prop('luggage.picnicHamper', { x: hx, z: hz, rot: 0.5 });
    const [sx, sz] = P(k, s - 1.3, 6.4);
    k.prop('animal.swan', { x: sx, z: sz, rot: Math.atan2(bx - sx, bz - sz) });
    const [dx, dz] = P(k, s - 0.4, 7.9);
    k.person({ x: dx, z: dz, face: [sx, sz], clip: 'point', hold: [{ key: 'hold.umbrella', tint: 'coral' }], look: { hat: opt('hat.straw.wide', 'hat.sun'), hatTint: 'butter' } });
    [[1.6, 8.1, 'cheer'], [2.3, 7.2, clip('eat.sandwich', 'wave')], [1.2, 6.5, 'wave']].forEach(([ds, d, c], i) => {
      const [qx, qz] = P(k, s + Number(ds), Number(d));
      k.person({ x: qx, z: qz, heading: alongHeading(s, true) + (i - 1) * 0.5, clip: String(c), age: i === 2 ? 'child' : 'adult' });
    });
  });
}

function painter(k: Kit): void {
  k.vignette({ id: 'bridge-painter', title: 'Everyone is a critic', story: 'A painter in a beret captures the iron footbridge at his easel while three onlookers crowd his elbow, one pointing out that he has painted it upside down.' }, () => {
    const s = 92.5;
    const h = alongHeading(s, true);
    const [ex, ez] = P(k, s, -7.1);
    k.prop('craft.easel', { x: ex, z: ez, rot: h + Math.PI });
    const [px, pz] = P(k, s - 0.75, -7.1);
    k.person({ x: px, z: pz, heading: h, clip: clip('paint.brush', 'paint.easel', 'point'), hold: ['upper.apron'], look: { hat: 'hat.beret', hatTint: 'coral', shirt: 'ivory', pattern: 0 } });
    [[-1.2, -6.2, 'point'], [-1.5, -8.1, 'lookout'], [-0.4, -8.4, clip('talk.shrug', 'talk')]].forEach(([ds, d, c]) => {
      const [qx, qz] = P(k, s + Number(ds), Number(d));
      k.person({ x: qx, z: qz, face: [ex, ez], clip: String(c) });
    });
  });
}

function cafe(k: Kit): void {
  k.vignette({ id: 'bank-cafe', title: 'Café on the quay', story: 'Diners crowd the little canal café under its parasols; the waiter sails between tables with a full tray while a duck makes its rounds for crumbs.' }, () => {
    let n = 0;
    for (let s = CAFE.s0 + 0.6; s < CAFE.s1; s += 2.35) {
      const [x, z] = P(k, s, CAFE.d);
      const rot = faceWater(s, -1);
      seatOn(k, 'cafe.set.round2', { x, z, rot, tint: n % 2 ? 'blue' : 'coral' }, { fill: 0.95, clips: [clip('sit.eat', 'sit'), clip('sit.talk', 'sit'), 'sit', clip('drink.cup', 'sit')] }, [0.8, 0.7]);
      k.prop(n % 2 ? 'tabletop.coffee2' : 'tabletop.breakfast', { x, z, rot, y: 0 });
      if (n % 2 === 0) k.prop('parasol.open', { x, z, rot, tint: n % 4 ? 'butter' : 'coral' }, { walkThrough: true });
      n++;
    }
    const cs = CAFE.s0 - 1.6;
    const [cx, cz] = P(k, cs, -7.9);
    const front = alongHeading(cs, false);
    k.prop('cart.coffee', { x: cx, z: cz, rot: front, tint: 'coral' });
    const barista = k.rel({ x: cx, z: cz, rot: front }, 0, -0.8, 0);
    k.person({ ...barista, clip: clip('serve.pour', 'vend.handover', 'talk'), hold: ['upper.apron'], look: { hat: opt('hat.baker', 'hat.cap'), hatTint: 'ivory' } });
    k.queue(P(k, cs - 3.8, -7.9), P(k, cs - 0.4, -7.9), 3, { clips: ['stand', 'lookout', 'talk'] });
    const [wx, wz] = P(k, CAFE.s0 + 4.1, -6.15);
    k.person({ x: wx, z: wz, heading: alongHeading(CAFE.s0, true), clip: clip('serve.tray', 'carry.trayup', 'point'), hold: ['upper.apron'], look: { shirt: 'ivory', pattern: 0, pants: 'ink', longLegs: true } });
    const [dx, dz] = P(k, CAFE.s0 + 5.3, -6.1);
    k.prop('animal.duck', { x: dx, z: dz, rot: alongHeading(CAFE.s0, false) });
    const [ix, iz] = P(k, CAFE.s1 + 0.5, -8.4);
    k.prop('cafe.easel.menu', { x: ix, z: iz, rot: faceWater(CAFE.s1, -1) });
  });
}

function accordion(k: Kit, b: BridgeSite): void {
  k.vignette({ id: 'iron-waltz', title: 'Waltz on the footbridge', story: 'An accordionist plays at the top of the iron footbridge and an elderly couple waltz across the deck while passers-by stop to clap.' }, () => {
    deckPerson(k, b, -2.6, -0.6, { heading: Math.PI / 2, clip: clip('accordion.polka', 'accordion.squeeze', 'talk'), look: { hat: opt('hat.fedora', 'hat.beret'), hatTint: 'blueDeep' } });
    deckPerson(k, b, -1.0, 0.2, { heading: -Math.PI / 2, clip: clip('waltz.lead', 'cheer'), age: 'elder', look: { hat: opt('hat.bowler', 'hat.top'), hatTint: 'ink' } });
    deckPerson(k, b, -1.45, 0.2, { heading: Math.PI / 2, clip: clip('waltz.follow', 'wave'), age: 'elder', look: { lower: opt('lower.dress.long', 'lower.dress') } });
    [[0.6, -0.7], [1.1, 0.7], [2.1, -0.6], [-3.6, 0.5], [-4.3, -0.5], [2.9, 0.75]].forEach(([u, v], i) => {
      deckPerson(k, b, u ?? 0, v ?? 0, { heading: (u ?? 0) > -1.2 ? -Math.PI / 2 : Math.PI / 2, clip: k.rng.pick([clip('cheer.clap', 'cheer'), 'cheer', 'lookout', 'talk']), age: i === 2 ? 'child' : 'adult' });
    });
  });
}

function toyBoats(k: Kit): void {
  k.vignette({ id: 'toy-boats', title: 'The great toy regatta', story: 'Two children lean over the gap in the railing launching toy sailboats, coached a little too enthusiastically by their grandfather.' }, () => {
    const s = TOY_BOATS.s;
    const side = TOY_BOATS.side;
    [-0.6, 0.6].forEach((ds, i) => {
      const [x, z] = P(k, s + ds, side * 5.9);
      k.person({ x, z, heading: faceWater(s, side), clip: i ? 'cheer' : 'point', age: 'child', look: { hat: opt('hat.sailor'), hatTint: 'blue' } });
      const [bx, bz] = P(k, s + ds * 1.4, side * 4.1);
      k.dynamic('boat.toySail', k.bob([bx, WATER_Y, bz], i * 2, 0.9, i, 0.02, 0.06, 1), { tint: i ? 'coral' : 'butter', scale: 1.4 });
    });
    const [gx, gz] = P(k, s, side * 7.0);
    k.person({ x: gx, z: gz, heading: faceWater(s, side), clip: 'point', age: 'elder', hold: ['hold.stick'], look: { hat: opt('hat.sailor', 'hat.cap'), hatTint: 'ivory' } });
  });
}

function decoys(k: Kit): void {
  const spot = (s: number, d: number): { x: number; z: number } => at(k, s, d);
  k.person({ ...spot(14, -7.9), heading: 0.3, clip: 'stand', look: { pattern: 1, shirt: 'coral', shirt2: 'ivory', hat: 'hat.cap', hatTint: 'blue', glasses: null, pants: 'clayDeep', longLegs: true } });
  k.person({ ...spot(66.2, 8.1), heading: -0.4, clip: 'talk', look: { pattern: 1, shirt: 'blue', shirt2: 'ivory', hat: 'hat.bobble', hatTint: 'coral', glasses: 'face.glasses.round', pants: 'cocoa', longLegs: true } });
  k.person({ ...spot(90.2, 8.0), heading: 2.6, clip: 'stand.stick', hold: ['hold.stick'], age: 'elder', look: { pattern: 0, shirt: 'sage', hat: 'hat.bobble', hatTint: 'coral', pants: 'blue', longLegs: true } });
  k.person({ ...spot(40.2, -8.2), heading: 0.9, clip: 'lookout', look: { pattern: 1, shirt: 'coralDeep', shirt2: 'ivory', glasses: 'face.glasses.round', hat: 'hat.beanie', hatTint: 'sage', pants: 'blue', longLegs: true } });
}

function targets(k: Kit, sites: readonly BridgeSite[]): void {
  for (const t of LAND_TARGETS) {
    const p = at(k, t.s, t.d);
    k.targetSpot(p.x, p.z, 0, faceWater(t.s, t.d) + Math.PI + k.rng.range(-0.6, 0.6));
  }
  const stone = onBridge(k, site(sites, 'stone'), 1.4, -1.25, 0.4);
  k.targetSpot(stone.x, stone.z, stone.y, stone.heading);
  const iron = onBridge(k, site(sites, 'iron'), 4.2, 0.3, -1.2);
  k.targetSpot(iron.x, iron.z, iron.y, iron.heading);
}

/** Bystanders that keep the stone and covered decks busy outside the authored scenes. */
function deckCrowds(k: Kit, sites: readonly BridgeSite[]): void {
  const stone = site(sites, 'stone');
  [[2.4, 1.3], [3.2, 1.35], [4.6, -1.3], [0.4, 1.4], [5.4, 1.3]].forEach(([u, v]) => {
    deckPerson(k, stone, u ?? 0, v ?? 0, { heading: (v ?? 0) > 0 ? 0 : Math.PI, clip: k.rng.pick(['lookout', 'wave', 'point', 'talk']), hold: k.rng.chance(0.3) ? [{ key: 'hold.balloon', tint: k.rng.pick(CLOTHS) }] : [] });
  });
  const covered = site(sites, 'covered');
  [[-3.6, 1.05], [-1.2, -1.05], [1.6, 1.05], [3.8, -1.05]].forEach(([u, v]) => {
    deckPerson(k, covered, u ?? 0, v ?? 0, { heading: (v ?? 0) > 0 ? 0 : Math.PI, clip: k.rng.pick(['lookout', 'talk', clip('read.book', 'stand')]) });
  });
}

export function bankStories(k: Kit, sites: readonly BridgeSite[]): void {
  heron(k);
  snoozer(k);
  ducklings(k);
  swanPicnic(k);
  painter(k);
  cafe(k);
  accordion(k, site(sites, 'iron'));
  toyBoats(k);
  decoys(k);
  deckCrowds(k, sites);
  targets(k, sites);
}
