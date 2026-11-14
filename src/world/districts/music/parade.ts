/**
 * The marching band: one compact looping route on the pale parade ring round the bandstand, with
 * the players in ranks of three at staggered start distances. The rival busker plays on regardless.
 */
import type { Vec3 } from '../../../crowd/stores';
import type { Kit } from '../../kit';
import { BUSKER, RING, ellipse, facing, stepRate } from './plan';

const SPEED = 0.8;
const RANK_GAP = 1.25;
const FILE_GAP = 0.75;

interface Rank {
  readonly clip: string;
  readonly duration: number;
  readonly stride: number;
  readonly files: readonly number[];
}

/** front to back; durations / strides mirror the clip definitions so the feet stay in step */
const RANKS: readonly Rank[] = [
  { clip: 'march.leader', duration: 1.3, stride: 1.0, files: [0] },
  { clip: 'march.flag', duration: 1.3, stride: 1.0, files: [-1, 1] },
  { clip: 'march.trumpet', duration: 1.2, stride: 0.95, files: [-1, 0, 1] },
  { clip: 'march.trumpet', duration: 1.2, stride: 0.95, files: [-1, 0, 1] },
  { clip: 'march.band', duration: 1.2, stride: 1.0, files: [-1, 0, 1] },
  { clip: 'march.drummer', duration: 1.2, stride: 0.95, files: [-1, 0, 1] },
];

export function paradeRoute(k: Kit): ReturnType<Kit['loop']> {
  const pts: Vec3[] = ellipse(RING.x, RING.z, RING.rx, RING.rz, 32).map(([x, z]) => [x, 0, z] as Vec3);
  return k.loop(pts);
}

export function marchingBand(k: Kit): number[] {
  const route = paradeRoute(k);
  const head = route.length * 0.62;
  const ids: number[] = [];
  RANKS.forEach((rank, r) => {
    for (const f of rank.files) {
      const m = k.onRoute(route, head - r * RANK_GAP, SPEED, { lateral: f * FILE_GAP });
      const leader = r === 0;
      ids.push(
        k.person({
          x: 0,
          z: 0,
          motion: m,
          clip: rank.clip,
          speed: stepRate(SPEED, rank.duration, rank.stride),
          blob: 1,
          hold: leader ? ['upper.sash'] : ['upper.bandjacket'],
          look: {
            shirt: leader ? 'blueDeep' : 'coral',
            shirt2: 'butter',
            pattern: leader ? 0 : 5,
            pants: 'ivory',
            longLegs: true,
            longSleeves: true,
            hat: leader ? 'hat.top.tall' : 'hat.officer',
            hatTint: leader ? 'coral' : 'blueDeep',
          },
        }),
      );
    }
  });
  return ids;
}

export function rivalBusker(k: Kit): void {
  k.vignette(
    {
      id: 'drowned-busker',
      title: 'Battle of the bands',
      story: 'A lone busker strums his heart out beside his open case just as the brass of the marching band thunders past; his listeners have all turned to watch the parade.',
    },
    () => {
      k.person({ x: BUSKER.x, z: BUSKER.z, heading: 0.7, clip: 'guitar.busk', look: { hat: 'hat.beanie', hatTint: 'sage', shirt: 'sage', pattern: 4, longLegs: true } });
      k.prop('music.buskerCase', { x: BUSKER.x + 0.55, z: BUSKER.z + 1.0, rot: 0.7 });
      const band: [number, number] = [RING.x - RING.rx, BUSKER.z];
      const fans: ReadonlyArray<readonly [number, number, string]> = [
        [-1.0, 1.6, 'lookout'],
        [-0.2, 2.2, 'point.across'],
        [0.8, 2.3, 'cheer.clap'],
        [1.4, 1.2, 'cheer.jump'],
        [-1.4, 0.6, 'talk.shrug'],
      ];
      fans.forEach(([dx, dz, clip], i) => {
        const x = BUSKER.x + dx;
        const z = BUSKER.z + dz;
        k.person({ x, z, heading: facing(x, z, band[0], band[1] + 2), clip, age: i === 3 ? 'child' : 'adult' });
      });
    },
  );
}
