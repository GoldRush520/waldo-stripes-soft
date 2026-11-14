/**
 * Playback speed for a person riding a route with a locomotion clip, so the feet match the travel
 * speed: one clip loop covers `stride` metres, so loops per second = v / stride.
 */
import { BASE_CLIPS } from '../../../crowd/clips/base';
import { ACTIVE_CLIPS } from '../../../crowd/clips/active';
import { EVERYDAY_CLIPS } from '../../../crowd/clips/everyday';

const STRIDES = new Map<string, { duration: number; stride: number }>(
  [...BASE_CLIPS, ...EVERYDAY_CLIPS, ...ACTIVE_CLIPS].filter((c) => (c.stride ?? 0) > 0).map((c) => [c.id, { duration: c.duration, stride: c.stride ?? 1 }]),
);

/** `speed` value for k.person({ motion, clip }) travelling at v m/s (scale ~1 adult). */
export function gaitSpeed(clip: string, v: number, scale = 1): number {
  const g = STRIDES.get(clip);
  if (!g) return 1;
  return (v * g.duration) / (g.stride * scale);
}
