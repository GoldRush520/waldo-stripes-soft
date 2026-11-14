/** Pure helpers for diffing successive GameState snapshots (no DOM). */
import type { ClickFeedback, GameState, SecondaryTarget } from '../game/api';

type Marker = GameState['marker'];

/** True when any of the listed fields differs (by identity) between prev and next; always true without prev. */
export function changed<K extends keyof GameState>(
  prev: GameState | null,
  next: GameState,
  ...keys: readonly K[]
): boolean {
  if (prev === null) return true;
  return keys.some((k) => !Object.is(prev[k], next[k]));
}

export function secondaryEqual(a: readonly SecondaryTarget[], b: readonly SecondaryTarget[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every((t, i) => {
    const o = b[i];
    return o !== undefined && o.id === t.id && o.label === t.label && o.found === t.found;
  });
}

/** Whether the secondary list's structure (ids/labels/order) changed, which requires rebuilding chips. */
export function secondaryStructureEqual(
  a: readonly SecondaryTarget[],
  b: readonly SecondaryTarget[],
): boolean {
  if (a.length !== b.length) return false;
  return a.every((t, i) => {
    const o = b[i];
    return o !== undefined && o.id === t.id && o.label === t.label;
  });
}

/** Marker equality with a sub-pixel tolerance so per-frame jitter does not touch the DOM. */
export function markerEqual(a: Marker, b: Marker, epsilon = 0.25): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  return (
    a.kind === b.kind &&
    Math.abs(a.x - b.x) < epsilon &&
    Math.abs(a.y - b.y) < epsilon &&
    Math.abs(a.radius - b.radius) < epsilon
  );
}

/** A click feedback that should start a new animation (new serial). */
export function newClick(prev: GameState | null, next: GameState): ClickFeedback | null {
  const click = next.lastClick;
  if (click === null) return null;
  const before = prev?.lastClick ?? null;
  if (before !== null && before.serial === click.serial) return null;
  return click;
}

/** Status transition helper: true exactly when status became `to` in this update. */
export function enteredStatus(prev: GameState | null, next: GameState, to: GameState['status']): boolean {
  return next.status === to && (prev === null || prev.status !== to);
}

/**
 * Initial reduced-motion decision at mount.
 * Returns the value to apply, or null when the current state should be left alone.
 */
export function initialReducedMotion(
  storedChoice: string | null,
  mediaPrefersReduced: boolean,
  current: boolean,
): boolean | null {
  if (storedChoice === 'on' || storedChoice === 'off') {
    const wanted = storedChoice === 'on';
    return wanted === current ? null : wanted;
  }
  return mediaPrefersReduced && !current ? true : null;
}
