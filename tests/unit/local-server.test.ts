/**
 * The real development server, started from the real vite.config.ts: what it listens on, what it
 * tells browsers, and whom it refuses. These settings are the game's protection against other
 * websites and other machines, so they are checked on the running server, not on a stand-in.
 */
import { request } from 'node:http';
import type { AddressInfo } from 'node:net';
import { type ViteDevServer, createServer } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const SETTING = 'WALDO_LEADERBOARD_FILE';
const good = { name: 'Ada', timeMs: 42_000, wrongClicks: 1, seed: 'abc-123' };

interface Answer {
  readonly status: number;
  readonly headers: Readonly<Record<string, string | string[] | undefined>>;
  readonly body: string;
}

describe('the local server as configured', () => {
  let server: ViteDevServer | null = null;
  let port = 0;
  let base = '';
  const before = process.env[SETTING];

  /** A request with full control over its headers (fetch will not send a made-up Host). */
  const raw = (path: string, headers: Record<string, string>, method = 'GET', body?: string): Promise<Answer> =>
    new Promise((resolve, reject) => {
      const req = request({ host: '127.0.0.1', port, path, method, headers }, (res) => {
        let text = '';
        res.setEncoding('utf8');
        res.on('data', (chunk: string) => (text += chunk));
        res.on('end', () => resolve({ status: res.statusCode ?? 0, headers: res.headers, body: text }));
      });
      req.on('error', reject);
      req.end(body);
    });

  beforeAll(async () => {
    /* the test must never write into the times saved by playing */
    process.env[SETTING] = ':memory:';
    const created = await createServer({ configFile: 'vite.config.ts', logLevel: 'silent', server: { port: 0, strictPort: false }, optimizeDeps: { noDiscovery: true, include: [] } });
    await created.listen();
    server = created;
    port = (created.httpServer?.address() as AddressInfo).port;
    base = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await server?.close();
    if (before === undefined) delete process.env[SETTING];
    else process.env[SETTING] = before;
  });

  it('listens on this machine only', () => {
    const address = server?.httpServer?.address() as AddressInfo;
    expect(address.address).toBe('127.0.0.1');
    expect(server?.config.server.host).toBe('127.0.0.1');
    expect(server?.config.preview.host).toBe('127.0.0.1');
  });

  it('sends the page with a policy that only allows its own files', async () => {
    const page = await fetch(`${base}/`);
    expect(page.status).toBe(200);
    const policy = page.headers.get('content-security-policy') ?? '';
    for (const rule of ["default-src 'self'", "script-src 'self'", "connect-src 'self'", "object-src 'none'", "frame-ancestors 'none'", "base-uri 'none'"]) expect(policy).toContain(rule);
    expect(policy).not.toContain("script-src 'self' 'unsafe");
    expect(page.headers.get('x-content-type-options')).toBe('nosniff');
    expect(page.headers.get('x-frame-options')).toBe('DENY');
    expect(page.headers.get('referrer-policy')).toBe('no-referrer');
    /* the production preview is set up the same way */
    expect(server?.config.preview.headers).toEqual(server?.config.server.headers);
    expect(server?.config.preview.cors).toBe(false);
  });

  it('serves the leaderboard to the game', async () => {
    const saved = await fetch(`${base}/api/leaderboard`, { method: 'POST', headers: { 'content-type': 'application/json', origin: base }, body: JSON.stringify(good) });
    expect(saved.status).toBe(201);
    const board = await (await fetch(`${base}/api/leaderboard`)).json();
    expect(board.data.entries.map((e: { name: string }) => e.name)).toEqual(['Ada']);
  });

  it('gives no other origin permission to read anything, not even another local server', async () => {
    for (const origin of ['https://evil.example', 'http://localhost:3000', 'http://127.0.0.1:8080']) {
      for (const path of ['/', '/api/leaderboard', '/src/main.ts']) {
        const out = await raw(path, { host: `127.0.0.1:${port}`, origin });
        expect(out.headers['access-control-allow-origin'], `${origin} ${path}`).toBeUndefined();
      }
      const preflight = await raw('/api/leaderboard', { host: `127.0.0.1:${port}`, origin, 'access-control-request-method': 'POST', 'access-control-request-headers': 'content-type' }, 'OPTIONS');
      expect(preflight.headers['access-control-allow-origin']).toBeUndefined();
      expect(preflight.status).toBe(405);
    }
  });

  it('refuses a save and a read sent by another website', async () => {
    const headers = { host: `127.0.0.1:${port}`, origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' };
    const write = await raw('/api/leaderboard', { ...headers, 'content-type': 'application/json' }, 'POST', JSON.stringify({ ...good, name: 'Intruder' }));
    expect(write.status).toBe(403);
    /* what a page elsewhere can still send without asking: no origin, but the browser marks it */
    const read = await raw('/api/leaderboard', { host: `127.0.0.1:${port}`, 'sec-fetch-site': 'cross-site' });
    expect(read.status).toBe(403);
    const board = await (await fetch(`${base}/api/leaderboard`)).json();
    expect(JSON.stringify(board)).not.toContain('Intruder');
  });

  it('refuses a request that reached it under another name (DNS rebinding)', async () => {
    for (const path of ['/', '/api/leaderboard']) {
      const out = await raw(path, { host: `rebind.evil.example:${port}` });
      expect(out.status, path).toBe(403);
    }
    const write = await raw('/api/leaderboard', { host: `rebind.evil.example:${port}`, 'content-type': 'application/json' }, 'POST', JSON.stringify({ ...good, name: 'Intruder' }));
    expect(write.status).toBe(403);
    expect(JSON.stringify(await (await fetch(`${base}/api/leaderboard`)).json())).not.toContain('Intruder');
  });

  it('does not hand out files outside the project, or its git and environment files', async () => {
    const PAGE = '<title>Waldo Stripes Soft</title>';
    const paths = ['/@fs/etc/passwd', '/@fs/etc/hosts', '/.env', '/.env.local', '/.git/config', '/.git/HEAD', '/../../etc/hosts', '/..%2f..%2f..%2fetc/hosts', '/src/../../../../etc/hosts'];
    for (const path of paths) {
      const out = await raw(path, { host: `127.0.0.1:${port}` });
      /* refused, not found, or answered with the game's own page: never with the file */
      if (out.status === 200) expect(out.body, path).toContain(PAGE);
      else expect([403, 404], path).toContain(out.status);
      expect(out.body, path).not.toMatch(/broadcasthost|\[core\]|ref: refs\/heads/);
    }
  });
});
