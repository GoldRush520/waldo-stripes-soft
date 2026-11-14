/**
 * Leaderboard contract shared by the browser and the server: types, limits and the pure helpers
 * both sides must agree on. No dependencies, no DOM, no Node APIs.
 */

export interface LeaderboardEntry {
  /** random id assigned by the server; lets a browser recognise its own entry */
  readonly id: string;
  readonly name: string;
  /** time taken to find Waldo, milliseconds */
  readonly timeMs: number;
  /** when it was recorded, milliseconds since the epoch */
  readonly at: number;
}

export interface Board {
  /** one entry per person (their best time), best first */
  readonly entries: readonly LeaderboardEntry[];
  /** how many people are on the board in all (at least entries.length) */
  readonly total: number;
  /** true when more times exist than the server could count */
  readonly more: boolean;
}

export interface Submission {
  readonly name: string;
  readonly timeMs: number;
  readonly wrongClicks: number;
  readonly seed: string;
}

/** Envelope of every API response. */
export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
}

export const NAME_MAX = 16;
/** nobody loads the page, reads the scene and finds him faster than this */
export const TIME_MIN_MS = 2_000;
export const TIME_MAX_MS = 6 * 60 * 60 * 1000;
export const WRONG_CLICKS_MAX = 9_999;
export const SEED_MAX = 40;
/** entries returned by the API */
export const BOARD_SIZE = 50;

export const EMPTY_BOARD: Board = { entries: [], total: 0, more: false };

/** Control characters, zero-width and bidirectional marks, and angle brackets (by code point). */
function unwanted(cp: number): boolean {
  return (
    cp <= 0x1f ||
    (cp >= 0x7f && cp <= 0x9f) ||
    (cp >= 0x200b && cp <= 0x200f) ||
    (cp >= 0x2028 && cp <= 0x202e) ||
    (cp >= 0x2060 && cp <= 0x206f) ||
    /* half of a surrogate pair on its own: not a character, and it does not survive storage */
    (cp >= 0xd800 && cp <= 0xdfff) ||
    cp === 0xfeff ||
    cp === 0x3c ||
    cp === 0x3e
  );
}

/** how many more cleaning passes a name may need before it stops changing (a real name needs none) */
const SETTLE_PASSES = 4;

function cleanOnce(raw: string): string {
  const spaced = raw.normalize('NFKC').replace(/\s+/g, ' ');
  const kept = [...spaced]
    .filter((ch) => !unwanted(ch.codePointAt(0) ?? 0))
    .join('')
    /* taking a character out can bring a letter and its accent together: join them */
    .normalize('NFKC')
    .replace(/ {2,}/g, ' ')
    .trim();
  return [...kept].slice(0, NAME_MAX).join('').trim();
}

/** `name` once cleaning it again changes nothing, or '' if it never gets there. */
function settled(name: string, passesLeft: number): string {
  const again = cleanOnce(name);
  if (again === name) return name;
  return passesLeft > 0 ? settled(again, passesLeft - 1) : '';
}

/**
 * Normalise a player name: whitespace collapsed, control and invisible characters and angle
 * brackets removed, trimmed and cut to NAME_MAX characters. Returns '' when nothing usable is left.
 * Cleaning a cleaned name gives the same name, so a stored name can always be checked again.
 */
export function cleanName(raw: string): string {
  return settled(cleanOnce(raw), SETTLE_PASSES);
}

/** Best time first; equal times are ordered by who recorded theirs first. */
export function compareEntries(a: LeaderboardEntry, b: LeaderboardEntry): number {
  return a.timeMs - b.timeMs || a.at - b.at || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

/** How usernames are compared: spellings that differ only in letter case are one person. */
export function nameKey(name: string): string {
  return name.toLowerCase();
}

/** One time per person (their best), best first. The board lists people, not runs. */
export function bestPerName(entries: readonly LeaderboardEntry[]): LeaderboardEntry[] {
  const best = new Map<string, LeaderboardEntry>();
  for (const entry of entries) {
    const key = nameKey(entry.name);
    const seen = best.get(key);
    if (!seen || compareEntries(entry, seen) < 0) best.set(key, entry);
  }
  return [...best.values()].sort(compareEntries);
}

/** 1-based position `entry` takes among `entries` (which need not contain it). */
export function rankAmong(entries: readonly LeaderboardEntry[], entry: LeaderboardEntry): number {
  let rank = 1;
  for (const other of entries) if (other.id !== entry.id && compareEntries(other, entry) < 0) rank++;
  return rank;
}

/** The board with `entry` included (once), still sorted. */
export function withEntry(board: Board, entry: LeaderboardEntry): Board {
  if (board.entries.some((e) => e.id === entry.id)) return board;
  return { ...board, entries: [...board.entries, entry].sort(compareEntries), total: board.total + 1 };
}

/** Milliseconds -> "m:ss.t" (tenths), e.g. 83400 -> "1:23.4". */
export function formatRunTime(ms: number): string {
  const safe = Number.isFinite(ms) && ms > 0 ? ms : 0;
  const tenths = Math.floor(safe / 100);
  const minutes = Math.floor(tenths / 600);
  const seconds = Math.floor((tenths % 600) / 10);
  return `${minutes}:${String(seconds).padStart(2, '0')}.${tenths % 10}`;
}
