import { describe, expect, it, vi } from 'vitest';
import type { Board, LeaderboardEntry } from '../../shared/leaderboard';
import { LeaderboardError } from '../../src/ui/leaderboard/client';
import { TOP_ROWS, boardSlots, createBoardModel } from '../../src/ui/leaderboard/model';
import { savedNote } from '../../src/ui/leaderboard/panel';

const entry = (id: string, timeMs: number): LeaderboardEntry => ({ id, name: `p-${id}`, timeMs, at: 1 });
const boardOf = (count: number): Board => ({ entries: Array.from({ length: count }, (_, i) => entry(`e${i}`, 10_000 + i * 1_000)), total: count, more: false });

describe('boardSlots', () => {
  it('always gives ten numbered places, empty ones included', () => {
    const { slots, extra, ownRank } = boardSlots({ board: boardOf(3), own: null, error: null });
    expect(slots).toHaveLength(TOP_ROWS);
    expect(slots.map((s) => s.rank)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(slots.filter((s) => s.entry !== null)).toHaveLength(3);
    expect(slots[3]).toEqual({ rank: 4, entry: null, own: false });
    expect(extra).toBeNull();
    expect(ownRank).toBeNull();
  });

  it('shows only the best ten of a longer board', () => {
    const { slots } = boardSlots({ board: boardOf(25), own: null, error: null });
    expect(slots.map((s) => s.entry?.id)).toEqual(['e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9']);
  });

  it('marks the saved time when it is among the ten, even if the loaded board lacks it', () => {
    const own = entry('me', 11_500);
    const { slots, extra, ownRank } = boardSlots({ board: boardOf(5), own, error: null });
    expect(ownRank).toBe(3);
    expect(slots[2]).toEqual({ rank: 3, entry: own, own: true });
    expect(slots.filter((s) => s.own)).toHaveLength(1);
    expect(extra).toBeNull();
  });

  it('adds the saved time as an extra line when it is outside the ten', () => {
    const own = entry('me', 99_000);
    const { slots, extra, ownRank } = boardSlots({ board: boardOf(25), own, error: null });
    expect(ownRank).toBe(26);
    expect(slots.some((s) => s.own)).toBe(false);
    expect(extra).toEqual({ rank: 26, entry: own, own: true });
  });

  it('shows a person once: a slower new time leaves their best in place and says so', () => {
    const board: Board = { entries: [{ id: 'old', name: 'Ada', timeMs: 20_000, at: 1 }, entry('e1', 30_000)], total: 2, more: false };
    const own: LeaderboardEntry = { id: 'new', name: 'ada', timeMs: 25_000, at: 9 };
    const view = boardSlots({ board, own, error: null });
    expect(view.slots.filter((s) => s.entry !== null).map((s) => s.entry?.id)).toEqual(['old', 'e1']);
    expect(view.slots[0]?.own).toBe(true);
    expect(view.ownRank).toBe(1);
    expect(view.improved).toBe(false);
    expect(view.mine?.timeMs).toBe(20_000);
  });

  it('replaces a person\'s earlier time when the new one is better', () => {
    const board: Board = { entries: [entry('e0', 10_000), { id: 'old', name: 'Ada', timeMs: 20_000, at: 1 }], total: 2, more: false };
    const own: LeaderboardEntry = { id: 'new', name: 'Ada', timeMs: 8_000, at: 9 };
    const view = boardSlots({ board, own, error: null });
    expect(view.slots.filter((s) => s.entry !== null).map((s) => s.entry?.id)).toEqual(['new', 'e0']);
    expect(view.ownRank).toBe(1);
    expect(view.improved).toBe(true);
  });

  it('says when the rank can only be a lower bound', () => {
    const board: Board = { ...boardOf(50), total: 400 };
    const view = boardSlots({ board, own: entry('me', 999_000), error: null });
    expect(view.ownRank).toBe(51);
    expect(view.rankIsLowerBound).toBe(true);
    expect(boardSlots({ board: boardOf(50), own: entry('me', 999_000), error: null }).rankIsLowerBound).toBe(false);
  });

  it('has ten empty places before anything has loaded', () => {
    const { slots } = boardSlots({ board: null, own: null, error: null });
    expect(slots.every((s) => s.entry === null)).toBe(true);
  });
});

describe('createBoardModel', () => {
  it('tells subscribers at once and after every change, until they leave', async () => {
    const model = createBoardModel(() => Promise.resolve(boardOf(2)));
    const seen = vi.fn();
    const leave = model.subscribe(seen);
    expect(seen).toHaveBeenCalledTimes(1);
    await model.refresh();
    expect(seen).toHaveBeenCalledTimes(2);
    expect(model.get().board?.total).toBe(2);
    leave();
    model.setOwn(entry('me', 5_000));
    expect(seen).toHaveBeenCalledTimes(2);
  });

  it('keeps the last board when a refresh fails, and says why', async () => {
    let fail = false;
    const model = createBoardModel(() => (fail ? Promise.reject(new LeaderboardError('down')) : Promise.resolve(boardOf(4))));
    await model.refresh();
    fail = true;
    await model.refresh();
    expect(model.get().board?.total).toBe(4);
    expect(model.get().error).toBe('down');
    fail = false;
    await model.refresh();
    expect(model.get().error).toBeNull();
  });

  it('ignores an answer that arrives after a newer request', async () => {
    const pending: Array<(b: Board) => void> = [];
    const model = createBoardModel(() => new Promise<Board>((resolve) => pending.push(resolve)));
    const first = model.refresh();
    const second = model.refresh();
    pending[1]!(boardOf(7));
    await second;
    pending[0]!(boardOf(1));
    await first;
    expect(model.get().board?.total).toBe(7);
  });

  it('remembers the saved time for one run only', () => {
    const model = createBoardModel(() => Promise.resolve(boardOf(0)));
    const own = entry('me', 5_000);
    model.setOwn(own);
    expect(model.get().own).toBe(own);
    model.startRun();
    expect(model.get().own).toBeNull();
  });
});

describe('savedNote', () => {
  const board: Board = { entries: [{ id: 'old', name: 'Ada', timeMs: 20_000, at: 1 }, entry('e1', 30_000)], total: 2, more: false };

  it('gives the place when this run is the best', () => {
    expect(savedNote({ board, own: { id: 'new', name: 'Zed', timeMs: 25_000, at: 9 }, error: null })).toBe('Saved. You are number 2.');
  });

  it('points to the earlier, better time when this run did not beat it', () => {
    expect(savedNote({ board, own: { id: 'new', name: 'ada', timeMs: 25_000, at: 9 }, error: null })).toBe('Saved. Your best is still 0:20.0, number 1.');
  });

  it('admits when the place is only a lower bound, and stays short before the board has loaded', () => {
    const big: Board = { ...boardOf(50), total: 400 };
    expect(savedNote({ board: big, own: entry('me', 999_000), error: null })).toBe('Saved. You are number 51 or lower.');
    expect(savedNote({ board: null, own: entry('me', 5_000), error: null })).toBe('Saved.');
  });
});
