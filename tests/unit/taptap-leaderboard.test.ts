import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTapTapLeaderboard, TAPTAP_LEADERBOARD_ID_PLACEHOLDER } from '../../src/ui/leaderboard/taptap';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('TapTap H5 leaderboard', () => {
  it('does not call the runtime with a placeholder ID', async () => {
    const getLeaderboardManager = vi.fn();
    vi.stubGlobal('tap', { getLeaderboardManager });
    const board = createTapTapLeaderboard(TAPTAP_LEADERBOARD_ID_PLACEHOLDER);
    expect(board.unavailable()).toBe('TapTap 排行榜尚未配置。');
    await expect(board.submitTime(1234)).rejects.toThrow('unavailable');
    expect(getLeaderboardManager).not.toHaveBeenCalled();
  });

  it('degrades outside the TapTap runtime and detects a late injection', () => {
    const board = createTapTapLeaderboard('test-board');
    expect(board.unavailable()).toBe('请在 TapTap 客户端内使用排行榜。');
    vi.stubGlobal('tap', { getLeaderboardManager: vi.fn() });
    expect(board.unavailable()).toBeNull();
  });

  it('submits whole seconds in milliseconds, uses the returned best time, and opens the public board', async () => {
    const submitScores = vi.fn(({ callback }) => callback.onSuccess({
      results: [{ leaderboardId: 'test-board', scoreResult: { rawScore: 30_000 } }],
    }));
    const loadCurrentPlayerLeaderboardScore = vi.fn(({ callback }) => callback.onSuccess({
      currentUserScore: { rank: 42, rankDisplay: '40+' },
    }));
    const openLeaderboard = vi.fn(({ callback }) => callback.onSuccess({}));
    vi.stubGlobal('tap', {
      getLeaderboardManager: () => ({ submitScores, loadCurrentPlayerLeaderboardScore, openLeaderboard }),
    });
    const board = createTapTapLeaderboard(' test-board ');
    await expect(board.submitTime(40_182)).resolves.toBe(30_000);
    expect(submitScores).toHaveBeenCalledWith(expect.objectContaining({ scores: [{ leaderboardId: 'test-board', score: 40_000 }] }));
    await expect(board.loadRank()).resolves.toBe('40+');
    await expect(board.open()).resolves.toEqual({});
    const publicBoard = expect.objectContaining({ leaderboardId: 'test-board', collection: 'public' });
    expect(loadCurrentPlayerLeaderboardScore).toHaveBeenCalledWith(publicBoard);
    expect(openLeaderboard).toHaveBeenCalledWith(publicBoard);
  });

  it('rejects absent scores and platform failures', async () => {
    const submitScores = vi.fn(({ callback }) => callback.onSuccess({ results: [] }));
    const openLeaderboard = vi.fn(({ callback }) => callback.onFailure(500001, 'invalid board'));
    vi.stubGlobal('tap', { getLeaderboardManager: () => ({ submitScores, openLeaderboard }) });
    const board = createTapTapLeaderboard('test-board');
    await expect(board.submitTime(1234)).rejects.toThrow('Missing leaderboard score');
    await expect(board.open()).rejects.toThrow('500001: invalid board');
  });

  it('times out when the runtime never calls back', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('tap', { getLeaderboardManager: () => ({ submitScores: vi.fn() }) });
    const board = createTapTapLeaderboard('test-board');
    const result = expect(board.submitTime(1234)).rejects.toThrow('timed out');
    await vi.runAllTimersAsync();
    await result;
  });
});
