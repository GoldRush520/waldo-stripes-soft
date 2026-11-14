/**
 * Café Lanes & Bakery.
 *
 * Tight lanes between four irregular blocks of shop houses (see cafe/plan.ts): tall terraces on
 * the north edge broken by the bakery yard with its brick chimney (the landmark) and a passage;
 * two low back-to-back interior blocks with roof terraces; the Bakery Piazza with its fountain and
 * café terraces; Book Square in the east; a florist & café garden and a chess & proposal terrace
 * on the open south side that faces the camera. Waiters weave, bunting crosses the lanes.
 */
import type { Kit } from '../kit';
import { buildBakery } from './cafe/bakery';
import { decoys, fillCrowd, targetSpots } from './cafe/crowd';
import { buildDecor } from './cafe/decor';
import { table, terrace, waiter } from './cafe/dining';
import { type V3 } from './cafe/plan';
import { balconies, roofs, walkers } from './cafe/population';
import { accordionist, chess, dominoBooks, proposal, waiterStumble } from './cafe/stories';
import { balconyGossip, florist, pancakeSummit, rooftopToast, sweeperPigeons, wateredCleaner } from './cafe/stories2';
import { type Terraces, buildTerraces, frontOf } from './cafe/terraces';

const WAITER_LOOPS: ReadonlyArray<readonly V3[]> = [
  [
    [-12.6, 0, -9],
    [-7.9, 0, -9],
    [-7.9, 0, 1.6],
    [-12.6, 0, 1.6],
  ],
  [
    [-33.2, 0, 14.8],
    [-20.4, 0, 14.8],
    [-20.4, 0, 22.4],
    [-33.2, 0, 22.4],
  ],
];

function cafeTerraces(k: Kit, t: Terraces): void {
  terrace(k, { x: -10.2, z: -3.5 }, 2, 4, { gap: [2.2, 2.6], parasols: 0.5 });
  terrace(k, { x: 3.6, z: -4.0 }, 2, 3, { gap: [2.2, 2.6], parasols: 0.5 });
  terrace(k, { x: -27, z: 18.6 }, 5, 3, { gap: [2.4, 2.5], parasols: 0.45 });
  terrace(k, { x: 14, z: 12.4, rot: 0.08 }, 4, 2, { gap: [2.4, 2.4], parasols: 0.5 });
  terrace(k, { x: 37.2, z: -2.0 }, 2, 2, { gap: [2.3, 2.4], parasols: 0.5 });
  for (const u of [-2.8, 0, 2.8]) {
    const p = frontOf(k, t.corner, 1.6, u);
    table(k, p.x, p.z, { chairs: 2, turn: Math.PI / 2 });
  }
  const lane1 = t.nw[0];
  if (lane1) {
    for (const u of [-1.6, 1.6]) {
      const p = frontOf(k, lane1, 1.3, u);
      table(k, p.x, p.z, { chairs: 2, turn: Math.PI / 2 + 0.16, square: true });
    }
  }
  waiter(k, -6.9, -6.0, [-9.1, -6.0], 'order');
  waiter(k, 6.0, -5.5, [4.7, -4.0], 'wipe');
  waiter(k, -24.6, 15.3, [-24.6, 16.1], 'order');
  waiter(k, 18.6, 10.2, [17.6, 11.2], 'tray');
  waiter(k, 34.8, -1.8, [36.0, -2.0], 'pour');
}

function stories(k: Kit, t: Terraces): void {
  buildBakery(k, t.bakery);
  const shop = t.neb[t.neb.length - 1];
  if (shop) dominoBooks(k, shop);
  waiterStumble(k, 2.0, 2.2);
  proposal(k, 21.2, 11.6);
  accordionist(k, -4, 4.6);
  chess(k, 29.5, 9.8);
  const [n0, n1] = t.nea;
  if (n0 && n1) balconyGossip(k, n0, n1);
  const nw0 = t.nw[0];
  if (nw0) wateredCleaner(k, nw0);
  pancakeSummit(k, -18.8, 19.4);
  rooftopToast(k, t.corner);
  const fl = t.c1s[0];
  if (fl) florist(k, fl);
  sweeperPigeons(k, -10.2, 5.0);
}

export function buildCafe(k: Kit): void {
  buildDecor(k);
  const t = buildTerraces(k);
  stories(k, t);
  cafeTerraces(k, t);
  const storied = [t.nea[0], t.nea[1], t.nw[0], t.corner].filter((h) => h !== undefined);
  balconies(
    k,
    t.all.filter((h) => !storied.includes(h)),
  );
  roofs(k, t.all, [t.corner]);
  walkers(k, WAITER_LOOPS);
  decoys(k);
  fillCrowd(k);
  targetSpots(k);
}
