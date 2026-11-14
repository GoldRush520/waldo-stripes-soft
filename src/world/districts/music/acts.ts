/** Street acts round the square: puppet theatre, living statue, tightrope, fountain juggler, organ grinder. */
import { box, cyl, merge, sphere, translate } from '../../../core/geo';
import type { Vec3 } from '../../../crowd/stores';
import { TIGHTROPE_HEIGHT } from '../../../props/craft';
import type { Kit } from '../../kit';
import { FOUNTAIN, ORGAN, PUPPET, ROPE, STATUE, facing, patch, stepRate } from './plan';

export function puppetShow(k: Kit): void {
  k.vignette(
    {
      id: 'puppet-show',
      title: 'Behind you!',
      story: 'Two glove puppets squabble on the little striped stage while rows of children shriek warnings and one curious girl has wandered round the back to find the puppeteer.',
    },
    () => {
      k.prop('music.puppetBooth', { x: PUPPET.x, z: PUPPET.z });
      k.person({ x: PUPPET.x + 0.1, z: PUPPET.z - 0.75, heading: 0, clip: 'talk.animated', look: { hat: 'hat.beret', hatTint: 'coral' } });
      k.person({ x: PUPPET.x + 0.9, z: PUPPET.z - 0.7, heading: -1.6, clip: 'point', age: 'child' });
      for (let row = 0; row < 3; row++) {
        const n = 4 + row;
        for (let i = 0; i < n; i++) {
          const x = PUPPET.x + (i - (n - 1) / 2) * 0.62 + (row % 2) * 0.12;
          const z = PUPPET.z + 1.5 + row * 0.75;
          const clip = row === 2 ? k.rng.pick(['cheer.jump', 'point', 'cheer.clap']) : k.rng.pick(['sit.ground', 'sit.ground', 'point']);
          k.person({ x, z, heading: facing(x, z, PUPPET.x, PUPPET.z), clip, age: 'child' });
        }
      }
      k.prop('crate.empty', { x: PUPPET.x + 2.4, z: PUPPET.z + 2.4 });
      k.person({ x: PUPPET.x - 2.6, z: PUPPET.z + 3.7, heading: Math.PI, clip: 'idle.watch' });
      k.person({ x: PUPPET.x + 2.6, z: PUPPET.z + 3.6, heading: Math.PI + 0.3, clip: 'photo.camera' });
    },
  );
}

export function livingStatue(k: Kit): void {
  k.vignette(
    {
      id: 'living-statue',
      title: 'Not a muscle',
      story: 'A living statue holds his heroic pose on the plinth while a boy pulls faces at him, a pigeon inspects his boots and a tourist leans in for a selfie, unaware the statue has just winked.',
    },
    () => {
      k.prop('music.statuePlinth', { x: STATUE.x, z: STATUE.z });
      patch(k, STATUE.x, STATUE.z, 0.35, 0.35, 0.93);
      k.person({
        x: STATUE.x,
        z: STATUE.z,
        y: 0.93,
        heading: 0,
        clip: 'statue.hero',
        speed: 1,
        look: { shirt: 'ivoryShade', shirt2: 'ivoryShade', pattern: 0, pants: 'ivoryShade', shoes: 'ivoryShade', hat: 'hat.top', hatTint: 'ivoryShade', longLegs: true, longSleeves: true },
      });
      k.prop('animal.pigeon.peck', { x: STATUE.x + 0.25, z: STATUE.z + 0.2, y: 0.93, rot: 1.2 });
      k.prop('music.buskerCase', { x: STATUE.x, z: STATUE.z + 1.05, tint: 'blue' });
      k.person({ x: STATUE.x - 0.6, z: STATUE.z + 1.7, heading: Math.PI - 0.3, clip: 'robot.wave', age: 'child' });
      k.person({ x: STATUE.x + 0.9, z: STATUE.z + 1.4, heading: 0.4, clip: 'photo.selfie', hold: ['back.pack'] });
      k.person({ x: STATUE.x + 1.6, z: STATUE.z + 2.1, heading: -2.4, clip: 'talk.laugh' });
      k.person({ x: STATUE.x - 1.5, z: STATUE.z + 2.3, heading: 2.6, clip: 'talk.whisper' });
      k.person({ x: STATUE.x - 0.9, z: STATUE.z + 2.6, heading: 2.9, clip: 'idle.hips', age: 'elder' });
    },
  );
}

export function tightrope(k: Kit): void {
  k.vignette(
    {
      id: 'tightrope',
      title: 'Halfway across',
      story: 'High above the south promenade a tightrope walker inches along with a parasol; below, a mother covers her son\'s eyes while everyone else gasps and points.',
    },
    () => {
      k.prop('music.tightrope', { x: ROPE.x, z: ROPE.z });
      const h = TIGHTROPE_HEIGHT;
      const route = k.street([[ROPE.x - 3.4, h, ROPE.z], [ROPE.x + 3.4, h, ROPE.z]] as Vec3[], 0);
      const m = k.onRoute(route, 2.5, 0.28);
      k.person({ x: 0, z: 0, motion: m, clip: 'tightrope.walk', speed: stepRate(0.28, 2.4, 0.5), hold: [{ key: 'hold.umbrella', tint: 'coral' }], look: { shirt: 'butter', shirt2: 'coral', pattern: 2, pants: 'coral', longLegs: true } });
      const clips = ['point.sky', 'cheer.clap', 'lookout', 'point.sky', 'cheer', 'idle.watch'] as const;
      for (let i = 0; i < 12; i++) {
        const x = ROPE.x - 3.3 + (i % 6) * 1.3 + (i > 5 ? 0.6 : 0);
        const z = ROPE.z - 2.0 - (i > 5 ? 0.9 : 0);
        k.person({ x, z, heading: k.rng.range(-0.4, 0.4), clip: k.rng.pick(clips), age: k.rng.chance(0.25) ? 'child' : 'adult' });
      }
      k.person({ x: ROPE.x - 4.6, z: ROPE.z - 1.6, heading: 0.3, clip: 'greet.hug', look: { lower: 'lower.dress' } });
      k.person({ x: ROPE.x - 4.4, z: ROPE.z - 1.0, heading: Math.PI + 0.3, clip: 'stand', age: 'child' });
    },
  );
}

const ball = (): ReturnType<typeof sphere> => sphere(0.07, 'coral', 6, 4);
const club = (): ReturnType<typeof box> => merge(cyl(0.02, 0.045, 0.34, 'ivory', 5), translate(cyl(0.045, 0.03, 0.1, 'blue', 5), 0, 0.34, 0));

export function fountainJuggler(k: Kit): void {
  k.prop('fountain.round', { x: FOUNTAIN.x, z: FOUNTAIN.z });
  k.prop('fountain.round.water', { x: FOUNTAIN.x, z: FOUNTAIN.z });
  k.vignette(
    {
      id: 'fountain-juggler',
      title: 'Fishing for clubs',
      story: 'One throw too high: the juggler leans over the fountain rim to fish out his bobbing balls and clubs, while a duck claims one and the crowd that came to watch him laughs harder than at the act.',
    },
    () => {
      const j = k.person({ x: FOUNTAIN.x + 2.0, z: FOUNTAIN.z + 0.7, heading: -1.9, clip: 'point.down', hold: ['face.clownnose'], look: { hat: 'hat.party', hatTint: 'blue', shirt: 'coral', shirt2: 'butter', pattern: 3, longLegs: true } });
      k.searchable(j, 'the juggler');
      const water = 0.37;
      [[0.9, 0.4], [1.1, -0.1], [0.6, 0.8]].forEach(([dx, dz], i) => {
        const m = k.bob([FOUNTAIN.x + dx, water, FOUNTAIN.z + dz], i, 1.4, i * 1.7, 0.02, 0.15, 1);
        k.dynamic(ball(), m, { tint: i === 1 ? 'butter' : 'coral' });
      });
      const mc = k.bob([FOUNTAIN.x + 0.5, water, FOUNTAIN.z + 0.1], 0.4, 1.1, 0.5, 0.02, 0.2, 1);
      k.dynamic(translate(club(), 0, 0.03, 0), mc);
      const md = k.bob([FOUNTAIN.x - 0.3, water - 0.02, FOUNTAIN.z + 1.0], 1.2, 0.9, 0.2, 0.02, 0.06, 1);
      k.dynamic('animal.duck', md);
      k.prop('music.jugglerBox', { x: FOUNTAIN.x + 3.2, z: FOUNTAIN.z - 0.6, rot: -0.4 });
      k.person({ x: FOUNTAIN.x + 2.2, z: FOUNTAIN.z + 1.6, heading: -2.2, clip: 'point.down', age: 'child', hold: [{ key: 'hold.umbrella', tint: 'sage' }] });
      const laughs: ReadonlyArray<readonly [number, number]> = [[3.4, 1.4], [3.9, 2.1], [3.0, 2.6], [2.2, 3.0]];
      laughs.forEach(([dx, dz], i) => {
        const x = FOUNTAIN.x + dx;
        const z = FOUNTAIN.z + dz;
        k.person({ x, z, heading: facing(x, z, FOUNTAIN.x + 2, FOUNTAIN.z + 0.7), clip: i % 2 ? 'talk.laugh' : 'cheer.clap', age: i === 3 ? 'child' : 'adult' });
      });
    },
  );
}

export function organGrinder(k: Kit): void {
  k.vignette(
    {
      id: 'organ-monkey',
      title: 'The collector',
      story: 'The organ grinder cranks a waltz while his monkey works the crowd for coins; a little girl offers it a biscuit instead and her father is already counting his change.',
    },
    () => {
      k.prop('music.streetOrgan', { x: ORGAN.x, z: ORGAN.z, rot: 0.3 });
      k.person({ x: ORGAN.x - 0.85, z: ORGAN.z - 0.3, heading: 0.3, clip: 'organ.crank-sing', hold: ['upper.waistcoat'], look: { hat: 'hat.boater', hatTint: 'coral', shirt: 'ivory', shirt2: 'blue', pattern: 2 } });
      k.prop('animal.monkey', { x: ORGAN.x + 0.6, z: ORGAN.z + 1.2, rot: 0.6 });
      k.person({ x: ORGAN.x + 1.05, z: ORGAN.z + 1.75, heading: facing(ORGAN.x + 1.05, ORGAN.z + 1.75, ORGAN.x + 0.6, ORGAN.z + 1.2), clip: 'point.down', age: 'child', look: { lower: 'lower.dress' } });
      k.person({ x: ORGAN.x + 1.8, z: ORGAN.z + 1.5, heading: -2.0, clip: 'vend.coins' });
      k.person({ x: ORGAN.x + 0.2, z: ORGAN.z + 2.2, heading: 2.8, clip: 'sway.wave', age: 'elder' });
      k.person({ x: ORGAN.x - 0.8, z: ORGAN.z + 1.9, heading: 2.4, clip: 'waltz.lead' });
      k.person({ x: ORGAN.x - 0.8, z: ORGAN.z + 2.45, heading: 2.4 + Math.PI, clip: 'waltz.follow', age: 'elder', look: { lower: 'lower.dress.long' } });
    },
  );
}
