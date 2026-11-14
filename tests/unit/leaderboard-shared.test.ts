import { describe, expect, it } from 'vitest';
import { type Board, type LeaderboardEntry, NAME_MAX, bestPerName, cleanName, compareEntries, formatRunTime, nameKey, rankAmong, withEntry } from '../../shared/leaderboard';
import { cleanPageUrl, isPrivateAddress, shareText, shareUrl } from '../../src/ui/share';

const entry = (id: string, timeMs: number, at = 1_000, name = id): LeaderboardEntry => ({ id, name, timeMs, at });

describe('cleanName', () => {
  it('trims, collapses whitespace and removes markup and invisible characters', () => {
    expect(cleanName('  Ada   Lovelace \n')).toBe('Ada Lovelace');
    expect(cleanName('<script>x</script>')).toBe('scriptx/script');
    expect(cleanName(`a${String.fromCodePoint(0)}b${String.fromCodePoint(0x200b)}c${String.fromCodePoint(0x202e)}d`)).toBe('abcd');
    expect(cleanName('tab\tand\nnewline')).toBe('tab and newline');
    /* half a surrogate pair is not a character */
    expect(cleanName(`${String.fromCharCode(0xd800)}ab`)).toBe('ab');
    expect(cleanName('   \t ')).toBe('');
  });

  it('gives a name that cleaning again does not change', () => {
    const accent = String.fromCodePoint(0x301);
    const invisible = String.fromCodePoint(0x200b);
    const tricky = [
      /* removing a character brings a letter and its accent together */
      `Rene${invisible}${accent}`,
      `e<${accent}ve`,
      `${String.fromCodePoint(0x1100)}${invisible}${String.fromCodePoint(0x1161)}`,
      `a ${invisible} b`,
      ` ${invisible}x${invisible} `,
      `${'ab'.repeat(7)}e${invisible}${accent}${accent}z`,
      `\uff1cb\uff1e Ada`,
      'Ada Lovelace',
      '',
    ];
    for (const raw of tricky) {
      const once = cleanName(raw);
      expect(cleanName(once), JSON.stringify(raw)).toBe(once);
      expect([...once].length).toBeLessThanOrEqual(NAME_MAX);
      expect(once).toBe(once.normalize('NFKC'));
    }
    expect(cleanName(`Rene${invisible}${accent}`)).toBe('Ren\u00e9');
  });

  it('cuts to the maximum length by characters, not UTF-16 units', () => {
    expect([...cleanName('x'.repeat(40))]).toHaveLength(NAME_MAX);
    const emoji = cleanName('🎈'.repeat(30));
    expect([...emoji]).toHaveLength(NAME_MAX);
    expect(emoji.endsWith('🎈')).toBe(true);
  });
});

describe('ordering', () => {
  it('puts the best time first and breaks ties by who came first', () => {
    const list = [entry('c', 9_000), entry('a', 5_000, 2_000), entry('b', 5_000, 1_000)].sort(compareEntries);
    expect(list.map((e) => e.id)).toEqual(['b', 'a', 'c']);
  });

  it('ranks an entry whether or not the list already holds it', () => {
    const list = [entry('a', 5_000), entry('b', 7_000), entry('c', 9_000)];
    expect(rankAmong(list, entry('me', 8_000))).toBe(3);
    expect(rankAmong(list, entry('b', 7_000))).toBe(2);
    expect(rankAmong([], entry('me', 8_000))).toBe(1);
  });

  it('adds an entry once, keeps the order and leaves the original board untouched', () => {
    const board: Board = { entries: [entry('a', 5_000), entry('c', 9_000)], total: 2, more: false };
    const next = withEntry(board, entry('b', 7_000));
    expect(next.entries.map((e) => e.id)).toEqual(['a', 'b', 'c']);
    expect(next.total).toBe(3);
    expect(board.entries).toHaveLength(2);
    expect(withEntry(next, entry('b', 7_000))).toBe(next);
  });
});

describe('bestPerName', () => {
  it('keeps one time per person, their best, best first', () => {
    const list = [entry('a1', 9_000, 1, 'Ada'), entry('b1', 7_000, 2, 'Bo'), entry('a2', 5_000, 3, 'Ada'), entry('a3', 6_000, 4, 'ada'), entry('b2', 8_000, 5, 'BO')];
    expect(bestPerName(list).map((e) => e.id)).toEqual(['a2', 'b1']);
  });

  it('treats spellings that differ only in letter case as one person', () => {
    expect(nameKey('Codex Terra')).toBe(nameKey('codex terra'));
    expect(nameKey('Ada')).not.toBe(nameKey('Ada2'));
  });

  it('does not change its input', () => {
    const list = [entry('x', 9_000, 1, 'X'), entry('y', 5_000, 2, 'Y')];
    bestPerName(list);
    expect(list.map((e) => e.id)).toEqual(['x', 'y']);
  });
});

describe('formatRunTime', () => {
  it('shows minutes, seconds and tenths', () => {
    expect(formatRunTime(83_456)).toBe('1:23.4');
    expect(formatRunTime(5_090)).toBe('0:05.0');
    expect(formatRunTime(3_600_000)).toBe('60:00.0');
    expect(formatRunTime(Number.NaN)).toBe('0:00.0');
  });
});

describe('share link', () => {
  it('drops the query and fragment from the shared address', () => {
    expect(cleanPageUrl('https://example.test/play/?dev&seed=abc#x')).toBe('https://example.test/play/');
    expect(cleanPageUrl('not a url')).toBe('not a url');
  });

  it('opens the X composer with the time and a clean link', () => {
    const url = new URL(shareUrl(83_456, 'https://example.test/?seed=secret'));
    expect(`${url.origin}${url.pathname}`).toBe('https://x.com/intent/post');
    expect(url.searchParams.get('text')).toBe(shareText(83_456));
    expect(url.searchParams.get('text')).toContain('1:23.4');
    expect(url.searchParams.get('url')).toBe('https://example.test/');
  });

  it('recognises addresses that only this machine or this network can open', () => {
    for (const host of ['localhost', '127.0.0.1', '127.8.9.1', '0.0.0.0', '[::1]', '10.0.0.5', '172.16.0.1', '172.31.255.254', '192.168.1.20', '169.254.10.1', '100.64.0.1', 'my-laptop', 'studio.local', 'game.localhost', 'box.internal', '[fe80::1]', '[fd12:3456::1]', 'FD12:3456::1', 'laptop.lan', 'nas.home', 'printer.home.arpa', 'box.localdomain', 'localhost.', 'studio.local.', '[::ffff:c0a8:105]', '::ffff:192.168.1.5', '[::ffff:7f00:1]', '[::ffff:a00:5]']) {
      expect(isPrivateAddress(host), host).toBe(true);
    }
    for (const host of ['example.test', 'waldo.example.com', '8.8.8.8', '172.32.0.1', '172.15.0.1', '192.169.1.1', '11.0.0.1', '100.128.0.1', '[2001:db8::1]', 'local.example.com', '[::ffff:808:808]', '::ffff:8.8.8.8', 'home.example.com', 'lan.example.com', 'example.com.']) {
      expect(isPrivateAddress(host), host).toBe(false);
    }
  });

  it('never puts a home-network address into a public post', () => {
    for (const local of ['http://192.168.1.20:5180/', 'http://10.0.0.5:5180/?seed=x', 'http://my-laptop:5180/', 'http://studio.local:5180/', 'http://0.0.0.0:5180/', 'http://laptop.lan:5180/', 'http://[::ffff:192.168.1.5]:5180/', 'http://localhost.:5180/']) {
      expect(new URL(shareUrl(83_456, local)).searchParams.has('url'), local).toBe(false);
    }
  });

  it('leaves the link out when the game runs on this machine, where nobody else could open it', () => {
    for (const local of ['http://127.0.0.1:5180/?seed=x', 'http://localhost:5181/', 'http://[::1]:5180/', 'http://game.localhost:5180/']) {
      const url = new URL(shareUrl(83_456, local));
      expect(`${url.origin}${url.pathname}`).toBe('https://x.com/intent/post');
      expect(url.searchParams.get('text')).toBe(shareText(83_456));
      expect(url.searchParams.has('url'), local).toBe(false);
    }
  });
});
