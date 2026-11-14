/** The funfair's required microstories: high striker, floating clown, lost teddy, stuck stilt walker. */
import { cyl, merge, rbox, translate } from '../../../core/geo';
import { Pattern } from '../../../crowd/skeleton';
import type { Kit } from '../../kit';
import { CLOTHS } from '../shared';
import { AVENUE, BIGTOP, PLAZA, STRIKERS } from './plan';

const PUCK = rbox(0.16, 0.12, 0.1, 0.03, 'blue');
const STILTS = merge(
  [-0.11, 0.11].map((x) => merge(translate(cyl(0.035, 0.035, 0.95, 'timber', 6), x, 0, 0), translate(rbox(0.12, 0.04, 0.24, 0.01, 'timberDeep'), x, 0.92, 0.02))),
);

export function highStriker(k: Kit): void {
  k.vignette(
    { id: 'high-striker', title: 'Ring the bell', story: "A flexing strongman swings with all his might and the puck barely lifts, while at the next striker a small girl's tap sends hers clanging into the bell." },
    () => {
      const [a, b] = STRIKERS;
      if (!a || !b) return;
      for (const s of STRIKERS) k.prop('game.highstriker', { x: s.x, z: s.z });
      const strong = k.person({ x: a.x - 0.95, z: a.z + 0.55, heading: Math.PI / 2 + 0.3, clip: 'strongman.flex', look: { pattern: Pattern.WideStripe, shirt: 'blueDeep', shirt2: 'ivory', pants: 'ink', hat: null, hairStyle: 'hair.short', build: 1.3, longLegs: true } });
      k.searchable(strong, 'the strongman');
      k.person({ x: b.x - 0.95, z: b.z + 0.55, heading: Math.PI / 2 + 0.2, clip: 'cheer.jump', age: 'child', look: { hairStyle: 'hair.ponytail', shirt: 'coralLight', pattern: Pattern.Dots, shirt2: 'ivory' } });
      const puck = k.toss([b.x, 0.42, b.z - 0.12], 0, 1.25, 0, 0, 5.78);
      k.dynamic(PUCK, puck);
      k.person({ x: a.x + 1.4, z: a.z + 1.2, heading: -0.4, clip: 'vend.hawk', hold: ['upper.apron'], look: { hat: 'hat.boater', hatTint: 'coral' } });
      const crowd: ReadonlyArray<readonly [number, number, string]> = [
        [a.x - 1.2, a.z + 2.1, 'talk.laugh'],
        [a.x - 0.4, a.z + 2.5, 'point'],
        [a.x + 0.5, a.z + 2.2, 'cheer.clap'],
        [b.x - 0.3, b.z + 2.3, 'cheer'],
        [b.x + 0.6, b.z + 1.9, 'cheer.fistpump'],
        [a.x - 2.0, a.z + 1.4, 'talk.shrug'],
      ];
      crowd.forEach(([x, z, clip], i) => k.person({ x, z, face: [a.x, a.z], clip, age: i === 3 ? 'child' : 'adult' }));
    },
  );
}

export function floatingClown(k: Kit): void {
  k.vignette(
    { id: 'floating-clown', title: 'Up, up and away', story: 'The balloon clown bought one balloon too many: his bunch lifts him off his big shoes while children grab for his ankles and a mum takes a photo.' },
    () => {
      const cx = PLAZA.x + 1.2;
      const cz = PLAZA.z + 0.8;
      const lift = k.bob([cx, 0.55, cz], 0.2, 1.1, 0, 0.28, 0.1, 4);
      const clown = k.person({ x: 0, z: 0, motion: lift, clip: 'sway.hands-up', blob: 0, hold: ['face.clownnose'], look: { pattern: Pattern.Dots, shirt: 'butter', shirt2: 'coral', pants: 'coral', longLegs: true, hat: 'hat.top', hatTint: 'coral', shoes: 'coralDeep' } });
      k.dynamic('balloon.bunch', lift, { x: 0.05, y: 2.15, z: 0.05, scale: 1.3, tint: 'coral' });
      k.searchable(clown, 'the floating clown');
      k.person({ x: cx - 0.55, z: cz + 0.35, face: [cx, cz], clip: 'point.sky', age: 'child' });
      k.person({ x: cx + 0.55, z: cz + 0.4, face: [cx, cz], clip: 'cheer.jump', age: 'child' });
      k.person({ x: cx + 0.1, z: cz + 0.75, face: [cx, cz], clip: 'point.sky', age: 'child', hold: [{ key: 'hold.balloon', tint: 'blue' }] });
      k.person({ x: cx - 1.7, z: cz + 1.6, face: [cx, cz], clip: 'photo.camera', hold: ['hold.camera'], look: { lower: 'lower.dress' } });
      k.person({ x: cx + 1.8, z: cz + 1.3, face: [cx, cz], clip: 'talk.laugh', age: 'elder' });
    },
  );
}

export function lostTeddy(k: Kit): void {
  k.vignette(
    { id: 'lost-teddy', title: 'Has anyone lost a teddy?', story: 'Four helpful strangers parade a giant prize teddy up and down the midway looking for its owner, who is waving from the far end while the ring-toss man points the other way.' },
    () => {
      const route = k.street([[-24, 0, AVENUE.z1 - 1.5], [0, 0, AVENUE.z1 - 1.3], [26, 0, AVENUE.z1 - 1.5]], 0);
      const m = k.onRoute(route, 6, 0.75);
      k.dynamic('fair.teddy', m, { y: 1.0, scale: 2.3, tint: 'clay' });
      for (const [x, z] of [[-0.5, 0.5], [0.5, 0.5], [-0.5, -0.6], [0.5, -0.6]] as const) {
        k.person({ x, z, motion: m, clip: 'carry', speed: 0.75 / 1.3, blob: 1, look: { shirt: k.rng.pick(CLOTHS), pattern: 0 } });
      }
      k.person({ x: 25.2, z: AVENUE.z1 - 0.8, heading: -1.4, clip: 'greet.bigwave', age: 'child', hold: ['holdL.icecream'], look: { hairStyle: 'hair.ponytail', shirt: 'blueLight', pattern: 0 } });
      k.person({ x: 24.5, z: AVENUE.z1 - 0.3, heading: -1.6, clip: 'point', look: { lower: 'lower.skirt' } });
      k.person({ x: -2.3, z: AVENUE.z0 + 0.25, heading: 1.3, clip: 'point.across', hold: ['upper.apron'], look: { hat: 'hat.top', hatTint: 'butter' } });
    },
  );
}

export function stiltWalker(k: Kit): void {
  k.vignette(
    { id: 'stuck-stilts', title: 'Stuck in the queue', story: 'A stilt walker has stepped astride the big-top queue rail and now teeters, unable to go forward or back, while the queue below takes bets.' },
    () => {
      const x = BIGTOP.x - 3.2;
      const z = -2.6;
      k.add(STILTS, { x, z });
      k.surface('deck', [[x - 0.3, z - 0.3], [x + 0.3, z - 0.3], [x + 0.3, z + 0.3], [x - 0.3, z + 0.3]], 0.95);
      const stilt = k.person({ x, z, y: 0.95, heading: 0.15, clip: 'tightrope.balance', look: { pattern: Pattern.VStripe, shirt: 'sage', shirt2: 'butter', pants: 'butter', longLegs: true, hat: 'hat.top', hatTint: 'sage' } });
      k.searchable(stilt, 'the stilt walker');
      k.person({ x: x - 0.8, z: z + 0.7, face: [x, z], clip: 'talk.laugh' });
      k.person({ x: x + 0.9, z: z + 0.75, face: [x, z], clip: 'point', age: 'child' });
      k.person({ x: x + 0.1, z: z + 1.4, face: [x, z], clip: 'vend.coins' });
    },
  );
}
