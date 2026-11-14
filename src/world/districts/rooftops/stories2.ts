/**
 * Microstories, part 2: the nosy astronomer and the tin bath, the chimney sweeps, the kite caught on
 * the water tower (the district landmark), the belvedere painter, the stair race and the pigeon
 * fancier calling his flock home.
 */
import type { Kit } from '../../kit';
import { clip, holds, opt } from './cast';
import { type Roof, claimRoof } from './houses';
import { BELVEDERE, FRONT_Z, LEVEL_Y, laneZ, rowZ } from './plan';
import { onRoof, roofCentre, stand } from './roofLife';
import type { Taken } from './stories';

/** Local position of the water tower (the hill-top landmark). */
export const WATER_TOWER = { x: -14, z: rowZ(3) } as const;

function astronomer(k: Kit, roofs: readonly Roof[], taken: Taken): void {
  const bath = claimRoof(roofs, taken, 2, 15);
  const scope = claimRoof(roofs, taken, 3, 16);
  k.vignette({ id: 'nosy-astronomer', title: 'Daytime astronomy', story: 'An old stargazer has trained his telescope on the roof below, where a bather in a tin bath is not amused.' }, () => {
    const c = roofCentre(bath);
    const b = onRoof(bath, c.u, c.v - 0.2);
    k.prop('roof.tinBath', b);
    const bather = k.person({ x: b.x, z: b.z, y: b.y - 0.17, heading: Math.PI, clip: clip('sit.talk', 'sit'), look: { hat: opt('hat.swimcap', 'hat.beanie'), hatTint: 'butter' } });
    k.searchable(bather, 'the bather');
    k.person({ x: b.x + 1.2, z: b.z + 0.6, y: bath.y, heading: Math.PI, clip: clip('laundry.shake', 'wave'), look: { lower: opt('lower.dress.long') } });
    stand(k, bath, c.u - 1.6, c.v + 0.6, clip('talk.laugh', 'cheer'), { face: [c.u, c.v] });
    const sc = roofCentre(scope);
    const s = onRoof(scope, sc.u, sc.v + 0.9, Math.PI);
    k.prop('roof.telescope', { ...s, rot: Math.PI + 0.2 });
    k.person({ x: s.x, z: s.z - 0.6, y: scope.y, heading: 0.1, clip: 'lookout', age: 'elder', hold: holds('neck.binoculars', 'upper.cardigan'), look: { hat: opt('hat.deerstalker', 'hat.beret'), hatTint: 'clayDeep', glasses: 'face.glasses.round' } });
    stand(k, scope, sc.u + 1.1, sc.v + 0.4, clip('point.down', 'point'), { heading: 0.2, child: true });
  });
}

function sweeps(k: Kit, roofs: readonly Roof[], taken: Taken): void {
  const r = claimRoof(roofs, taken, 3, -27);
  k.vignette({ id: 'chimney-sweeps', title: 'Wrong chimney', story: 'One chimney sweep pops out of the chimney pots, sooty and waving, while his partner peers hopefully down a different stack.' }, () => {
    const c = roofCentre(r);
    const pots = onRoof(r, c.u - 0.6, c.v - 0.6);
    k.prop('roof.chimneyPots', pots);
    const sweep = k.person({ x: pots.x + 0.15, z: pots.z, y: r.y - 0.05, heading: 0, clip: 'wave', blob: 0, hold: holds('hold.featherduster'), look: { hat: 'hat.top', hatTint: 'cocoa', shirt: 'cocoa', pattern: 0 } });
    k.searchable(sweep, 'the chimney sweep');
    const other = onRoof(r, c.u + 1.5, c.v - 0.8);
    k.prop('roof.umbrellaChimney', other);
    k.person({ x: other.x - 0.3, z: other.z + 0.7, y: r.y, heading: Math.PI, clip: clip('point.down', 'lookout'), hold: holds('hold.broom', 'hold.stick'), look: { hat: 'hat.top', hatTint: 'ink', shirt: 'cocoa', pattern: 0 } });
    k.prop('roof.ladder', onRoof(r, c.u - 1.9, c.v + 0.3, 0.2));
    stand(k, r, c.u + 0.4, c.v + 1.0, clip('point'), { face: [c.u - 0.6, c.v - 0.6] });
  });
}

function kiteTower(k: Kit): void {
  const y = LEVEL_Y[3];
  k.prop('tower.water', { x: WATER_TOWER.x, z: WATER_TOWER.z, y }, {});
  k.block(WATER_TOWER.x, WATER_TOWER.z, 3.8, 3.8);
  const lz = laneZ(3);
  k.vignette({ id: 'kite-tower', title: 'The kite that got away', story: 'A coral kite has snagged on the water-tower roof; its small owner points up while dad studies the problem and a rival kite soars past.' }, () => {
    const stuck = k.bob([WATER_TOWER.x + 1.6, y + 11.6, WATER_TOWER.z + 1.2], 0.3, 0.9, 0, 0.08, 0.2, 3);
    k.dynamic('air.kite.diamond', stuck, { tint: 'coral' });
    k.person({ x: WATER_TOWER.x + 0.6, z: lz + 0.2, y, heading: Math.PI, age: 'child', clip: clip('point.sky', 'point') });
    k.person({ x: WATER_TOWER.x - 0.5, z: lz + 0.5, y, heading: Math.PI - 0.2, clip: 'lookout', hold: holds('back.kite'), look: { hat: 'hat.cap', hatTint: 'sage' } });
    k.person({ x: WATER_TOWER.x - 1.6, z: lz - 0.1, y, heading: 0.3, clip: clip('talk.laugh', 'talk'), age: 'child' });
    const soar = k.bob([WATER_TOWER.x + 8, y + 9, lz - 3], 0, 0.7, 1.2, 0.5, 0.3, 4);
    k.dynamic('air.kite.box', soar, { tint: 'blue' });
    k.person({ x: WATER_TOWER.x + 6.5, z: lz + 0.6, y, heading: Math.PI + 0.4, age: 'child', clip: clip('point.sky', 'cheer') });
  });
}

function painter(k: Kit): void {
  const y = LEVEL_Y[1];
  const x = (BELVEDERE.x0 + BELVEDERE.x1) / 2;
  const z = BELVEDERE.z - 1.4;
  k.vignette({ id: 'belvedere-painter', title: 'View obstructed', story: 'A painter on the belvedere tries to paint the town below while a tourist plants himself in front of the easel for a selfie.' }, () => {
    k.prop('craft.easel', { x: x - 1.2, z: z - 0.1, y, rot: Math.PI });
    k.person({ x: x - 1.2, z: z - 0.9, y, heading: Math.PI, clip: clip('point'), hold: holds('upper.smock', 'hold.paintbrush', 'holdL.palette'), look: { hat: 'hat.beret', hatTint: 'coral' } });
    k.person({ x: x - 1.2, z: z + 1.0, y, heading: 0, clip: clip('photo.selfie', 'wave'), hold: holds('back.pack', 'hold.selfiestick', 'neck.camera'), look: { hat: 'hat.sun', hatTint: 'butter', glasses: 'face.sunglasses' } });
    for (let i = 0; i < 4; i++) k.person({ x: x + 0.8 + i * 0.8, z: BELVEDERE.z - 0.75, y, heading: 0, clip: i % 2 ? 'lookout' : clip('idle.watch', 'point') });
  });
}

function stairRace(k: Kit): void {
  const top = FRONT_Z[1];
  k.vignette({ id: 'stair-race', title: 'Race to the top', story: 'Children race up the grand stairs past a grandmother who has stopped on the top landing to catch her breath and her shopping.' }, () => {
    k.person({ x: -9.9, z: top - 1.0, y: LEVEL_Y[1], heading: 0.3, age: 'elder', clip: 'stand.stick', hold: holds('hold.stick', { key: 'hold.bag', tint: 'coral' }) });
    k.prop('crate.apples', { x: -9.1, z: top - 0.8, y: LEVEL_Y[1] });
    k.person({ x: -14.6, z: top + 4.4, y: 0, heading: Math.PI, clip: 'wave', look: { lower: opt('lower.skirt') } });
    k.person({ x: -9.3, z: top + 4.1, y: 0, heading: Math.PI, age: 'child', clip: 'cheer' });
  });
  k.walkers([[-12.6, 0, top + 6.2], [-12.6, 0, top + 3.6], [-12.6, 3, top - 0.1], [-12.6, 3, top - 1.6]], 3, { lanes: [0.5], speed: [1.5, 1.8], childShare: 1, clip: clip('kid.run', 'walk') });
}

function fancier(k: Kit, roofs: readonly Roof[], taken: Taken): void {
  const r = claimRoof(roofs, taken, 3, 23);
  const neighbour = claimRoof(roofs, taken, 2, 29);
  k.vignette({ id: 'pigeon-fancier', title: 'Calling the flock home', story: 'A pigeon fancier waves his flag to call the flock home; below, a neighbour holds an umbrella over her fresh laundry just in case.' }, () => {
    const c = roofCentre(r);
    k.prop('roof.pigeonCoop', onRoof(r, c.u + 0.6, c.v - 1.0));
    k.prop('roof.dovecote', onRoof(r, c.u - 1.7, c.v - 0.9));
    const p = onRoof(r, c.u - 0.4, c.v + 0.2);
    k.person({ x: p.x, z: p.z, y: r.y, heading: 0.2, clip: 'wave', hold: holds({ key: 'hold.flag', tint: 'coral' }, 'upper.overalls'), look: { hat: 'hat.cap', hatTint: 'blueDeep' } });
    const spin = k.spin([p.x, r.y + 4.2, p.z], -0.9, 0, 4);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      k.dynamic('animal.gull.flying', spin, { x: Math.cos(a) * 2.6, y: (i % 2) * 0.5, z: Math.sin(a) * 2.6, rot: -a + Math.PI, tint: i % 2 ? 'stone' : 'slate', scale: 0.7 });
    }
    const nc = roofCentre(neighbour);
    k.person({ x: neighbour.x + nc.u, z: neighbour.z + nc.v, y: neighbour.y, heading: Math.PI, clip: 'stand', hold: holds({ key: 'hold.umbrella', tint: 'butter' }) });
    k.prop('roof.clothesProp', onRoof(neighbour, nc.u - 1.4, nc.v - 0.4));
    stand(k, neighbour, nc.u + 1.2, nc.v + 0.4, clip('talk.shrug', 'talk'), { face: [nc.u, nc.v] });
  });
}

export function moreStories(k: Kit, roofs: readonly Roof[], taken: Taken): void {
  astronomer(k, roofs, taken);
  sweeps(k, roofs, taken);
  kiteTower(k);
  painter(k);
  stairRace(k);
  fancier(k, roofs, taken);
}
