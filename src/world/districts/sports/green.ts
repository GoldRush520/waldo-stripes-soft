/**
 * The green between the pitch and the tennis court (x ≈ 0 … 15): a tug-of-war on the north half,
 * an open-air yoga class on the south half, a drinking fountain between them.
 */
import type { Col } from '../../../core/geo';
import type { Kit } from '../../kit';
import { clip, gear } from './catalog';
import { rect } from './plan';

const ROPE = { x: 7.6, z: -6.1, y: 0.95 };
const MAT_COLS: readonly Col[] = ['coral', 'blue', 'sage', 'butter'];

function tugOfWar(k: Kit): void {
  k.ground(rect(2.6, -7.4, 12.6, -4.8), 'sage', 0.03, 0.015);
  k.ground(rect(ROPE.x - 0.05, -7.5, ROPE.x + 0.05, -4.7), 'ivory', 0.045, 0.015);
  k.vignette({ id: 'tug-dominoes', title: 'Tug-of-war dominoes', story: 'The blue team gives one mighty heave and the whole butter team topples forward like dominoes, the anchor still clinging to the rope end.' }, () => {
    const blue = { shirt: 'blue', shirt2: 'ivory', pattern: 0, pants: 'blueDeep', longLegs: false } as const;
    const butter = { shirt: 'butter', shirt2: 'ivory', pattern: 0, pants: 'clayDeep', longLegs: false } as const;
    const pull = clip('tug.pull', 'pull.rope', 'pull.lead', 'carry.wobble', 'lookout');
    [4.0, 4.7, 5.4, 6.1].forEach((x, i) => {
      k.person({ x, z: ROPE.z + (i % 2 ? 0.22 : -0.22), heading: Math.PI / 2, clip: pull, look: blue });
    });
    const fall = [clip('comedy.trip', 'clown.pratfall'), clip('comedy.slip', 'clown.pratfall'), clip('clown.pratfall', 'sit.ground'), clip('lie.front', 'sit.ground'), clip('sit.ground', 'sit')];
    [9.0, 9.8, 10.6, 11.4, 12.2].forEach((x, i) => {
      k.person({ x, z: ROPE.z + (i % 2 ? -0.3 : 0.3), heading: -Math.PI / 2 + (i % 2 ? 0.25 : -0.25), clip: fall[i] ?? 'sit', look: butter });
    });
    const judge = k.person({ x: ROPE.x, z: ROPE.z - 1.2, heading: 0, clip: clip('point.sky', 'point'), look: { shirt: 'ivory', pattern: 0, pants: 'blueDeep', hat: 'hat.boater', hatTint: 'coral' } });
    k.searchable(judge, 'the tug-of-war judge');
    k.group(3.2, -8.5, 3, { clips: [clip('cheer.jump', 'cheer'), 'cheer', clip('cheer.fistpump', 'cheer')] });
    k.group(12.4, -8.6, 2, { clips: [clip('talk.laugh', 'point'), 'point'] });
  });
  k.prop('sport.tugrope', { x: ROPE.x, z: ROPE.z, y: ROPE.y });
}

function yoga(k: Kit): void {
  const rows = [1.3, 3.7];
  const cols = [2.2, 4.6, 7.0, 9.4];
  rows.forEach((z, r) =>
    cols.forEach((x, c) => {
      k.ground(rect(x - 0.9, z - 0.32, x + 0.9, z + 0.32), MAT_COLS[(r + c) % MAT_COLS.length] ?? 'coral', 0.03, 0.015);
    }),
  );
  k.ground(rect(11.6, 1.6, 13.4, 3.4), 'ivory', 0.03, 0.015);
  k.vignette({ id: 'yoga-wrong-way', title: 'Downward dog, wrong way', story: 'Eight yogis follow the instructor\'s pose in perfect unison, except one man who faces the other way and copies his bewildered neighbour.' }, () => {
    const pose = clip('yoga.warrior', 'yoga.tree', 'ballet.arabesque', 'idle.stretch', 'sway.hands-up');
    k.person({ x: 12.5, z: 2.5, heading: -Math.PI / 2, clip: pose, look: { shirt: 'sage', pattern: 0, pants: 'sageDeep', hairStyle: 'hair.bun' }, speed: 0.7, phase: 0 });
    rows.forEach((z, r) =>
      cols.forEach((x, c) => {
        const wrong = r === 1 && c === 2;
        const id = k.person({ x, z, heading: wrong ? -Math.PI / 2 : Math.PI / 2, clip: pose, speed: 0.7, phase: wrong ? 0.5 : 0, look: { pants: 'slate', longLegs: true, lower: null } });
        if (wrong) k.searchable(id, 'the yogi facing the wrong way');
      }),
    );
  });
}

function fountain(k: Kit): void {
  k.prop('fountain.drinking', { x: 13.6, z: -2.6 });
  k.person({ x: 13.6, z: -1.95, heading: Math.PI, age: 'child', clip: clip('drink.bottle', 'drink.cup', 'stand') });
  k.queue([13.4, 0.2], [13.6, -1.95], 2, { clips: ['stand', clip('idle.tap', 'stand')], spacing: 0.7 });
  k.prop('bin.litter', { x: 1.2, z: -2.8 });
  k.prop('bench.stone', { x: 6.8, z: -2.6 }, { walkThrough: true });
  k.person({ x: 6.2, z: -2.6, y: -0.02, heading: 0, clip: clip('sit.eat', 'sit'), hold: gear({ keys: ['hold.bag'], tint: 'butter' }) });
  k.person({ x: 7.4, z: -2.6, y: -0.02, heading: 0, clip: clip('sit.read', 'sit') });
}

export function buildGreen(k: Kit): void {
  tugOfWar(k);
  yoga(k);
  fountain(k);
}
