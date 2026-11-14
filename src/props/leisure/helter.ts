/** Helter-skelter: striped tower with gallery, conical roof and a three-turn spiral slide. */
import { type Geo, box, cone, detail, farOnly, merge, rotateY, rotateZ, tintable, translate } from '../../core/geo';
import type { PropDef } from '../registry';
import { boxAt, bulbs, canopyProfile, flagOnPole, post, prop, revolve, stripedRevolve } from './kit';

const TOWER_H = 8.5;
const SLIDE_R = 2.62;
const SLIDE_TOP = 8.2;
const SLIDE_BOTTOM = 0.45;
const TURNS = 3;

function tower(): Geo {
  const wall = stripedRevolve(
    [
      [2.0, 0],
      [1.72, TOWER_H],
      [0.01, TOWER_H],
    ],
    12,
    1,
    'blue',
    'ivory',
  );
  const gallery = translate(revolve([[0.01, 0], [2.35, 0], [2.35, 0.2], [0.01, 0.2]], 'clay', 16), 0, TOWER_H, 0);
  const roof = translate(stripedRevolve(canopyProfile(2.6, 2.4), 12, 1, 'coral', 'ivory'), 0, TOWER_H + 1.9, 0);
  const roofPosts = merge(
    Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      return post(Math.sin(a) * 2.2, Math.cos(a) * 2.2, 1.95, 0.06, 'ivory', 5, TOWER_H + 0.1);
    }),
  );
  const rail = detail(translate(revolve([[2.33, 0.9], [2.33, 0.95], [2.28, 0.95], [2.28, 0.9], [2.33, 0.9]], 'ivory', 16), 0, TOWER_H, 0));
  const flag = translate(flagOnPole(1.0, 'coral'), 0, TOWER_H + 4.3, 0);
  const finial = translate(cone(0.12, 0.3, 'butter', 6), 0, TOWER_H + 4.2, 0);
  return merge(wall, gallery, roof, roofPosts, rail, flag, finial);
}

function slideAngle(t: number): number {
  return -TURNS * Math.PI * 2 * (1 - t);
}

function slideY(t: number): number {
  return SLIDE_TOP + (SLIDE_BOTTOM - SLIDE_TOP) * t;
}

function chuteSegment(t0: number, t1: number, withLips: boolean, stripe: boolean): Geo {
  const a0 = slideAngle(t0);
  const a1 = slideAngle(t1);
  const am = (a0 + a1) / 2;
  const len = (a1 - a0) * SLIDE_R * 1.04;
  const slope = Math.atan2(slideY(t1) - slideY(t0), (a1 - a0) * SLIDE_R);
  const col = stripe ? 'coral' : 'ivory';
  const floor = box(len, 0.1, 0.72, col);
  const lips = withLips
    ? [translate(box(len, 0.32, 0.06, 'butter'), 0, 0, 0.36), translate(box(len, 0.22, 0.05, 'butter'), 0, 0, -0.36)]
    : [];
  const seg = rotateZ(merge(stripe ? tintable(floor) : floor, lips), slope);
  const ym = (slideY(t0) + slideY(t1)) / 2;
  return translate(rotateY(seg, am), Math.sin(am) * SLIDE_R, ym - 0.05, Math.cos(am) * SLIDE_R);
}

function slide(): Geo {
  const nearN = 54;
  const farN = 18;
  const near = Array.from({ length: nearN }, (_, i) => chuteSegment(i / nearN, (i + 1) / nearN, true, i % 2 === 0));
  const far = Array.from({ length: farN }, (_, i) => chuteSegment(i / farN, (i + 1) / farN, false, i % 2 === 0));
  const runout = boxAt(2.4, SLIDE_BOTTOM, 0.8, 'butter', 1.2, 0, SLIDE_R);
  const mat = detail(boxAt(1.2, 0.08, 1.0, 'sage', 3.0, 0, SLIDE_R));
  return merge(detail(merge(near)), farOnly(merge(far)), runout, mat);
}

function entrance(): Geo {
  const door = boxAt(0.95, 1.8, 0.12, 'cocoa', 0, 0.45, 0);
  const steps = [0, 1, 2].map((i) => boxAt(1.3, 0.15 * (i + 1), 0.3, 'stone', 0, 0, 0.9 - i * 0.3));
  const landing = boxAt(1.3, 0.45, 0.5, 'stone', 0, 0, 0.25);
  const topDoor = boxAt(0.8, 1.2, 0.12, 'cocoa', 0, SLIDE_TOP + 0.2 - 0.01, -0.02);
  const front = rotateY(translate(merge(door, steps, landing), 0, 0, 1.95), Math.PI / 2);
  const top = translate(topDoor, 0, 0, 1.75);
  return merge(front, top);
}

function helterBuild(): Geo {
  const lights = bulbs(
    Array.from({ length: 20 }, (_, i) => {
      const a = (i / 20) * Math.PI * 2;
      return [Math.sin(a) * 2.62, TOWER_H + 1.85, Math.cos(a) * 2.62] as const;
    }),
  );
  return merge(tower(), slide(), entrance(), lights);
}

export const HELTER_PROPS: readonly PropDef[] = [
  prop('fair.helterskelter', helterBuild, [6.4, 6.4], 'landmark', { tags: ['funfair', 'ride', 'landmark'], tint: 'coral' }),
];
