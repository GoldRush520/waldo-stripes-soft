/**
 * Contract between the game logic (src/game) and the HUD (src/ui).
 * The HUD only reads immutable GameState snapshots and calls GameApi methods; it never touches the
 * renderer, the camera or the world directly.
 */
export type QualitySetting = 'auto' | 'low' | 'medium' | 'high';

/** 0 = no hint yet, 1 = district named, 2 = vicinity ring shown, 3 = explicit reveal. */
export type HintLevel = 0 | 1 | 2 | 3;
export type HintReward = 'range' | 'shrink' | 'reveal';
export type HintOutline = readonly (readonly [x: number, y: number])[];

export interface SecondaryTarget {
  readonly id: string;
  /** short label, e.g. "the juggler" */
  readonly label: string;
  readonly found: boolean;
}

export interface ClickFeedback {
  /** hit = the hero, secondary = an optional search object, decoy = a look-alike, miss = anything else */
  readonly kind: 'hit' | 'secondary' | 'decoy' | 'miss';
  /** canvas-relative CSS pixels of the click */
  readonly x: number;
  readonly y: number;
  /** monotonically increasing id so the HUD can restart its animation */
  readonly serial: number;
  /** optional short message, e.g. "Close! Same hat, wrong shirt." */
  readonly message: string | null;
}

export interface GameState {
  readonly status: 'loading' | 'playing' | 'won';
  readonly runId: number;
  readonly waiting: boolean;
  /** human-readable puzzle seed shown in the HUD and accepted by newPuzzle() */
  readonly seed: string;
  readonly paused: boolean;
  readonly reducedMotion: boolean;
  readonly quality: QualitySetting;
  readonly hintLevel: HintLevel;
  /** text for the current hint level, or null */
  readonly hintText: string | null;
  readonly elapsedMs: number;
  readonly wrongClicks: number;
  readonly hintsUsed: number;
  readonly hintReward: HintReward | null;
  readonly hintOutline: HintOutline | null;
  readonly secondary: readonly SecondaryTarget[];
  readonly lastClick: ClickFeedback | null;
  /** screen position (CSS px) of the hint ring / found marker when one should be drawn, else null */
  readonly marker: { readonly x: number; readonly y: number; readonly radius: number; readonly kind: 'vicinity' | 'reveal' | 'found' } | null;
  /** loading progress 0..1 while status === 'loading' */
  readonly progress: number;
}

export interface GameApi {
  getState(): GameState;
  /** Subscribe to state changes; returns an unsubscribe function. Called at most once per frame. */
  subscribe(listener: (state: GameState) => void): () => void;
  setPaused(paused: boolean): void;
  /**
   * Hold the game before play begins (the how-to-play card is up): while waiting, the clock does
   * not run and the town cannot be moved or clicked. The scene itself keeps animating.
   */
  setWaiting(waiting: boolean): void;
  setReducedMotion(on: boolean): void;
  setQuality(q: QualitySetting): void;
  setHintAdActive(active: boolean): void;
  requestHint(runId: number): boolean;
  focusHint(): void;
  resetView(): void;
  zoomBy(factor: number): void;
  rotateBy(radians: number): void;
  /** Same town layout, same hero position, cleared progress. */
  restart(): void;
  /** New hero position from a seed string (random when omitted). */
  newPuzzle(seed?: string): void;
  /** Draw the code-built 3D reference portrait of the hero into a canvas owned by the HUD. */
  renderPortrait(canvas: HTMLCanvasElement): void;
}
