/** Where times are kept. The handler only knows this interface. */
import { type Board, type LeaderboardEntry, bestPerName } from '../../shared/leaderboard.js';

/** people a board keeps (best first); beyond this the slowest drop off */
export const MAX_PEOPLE = 5_000;

export interface ScoreStore {
  /** Record one time. */
  add(entry: LeaderboardEntry): Promise<void>;
  /** The best `limit` people (one entry each: their best time) and how many people there are in all. */
  top(limit: number): Promise<Board>;
}

/** Raised when the board cannot be read or written (for instance its file is not writable). */
export class StoreUnavailableError extends Error {
  constructor(message = 'Leaderboard storage is not available') {
    super(message);
    this.name = 'StoreUnavailableError';
  }
}

/** Keeps times in memory only: for tests, and for running without a file (lost when the server stops). */
export class MemoryStore implements ScoreStore {
  /** one entry per person (their best), best first */
  private people: readonly LeaderboardEntry[] = [];

  constructor(private readonly capacity = MAX_PEOPLE) {}

  async add(entry: LeaderboardEntry): Promise<void> {
    this.people = bestPerName([...this.people, entry]).slice(0, this.capacity);
  }

  async top(limit: number): Promise<Board> {
    return { entries: this.people.slice(0, limit), total: this.people.length, more: false };
  }
}
