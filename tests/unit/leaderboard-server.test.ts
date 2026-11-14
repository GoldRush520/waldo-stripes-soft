import { describe, expect, it, vi } from 'vitest';
import type { Board, LeaderboardEntry } from '../../shared/leaderboard';
import { type LeaderboardDeps, type LeaderboardRequest, MAX_BODY_BYTES, handleLeaderboard } from '../../server/leaderboard/handler';
import { createRateLimiter } from '../../server/leaderboard/rateLimit';
import { parseSubmission } from '../../server/leaderboard/schema';
import { MemoryStore, type ScoreStore, StoreUnavailableError } from '../../server/leaderboard/store';

const good = { name: 'Ada', timeMs: 42_000, wrongClicks: 1, seed: 'abc-123' };

describe('parseSubmission', () => {
  it('accepts a plausible time and cleans the name', () => {
    expect(parseSubmission({ ...good, name: '  <b>Ada</b>  ' })).toEqual({ ok: true, value: { ...good, name: 'bAda/b' } });
  });

  it('rejects impossible, malformed or padded input', () => {
    for (const bad of [
      { ...good, timeMs: 500 },
      { ...good, timeMs: 7 * 60 * 60 * 1000 },
      { ...good, timeMs: 42_000.5 },
      { ...good, timeMs: '42000' },
      { ...good, wrongClicks: -1 },
      { ...good, seed: 'has spaces' },
      { ...good, name: '   ' },
      { ...good, name: 'x'.repeat(500) },
      { ...good, admin: true },
      { name: 'Ada' },
      null,
      'text',
    ]) {
      expect(parseSubmission(bad).ok).toBe(false);
    }
  });
});

describe('createRateLimiter', () => {
  it('allows a fixed number per window and per key', () => {
    const limit = createRateLimiter(2, 1_000);
    expect(limit.allow('a', 0)).toBe(true);
    expect(limit.allow('a', 10)).toBe(true);
    expect(limit.allow('a', 20)).toBe(false);
    expect(limit.allow('b', 20)).toBe(true);
    expect(limit.allow('a', 1_000)).toBe(true);
  });

  it('does not grow without bound', () => {
    const limit = createRateLimiter(1, 1_000, 3);
    for (let i = 0; i < 50; i++) expect(limit.allow(`k${i}`, i)).toBe(true);
  });
});

function setup(store: ScoreStore = new MemoryStore()) {
  let clock = 1_000_000;
  let ids = 0;
  const onError = vi.fn();
  const deps: LeaderboardDeps = {
    store,
    submitLimit: createRateLimiter(3, 60_000),
    globalSubmitLimit: createRateLimiter(5, 60_000),
    readLimit: createRateLimiter(100, 60_000),
    now: () => clock++,
    newId: () => `id${ids++}`,
    onError,
  };
  const get = () => handleLeaderboard({ method: 'GET', ip: '1.1.1.1', contentType: null, body: null, fromOwnPage: true }, deps);
  const post = (body: unknown, over: Partial<LeaderboardRequest> = {}) =>
    handleLeaderboard(
      { method: 'POST', ip: '1.1.1.1', contentType: 'application/json', body: typeof body === 'string' ? body : JSON.stringify(body), fromOwnPage: true, ...over },
      deps,
    );
  return { get, post, onError, deps };
}

describe('handleLeaderboard', () => {
  it('returns an empty board that the browser does not keep a copy of', async () => {
    const out = await setup().get();
    expect(out.status).toBe(200);
    expect(out.body).toEqual({ success: true, data: { entries: [], total: 0, more: false } });
    expect(out.headers['cache-control']).toBe('no-store');
    expect(out.headers['x-content-type-options']).toBe('nosniff');
  });

  it('records a time and lists the best first', async () => {
    const { get, post } = setup();
    const slow = await post({ ...good, name: 'Slow', timeMs: 90_000 });
    const fast = await post({ ...good, name: 'Fast', timeMs: 12_000 });
    expect(slow.status).toBe(201);
    expect(slow.headers['cache-control']).toBe('no-store');
    expect((fast.body.data as { entry: LeaderboardEntry }).entry).toMatchObject({ name: 'Fast', timeMs: 12_000, id: 'id1' });
    const board = (await get()).body.data as Board;
    expect(board.entries.map((e) => e.name)).toEqual(['Fast', 'Slow']);
    expect(board.total).toBe(2);
  });

  it('lists each person once, with their best time', async () => {
    const { get, post } = setup();
    await post({ ...good, name: 'Ada', timeMs: 90_000 }, { ip: '4.0.0.1' });
    await post({ ...good, name: 'Bo', timeMs: 50_000 }, { ip: '4.0.0.2' });
    await post({ ...good, name: 'ada', timeMs: 30_000 }, { ip: '4.0.0.3' });
    await post({ ...good, name: 'Ada', timeMs: 70_000 }, { ip: '4.0.0.4' });
    const board = (await get()).body.data as Board;
    expect(board.entries.map((e) => [e.name, e.timeMs])).toEqual([['ada', 30_000], ['Bo', 50_000]]);
    expect(board.total).toBe(2);
  });

  it('refuses bad requests without touching the store', async () => {
    const store = new MemoryStore();
    const add = vi.spyOn(store, 'add');
    const { post, deps } = setup(store);
    /* each from its own address: refused requests count toward the sender's limit too */
    expect((await post('{not json', { ip: '3.0.0.1' })).status).toBe(400);
    expect((await post({ ...good, timeMs: 1 }, { ip: '3.0.0.2' })).status).toBe(400);
    expect((await post(good, { ip: '3.0.0.3', contentType: 'text/plain' })).status).toBe(415);
    expect((await post('x'.repeat(MAX_BODY_BYTES + 1), { ip: '3.0.0.4' })).status).toBe(413);
    expect((await handleLeaderboard({ method: 'DELETE', ip: '9.9.9.9', contentType: null, body: null, fromOwnPage: true }, deps)).status).toBe(405);
    expect(add).not.toHaveBeenCalled();
  });

  it('limits how often the board may be read', async () => {
    const { get } = setup();
    for (let i = 0; i < 100; i++) expect((await get()).status).toBe(200);
    const blocked = await get();
    expect(blocked.status).toBe(429);
    expect(blocked.headers['retry-after']).toBe('60');
  });

  it('refuses a read sent from another website, without counting it against the player', async () => {
    const store = new MemoryStore();
    const top = vi.spyOn(store, 'top');
    const { get, deps } = setup(store);
    for (let i = 0; i < 250; i++) {
      const out = await handleLeaderboard({ method: 'GET', ip: '1.1.1.1', contentType: null, body: null, fromOwnPage: false }, deps);
      expect(out.status).toBe(403);
    }
    expect(top).not.toHaveBeenCalled();
    /* the player's own allowance of a hundred is untouched */
    expect((await get()).status).toBe(200);
  });

  it('refuses a time sent from another website, without counting it against the player', async () => {
    const store = new MemoryStore();
    const add = vi.spyOn(store, 'add');
    const { post } = setup(store);
    for (let i = 0; i < 10; i++) {
      const out = await post(good, { fromOwnPage: false });
      expect(out.status).toBe(403);
      expect(out.body).toEqual({ success: false, error: 'That request did not come from the game.' });
    }
    expect(add).not.toHaveBeenCalled();
    /* the player's own allowance of three is untouched */
    for (let i = 0; i < 3; i++) expect((await post(good)).status).toBe(201);
  });

  it('limits how often one address may save', async () => {
    const { post } = setup();
    for (let i = 0; i < 3; i++) expect((await post(good)).status).toBe(201);
    const blocked = await post(good);
    expect(blocked.status).toBe(429);
    expect(blocked.headers['retry-after']).toBe('60');
    expect((await post(good, { ip: '2.2.2.2' })).status).toBe(201);
  });

  it('caps saved times for all callers together', async () => {
    const { post } = setup();
    let accepted = 0;
    for (let i = 0; i < 9; i++) if ((await post(good, { ip: `7.0.0.${i}` })).status === 201) accepted++;
    expect(accepted).toBe(5);
  });

  it('measures the body in bytes', async () => {
    const { post } = setup();
    /* 400 three-byte characters: short as a string, too long on the wire */
    expect((await post(JSON.stringify({ ...good, name: '\u20ac'.repeat(400) }), { ip: '8.0.0.1' })).status).toBe(413);
    expect((await post('', { ip: '8.0.0.2' })).status).toBe(400);
  });

  it('reports missing storage as unavailable and hides unexpected failures', async () => {
    const down: ScoreStore = { add: () => Promise.reject(new StoreUnavailableError()), top: () => Promise.reject(new StoreUnavailableError()) };
    const missing = setup(down);
    expect((await missing.get()).status).toBe(503);
    expect((await missing.post(good)).status).toBe(503);
    /* the person running the server is told: the file may need attention */
    expect(missing.onError).toHaveBeenCalledTimes(2);
    const broken: ScoreStore = { add: () => Promise.reject(new Error('secret detail')), top: () => Promise.reject(new Error('secret detail')) };
    const failing = setup(broken);
    const out = await failing.get();
    expect(out.status).toBe(500);
    expect(JSON.stringify(out.body)).not.toContain('secret detail');
    expect(failing.onError).toHaveBeenCalledTimes(1);
  });
});

describe('MemoryStore', () => {
  it('holds a number of people, however many times each of them has saved', async () => {
    const store = new MemoryStore(2);
    for (let i = 0; i < 10; i++) await store.add({ id: `a${i}`, name: 'Ada', timeMs: 5_000 + i, at: i });
    await store.add({ id: 'b', name: 'Bo', timeMs: 9_000, at: 20 });
    await store.add({ id: 'c', name: 'Cy', timeMs: 7_000, at: 21 });
    const board = await store.top(10);
    expect(board.entries.map((e) => e.name)).toEqual(['Ada', 'Cy']);
    expect(board.total).toBe(2);
  });
});
