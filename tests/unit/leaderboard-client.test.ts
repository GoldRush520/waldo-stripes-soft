import { describe, expect, it, vi } from 'vitest';
import { LeaderboardError, isBoard, isEntry, loadBoard, submitTime } from '../../src/ui/leaderboard/client';

const entry = { id: 'a1', name: 'Ada', timeMs: 42_000, at: 5 };
const json = (status: number, body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));

describe('response guards', () => {
  it('accept well-formed data only', () => {
    expect(isEntry(entry)).toBe(true);
    expect(isEntry({ ...entry, timeMs: '42000' })).toBe(false);
    expect(isEntry(null)).toBe(false);
    expect(isBoard({ entries: [entry], total: 1, more: false })).toBe(true);
    expect(isBoard({ entries: [{ id: 1 }], total: 1, more: false })).toBe(false);
    expect(isBoard({ entries: [], total: 0 })).toBe(false);
  });
});

describe('loadBoard', () => {
  it('returns the board', async () => {
    const board = { entries: [entry], total: 1, more: false };
    await expect(loadBoard(() => json(200, { success: true, data: board }))).resolves.toEqual(board);
  });

  it('turns every failure into a message that can be shown', async () => {
    await expect(loadBoard(() => json(503, { success: false, error: 'The leaderboard is not available right now.' }))).rejects.toThrow('The leaderboard is not available right now.');
    await expect(loadBoard(() => Promise.reject(new Error('offline')))).rejects.toBeInstanceOf(LeaderboardError);
    await expect(loadBoard(() => json(200, { success: true, data: { entries: 'nope' } }))).rejects.toBeInstanceOf(LeaderboardError);
    await expect(loadBoard(() => Promise.resolve(new Response('<html>not json</html>', { status: 404 })))).rejects.toBeInstanceOf(LeaderboardError);
  });
});

describe('submitTime', () => {
  it('posts JSON and returns the stored entry', async () => {
    const fetcher = vi.fn((_url: string, _init?: RequestInit) => json(201, { success: true, data: { entry } }));
    const sent = { name: 'Ada', timeMs: 42_000, wrongClicks: 0, seed: 's' };
    await expect(submitTime(sent, fetcher)).resolves.toEqual(entry);
    const [url, init] = fetcher.mock.calls[0]!;
    expect(url).toBe('/api/leaderboard');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual(sent);
    expect(new Headers(init?.headers).get('content-type')).toBe('application/json');
  });

  it('passes on the server reason for a refusal', async () => {
    await expect(submitTime({ name: '', timeMs: 1, wrongClicks: 0, seed: '' }, () => json(400, { success: false, error: 'Please enter a username.' }))).rejects.toThrow('Please enter a username.');
  });
});
