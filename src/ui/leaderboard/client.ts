/** Browser side of the leaderboard API. Responses are checked before they are trusted. */
import type { ApiResponse, Board, LeaderboardEntry, Submission } from '../../../shared/leaderboard';

const ENDPOINT = '/api/leaderboard';
const TIMEOUT_MS = 8_000;
const UNAVAILABLE = 'The leaderboard is not available right now.';

/** An error whose message can be shown to the player as it is. */
export class LeaderboardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LeaderboardError';
  }
}

type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isEntry(value: unknown): value is LeaderboardEntry {
  return (
    isRecord(value) &&
    typeof value['id'] === 'string' &&
    typeof value['name'] === 'string' &&
    typeof value['timeMs'] === 'number' &&
    Number.isFinite(value['timeMs']) &&
    typeof value['at'] === 'number'
  );
}

export function isBoard(value: unknown): value is Board {
  return isRecord(value) && Array.isArray(value['entries']) && value['entries'].every(isEntry) && typeof value['total'] === 'number' && typeof value['more'] === 'boolean';
}

async function call(fetcher: Fetcher, init: RequestInit): Promise<unknown> {
  let response: Response;
  let payload: unknown;
  try {
    response = await fetcher(ENDPOINT, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
    payload = await response.json();
  } catch {
    throw new LeaderboardError(UNAVAILABLE);
  }
  const body: Partial<ApiResponse<unknown>> = isRecord(payload) ? payload : {};
  if (!response.ok || body.success !== true) {
    throw new LeaderboardError(typeof body.error === 'string' && body.error.length < 160 ? body.error : UNAVAILABLE);
  }
  return body.data;
}

export async function loadBoard(fetcher: Fetcher = (i, o) => fetch(i, o)): Promise<Board> {
  const data = await call(fetcher, { method: 'GET', headers: { accept: 'application/json' } });
  if (!isBoard(data)) throw new LeaderboardError(UNAVAILABLE);
  return data;
}

export async function submitTime(submission: Submission, fetcher: Fetcher = (i, o) => fetch(i, o)): Promise<LeaderboardEntry> {
  const data = await call(fetcher, {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify(submission),
  });
  const entry = isRecord(data) ? data['entry'] : null;
  if (!isEntry(entry)) throw new LeaderboardError(UNAVAILABLE);
  return entry;
}
