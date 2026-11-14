/**
 * The leaderboard as the page knows it: one small observable shared by the always-visible top ten
 * under the clock and the win card's "save my time" form.
 */
import { type Board, type LeaderboardEntry, bestPerName, nameKey } from '../../../shared/leaderboard';
import { LeaderboardError, loadBoard } from './client';

/** places shown on the board */
export const TOP_ROWS = 10;

export interface BoardState {
  /** the board as last loaded; null until the first answer */
  readonly board: Board | null;
  /** the time this browser saved for the current run */
  readonly own: LeaderboardEntry | null;
  /** why the latest refresh failed, in words that can be shown; null when it worked */
  readonly error: string | null;
}

/** One place on the board; `entry` is null for a place nobody holds yet. */
export interface Slot {
  readonly rank: number;
  readonly entry: LeaderboardEntry | null;
  readonly own: boolean;
}

export interface BoardSlots {
  /** always `rows` places, best first; each person appears once, with their best time */
  readonly slots: readonly Slot[];
  /** the player's place, when it is below the listed ones */
  readonly extra: Slot | null;
  /** the entry that stands for the player: the saved time, or an earlier better one under the same username */
  readonly mine: LeaderboardEntry | null;
  readonly ownRank: number | null;
  /** true when the time just saved is the player's best (false: an earlier time of theirs still stands) */
  readonly improved: boolean;
  /** true when the player is below everything that was loaded, so the real rank may be lower still */
  readonly rankIsLowerBound: boolean;
}

/** The places to draw: the best `rows` people with the player's saved time merged in. */
export function boardSlots(state: BoardState, rows = TOP_ROWS): BoardSlots {
  const loaded = state.board ?? { entries: [], total: 0, more: false };
  const own = state.own;
  const people = bestPerName(own ? [...loaded.entries, own] : loaded.entries);
  const mine = own ? (people.find((e) => nameKey(e.name) === nameKey(own.name)) ?? null) : null;
  const ownRank = mine ? people.indexOf(mine) + 1 : null;
  const slots = Array.from({ length: rows }, (_, i): Slot => {
    const entry = people[i] ?? null;
    return { rank: i + 1, entry, own: entry !== null && entry === mine };
  });
  const extra = mine && ownRank !== null && ownRank > rows ? { rank: ownRank, entry: mine, own: true } : null;
  const rankIsLowerBound = ownRank !== null && ownRank === people.length && (loaded.more || loaded.total > loaded.entries.length) && ownRank > loaded.entries.length;
  return { slots, extra, mine, ownRank, improved: mine !== null && mine.id === own?.id, rankIsLowerBound };
}

export interface BoardModel {
  get(): BoardState;
  /** Called at once with the current state and again after every change; returns an unsubscribe. */
  subscribe(listener: (state: BoardState) => void): () => void;
  /** Load the board again. The previous board stays in place if this fails. */
  refresh(): Promise<void>;
  /** A new run began: the previous run's saved time is no longer "mine". */
  startRun(): void;
  /** The server accepted this run's time. */
  setOwn(entry: LeaderboardEntry): void;
}

const UNAVAILABLE = 'The leaderboard is not available right now.';

export function createBoardModel(load: () => Promise<Board> = () => loadBoard()): BoardModel {
  let state: BoardState = { board: null, own: null, error: null };
  const listeners = new Set<(state: BoardState) => void>();
  /** only the answer to the newest request is used */
  let serial = 0;
  const set = (next: BoardState): void => {
    state = next;
    for (const listener of [...listeners]) listener(state);
  };
  return {
    get: () => state,
    subscribe(listener) {
      listeners.add(listener);
      listener(state);
      return () => {
        listeners.delete(listener);
      };
    },
    async refresh() {
      const ticket = ++serial;
      try {
        const board = await load();
        if (ticket === serial) set({ ...state, board, error: null });
      } catch (error) {
        if (ticket === serial) set({ ...state, error: error instanceof LeaderboardError ? error.message : UNAVAILABLE });
      }
    },
    startRun() {
      if (state.own) set({ ...state, own: null });
    },
    setOwn(entry) {
      set({ ...state, own: entry });
    },
  };
}
