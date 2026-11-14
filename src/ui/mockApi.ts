/**
 * In-memory GameApi for manual HUD development (not imported by production code).
 * Simulates loading, the clock, pause and click feedback (no hints, no portrait).
 */
import type { ClickFeedback, GameApi, GameState, QualitySetting } from '../game/api';
import { createRng } from '../core/rng';

const INITIAL: GameState = {
  status: 'loading', seed: 'soft-harbour-01', paused: false, reducedMotion: false, quality: 'auto',
  hintLevel: 0, hintText: null, elapsedMs: 0, wrongClicks: 0, hintsUsed: 0,
  secondary: [
    { id: 'juggler', label: 'the juggler', found: false },
    { id: 'kite', label: 'a red kite', found: false },
    { id: 'cat', label: 'a sleepy cat', found: false },
  ],
  lastClick: null, marker: null, progress: 0,
};

export interface MockApi extends GameApi {
  /** simulate a click on the world (kinds cycle miss → decoy → secondary → hit) */
  simulateClick(x: number, y: number): void;
  dispose(): void;
}

export function createMockApi(): MockApi {
  let state: GameState = INITIAL;
  let listeners: ReadonlyArray<(s: GameState) => void> = [];
  let clickCount = 0;
  let lastTick = performance.now();

  const emit = (patch: Partial<GameState>): void => {
    state = { ...state, ...patch };
    listeners.forEach((l) => l(state));
  };

  const tick = (): void => {
    const now = performance.now();
    const dt = now - lastTick;
    lastTick = now;
    if (state.status === 'loading') {
      const progress = Math.min(1, state.progress + 0.02);
      emit(progress >= 1 ? { progress, status: 'playing' } : { progress });
    } else if (state.status === 'playing' && !state.paused) {
      emit({ elapsedMs: state.elapsedMs + dt });
    }
  };
  const timer = window.setInterval(tick, 50);

  const fresh = (seed: string): Partial<GameState> => ({
    ...INITIAL, status: 'playing', progress: 1, seed, reducedMotion: state.reducedMotion, quality: state.quality,
  });

  return {
    getState: () => state,
    subscribe(listener) {
      listeners = [...listeners, listener];
      return () => {
        listeners = listeners.filter((l) => l !== listener);
      };
    },
    setPaused: (paused) => emit({ paused }),
    setWaiting: () => undefined,
    setReducedMotion: (reducedMotion) => emit({ reducedMotion }),
    setQuality: (quality: QualitySetting) => emit({ quality }),
    requestHint: () => undefined,
    resetView: () => undefined,
    zoomBy: () => undefined,
    rotateBy: () => undefined,
    restart: () => emit(fresh(state.seed)),
    newPuzzle: (seed) => emit(fresh(seed ?? `seed-${Math.floor(createRng(Date.now()).next() * 1e6)}`)),
    renderPortrait: () => undefined,
    simulateClick(x, y) {
      if (state.status !== 'playing') return;
      const kinds: ClickFeedback['kind'][] = ['miss', 'decoy', 'secondary', 'hit'];
      const kind = kinds[clickCount % kinds.length] ?? 'miss';
      clickCount += 1;
      const lastClick: ClickFeedback = {
        kind, x, y, serial: clickCount, message: null,
      };
      if (kind === 'hit') {
        emit({ lastClick, status: 'won', marker: { x, y, radius: 34, kind: 'found' } });
      } else if (kind === 'secondary') {
        const idx = state.secondary.findIndex((t) => !t.found);
        emit({ lastClick, secondary: state.secondary.map((t, i) => (i === idx ? { ...t, found: true } : t)) });
      } else {
        emit({ lastClick, wrongClicks: state.wrongClicks + 1 });
      }
    },
    dispose: () => window.clearInterval(timer),
  };
}
