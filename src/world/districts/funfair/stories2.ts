/** More funfair microstories: side-shows, rides and the big-top forecourt. */
import { Pattern } from '../../../crowd/skeleton';
import type { Kit } from '../../kit';
import { BIGTOP, BOOTHS, BOOTH_Z, CARTS, DODGEMS, FORTUNE, HELTER, SWINGBOATS } from './plan';
import { ride } from './riders';

export function fortuneTeller(k: Kit): void {
  k.vignette(
    { id: 'fortune', title: 'Your future holds…', story: "The fortune teller gazes into her crystal ball and whatever she says makes her customer throw up his hands, while two friends outside whisper and giggle." },
    () => {
      const { x, z } = FORTUNE;
      k.prop('tent.fortune', { x, z }, { walkThrough: true });
      k.block(x, z - 1.35, 4, 1.1);
      k.block(x, z + 0.4, 0.7, 0.7);
      k.person({ x, z: z - 0.35, y: 0.03, heading: 0, clip: 'sit.talk', look: { hat: 'hat.headscarf', hatTint: 'coral', hairStyle: 'hair.long', pattern: Pattern.Dots, shirt: 'blueDeep', shirt2: 'butter', lower: 'lower.dress.long' } });
      k.person({ x: x + 0.1, z: z + 1.2, heading: Math.PI, clip: 'talk.shrug' });
      k.person({ x: x - 0.9, z: z + 2.7, heading: 0.4, clip: 'talk.whisper' });
      k.person({ x: x - 0.3, z: z + 3.1, heading: -2.4, clip: 'talk.laugh' });
    },
  );
}

export function ringmaster(k: Kit): void {
  k.vignette(
    { id: 'roll-up', title: 'Roll up, roll up!', story: 'The ringmaster bellows at the big-top queue while a juggler warms up beside him and a toddler copies every move with a toffee apple.' },
    () => {
      const x = BIGTOP.x - 6.2;
      const z = -5.6;
      k.person({ x, z, heading: 0.3, clip: 'vend.hawk', hold: ['hold.megaphone'], look: { hat: 'hat.top.tall', hatTint: 'coralDeep', shirt: 'coralDeep', pattern: Pattern.Block, shirt2: 'ivory', pants: 'ink', longLegs: true, longSleeves: true } });
      k.person({ x: x - 2.1, z: z + 1.0, heading: 0.5, clip: 'juggle.clubs', hold: ['hold.club'], look: { pattern: Pattern.Check, shirt: 'butter', shirt2: 'sage', hat: 'hat.beanie', hatTint: 'sage' } });
      k.person({ x: x - 1.5, z: z + 2.2, heading: -2.6, clip: 'juggle.balls', age: 'child', hold: ['hold.toffeeapple'] });
      k.person({ x: x - 0.4, z: z + 2.6, heading: -2.9, clip: 'cheer.clap' });
      k.person({ x: x - 2.9, z: z + 2.5, heading: 2.6, clip: 'talk.laugh', age: 'elder' });
    },
  );
}

export function coconutShy(k: Kit): void {
  const b = BOOTHS.find((s) => s.key === 'game.coconutshy');
  if (!b) return;
  k.vignette(
    { id: 'coconut-shy', title: 'The coconut that will not fall', story: 'A dad has hit the same coconut five times and it has not budged; the stallholder shrugs innocently while the kids lose patience.' },
    () => {
      const front = BOOTH_Z + b.d / 2;
      k.person({ x: b.x - 0.6, z: front - 0.75, heading: 0, clip: 'talk.shrug', hold: ['upper.apron'], look: { hat: 'hat.boater', hatTint: 'sage' } });
      k.person({ x: b.x + 0.4, z: front + 0.6, heading: Math.PI - 0.2, clip: 'baton.toss', look: { hat: 'hat.cap', hatTint: 'blue' } });
      k.person({ x: b.x - 0.5, z: front + 0.75, heading: Math.PI + 0.3, clip: 'talk.animated' });
      k.person({ x: b.x + 1.2, z: front + 1.3, heading: Math.PI + 0.5, clip: 'idle.tap', age: 'child' });
      k.person({ x: b.x - 1.3, z: front + 1.25, heading: Math.PI - 0.5, clip: 'talk.shrug', age: 'child' });
    },
  );
}

export function cottonCandy(k: Kit): void {
  const c = CARTS.find((s) => s.key === 'cart.cottoncandy');
  if (!c) return;
  k.vignette(
    { id: 'candy-floss', title: 'Sticky fingers', story: 'The candy-floss man hands over a cloud bigger than the toddler holding out her coins, as her brother is already licking his.' },
    () => {
      k.person({ x: c.x + 0.2, z: c.z - 0.95, heading: 0, clip: 'vend.handover', hold: ['upper.apron', 'hold.cottoncandy'], look: { hat: 'hat.sailor', hatTint: 'blue', shirt: 'blueLight', pattern: Pattern.HStripe, shirt2: 'ivory' } });
      k.person({ x: c.x, z: c.z + 0.95, heading: Math.PI, clip: 'vend.coins', age: 'child' });
      k.person({ x: c.x + 0.75, z: c.z + 1.25, heading: Math.PI + 0.6, clip: 'eat.icecream', age: 'child', hold: ['hold.cottoncandy'] });
      k.person({ x: c.x - 0.8, z: c.z + 1.3, heading: Math.PI - 0.5, clip: 'idle.watch', hold: [{ key: 'hold.bag', tint: 'butter' }] });
    },
  );
}

/** Coaster vignette: granny in the front car reading, grandson clinging on behind. */
export function coasterGranny(k: Kit, lead: number): void {
  k.vignette(
    { id: 'coaster-granny', title: 'Unflappable granny', story: 'In the front car of the kiddie coaster a granny calmly reads her book through every dip while her grandson behind her holds on for dear life.' },
    () => {
      ride(k, 'coaster.car', lead, { seats: [0], fill: 1, clips: ['sit.read'], ages: ['elder'] });
      ride(k, 'coaster.car', lead, { seats: [1], fill: 1, clips: ['sit.talk'], ages: ['child'] });
      k.person({ x: 10.8, z: 15.6, heading: 1.2, clip: 'point', age: 'child' });
      k.person({ x: 10.4, z: 14.8, heading: 1.4, clip: 'talk.laugh' });
    },
  );
}

/** Three dodgems jammed nose to tail in a corner, jostling, drivers arguing. */
export function dodgemJam(k: Kit): void {
  k.vignette(
    { id: 'dodgem-jam', title: 'Traffic jam', story: 'Three dodgems are wedged in the corner, their drivers all blaming each other, while the attendant leans on the rail and points the wrong way.' },
    () => {
      const cars: ReadonlyArray<readonly [number, number, number]> = [
        [DODGEMS.x + 4.4, DODGEMS.z - 2.6, 0.6],
        [DODGEMS.x + 4.7, DODGEMS.z - 0.9, 2.6],
        [DODGEMS.x + 3.0, DODGEMS.z - 2.9, -1.2],
      ];
      cars.forEach(([x, z, rot], i) => {
        const m = k.bob([x, 0.12, z], rot, 5 + i, i, 0.02, 0.05, 2);
        k.dynamic('dodgem.car', m, { tint: (['blue', 'butter', 'sage'] as const)[i] });
        ride(k, 'dodgem.car', m, { fill: 1, clips: ['sit.talk'], ages: ['adult', 'teen', 'elder'] });
      });
      k.person({ x: DODGEMS.x + 4.5, z: DODGEMS.z + 4.6, heading: Math.PI + 0.4, clip: 'point.across', look: { hat: 'hat.cap', hatTint: 'coral' } });
      k.person({ x: DODGEMS.x + 3.6, z: DODGEMS.z + 5.0, heading: Math.PI, clip: 'talk.laugh' });
    },
  );
}

/** Swing boats: a boat full of shrieking kids next to two grandpas fast asleep. */
export function swingBoatRiders(k: Kit, boats: readonly number[]): void {
  const [kids, grandpas] = boats;
  if (kids === undefined || grandpas === undefined) return;
  k.vignette(
    { id: 'swing-boats', title: 'Sweet dreams', story: 'One swing boat is packed with screaming children; in the other, two grandpas swing just as high, fast asleep.' },
    () => {
      ride(k, 'swingboat.boat', kids, { fill: 1, clips: ['sit.talk', 'sit'], ages: ['child'] });
      ride(k, 'swingboat.boat', grandpas, { seats: [1, 4], fill: 1, clips: ['sit.asleep'], ages: ['elder'] });
      const s = SWINGBOATS[0];
      if (!s) return;
      k.person({ x: s.x + 3.4, z: s.z + 3.9, heading: -0.6, clip: 'idle.watch', look: { hat: 'hat.cap', hatTint: 'blue' } });
      k.person({ x: s.x + 2.2, z: s.z + 4.1, heading: 0.4, clip: 'cheer', age: 'child' });
    },
  );
}

/** Helter-skelter: grandpa's first ride down while the family cheers at the mat. */
export function helterGrandpa(k: Kit, slider: number): void {
  k.vignette(
    { id: 'helter-grandpa', title: "Grandpa's first slide", story: 'Grandpa spirals down the helter-skelter on his mat, hat clamped on, as his grandchildren cheer at the bottom and grandma covers her eyes.' },
    () => {
      k.person({ x: 0, z: 0, motion: slider, clip: 'sit.ground', age: 'elder', look: { hat: 'hat.boater', hatTint: 'butter' } });
      const x = HELTER.x + 3.4;
      const z = HELTER.z + 4.3;
      k.person({ x, z, heading: Math.PI + 0.6, clip: 'cheer.jump', age: 'child' });
      k.person({ x: x + 0.7, z: z + 0.3, heading: Math.PI + 0.9, clip: 'cheer', age: 'child' });
      k.person({ x: x + 1.2, z: z - 0.6, heading: -1.9, clip: 'idle.behind', age: 'elder', look: { lower: 'lower.skirt.long' } });
    },
  );
}
