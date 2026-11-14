/**
 * The leaderboard endpoint of the local server: `npm run dev` and `npm run preview` both answer
 * GET and POST /api/leaderboard with handler.ts. Nothing here listens on its own; Vite's server
 * does, and vite.config.ts binds it to this machine only.
 */
import { randomBytes } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { type LeaderboardDeps, type LeaderboardReply, MAX_BODY_BYTES, handleLeaderboard, serverError } from './handler.js';
import { fromOwnPage } from './origin.js';
import { createRateLimiter } from './rateLimit.js';
import type { ScoreStore } from './store.js';

export const API_PATH = '/api/leaderboard';
const MINUTE_MS = 60_000;
/* far more than a person playing needs; a brake on a script gone wrong */
const DEFAULT_SAVES_PER_MINUTE = 120;
const DEFAULT_READS_PER_MINUTE = 6_000;
const ID_BYTES = 6;

export interface LocalApiOptions {
  readonly store: ScoreStore;
  readonly savesPerMinute?: number;
  readonly readsPerMinute?: number;
  /** told about failures (details stay here; the browser only gets a general message) */
  readonly onError?: (error: unknown) => void;
}

export type Middleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => void;

/** The request body as text, keeping no more than the limit in memory (an oversized body is reported as such). */
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0;
    let chunks: readonly Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size <= MAX_BODY_BYTES) chunks = [...chunks, chunk];
    });
    /* never cut down to something that parses */
    req.on('end', () => resolve(size > MAX_BODY_BYTES ? 'x'.repeat(MAX_BODY_BYTES + 1) : Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function send(res: ServerResponse, out: LeaderboardReply): void {
  res.statusCode = out.status;
  for (const [name, value] of Object.entries(out.headers)) res.setHeader(name, value);
  res.end(JSON.stringify(out.body));
}

function isApiPath(url: string | undefined): boolean {
  try {
    return new URL(url ?? '/', 'http://local').pathname === API_PATH;
  } catch {
    return false;
  }
}

export function leaderboardMiddleware(options: LocalApiOptions): Middleware {
  const saves = options.savesPerMinute ?? DEFAULT_SAVES_PER_MINUTE;
  const deps: LeaderboardDeps = {
    store: options.store,
    /* every caller is this machine, so "per address" and "in all" are the same budget */
    submitLimit: createRateLimiter(saves, MINUTE_MS),
    globalSubmitLimit: createRateLimiter(saves, MINUTE_MS),
    readLimit: createRateLimiter(options.readsPerMinute ?? DEFAULT_READS_PER_MINUTE, MINUTE_MS),
    now: () => Date.now(),
    newId: () => randomBytes(ID_BYTES).toString('hex'),
    ...(options.onError ? { onError: options.onError } : {}),
  };
  return (req, res, next) => {
    if (!isApiPath(req.url)) {
      next();
      return;
    }
    const method = req.method ?? 'GET';
    const body = method === 'POST' ? readBody(req) : Promise.resolve(null);
    body
      .then((text) =>
        handleLeaderboard(
          { method, ip: req.socket.remoteAddress ?? 'local', contentType: req.headers['content-type'] ?? null, body: text, fromOwnPage: fromOwnPage(req.headers) },
          deps,
        ),
      )
      .then((out) => send(res, out))
      .catch((error: unknown) => {
        options.onError?.(error);
        send(res, serverError());
      });
  };
}

/** Vite plugin: adds the endpoint to the development server and to the preview server. */
export function leaderboardApi(options: LocalApiOptions): Plugin {
  const middleware = leaderboardMiddleware(options);
  return {
    name: 'leaderboard-api',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
