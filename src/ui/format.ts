/** Pure formatting and sanitising helpers for the HUD (no DOM access). */

const MAX_SEED_LENGTH = 32;

/** Milliseconds -> "mm:ss" (minutes keep growing past 99, negatives and NaN clamp to 00:00). */
export function formatTime(ms: number): string {
  const safe = Number.isFinite(ms) && ms > 0 ? ms : 0;
  const totalSeconds = Math.floor(safe / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Spoken form for screen readers, e.g. "2 minutes 5 seconds". */
export function formatTimeSpoken(ms: number): string {
  const safe = Number.isFinite(ms) && ms > 0 ? ms : 0;
  const totalSeconds = Math.floor(safe / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const parts = [
    minutes > 0 ? plural(minutes, 'minute') : '',
    plural(seconds, 'second'),
  ].filter((p) => p.length > 0);
  return parts.join(' ');
}

export function plural(n: number, word: string, many = `${word}s`): string {
  return `${n} ${n === 1 ? word : many}`;
}

/**
 * Normalise user-typed seeds: trims, collapses inner whitespace to single dashes, keeps letters,
 * digits, dash and underscore, and caps the length. Returns null when nothing usable remains.
 */
export function sanitizeSeed(raw: string): string | null {
  const cleaned = raw
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^A-Za-z0-9_-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SEED_LENGTH);
  return cleaned.length > 0 ? cleaned : null;
}

/** Win summary line used by the win card and its screen-reader announcement. */
export function winSummary(elapsedMs: number, wrongClicks: number): string {
  return `Time ${formatTimeSpoken(elapsedMs)}, ${plural(wrongClicks, 'wrong guess', 'wrong guesses')}.`;
}
