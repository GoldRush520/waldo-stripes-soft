/** Persisted HUD preferences (per-browser convenience only; every access is guarded). */
const MOTION_KEY = 'wss-reduced-motion-choice';
const BOARD_KEY = 'wss-board';

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode / blocked): the choice simply is not remembered */
  }
}

export function rememberReducedMotion(on: boolean): void {
  write(MOTION_KEY, on ? 'on' : 'off');
}

/**
 * Whether the top ten starts open: the player's last choice if there is one, otherwise open on a
 * roomy screen and closed on a small one (where it would cover too much of the town).
 */
export function initialBoardOpen(stored: string | null, smallScreen: boolean): boolean {
  if (stored === 'open') return true;
  if (stored === 'closed') return false;
  return !smallScreen;
}

export function storedBoardChoice(): string | null {
  return read(BOARD_KEY);
}

export function rememberBoardOpen(open: boolean): void {
  write(BOARD_KEY, open ? 'open' : 'closed');
}
