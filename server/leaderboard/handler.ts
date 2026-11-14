/**
 * The leaderboard endpoint as a pure function of the request: used by the local server
 * (localApi.ts) and by the tests.
 *
 *   GET  -> { success, data: Board }
 *   POST -> { success, data: { entry } }                (body: Submission as JSON)
 */
import { type ApiResponse, BOARD_SIZE, type Board, type LeaderboardEntry } from '../../shared/leaderboard.js';
import type { RateLimiter } from './rateLimit.js';
import { parseSubmission } from './schema.js';
import { type ScoreStore, StoreUnavailableError } from './store.js';

export interface LeaderboardRequest {
  readonly method: string;
  /** caller address used for rate limiting */
  readonly ip: string;
  readonly contentType: string | null;
  /** raw request body (POST only) */
  readonly body: string | null;
  /** false when a browser sent this from some other website's page (see origin.ts); such requests are refused */
  readonly fromOwnPage: boolean;
}

export interface LeaderboardReply {
  readonly status: number;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: ApiResponse<Board | { entry: LeaderboardEntry }>;
}

export interface LeaderboardDeps {
  readonly store: ScoreStore;
  readonly submitLimit: RateLimiter;
  /** one budget for all callers together: caps how fast storage can be filled, whoever is asking */
  readonly globalSubmitLimit: RateLimiter;
  readonly readLimit: RateLimiter;
  readonly now: () => number;
  readonly newId: () => string;
  /** told about failures, for the person running the server (the details never reach the caller) */
  readonly onError?: (error: unknown) => void;
}

export const MAX_BODY_BYTES = 1_024;
/** seconds a caller over a limit is asked to wait: the limits count per minute */
const RETRY_AFTER = '60';

/* the board is always read fresh: nothing in between keeps a copy */
function reply(status: number, body: LeaderboardReply['body'], extra: Record<string, string> = {}): LeaderboardReply {
  return { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...extra }, body };
}

const fail = (status: number, error: string, extra: Record<string, string> = {}): LeaderboardReply => reply(status, { success: false, error }, extra);

/** The answer to a failure that has no better explanation. Says nothing about what went wrong. */
export const serverError = (): LeaderboardReply => fail(500, 'The leaderboard is having trouble. Please try again later.');

export async function handleLeaderboard(req: LeaderboardRequest, deps: LeaderboardDeps): Promise<LeaderboardReply> {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') return fail(405, 'Method not allowed.', { allow: 'GET, POST' });
    /* before the limits, so another website cannot use up the player's own allowance */
    if (!req.fromOwnPage) return fail(403, 'That request did not come from the game.');
    if (req.method === 'GET') {
      if (!deps.readLimit.allow(req.ip, deps.now())) return fail(429, 'Too many requests. Try again in a minute.', { 'retry-after': RETRY_AFTER });
      return reply(200, { success: true, data: await deps.store.top(BOARD_SIZE) });
    }
    if (!deps.submitLimit.allow(req.ip, deps.now())) return fail(429, 'Too many times sent. Try again in a minute.', { 'retry-after': RETRY_AFTER });
    if (!deps.globalSubmitLimit.allow('all', deps.now())) return fail(429, 'The leaderboard is busy. Try again in a minute.', { 'retry-after': RETRY_AFTER });
    if (!(req.contentType ?? '').toLowerCase().startsWith('application/json')) return fail(415, 'Send JSON.');
    const raw = req.body ?? '';
    const bytes = new TextEncoder().encode(raw).length;
    if (bytes === 0) return fail(400, 'That time could not be accepted.');
    if (bytes > MAX_BODY_BYTES) return fail(413, 'That time could not be accepted.');
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return fail(400, 'That time could not be accepted.');
    }
    const parsed = parseSubmission(json);
    if (!parsed.ok) return fail(400, parsed.error);
    const entry: LeaderboardEntry = { id: deps.newId(), name: parsed.value.name, timeMs: parsed.value.timeMs, at: deps.now() };
    await deps.store.add(entry);
    return reply(201, { success: true, data: { entry } });
  } catch (error) {
    deps.onError?.(error);
    if (error instanceof StoreUnavailableError) return fail(503, 'The leaderboard is not available right now.');
    return serverError();
  }
}
