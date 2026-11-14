/** Craft leg, north half: potters with kilns (and the absurdly tall pot), the sculptor, the weaver. */
import { type Geo, box, lathe, merge } from '../../../core/geo';
import type { Kit } from '../../kit';
import { PI, SMOCK, clip, pad } from './plan';

let tallPot: Geo | null = null;

/** A wobbly 2.7 m clay pot that has kept on growing on the wheel — built once. */
function tallPotGeo(): Geo {
  if (!tallPot) {
    tallPot = lathe(
      [[0.13, 0], [0.18, 0.25], [0.22, 0.7], [0.15, 1.2], [0.19, 1.65], [0.24, 2.05], [0.16, 2.45], [0.13, 2.62], [0.17, 2.72]],
      'clay',
      10,
    );
  }
  return tallPot;
}

function tallPotStory(k: Kit): void {
  const at = { x: 0.4, z: 11.2, rot: PI };
  k.prop('craft.potterWheel', at);
  const spin = k.spin([at.x, 0.62, at.z], 1.6, 0, 3.5);
  k.dynamic(tallPotGeo(), spin, {});
  k.vignette(
    { id: 'tall-pot', title: 'One more turn', story: 'A potter, now standing on his stool, keeps raising a pot that has grown taller than he is; his apprentice steadies the top from a stepladder while neighbours gape.' },
    () => {
      const stool = k.rel(at, 0, 0.55, PI);
      pad(k, stool.x, stool.z, 0.5, 0.5, 0.5);
      const potter = k.person({ x: stool.x, z: stool.z, y: 0.5, heading: stool.heading, clip: 'vend.arrange', hold: ['upper.apron'], look: { ...SMOCK, hat: 'hat.beret', hatTint: 'clay', shirt: 'clayLight' } });
      k.searchable(potter, 'the potter with the towering pot');
      const lx = at.x + 0.95;
      k.prop('craft.stepLadder6', { x: lx, z: at.z, rot: -PI / 2 });
      const rung = 4 * 0.28 * Math.cos(0.26);
      pad(k, lx, at.z, rung, 0.5, 0.5);
      k.person({ x: lx + 0.1, z: at.z, y: rung, heading: -PI / 2, clip: 'vend.arrange', age: 'teen', hold: ['upper.apron'], look: { hat: 'hat.cap', hatTint: 'butter' } });
      k.person({ x: at.x - 1.2, z: at.z + 1.5, heading: PI - 0.5, clip: 'point.sky', age: 'child' });
      k.person({ x: at.x - 0.3, z: at.z + 1.8, heading: PI, clip: 'cheer.clap' });
      k.person({ x: at.x + 1.6, z: at.z + 1.4, heading: PI + 0.6, clip: 'talk.shrug', age: 'elder', look: { hat: 'hat.boater', hatTint: 'blue' } });
    },
  );
}

function kilns(k: Kit): void {
  k.ground([[-4, 7.5], [8.5, 7.5], [8.5, 15.5], [-4, 15.5]], 'clay', 0.03, 0.02);
  k.prop('craft.kiln', { x: 5.2, z: 8.9 });
  k.prop('craft.kiln', { x: 7.4, z: 11.6, rot: -PI / 2 });
  k.prop('craft.potteryShelves', { x: 4.6, z: 14.6, rot: PI });
  k.person({ x: 5.2, z: 10.0, heading: PI, clip: 'point.down', hold: ['upper.apron'], look: { ...SMOCK, hat: 'hat.beanie', hatTint: 'coral' } });
  k.person({ x: 4.6, z: 13.7, heading: 0, clip: 'vend.arrange', hold: ['upper.apron'], look: SMOCK });
  k.seated('craft.potterWheel', { x: -2.6, z: 9.4, rot: PI }, { clips: ['sit.talk'], fill: 1 });
  k.seated('craft.potterWheel', { x: -2.8, z: 13.2, rot: PI }, { clips: ['sit.talk'], fill: 1 });
}

/** The sculptor and the heroic model; finished statues stand in a row. */
function sculptor(k: Kit): void {
  k.prop('craft.marbleBlock', { x: 1.2, z: 18.4 });
  k.prop('craft.statue', { x: 5.2, z: 17.2 });
  k.prop('craft.statue', { x: 6.8, z: 19.2, rot: -0.6 });
  k.vignette(
    { id: 'sculptor-model', title: 'Still a cube', story: 'A model has held a heroic pose on a crate all morning; the sculptor has chiselled one corner off the marble block, and two critics compare it, unimpressed, with the model.' },
    () => {
      k.add(merge(box(0.8, 0.5, 0.8, 'timber'), box(0.84, 0.04, 0.84, 'timberDeep')), { x: 2.9, z: 17.2 });
      k.block(2.9, 17.2, 0.8, 0.8);
      pad(k, 2.9, 17.2, 0.5);
      k.person({ x: 2.9, z: 17.2, y: 0.5, heading: -0.5, clip: clip('statue.hero', 'point.sky'), look: { shirt: 'ivory', pattern: 0, pants: 'ivoryShade', hat: null } });
      k.person({ x: 0.4, z: 18.4, heading: PI / 2, clip: clip('sculpt.chisel', 'vend.arrange'), hold: ['upper.apron'], look: { ...SMOCK, hat: 'hat.beret', hatTint: 'ivory' } });
      k.person({ x: 1.9, z: 20.0, heading: PI + 0.4, clip: 'talk.shrug' });
      k.person({ x: 2.7, z: 20.3, heading: PI - 0.3, clip: 'point', look: { hat: 'hat.top', hatTint: 'blueDeep' } });
    },
  );
}

function weaving(k: Kit): void {
  k.seated('craft.loom', { x: -2.4, z: 21.6, rot: PI }, { clips: ['sit.talk'], fill: 1 });
  k.prop('craft.spinningWheel', { x: -2.6, z: 18.6, rot: 0.4 });
}

export function pottersAndSculptor(k: Kit): void {
  kilns(k);
  tallPotStory(k);
  sculptor(k);
  weaving(k);
}
