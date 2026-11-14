import type { GameApi, GameState } from '../game/api';
import type { Disposer } from './dom';

/** One self-contained HUD region: owns its DOM, updates from state diffs, cleans up after itself. */
export interface HudPart {
  readonly el: HTMLElement;
  update(prev: GameState | null, next: GameState): void;
}

/** Shared services handed to every part. */
export interface HudContext {
  readonly api: GameApi;
  readonly disposer: Disposer;
  /** polite screen-reader announcement */
  announce(text: string): void;
  /** remember an explicit user choice for reduced motion */
  rememberReducedMotion(on: boolean): void;
}
