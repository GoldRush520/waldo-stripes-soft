/** The leaderboard endpoint over real HTTP, as the local server answers it. */
import { type Server, createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MAX_BODY_BYTES } from '../../server/leaderboard/handler';
import { type LocalApiOptions, leaderboardMiddleware } from '../../server/leaderboard/localApi';
import { MemoryStore, type ScoreStore, StoreUnavailableError } from '../../server/leaderboard/store';

const good = { name: 'Ada', timeMs: 42_000, wrongClicks: 1, seed: 'abc-123' };
const JSON_TYPE = { 'content-type': 'application/json' };

describe('the local leaderboard endpoint', () => {
  let server: Server | null = null;
  let base = '';
  let errors: unknown[] = [];

  async function start(options: Partial<LocalApiOptions> = {}): Promise<void> {
    const middleware = leaderboardMiddleware({ store: new MemoryStore(), onError: (error) => (errors = [...errors, error]), ...options });
    const created = createServer((req, res) =>
      middleware(req, res, () => {
        res.statusCode = 404;
        res.end('not the leaderboard');
      }),
    );
    await new Promise<void>((resolve) => created.listen(0, '127.0.0.1', resolve));
    server = created;
    base = `http://127.0.0.1:${(created.address() as AddressInfo).port}`;
  }

  beforeEach(() => {
    errors = [];
  });

  afterEach(async () => {
    const running = server;
    server = null;
    if (running) await new Promise<void>((resolve) => running.close(() => resolve()));
  });

  it('saves a time and lists it', async () => {
    await start();
    const saved = await fetch(`${base}/api/leaderboard`, { method: 'POST', headers: JSON_TYPE, body: JSON.stringify(good) });
    expect(saved.status).toBe(201);
    expect(saved.headers.get('cache-control')).toBe('no-store');
    expect(saved.headers.get('x-content-type-options')).toBe('nosniff');
    const entry = (await saved.json()).data.entry;
    expect(entry).toMatchObject({ name: 'Ada', timeMs: 42_000 });
    expect(entry.id).toMatch(/^[0-9a-f]{12}$/);

    const board = await fetch(`${base}/api/leaderboard`);
    expect(board.status).toBe(200);
    expect(board.headers.get('content-type')).toContain('application/json');
    expect((await board.json()).data).toEqual({ entries: [entry], total: 1, more: false });
  });

  it('answers only its own address', async () => {
    await start();
    expect((await fetch(`${base}/api/leaderboard/extra`)).status).toBe(404);
    expect((await fetch(`${base}/api/other`)).status).toBe(404);
    expect((await fetch(`${base}/`)).status).toBe(404);
    /* a query string changes nothing */
    expect((await fetch(`${base}/api/leaderboard?x=1`)).status).toBe(200);
  });

  it('refuses invalid input', async () => {
    await start();
    const post = (body: string, headers: Record<string, string> = JSON_TYPE) => fetch(`${base}/api/leaderboard`, { method: 'POST', headers, body });
    expect((await post('{not json')).status).toBe(400);
    expect((await post(JSON.stringify({ ...good, timeMs: 1 }))).status).toBe(400);
    expect((await post(JSON.stringify({ ...good, extra: true }))).status).toBe(400);
    expect((await post(JSON.stringify(good), { 'content-type': 'text/plain' })).status).toBe(415);
    expect((await fetch(`${base}/api/leaderboard`, { method: 'DELETE' })).status).toBe(405);
    expect((await (await fetch(`${base}/api/leaderboard`)).json()).data.total).toBe(0);
  });

  it('refuses a body over the size limit without reading it into the board', async () => {
    await start();
    const big = JSON.stringify({ ...good, name: 'x'.repeat(MAX_BODY_BYTES * 4) });
    const out = await fetch(`${base}/api/leaderboard`, { method: 'POST', headers: JSON_TYPE, body: big });
    expect(out.status).toBe(413);
    expect((await (await fetch(`${base}/api/leaderboard`)).json()).data.total).toBe(0);
  });

  it('refuses a save sent by another website', async () => {
    await start();
    const out = await fetch(`${base}/api/leaderboard`, { method: 'POST', headers: { ...JSON_TYPE, origin: 'https://evil.example' }, body: JSON.stringify(good) });
    expect(out.status).toBe(403);
    expect(await out.json()).toEqual({ success: false, error: 'That request did not come from the game.' });
    expect((await (await fetch(`${base}/api/leaderboard`)).json()).data.total).toBe(0);
    /* the game's own page is let through */
    const own = await fetch(`${base}/api/leaderboard`, { method: 'POST', headers: { ...JSON_TYPE, origin: base }, body: JSON.stringify(good) });
    expect(own.status).toBe(201);
  });

  it('refuses a read sent by another website, and does not answer a permission request', async () => {
    await start({ readsPerMinute: 3 });
    for (let i = 0; i < 10; i++) {
      /* an image tag or a no-cors fetch on some other page: no origin, but the browser marks it */
      const out = await fetch(`${base}/api/leaderboard`, { headers: { 'sec-fetch-site': 'cross-site' } });
      expect(out.status).toBe(403);
    }
    const preflight = await fetch(`${base}/api/leaderboard`, { method: 'OPTIONS', headers: { origin: 'https://evil.example', 'access-control-request-method': 'POST' } });
    expect(preflight.status).toBe(405);
    /* none of that used up the game's own allowance */
    expect((await fetch(`${base}/api/leaderboard`)).status).toBe(200);
  });

  it('limits how fast times can be saved', async () => {
    await start({ savesPerMinute: 2 });
    const post = () => fetch(`${base}/api/leaderboard`, { method: 'POST', headers: JSON_TYPE, body: JSON.stringify(good) });
    expect((await post()).status).toBe(201);
    expect((await post()).status).toBe(201);
    const blocked = await post();
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('retry-after')).toBe('60');
  });

  it('says so when the board cannot be stored, without details', async () => {
    const down: ScoreStore = { add: () => Promise.reject(new StoreUnavailableError('/secret/path is not writable')), top: () => Promise.reject(new Error('/secret/path exploded')) };
    await start({ store: down });
    const saved = await fetch(`${base}/api/leaderboard`, { method: 'POST', headers: JSON_TYPE, body: JSON.stringify(good) });
    expect(saved.status).toBe(503);
    const board = await fetch(`${base}/api/leaderboard`);
    expect(board.status).toBe(500);
    expect(`${await saved.text()}${await board.text()}`).not.toContain('secret');
    /* both reach the terminal, where the person running the game can act on them */
    expect(errors).toHaveLength(2);
  });
});
