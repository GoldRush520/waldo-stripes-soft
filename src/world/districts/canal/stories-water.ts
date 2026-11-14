/**
 * Microstories on the bridges and the water: the photobombed wedding, the frozen rope-bridge
 * crosser, the crowd at the raised drawbridge, the gondolier's serenade, the lost oar and the dog
 * that stole a scarf.
 */
import { type Geo, box, cyl, merge, translate } from '../../../core/geo';
import type { Kit } from '../../kit';
import { WATER_Y } from '../../layout';
import { CLOTHS } from '../shared';
import { rider } from './boats';
import { type BridgeSite, deckPerson, onBridge, site } from './bridges';
import { clip, holds, opt } from './catalog';
import { alongHeading, at, faceWater } from './frame';
import { BARGE, LOST_OAR, OAR, SCARF_RUN, SERENADE } from './spots';

let stiltGeo: Geo | null = null;

/** Two striped trouser-covered stilts, 1.15 m tall, feet at y = 0. */
function stilts(): Geo {
  if (stiltGeo) return stiltGeo;
  const legs = [-0.09, 0.09].flatMap((x) => [
    ...[0, 1, 2, 3, 4].map((i) => translate(cyl(0.075, 0.07, 0.23, i % 2 ? 'ivory' : 'coral', 6), x, i * 0.23, 0)),
    translate(box(0.12, 0.06, 0.2, 'timberDeep'), x, 0, 0.03),
  ]);
  stiltGeo = merge(legs);
  return stiltGeo;
}

function wedding(k: Kit, b: BridgeSite): void {
  k.vignette({ id: 'wedding-photobomb', title: 'The photobombed wedding', story: 'A wedding party poses stiffly on the stone bridge for the photographer on the bank, while a grinning stilt walker towers behind them, waving at the camera.' }, () => {
    const photo = at(k, b.s - 3.3, -7.3);
    const face: [number, number] = [photo.x, photo.z];
    const row: ReadonlyArray<readonly [number, string, Partial<Parameters<Kit['person']>[0]>]> = [
      [-3.6, 'wave', { look: { hat: opt('hat.top'), hatTint: 'blueDeep', shirt: 'blueDeep', pattern: 0, longLegs: true } }],
      [-2.8, clip('greet.hug', 'cheer'), { look: { hat: opt('hat.top', 'hat.boater'), hatTint: 'ink', shirt: 'ink', pattern: 0, pants: 'ink', longLegs: true } }],
      [-2.15, clip('greet.kiss', 'stand'), { look: { shirt: 'ivory', pattern: 0, lower: opt('lower.ballgown', 'lower.dress.long'), hat: opt('hat.flowercrown', 'hat.tiara'), hatTint: 'coralLight' }, hold: holds({ key: 'hold.bouquet', tint: 'coral' }) }],
      [-1.4, 'cheer', { look: { shirt: 'coralLight', pattern: 0, lower: opt('lower.dress'), hat: null } }],
      [-0.75, 'wave', { look: { shirt: 'butterLight', pattern: 0, lower: opt('lower.dress') }, age: 'child' }],
    ];
    row.forEach(([u, c, extra]) => {
      const p = onBridge(k, b, u, 1.1);
      k.person({ ...extra, x: p.x, z: p.z, y: p.y, face, clip: c });
    });
    deckPerson(k, b, -3.2, 1.55, { heading: 0, clip: 'cheer', look: { hat: opt('hat.pillbox', 'hat.sun'), hatTint: 'sage' }, age: 'elder' });
    const st = onBridge(k, b, -2.4, -1.3, 0);
    k.add(stilts(), { x: st.x, z: st.z, y: st.y, rot: st.heading });
    k.person({ x: st.x, z: st.z, y: st.y + 1.15, heading: st.heading + 0.4, clip: 'wave', look: { hat: opt('hat.jester', 'hat.party'), hatTint: 'butter', pattern: 2, shirt: 'butter', shirt2: 'coral' } });
    const tripod = k.person({ x: photo.x, z: photo.z, face: [onBridge(k, b, -2.2, 1.1).x, onBridge(k, b, -2.2, 1.1).z], clip: clip('photo.tripod', 'photo.camera', 'point'), look: { hat: opt('hat.beret'), hatTint: 'ink', shirt: 'ink', pattern: 0 } });
    const helper = at(k, b.s - 3.9, -8.2);
    k.person({ x: helper.x, z: helper.z, face, clip: 'point', hold: [{ key: 'hold.umbrella', tint: 'ivory' }] });
    k.searchable(tripod, 'the wedding photographer');
  });
}

function ropeWobble(k: Kit, b: BridgeSite): void {
  k.vignette({ id: 'rope-wobble', title: 'Frozen on the rope bridge', story: 'Halfway across the sagging plank bridge a man has frozen, arms out, while a small girl skips toward him and her mother waves from the far end.' }, () => {
    const frozen = deckPerson(k, b, -1.3, 0, { heading: Math.PI / 2, clip: clip('tightrope.balance', 'lookout'), look: { hat: opt('hat.bowler', 'hat.top'), hatTint: 'ink' }, hold: holds('back.pack') });
    deckPerson(k, b, 1.0, 0.1, { heading: -Math.PI / 2, clip: clip('jump.skip', 'cheer.jump', 'cheer'), age: 'child', look: { lower: opt('lower.skirt') } });
    const end = onBridge(k, b, 7.2, 0.2, -Math.PI / 2);
    k.person({ x: end.x, z: end.z, heading: end.heading, clip: 'wave' });
    const back = onBridge(k, b, -7.3, -0.4, Math.PI / 2);
    k.person({ x: back.x, z: back.z, heading: back.heading, clip: clip('talk.shrug', 'point') });
    k.searchable(frozen, 'the man frozen on the rope bridge');
  });
}

function drawbridge(k: Kit, b: BridgeSite): void {
  k.vignette({ id: 'drawbridge-wait', title: 'Waiting for the barge', story: 'The drawbridge leaves stand open while a flower barge idles alongside; crowds wait at both ends, the bridge keeper points at his watch and the bargee waves cheerfully.' }, () => {
    for (const side of [-1, 1] as const) {
      [[5.0, -0.8], [5.0, 0.1], [5.0, 0.9], [5.75, -0.4], [5.75, 0.5]].forEach(([u, v], i) => {
        const keeper = side > 0 && i === 2;
        deckPerson(k, b, side * (u ?? 5), v ?? 0, {
          heading: side > 0 ? -Math.PI / 2 : Math.PI / 2,
          clip: keeper ? clip('idle.watch', 'point') : k.rng.pick(['lookout', 'stand', 'talk', clip('idle.tap', 'stand'), clip('read.paper', 'stand')]),
          look: keeper ? { hat: opt('hat.officer', 'hat.cap'), hatTint: 'blueDeep', shirt: 'blueDeep', pattern: 0 } : undefined,
          hold: !keeper && k.rng.chance(0.35) ? [{ key: 'hold.bag', tint: k.rng.pick(CLOTHS) }] : [],
        });
      });
    }
    const p = at(k, BARGE.s, BARGE.d);
    const m = k.bob([p.x, WATER_Y, p.z], alongHeading(BARGE.s, true), 0.55, 0.2, 0.03, 0.015, 6);
    k.dynamic('boat.barge', m, { tint: 'sage' });
    rider(k, m, { x: 0, y: 0.35, z: -4.0, heading: 0, clip: 'wave', look: { hat: opt('hat.sailor', 'hat.cap'), hatTint: 'blue' } });
    rider(k, m, { x: 0.5, y: 0.35, z: 3.4, heading: 0, clip: 'lookout' });
    rider(k, m, { x: -0.5, y: 0.35, z: 3.4, heading: -0.4, clip: clip('idle.hips', 'stand'), hold: holds('upper.apron') });
    k.dynamic('animal.dog.terrier.sit', m, { x: 0, y: 0.35, z: 2.4, rot: 0.3 });
  });
}

function serenade(k: Kit): void {
  k.vignette({ id: 'gondola-serenade', title: 'Serenade for a cat', story: 'A moored gondolier sings his heart out toward the quay, where the only listener is a cat that has turned its back on him; his passengers swoon anyway.' }, () => {
    const p = at(k, SERENADE.s, SERENADE.d);
    const m = k.bob([p.x, WATER_Y, p.z], alongHeading(SERENADE.s, true), 0.6, 1.3, 0.03, 0.02, 4);
    k.dynamic('boat.gondola', m, { tint: 'ink' });
    const singer = rider(k, m, { x: 0.15, y: 0.3, z: -2.65, heading: Math.PI / 2 - 0.5, clip: clip('singer.wide', 'singer.heart', 'wave'), look: { pattern: 1, shirt: 'blueDeep', shirt2: 'ivory', hat: opt('hat.boater'), hatTint: 'coral', pants: 'ink', longLegs: true } });
    rider(k, m, { x: -0.22, y: 0.18 - 0.47, z: -0.35, heading: 0, clip: clip('sway.wave', 'sit') });
    rider(k, m, { x: 0.22, y: 0.18 - 0.47, z: -0.35, heading: 0, clip: clip('sit.talk', 'sit') });
    const cat = at(k, SERENADE.s - 1.1, -5.55);
    k.prop('animal.cat.loaf', { x: cat.x, z: cat.z, y: 0.06, rot: faceWater(SERENADE.s, -1) + Math.PI });
    [[-0.6, -7.2, 'cheer'], [0.6, -7.6, clip('talk.laugh', 'talk')], [1.4, -6.9, 'point']].forEach(([ds, d, c]) => {
      const q = at(k, SERENADE.s + Number(ds), Number(d));
      k.person({ x: q.x, z: q.z, face: [cat.x, cat.z], clip: String(c) });
    });
    k.searchable(singer, 'the singing gondolier');
  });
}

function lostOar(k: Kit): void {
  k.vignette({ id: 'lost-oar', title: 'One oar short', story: 'A rower stands up in his boat pointing at the oar drifting away ahead of him, while his partner shrugs and people on the bank laugh and point the way.' }, () => {
    const p = at(k, LOST_OAR.s, LOST_OAR.d);
    const m = k.bob([p.x, WATER_Y, p.z], alongHeading(LOST_OAR.s, true) + 0.25, 0.9, 0.5, 0.05, 0.05, 4);
    k.dynamic('boat.row', m, { tint: 'coral' });
    k.dynamic('boat.oar', m, { x: 0.35, y: 0.25, z: 0.2, rot: 0.1 });
    rider(k, m, { x: 0, y: 0.08, z: 0.1, heading: 0, clip: 'point', look: { hat: opt('hat.boater'), hatTint: 'butter' } });
    rider(k, m, { x: 0, y: 0.16 - 0.47, z: -1.0, heading: 0, clip: clip('talk.shrug', 'sit') });
    const o = at(k, OAR.s, OAR.d);
    k.dynamic('boat.oar', k.bob([o.x, WATER_Y, o.z], 0.7, 0.7, 0.2, 0.03, 0.06, 2), { y: 0.02 });
    [[73.6, -6.3, 'point'], [74.5, -6.6, clip('talk.laugh', 'cheer')], [75.2, -7.4, 'point']].forEach(([s, d, c]) => {
      const q = at(k, Number(s), Number(d));
      k.person({ x: q.x, z: q.z, face: [o.x, o.z], clip: String(c), age: Number(s) > 75 ? 'child' : 'adult' });
    });
  });
}

function scarfDog(k: Kit): void {
  k.vignette({ id: 'scarf-dog', title: 'The very long scarf', story: 'A terrier races along the east bank trailing a very long striped scarf, its owner sprinting after it, while people on the promenade double up laughing.' }, () => {
    const pts = [SCARF_RUN.s0, (SCARF_RUN.s0 + SCARF_RUN.s1) / 2, SCARF_RUN.s1].map((s): [number, number, number] => {
      const q = at(k, s, SCARF_RUN.d);
      return [q.x, 0, q.z];
    });
    const route = k.street(pts, 0.25);
    k.dynamic('animal.dog.scarf', k.onRoute(route, 3.2, 2.1), { tint: 'coral' });
    k.person({ x: 0, z: 0, motion: k.onRoute(route, 0, 2.1), clip: 'walk', speed: 2.1 / 1.42, look: { hat: opt('hat.beanie', 'hat.cap'), hatTint: 'blue', shirt: 'butter', pattern: 0 } });
    [[42, 8.2, clip('talk.laugh', 'cheer')], [43.1, 8.4, 'point'], [44, 8.1, 'cheer']].forEach(([s, d, c]) => {
      const q = at(k, Number(s), Number(d));
      k.person({ x: q.x, z: q.z, heading: faceWater(Number(s), 1) + 0.3, clip: String(c) });
    });
  });
}

export function waterStories(k: Kit, sites: readonly BridgeSite[]): void {
  wedding(k, site(sites, 'stone'));
  ropeWobble(k, site(sites, 'rope'));
  drawbridge(k, site(sites, 'draw'));
  serenade(k);
  lostOar(k);
  scarfDog(k);
}
