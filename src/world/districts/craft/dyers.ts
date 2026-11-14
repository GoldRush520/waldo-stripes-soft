/** Craft leg, south half: dye vats and drying cloth, basket weavers and the sign painter. */
import { giantLetters } from '../../../props/craft/craft-arts';
import type { Kit } from '../../kit';
import { PI, SMOCK, clip, pad } from './plan';

function dyeWorks(k: Kit): void {
  k.ground([[-4, 23], [8.5, 23], [8.5, 30.5], [-4, 30.5]], 'sageLight', 0.03, 0.02);
  k.prop('craft.dyeVats', { x: 0.9, z: 24.2 });
  k.prop('craft.dyeVat', { x: -1.3, z: 24.6 });
  k.prop('craft.dryingLines', { x: 3.4, z: 26.8 });
  k.prop('craft.dryingLines', { x: 3.4, z: 29.2, tint: 'blue' });
  k.vignette(
    { id: 'blue-dyer', title: 'True blue', story: 'A dyer who fell into the indigo vat this morning — blue from cap to boots — stirs the coral vat and swears it was on purpose, while his colleague cannot stop laughing.' },
    () => {
      k.person({ x: 0.1, z: 25.0, heading: PI + 0.3, clip: clip('pot.stir', 'serve.wipe'), look: { shirt: 'blue', pattern: 0, longSleeves: true, pants: 'blue', shoes: 'blueDeep', hat: 'hat.cap', hatTint: 'blue', hairStyle: 'hair.short' } });
      k.person({ x: 1.5, z: 25.3, heading: -PI / 2 - 0.4, clip: 'talk.laugh', hold: ['upper.apron'], look: { ...SMOCK, hat: 'hat.beanie', hatTint: 'coral' } });
      k.person({ x: -1.3, z: 25.4, heading: PI, clip: 'point', age: 'elder', hold: ['upper.apron'] });
    },
  );
  k.vignette(
    { id: 'hide-and-seek', title: 'Hide and seek in the washing', story: 'A child counts against a drying-line post while the others hide among the coral and blue cloths — one pair of boots and a giggle give the best hider away.' },
    () => {
      k.person({ x: 1.0, z: 27.15, heading: -PI / 2, clip: 'idle.watch', age: 'child', look: { shirt: 'butter', pattern: 0 } });
      k.person({ x: 3.0, z: 26.4, heading: PI, clip: 'stand', age: 'child' });
      k.person({ x: 4.6, z: 27.3, heading: 0.4, clip: 'talk.laugh', age: 'child' });
      k.person({ x: 2.2, z: 28.7, heading: 0, clip: 'lookout', age: 'child', look: { hat: 'hat.sun', hatTint: 'butter' } });
      k.person({ x: 5.9, z: 29.7, heading: -0.6, clip: 'vend.arrange', hold: ['upper.apron'], look: { ...SMOCK, hairStyle: 'hair.bun' } });
    },
  );
}

function baskets(k: Kit): void {
  k.prop('craft.baskets', { x: -1.6, z: 31.4 });
  k.prop('craft.baskets', { x: -1.9, z: 34.4, rot: 0.3 });
  k.vignette(
    { id: 'cat-basket', title: 'Not for sale', story: 'A basket weaver offers her finest basket to a customer, but the cat curled up inside it has other plans.' },
    () => {
      k.prop('basket.wicker', { x: 0.4, z: 32.0 });
      k.prop('animal.cat.sleep', { x: 0.4, z: 32.0, y: 0.12, rot: 0.6 });
      k.person({ x: -1.5, z: 32.6, heading: 0.9, clip: 'sit.crossed', hold: ['upper.apron'], look: { hairStyle: 'hair.long', lower: 'lower.skirt.long', hat: 'hat.sun', hatTint: 'butter' } });
      k.person({ x: 0.5, z: 33.3, heading: PI, clip: 'point.down', look: { hat: 'hat.boater', hatTint: 'coral' }, hold: [{ key: 'hold.bag', tint: 'sage' }] });
      k.person({ x: 1.3, z: 33.0, heading: PI + 0.8, clip: 'talk.laugh', age: 'child' });
    },
  );
  k.person({ x: -1.0, z: 35.3, heading: 0.4, clip: 'sit.ground', hold: ['upper.apron'], age: 'elder' });
}

function signPainter(k: Kit): void {
  k.add(giantLetters('FIAR', 0.34), { x: 4.3, z: 35.0, tint: 'coral' });
  k.block(4.3, 35.0, 4.9, 0.5);
  k.prop('craft.paintBucket', { x: 2.0, z: 35.8, tint: 'coral' });
  k.prop('craft.paintCanOpen', { x: 6.9, z: 35.9 });
  k.vignette(
    { id: 'fiar', title: 'Welcome to the FIAR', story: 'A sign painter on his stepladder adds the final flourish to giant letters spelling FIAR; his apprentice studies the order sheet upside down and the boss has just noticed.' },
    () => {
      k.prop('craft.stepLadder6', { x: 5.9, z: 36.0 });
      const rung = 3 * 0.28 * Math.cos(0.26);
      pad(k, 5.9, 36.1, rung, 0.5, 0.5);
      k.person({ x: 5.9, z: 36.15, y: rung, heading: PI, clip: clip('paint.brush', 'serve.wipe'), hold: ['upper.apron'], look: { ...SMOCK, hat: 'hat.beret', hatTint: 'blue', pattern: 3, shirt2: 'coral' } });
      k.person({ x: 3.2, z: 36.4, heading: 0.2, clip: 'read.maplost', age: 'teen', look: { hat: 'hat.cap', hatTint: 'coral' } });
      k.person({ x: 4.4, z: 37.0, heading: PI - 0.2, clip: 'idle.hips', look: { hat: 'hat.top', hatTint: 'ink', shirt: 'blueDeep', pattern: 2, shirt2: 'blue' } });
    },
  );
}

export function dyersAndPainters(k: Kit): void {
  dyeWorks(k);
  baskets(k);
  signPainter(k);
}
