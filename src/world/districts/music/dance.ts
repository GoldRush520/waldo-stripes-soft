/**
 * Dance floor (waltzing couples revolving slowly on a spin frame) and the maypole (ribbon dancers
 * circling the pole), each ringed by onlookers. Both sit south of the parade ring in open view.
 */
import { merge, torus, translate } from '../../../core/geo';
import type { Kit } from '../../kit';
import { DANCE, MAYPOLE, facing } from './plan';

function waltzers(k: Kit): void {
  const m = k.spin([DANCE.x, 0.03, DANCE.z], 0.16, 0, 3);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const r = i === 4 ? 0 : 1.25;
    const cx = Math.sin(a) * r;
    const cz = Math.cos(a) * r;
    const t = a + Math.PI / 2;
    const ox = Math.sin(t) * 0.26;
    const oz = Math.cos(t) * 0.26;
    k.person({ x: cx - ox, z: cz - oz, motion: m, heading: t, clip: 'waltz.lead', speed: 1, blob: 1, look: { longLegs: true, shirt: i % 2 ? 'blueDeep' : 'sageDeep', pattern: 0 } });
    k.person({ x: cx + ox, z: cz + oz, motion: m, heading: t + Math.PI, clip: 'waltz.follow', speed: 1, blob: 1, look: { lower: i % 2 ? 'lower.dress.long' : 'lower.dress', shirt: k.rng.pick(['coral', 'butter', 'sage', 'blue']) } });
  }
}

function floorWatchers(k: Kit): void {
  const clips = ['cheer.clap', 'sway.wave', 'groove.hip-clap', 'idle.watch', 'talk', 'groove.shimmy'] as const;
  for (let i = 0; i < 16; i++) {
    const a = -1.9 + (i / 15) * 3.8 + Math.PI;
    const r = 2.75 + (i % 2) * 0.7;
    const x = DANCE.x + Math.sin(a) * r;
    const z = DANCE.z + Math.cos(a) * r;
    k.person({ x, z, heading: facing(x, z, DANCE.x, DANCE.z), clip: k.rng.pick(clips), age: k.rng.chance(0.15) ? 'child' : 'adult' });
  }
}

export function danceFloor(k: Kit): void {
  k.prop('music.danceFloor', { x: DANCE.x, z: DANCE.z, y: 0.03 });
  k.vignette(
    {
      id: 'granny-jig',
      title: 'Out-danced',
      story: 'Polite couples revolve in a slow waltz until a grandmother at the edge of the floor breaks into a furious jig and the onlookers start clapping her instead.',
    },
    () => {
      waltzers(k);
      k.person({ x: DANCE.x + 1.6, z: DANCE.z + 2.3, heading: 0.2, clip: 'jig.kick', age: 'elder', look: { lower: 'lower.skirt.long', hat: 'hat.sun', hatTint: 'coral' } });
      floorWatchers(k);
    },
  );
}

function ribbonDancers(k: Kit): void {
  const m = k.spin([MAYPOLE.x, 0, MAYPOLE.z], 0.3, 0, 4);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    k.person({
      x: Math.sin(a) * 2.45,
      z: Math.cos(a) * 2.45,
      motion: m,
      heading: a + Math.PI / 2,
      clip: i % 2 ? 'ribbon.circles' : 'twirl.skirt',
      blob: 1,
      age: i % 3 === 0 ? 'child' : 'adult',
      look: { lower: i % 2 ? 'lower.dress' : null, shirt: (['coral', 'blue', 'butter', 'sage'] as const)[i % 4] },
    });
  }
}

export function maypole(k: Kit): void {
  k.prop('maypole', { x: MAYPOLE.x, z: MAYPOLE.z });
  ribbonDancers(k);
  k.vignette(
    {
      id: 'maypole-tangle',
      title: 'All wrapped up',
      story: 'The maypole dancers weave perfectly round and round, except for one boy who went the wrong way and is now bound to the pole in coloured ribbons while his sister doubles up laughing.',
    },
    () => {
      const x = MAYPOLE.x;
      const z = MAYPOLE.z + 0.42;
      k.person({ x, z, heading: 0, clip: 'talk.shrug', age: 'child', look: { shirt: 'sage', pattern: 0 } });
      const wrap = merge(
        translate(torus(0.27, 0.035, 'coral', 4, 12), 0, 0.55, 0),
        translate(torus(0.25, 0.035, 'blue', 4, 12), 0, 0.72, 0),
        translate(torus(0.24, 0.035, 'butter', 4, 12), 0, 0.88, 0),
      );
      k.add(wrap, { x, z });
      k.person({ x: x + 1.0, z: MAYPOLE.z + 3.3, heading: -0.3, clip: 'talk.laugh', age: 'child', look: { lower: 'lower.dress' } });
      k.person({ x: x - 1.2, z: MAYPOLE.z + 3.4, heading: 0.4, clip: 'point', age: 'adult' });
    },
  );
  const clips = ['cheer.clap', 'sway.wave', 'idle.watch', 'talk', 'photo.camera'] as const;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.26;
    const x = MAYPOLE.x + Math.sin(a) * 3.65;
    const z = MAYPOLE.z + Math.cos(a) * 3.65;
    if (!k.isFree(x, z, 0.3)) continue;
    k.person({ x, z, heading: facing(x, z, MAYPOLE.x, MAYPOLE.z), clip: k.rng.pick(clips), age: k.rng.chance(0.2) ? 'child' : 'adult' });
  }
}
