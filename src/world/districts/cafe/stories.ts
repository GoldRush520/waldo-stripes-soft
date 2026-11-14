/**
 * Square and terrace microstories: the bookshop domino collapse, the stumbling waiter, the
 * proposal with the pigeon, the accordionist and the chess match.
 */
import { bookshelfLean } from '../../../props/street/bookshop';
import type { Kit } from '../../kit';
import { clip, opt, opts } from './catalog';
import { table, waiter } from './dining';
import { chessboard, flyingCup, ringBox } from './geos';
import { EDGE_ROT } from './plan';
import { type PlacedHouse, frontOf } from './terraces';

const R = EDGE_ROT;

/** Seat one person on a walk-through stool / chair (hips on the seat). */
function sitOn(k: Kit, key: string, x: number, z: number, rot: number, clipId: string): number[] {
  k.prop(key, { x, z, rot }, { walkThrough: true });
  return k.seated(key, { x, z, rot }, { place: false, fill: 1, clips: [clipId] });
}

export function dominoBooks(k: Kit, shop: PlacedHouse): void {
  k.vignette(
    {
      id: 'bookshop-dominoes',
      title: 'The bookshop dominoes',
      story: 'Outside the bookshop the pavement shelves are toppling one onto the next, and the last one is leaning over a reader who has not looked up from his novel.',
    },
    () => {
      const o = frontOf(k, shop, 2.3, -3.4);
      const chain = { x: o.x, z: o.z, rot: R + Math.PI / 2 };
      const shelves: ReadonlyArray<readonly [number, number]> = [
        [-2.2, 90],
        [0, 45],
        [1.4, 25],
        [2.25, 10],
      ];
      for (const [d, deg] of shelves) {
        const p = k.rel(chain, 0, d);
        k.add(bookshelfLean(deg), { x: p.x, z: p.z, rot: chain.rot });
        const lean = Math.sin((deg * Math.PI) / 180) * 2;
        const c = k.rel(chain, 0, d + lean / 2);
        k.block(c.x, c.z, 1.2, 0.36 + lean, chain.rot);
      }
      const books = k.rel(chain, 0.2, -0.6);
      k.prop('books.scattered', { x: books.x, z: books.z, rot: chain.rot });
      const seat = k.rel(chain, 0, 3.15);
      const reader = sitOn(k, 'cafe.stool', seat.x, seat.z, chain.rot, clip('sit.read', 'sit'))[0];
      if (reader !== undefined) k.searchable(reader, 'the oblivious reader');
      const pile = k.rel(chain, 0.55, 3.3);
      k.prop('books.pile.tall', { x: pile.x, z: pile.z });
      const seller = k.rel(chain, -1.3, 1.0, Math.PI / 2);
      k.person({ ...seller, clip: clip('comedy.startle', 'cheer'), hold: opts('upper.apron'), look: { glasses: 'face.glasses.round', hat: null, shirt: 'sage', pattern: 0 } });
      const kid = k.rel(chain, 1.5, 2.2, -Math.PI / 2);
      k.person({ ...kid, age: 'child', clip: clip('point.across', 'point') });
      const gran = k.rel(chain, 1.7, 0.6, -Math.PI / 2);
      k.person({ ...gran, age: 'elder', clip: clip('comedy.facepalm', 'lookout'), hold: [{ key: 'hold.umbrella', tint: 'blue' }] });
      for (const along of [1.2, 2.6]) {
        const s = frontOf(k, shop, 0.3, along);
        k.prop('bookshelf.upright', { x: s.x, z: s.z, rot: R });
      }
    },
  );
}

export function waiterStumble(k: Kit, x: number, z: number): void {
  k.vignette(
    {
      id: 'waiter-stumble',
      title: 'Mind the tray!',
      story: 'A waiter catches his foot on a chair leg: cups and saucers sail off his tray toward a table of diners who are only just noticing.',
    },
    () => {
      const w = k.person({
        x,
        z,
        heading: 0.5,
        clip: clip('carry.wobble', 'comedy.trip', 'cheer'),
        hold: opts('upper.apron'),
        look: { shirt: 'ivory', pattern: 0, pants: 'ink', longLegs: true, hat: null },
      });
      k.searchable(w, 'the stumbling waiter');
      k.prop('cafe.chair.bistro', { x: x - 0.35, z: z - 0.55, rot: 1.9 }, { walkThrough: true });
      for (let i = 0; i < 3; i++) {
        const t = k.toss([x + 0.5 + i * 0.25, 1.5, z + 0.5 + i * 0.15], 0.5, 0.6 + i * 0.07, i * 0.3, 0.7, 1.1);
        k.dynamic(flyingCup(), t);
      }
      table(k, x + 1.6, z + 1.5, { chairs: 3, top: 'tabletop.spill', fill: 1, turn: 0.4, clips: [clip('sit.talk', 'sit')] });
      k.person({ x: x + 2.9, z: z + 0.2, face: [x, z], clip: clip('comedy.startle', 'point') });
      k.person({ x: x - 1.2, z: z + 1.1, face: [x, z], clip: clip('point.across', 'point'), age: 'child' });
    },
  );
}

export function proposal(k: Kit, x: number, z: number): void {
  k.vignette(
    {
      id: 'proposal-pigeon',
      title: 'Will you marry me?',
      story: 'A suitor down on one knee offers a ring beside a café table; his sweetheart is speechless, the neighbours applaud, and a pigeon on the table has eyes only for the sparkle.',
    },
    () => {
      k.prop('cafe.table.round', { x, z });
      k.prop('tabletop.wine', { x, z, y: 0.75 });
      const chair = { x: x - 0.64, z, rot: Math.PI / 2 };
      k.prop('cafe.chair.bistro', { ...chair, tint: 'coral' }, { walkThrough: true });
      k.seated('cafe.chair.bistro', chair, { place: false, fill: 1, clips: [clip('sit.talk', 'sit')] });
      const kneel = k.person({ x: x - 0.4, z: z + 1.05, heading: Math.PI - 0.35, clip: clip('propose', 'kneel', 'garden.plant', 'greet.bow'), speed: 0.25, look: { shirt: 'blueDeep', pattern: 0, pants: 'ink', longLegs: true, hat: null } });
      k.searchable(kneel, 'the nervous suitor');
      k.add(ringBox(), { x: x - 0.48, z: z + 0.62, y: 0.58, rot: Math.PI });
      k.prop('animal.pigeon.stand', { x: x + 0.05, z: z + 0.28, y: 0.75, rot: Math.PI + 0.8 });
      k.prop('animal.pigeon.peck', { x: x + 0.9, z: z + 1.3, rot: 2.4 });
      waiter(k, x + 1.3, z - 0.3, [x, z], 'pour');
      k.person({ x: x + 1.6, z: z + 1.4, face: [x - 0.4, z + 1], clip: clip('cheer.clap', 'cheer') });
      k.person({ x: x + 2.2, z: z + 0.8, face: [x - 0.4, z + 1], clip: clip('cheer.clap', 'cheer'), age: 'elder' });
      k.person({ x: x - 1.6, z: z + 2.0, face: [x - 0.4, z + 1], clip: clip('photo.camera', 'point') });
    },
  );
}

export function accordionist(k: Kit, x: number, z: number): void {
  k.vignette(
    {
      id: 'accordionist',
      title: 'Polka by the fountain',
      story: 'An accordionist squeezes out a polka by the fountain; an elderly couple waltzes, children hop along and the busker case slowly fills.',
    },
    () => {
      const m = k.person({ x, z, heading: 0.1, clip: clip('accordion.squeeze', 'accordion.polka', 'talk'), hold: opts('hold.accordion'), look: { hat: opt('hat.fedora', 'hat.beret'), hatTint: 'coralDeep', shirt: 'butter', pattern: 2, shirt2: 'ivory' } });
      k.searchable(m, 'the accordionist');
      k.prop('music.buskerCase', { x: x + 0.2, z: z + 0.9, rot: 0.2 });
      k.person({ x: x - 2.1, z: z + 1.6, face: [x - 1.7, z + 2.3], clip: clip('waltz.lead', 'talk'), age: 'elder' });
      k.person({ x: x - 1.7, z: z + 2.3, face: [x - 2.1, z + 1.6], clip: clip('waltz.follow', 'talk'), age: 'elder', look: { lower: opt('lower.dress.long', 'lower.dress') } });
      k.person({ x: x + 1.7, z: z + 1.9, heading: 0.4, age: 'child', clip: clip('jig.kick', 'cheer.jump', 'cheer') });
      k.person({ x: x + 2.4, z: z + 1.2, heading: -0.6, age: 'child', clip: clip('kid.hop', 'cheer') });
      for (let i = 0; i < 6; i++) {
        const a = -1.0 + i * 0.4;
        k.person({ x: x + Math.sin(a) * 3.4, z: z + Math.cos(a) * 3.4, face: [x, z], clip: k.rng.pick([clip('cheer.clap', 'cheer'), 'stand', clip('idle.watch', 'stand'), 'talk']) });
      }
    },
  );
}

export function chess(k: Kit, x: number, z: number): void {
  k.vignette(
    {
      id: 'chess-match',
      title: 'Check… mate?',
      story: 'Two old rivals hunch over a chessboard outside the café while three kibitzers all point at different pieces and one spectator has fallen asleep on the bench.',
    },
    () => {
      k.prop('cafe.table.square', { x, z, rot: 0 });
      k.add(chessboard(), { x, z, y: 0.75, rot: 0.1 });
      sitOn(k, 'cafe.stool', x - 0.62, z, Math.PI / 2, clip('sit.crossed', 'sit'));
      sitOn(k, 'cafe.stool', x + 0.62, z, -Math.PI / 2, clip('sit', 'sit'));
      k.person({ x: x - 0.3, z: z + 0.95, face: [x, z], clip: clip('point.down', 'point'), age: 'elder', hold: ['hold.stick'] });
      k.person({ x: x + 0.5, z: z + 1.0, face: [x, z], clip: clip('point.down', 'point') });
      k.person({ x: x + 1.2, z: z - 0.8, face: [x, z], clip: clip('idle.behind', 'lookout'), age: 'elder' });
      sitOn(k, 'bench.park', x + 0.3, z + 2.6, 0, clip('sit.asleep', 'sit'));
    },
  );
}
