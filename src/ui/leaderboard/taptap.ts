export const TAPTAP_LEADERBOARD_ID_PLACEHOLDER = 'TAPTAP_LEADERBOARD_ID_PLACEHOLDER';

interface TapCallback<Result> {
  onSuccess(result: Result): void;
  onFailure(code: number, message: string): void;
}

interface TapScore {
  readonly leaderboardId: string;
  readonly scoreResult: { readonly rawScore: number };
}

interface TapBoardRequest<Result> {
  readonly leaderboardId: string;
  readonly collection: 'public';
  readonly callback: TapCallback<Result>;
}

interface TapPlayerScore {
  readonly currentUserScore?: { readonly rank?: number; readonly rankDisplay?: string };
}

interface TapLeaderboardManager {
  submitScores(options: {
    readonly scores: readonly { readonly leaderboardId: string; readonly score: number }[];
    readonly callback: TapCallback<{ readonly results: readonly TapScore[] }>;
  }): void;
  loadCurrentPlayerLeaderboardScore(options: TapBoardRequest<TapPlayerScore>): void;
  openLeaderboard(options: TapBoardRequest<unknown>): void;
}

function runtime() {
  return (globalThis as { tap?: { getLeaderboardManager?(): TapLeaderboardManager } }).tap;
}

function request<Result>(invoke: (callback: TapCallback<Result>) => void): Promise<Result> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return new Promise<Result>((resolve, reject) => {
    timeout = setTimeout(() => reject(new Error('TapTap leaderboard request timed out')), 8_000);
    invoke({ onSuccess: resolve, onFailure: (code, message) => reject(new Error(`${code}: ${message}`)) });
  }).finally(() => clearTimeout(timeout));
}

export function createTapTapLeaderboard(id: string = import.meta.env.VITE_TAPTAP_LEADERBOARD_ID || TAPTAP_LEADERBOARD_ID_PLACEHOLDER) {
  const leaderboardId = id.trim();
  const configured = leaderboardId !== '' && leaderboardId !== TAPTAP_LEADERBOARD_ID_PLACEHOLDER;
  const unavailable = (): string | null => {
    if (!configured) return 'TapTap 排行榜尚未配置。';
    if (typeof runtime()?.getLeaderboardManager !== 'function') return '请在 TapTap 客户端内使用排行榜。';
    return null;
  };
  const manager = (): TapLeaderboardManager => {
    const tap = runtime();
    if (!configured || typeof tap?.getLeaderboardManager !== 'function') throw new Error('TapTap leaderboard unavailable');
    return tap.getLeaderboardManager();
  };

  return {
    unavailable,
    async submitTime(elapsedMs: number): Promise<number> {
      if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) throw new Error('Invalid elapsed time');
      const response = await request<{ readonly results: readonly TapScore[] }>((callback) => manager().submitScores({
        scores: [{ leaderboardId, score: Math.ceil(elapsedMs) }],
        callback,
      }));
      const best = response?.results?.find((result) => result.leaderboardId === leaderboardId)?.scoreResult?.rawScore;
      if (typeof best !== 'number' || !Number.isFinite(best) || best <= 0) throw new Error('Missing leaderboard score');
      return best;
    },
    async loadRank(): Promise<string | null> {
      const response = await request<TapPlayerScore>((callback) => manager().loadCurrentPlayerLeaderboardScore({
        leaderboardId, collection: 'public', callback,
      }));
      const score = response?.currentUserScore;
      if (score?.rankDisplay) return score.rankDisplay;
      return score?.rank && score.rank > 0 ? String(score.rank) : null;
    },
    open(): Promise<unknown> {
      return request((callback) => manager().openLeaderboard({ leaderboardId, collection: 'public', callback }));
    },
  };
}
