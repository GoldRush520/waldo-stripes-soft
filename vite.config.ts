import path from 'node:path';
import { defineConfig } from 'vitest/config';
import { FileStore } from './server/leaderboard/fileStore.ts';
import { leaderboardApi } from './server/leaderboard/localApi.ts';
import { MemoryStore, type ScoreStore } from './server/leaderboard/store.ts';

/**
 * The game is served to this machine only. Changing this address puts the game, its leaderboard
 * and its developer switches on your network: read the "Security" part of the README first.
 */
const HOST = '127.0.0.1';
/**
 * Saved times live in data/ (which git ignores). WALDO_LEADERBOARD_FILE names another file: a bare
 * name stays inside data/, an absolute path goes wherever it says, and ":memory:" keeps the times
 * only until the server stops.
 */
const DATA_FOLDER = 'data';
const DEFAULT_BOARD_FILE = 'leaderboard.json';
const IN_MEMORY = ':memory:';

/* the page may only load what this server itself sends: no outside scripts, frames or requests */
const CONTENT_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  /* the HUD is styled by a stylesheet plus a small block in index.html */
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const HEADERS = {
  'content-security-policy': CONTENT_POLICY,
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'no-referrer',
  'cross-origin-resource-policy': 'same-origin',
};

const toTerminal = (detail: unknown): void => {
  process.stderr.write(`[leaderboard] ${detail instanceof Error ? detail.message : String(detail)}\n`);
};

function scoreStore(): ScoreStore {
  const chosen = process.env['WALDO_LEADERBOARD_FILE']?.trim() || DEFAULT_BOARD_FILE;
  return chosen === IN_MEMORY ? new MemoryStore() : new FileStore(path.resolve(import.meta.dirname, DATA_FOLDER, chosen));
}

export default defineConfig({
  plugins: [leaderboardApi({ store: scoreStore(), onError: toTerminal })],
  build: { target: 'es2022', chunkSizeWarningLimit: 2000 },
  /* cors: false = no other origin, not even another local server, is told it may read a response */
  server: { host: HOST, hmr: false, cors: false, headers: HEADERS },
  preview: { host: HOST, cors: false, headers: HEADERS },
  test: { environment: 'node', include: ['tests/unit/**/*.test.ts'] },
});
