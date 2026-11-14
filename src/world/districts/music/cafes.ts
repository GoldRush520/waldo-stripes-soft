/**
 * Café terraces in front of the north and east house rows, the dancing waiter and the ice-cream cart
 * with its queue in the open south-east corner.
 */
import type { Kit } from '../../kit';
import { ICECREAM, facing } from './plan';

const NORTH = { x0: -6.57, z0: -27.11, ux: 0.965, uz: -0.263, nx: 0.263, nz: 0.965, rot: 0.266 } as const;
const DINE = ['sit.eat', 'sit.talk', 'sit', 'sit.crossed', 'sit.talk', 'sit.read'] as const;
const apron = ['upper.apron'] as const;

function tableSet(k: Kit, x: number, z: number, rot: number, parasol: boolean): void {
  k.prop('cafe.set.round2', { x, z, rot }, { walkThrough: true });
  k.block(x, z, 0.76, 0.76, rot);
  k.seated('cafe.set.round2', { x, z, rot }, { place: false, clips: DINE, fill: 0.9 });
  if (parasol) k.prop('parasol.open', { x, z, rot, tint: k.rng.pick(['coral', 'blue', 'butter', 'sage']) }, { walkThrough: true });
}

function northTerrace(k: Kit): void {
  for (let i = 0; i < 7; i++) {
    for (const off of [1.6, 4.0]) {
      const s = 0.4 + i * 2.35 + (off > 2 ? 1.1 : 0);
      if (off > 2 && i > 5) continue;
      const x = NORTH.x0 + NORTH.ux * s + NORTH.nx * off;
      const z = NORTH.z0 + NORTH.uz * s + NORTH.nz * off;
      tableSet(k, x, z, NORTH.rot, (i + (off > 2 ? 1 : 0)) % 2 === 0);
    }
  }
  const cx = NORTH.x0 + NORTH.ux * 17.4 + NORTH.nx * 1.4;
  const cz = NORTH.z0 + NORTH.uz * 17.4 + NORTH.nz * 1.4;
  k.prop('cart.coffee', { x: cx, z: cz, rot: NORTH.rot });
  k.person({ x: cx - NORTH.nx * 0.85, z: cz - NORTH.nz * 0.85, heading: NORTH.rot, clip: 'serve.pour', hold: [...apron] });
  k.queue([cx + NORTH.nx * 4.2, cz + NORTH.nz * 4.2], [cx + NORTH.nx * 0.2, cz + NORTH.nz * 0.2], 4, { clips: ['stand', 'idle.phone', 'talk', 'idle.watch'] });
  for (const s of [3.5, 9.6]) {
    const x = NORTH.x0 + NORTH.ux * s + NORTH.nx * 2.8;
    const z = NORTH.z0 + NORTH.uz * s + NORTH.nz * 2.8;
    k.person({ x, z, heading: NORTH.rot + Math.PI * 0.5, clip: s > 5 ? 'serve.tray' : 'serve.order', hold: [...apron] });
  }
}

function eastTerrace(k: Kit): void {
  for (let i = 0; i < 9; i++) tableSet(k, 12.6, -27 + i * 2.45, Math.PI / 2, i % 2 === 0);
  for (let i = 0; i < 5; i++) tableSet(k, 10.0, -25.8 + i * 2.6, Math.PI / 2, i % 2 === 1);
  k.prop('cafe.easel.menu', { x: 11.2, z: -6.2, rot: -0.6 });
  k.prop('cafe.traystand', { x: 14.0, z: -12.4, rot: -Math.PI / 2 });
}

export function cafes(k: Kit): void {
  northTerrace(k);
  eastTerrace(k);
  iceCream(k);
}

export function dancingWaiter(k: Kit): void {
  k.vignette(
    {
      id: 'dancing-waiter',
      title: 'Service with a jig',
      story: 'The band strikes up a polka and the café waiter abandons his round, jigging between the tables in his apron while the diners clap along and his boss glares from the doorway.',
    },
    () => {
      k.person({ x: 11.3, z: -14.6, heading: -0.5, clip: 'jig.hands-hips', hold: [...apron], look: { shirt: 'ivory', pattern: 0, pants: 'ink', longLegs: true } });
      k.person({ x: 13.9, z: -15.9, heading: -Math.PI / 2 - 0.4, clip: 'idle.hips', hold: ['upper.waistcoat'], look: { shirt: 'blueDeep', pattern: 0, hat: 'hat.fedora', hatTint: 'cocoa' } });
      k.person({ x: 11.1, z: -13.3, heading: 2.6, clip: 'cheer.clap' });
      k.person({ x: 11.4, z: -16.0, heading: 0.3, clip: 'cheer.clap', age: 'child' });
    },
  );
}

function iceCream(k: Kit): void {
  k.prop('cart.icecream', { x: ICECREAM.x, z: ICECREAM.z });
  k.person({ x: ICECREAM.x, z: ICECREAM.z - 0.85, heading: 0, clip: 'vend.handover', hold: [...apron], look: { hat: 'hat.sailor', hatTint: 'ivory', shirt: 'blueLight', shirt2: 'ivory', pattern: 2 } });
  k.queue([ICECREAM.x - 0.4, ICECREAM.z + 3.9], [ICECREAM.x, ICECREAM.z + 0.3], 4, { clips: ['stand', 'idle.tap', 'talk', 'idle.watch'] });
  for (const [dx, dz] of [[-2.0, 1.4], [2.1, 1.0], [2.7, 1.8]] as const) {
    const x = ICECREAM.x + dx;
    const z = ICECREAM.z + dz;
    k.person({ x, z, heading: facing(x, z, ICECREAM.x, ICECREAM.z + 4), clip: 'eat.icecream', age: dx > 2.5 ? 'child' : 'adult' });
  }
}
