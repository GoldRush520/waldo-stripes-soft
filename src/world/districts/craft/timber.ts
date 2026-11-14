/**
 * Timber yard (north of Yard Street) and the carpenters' corner of the work yard, with the
 * "sawing the plank he stands on" and "plank tally" stories.
 */
import { type Geo, box, detail, merge, translate } from '../../../core/geo';
import type { Kit } from '../../kit';
import { HARD_HAT, PI, SMOCK, clip, pad } from './plan';

let longPlank: Geo | null = null;

/** A 3.6 m plank (with saw kerf) that overhangs one sawhorse — built once. */
function plankGeo(): Geo {
  if (!longPlank) {
    longPlank = merge(
      box(3.6, 0.05, 0.32, 'butterLight'),
      detail(translate(box(0.03, 0.02, 0.33, 'cocoa'), 0.65, 0.035, 0)),
    );
  }
  return longPlank;
}

/** Stacks, beams, logs and the foreman's tally. */
function stacks(k: Kit): void {
  k.ground([[-13.5, -29], [-2.5, -29], [-2.5, -16], [-13.5, -16]], 'butterLight', 0.03, 0.02);
  k.prop('craft.timberPlanks', { x: -11, z: -26.6 });
  k.prop('craft.timberPlanks', { x: -7.2, z: -26.8, rot: 0.08 });
  k.prop('craft.timberLogs', { x: -12.4, z: -21.4 });
  k.prop('craft.timberBeams', { x: -8.6, z: -21.6, rot: 0.25 });
  k.prop('craft.sawdustHeap', { x: -4.4, z: -24.6 });
  k.prop('craft.workbench', { x: -4.6, z: -20.4, rot: PI / 2 });
  k.person({ x: -5.5, z: -20.4, heading: PI / 2, clip: 'vend.arrange', hold: ['upper.apron'], look: SMOCK });
  k.vignette(
    { id: 'plank-tally', title: 'The plank tally', story: 'A foreman counts the plank stack on his clipboard while, behind his back, apprentices carry the planks off one by one.' },
    () => {
      k.person({ x: -9.1, z: -24.7, heading: PI, clip: 'read.paper', look: { hat: 'hat.cap', hatTint: 'blue', shirt: 'blue', pattern: 4, pants: 'slate' } });
      k.person({ x: -6.2, z: -25.1, heading: 0.5, clip: 'carry.wobble', age: 'teen', hold: ['carry.crate'], look: HARD_HAT });
      k.person({ x: -11.6, z: -24.6, heading: -0.7, clip: 'talk.whisper', age: 'teen', look: { ...HARD_HAT, hatTint: 'coral' } });
      k.person({ x: -12.1, z: -23.9, heading: 2.4, clip: 'talk.laugh', age: 'teen', look: HARD_HAT });
    },
  );
}

/** The carpenter on the cantilevered plank end, sawing between himself and the sawhorse. */
function sawingStory(k: Kit): void {
  const at = { x: -9.4, z: -2.6, rot: 0 };
  k.prop('craft.sawhorses', at);
  k.add(plankGeo(), { x: at.x + 0.6, z: at.z, y: 0.76 });
  const top = 0.81;
  k.vignette(
    { id: 'saw-the-plank', title: 'Measure twice, saw once', story: 'A carpenter stands on the overhanging end of a plank and saws busily between his own boots and the sawhorse; his apprentice points at the cut in horror.' },
    () => {
      const carpenter = k.person({ x: at.x + 2.05, z: at.z, y: top, heading: -PI / 2 + 0.35, clip: clip('saw.cut', 'serve.wipe'), hold: ['upper.apron'], look: { ...SMOCK, hat: 'hat.cap', hatTint: 'coral', shirt: 'sage', pattern: 4 } });
      k.searchable(carpenter, 'the carpenter sawing his own plank');
      pad(k, at.x + 1.9, at.z, top, 1.2, 0.32);
      k.person({ x: at.x + 2.2, z: at.z + 1.4, heading: PI - 0.3, clip: 'point.down', age: 'teen', look: HARD_HAT });
      k.person({ x: at.x + 3.2, z: at.z + 0.9, heading: -PI / 2 - 0.4, clip: 'talk.shrug', hold: ['upper.apron'], look: SMOCK });
      k.person({ x: at.x + 0.2, z: at.z + 1.5, heading: PI - 0.2, clip: 'talk.animated', age: 'elder', hold: ['hold.stick'], look: { hat: 'hat.beret', hatTint: 'sage', pants: 'cocoa' } });
    },
  );
  k.prop('craft.timberPlanks', { x: -11.6, z: -5.4 });
  k.prop('craft.workbench', { x: -12.2, z: -1.4, rot: PI / 2 });
  k.person({ x: -11.4, z: -1.4, heading: -PI / 2, clip: 'vend.arrange', hold: ['upper.apron'], look: SMOCK });
  k.prop('craft.sawdustHeap', { x: -8.4, z: -1.4 });
}

export function timberYard(k: Kit): void {
  stacks(k);
  sawingStory(k);
}
