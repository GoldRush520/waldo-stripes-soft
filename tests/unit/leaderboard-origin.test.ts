import { describe, expect, it } from 'vitest';
import { fromOwnPage } from '../../server/leaderboard/origin';

describe('fromOwnPage', () => {
  it('accepts the game\'s own page', () => {
    expect(fromOwnPage({ host: '127.0.0.1:5180', origin: 'http://127.0.0.1:5180', 'sec-fetch-site': 'same-origin' })).toBe(true);
    expect(fromOwnPage({ host: 'localhost:5181', origin: 'http://localhost:5181' })).toBe(true);
    expect(fromOwnPage({ host: 'LOCALHOST:5181', origin: 'http://localhost:5181' })).toBe(true);
  });

  it('accepts a tool that is not a browser (no origin at all)', () => {
    expect(fromOwnPage({ host: '127.0.0.1:5180' })).toBe(true);
    /* typed into the address bar or sent by a browser extension on the user's behalf */
    expect(fromOwnPage({ host: '127.0.0.1:5180', 'sec-fetch-site': 'none' })).toBe(true);
  });

  it('refuses another website open in the same browser', () => {
    expect(fromOwnPage({ host: '127.0.0.1:5180', origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' })).toBe(false);
    expect(fromOwnPage({ host: '127.0.0.1:5180', origin: 'https://evil.example' })).toBe(false);
    expect(fromOwnPage({ host: '127.0.0.1:5180', 'sec-fetch-site': 'cross-site' })).toBe(false);
    /* another local server on a different port is another site */
    expect(fromOwnPage({ host: '127.0.0.1:5180', origin: 'http://127.0.0.1:3000', 'sec-fetch-site': 'same-site' })).toBe(false);
    expect(fromOwnPage({ host: '127.0.0.1:5180', origin: 'http://localhost:5180' })).toBe(false);
  });

  it('refuses an origin it cannot make sense of', () => {
    /* a sandboxed frame or a local file sends the word "null" */
    expect(fromOwnPage({ host: '127.0.0.1:5180', origin: 'null' })).toBe(false);
    expect(fromOwnPage({ host: '127.0.0.1:5180', origin: '' })).toBe(false);
    expect(fromOwnPage({ origin: 'http://127.0.0.1:5180' })).toBe(false);
    expect(fromOwnPage({ host: '127.0.0.1:5180', origin: ['http://127.0.0.1:5180', 'https://evil.example'] })).toBe(false);
  });
});
