import { chmod, mkdir, mkdtemp, readFile, readdir, rm, stat, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { LeaderboardEntry } from '../../shared/leaderboard';
import { FileStore, parsePeopleFile, peopleFileText } from '../../server/leaderboard/fileStore';
import { parseSubmission } from '../../server/leaderboard/schema';
import { StoreUnavailableError } from '../../server/leaderboard/store';

const entry = (id: string, timeMs: number, name = id, at = 1_000): LeaderboardEntry => ({ id, name, timeMs, at });
/** a letter, an invisible character, then an accent: cleaning brings the letter and the accent together */
const TRICKY_NAMES = [`Rene${String.fromCodePoint(0x200b, 0x301)}`, `e<${String.fromCodePoint(0x301)}ve`, `${String.fromCodePoint(0x1100, 0x200b, 0x1161)}`];

describe('the leaderboard file format', () => {
  it('reads back what it wrote', () => {
    const people = [entry('a', 5_000, 'Ada'), entry('b', 9_000, 'Bo')];
    expect(parsePeopleFile(peopleFileText(people))).toEqual(people);
  });

  it('keeps one time per person, best first, whatever order the file has', () => {
    const text = JSON.stringify({ version: 1, people: [entry('slow', 9_000, 'Ada'), entry('other', 7_000, 'Bo'), entry('fast', 5_000, 'ada')] });
    expect(parsePeopleFile(text).map((p) => p.id)).toEqual(['fast', 'other']);
  });

  it('refuses anything that is not a leaderboard file', () => {
    const good = entry('a', 5_000);
    const bad: readonly string[] = [
      'not json',
      '[]',
      'null',
      JSON.stringify({ important: 'somebody else\'s settings' }),
      JSON.stringify({ version: 2, people: [] }),
      JSON.stringify({ people: [] }),
      JSON.stringify({ version: 1, people: 'none' }),
      JSON.stringify({ version: 1, people: [{ ...good, timeMs: '5000' }] }),
      JSON.stringify({ version: 1, people: [{ ...good, timeMs: -1 }] }),
      JSON.stringify({ version: 1, people: [{ ...good, timeMs: 5_000.5 }] }),
      JSON.stringify({ version: 1, people: [{ ...good, name: '' }] }),
      JSON.stringify({ version: 1, people: [{ ...good, name: '<b>x</b>' }] }),
      JSON.stringify({ version: 1, people: [{ ...good, name: 'x'.repeat(200) }] }),
      JSON.stringify({ version: 1, people: [{ ...good, id: '' }] }),
      JSON.stringify({ version: 1, people: [{ id: 'a', name: 'a', timeMs: 5_000 }] }),
    ];
    for (const text of bad) expect(() => parsePeopleFile(text), text).toThrow();
  });

  it('accepts every name the server itself would store', () => {
    for (const raw of TRICKY_NAMES) {
      const parsed = parseSubmission({ name: raw, timeMs: 5_000, wrongClicks: 0, seed: 'x' });
      if (!parsed.ok) throw new Error(`not accepted: ${JSON.stringify(raw)}`);
      const stored = entry('a', 5_000, parsed.value.name);
      expect(parsePeopleFile(peopleFileText([stored])), JSON.stringify(raw)).toEqual([stored]);
    }
  });
});

describe('FileStore', () => {
  let dir = '';
  let file = '';
  const open = (capacity?: number): FileStore => new FileStore(file, capacity);
  /** permission bits do not stop the administrator, and Windows has none */
  const permissionsApply = process.platform !== 'win32' && process.getuid?.() !== 0;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'wss-board-'));
    file = path.join(dir, 'data', 'leaderboard.json');
  });

  afterEach(async () => {
    await chmod(path.dirname(file), 0o700).catch(() => undefined);
    await rm(dir, { recursive: true, force: true });
  });

  it('starts empty and creates nothing until a time is saved', async () => {
    expect(await open().top(10)).toEqual({ entries: [], total: 0, more: false });
    expect(await readdir(dir)).toEqual([]);
  });

  it('keeps saved times across restarts', async () => {
    const first = open();
    await first.add(entry('a', 9_000, 'Ada'));
    await first.add(entry('b', 5_000, 'Bo'));
    const board = await open().top(10);
    expect(board.entries.map((e) => e.name)).toEqual(['Bo', 'Ada']);
    expect(board.total).toBe(2);
    expect(parsePeopleFile(await readFile(file, 'utf8')).map((p) => p.id)).toEqual(['b', 'a']);
  });

  it('keeps a person only once, with their best time', async () => {
    const store = open();
    await store.add(entry('first', 8_000, 'Ada'));
    await store.add(entry('better', 6_000, 'ADA'));
    await store.add(entry('worse', 9_000, 'ada'));
    const board = await store.top(10);
    expect(board.entries).toEqual([entry('better', 6_000, 'ADA')]);
    expect(board.total).toBe(1);
  });

  it('does not touch the file for a time that is not an improvement', async () => {
    const store = open();
    await store.add(entry('a', 6_000, 'Ada'));
    const before = await readFile(file, 'utf8');
    await writeFile(file, `${before} `);
    await store.add(entry('b', 9_000, 'Ada'));
    expect(await readFile(file, 'utf8')).toBe(`${before} `);
  });

  it('returns only as many as asked for, but counts everyone', async () => {
    const store = open();
    for (let i = 0; i < 6; i++) await store.add(entry(`p${i}`, 5_000 + i));
    const board = await store.top(3);
    expect(board.entries.map((e) => e.id)).toEqual(['p0', 'p1', 'p2']);
    expect(board.total).toBe(6);
  });

  it('loses none of several times saved at the same moment', async () => {
    const store = open();
    await Promise.all(Array.from({ length: 25 }, (_, i) => store.add(entry(`p${i}`, 5_000 + i))));
    expect((await store.top(50)).total).toBe(25);
    expect((await open().top(50)).total).toBe(25);
  });

  it('drops the slowest when the board is full, and leaves the file alone for a time that does not make it', async () => {
    const store = open(3);
    for (const [id, time] of [['a', 9_000], ['b', 5_000], ['c', 7_000], ['d', 6_000]] as const) await store.add(entry(id, time));
    expect((await open(3).top(10)).entries.map((e) => e.id)).toEqual(['b', 'd', 'c']);
    const before = await readFile(file, 'utf8');
    await store.add(entry('e', 8_000));
    expect(await readFile(file, 'utf8')).toBe(before);
    expect((await store.top(10)).entries.map((e) => e.id)).toEqual(['b', 'd', 'c']);
  });

  it('leaves no temporary file behind', async () => {
    const store = open();
    await store.add(entry('a', 5_000));
    await store.add(entry('b', 6_000));
    expect(await readdir(path.dirname(file))).toEqual(['leaderboard.json']);
  });

  it('shares one file between two servers without losing a time', async () => {
    const dev = open();
    const preview = open();
    await dev.add(entry('a', 5_000, 'Ada'));
    expect((await preview.top(10)).entries.map((e) => e.name)).toEqual(['Ada']);
    await dev.add(entry('b', 6_000, 'Bo'));
    await preview.add(entry('c', 7_000, 'Cy'));
    for (const store of [dev, preview, open()]) expect((await store.top(10)).entries.map((e) => e.name)).toEqual(['Ada', 'Bo', 'Cy']);
  });

  it('follows the file when it is edited or deleted while the server runs', async () => {
    const store = open();
    await store.add(entry('a', 5_000, 'Ada'));
    await store.add(entry('b', 6_000, 'Bo'));
    /* someone takes Bo off by hand */
    await writeFile(file, peopleFileText([entry('a', 5_000, 'Ada')]));
    expect((await store.top(10)).entries.map((e) => e.name)).toEqual(['Ada']);
    await store.add(entry('c', 7_000, 'Cy'));
    expect(parsePeopleFile(await readFile(file, 'utf8')).map((p) => p.name)).toEqual(['Ada', 'Cy']);
    /* deleting the file clears the board, and it stays cleared */
    await rm(file);
    expect((await store.top(10)).total).toBe(0);
    await store.add(entry('d', 8_000, 'Di'));
    expect((await store.top(10)).entries.map((e) => e.name)).toEqual(['Di']);
  });

  it('notices an edit even when the disk records no new time or size for it', async () => {
    const store = open();
    await store.add(entry('a', 5_000, 'Ada'));
    /* a disk that times changes only to the second */
    const tick = new Date(Math.floor(Date.now() / 1_000) * 1_000);
    await utimes(file, tick, tick);
    expect((await store.top(10)).entries[0]?.timeMs).toBe(5_000);
    const before = await stat(file);
    /* edited in place within the same second: same file, same size, same time */
    await writeFile(file, (await readFile(file, 'utf8')).replace('5000', '6000'));
    await utimes(file, tick, tick);
    const after = await stat(file);
    expect([after.ino, after.mtimeMs, after.size]).toEqual([before.ino, before.mtimeMs, before.size]);
    expect((await store.top(10)).entries[0]?.timeMs).toBe(6_000);
  });

  it('stores names that only settle after cleaning, and still reads the file afterwards', async () => {
    const store = open();
    for (const [i, raw] of TRICKY_NAMES.entries()) {
      const parsed = parseSubmission({ name: raw, timeMs: 5_000 + i, wrongClicks: 0, seed: 'x' });
      if (!parsed.ok) throw new Error(`not accepted: ${JSON.stringify(raw)}`);
      await store.add(entry(`p${i}`, parsed.value.timeMs, parsed.value.name));
    }
    await store.add(entry('ada', 9_000, 'Ada'));
    expect((await open().top(10)).total).toBe(TRICKY_NAMES.length + 1);
  });

  it('never overwrites, moves or deletes a file it cannot understand', async () => {
    await mkdir(path.dirname(file), { recursive: true });
    for (const foreign of ['{"version":1,"people":[{"oops"', JSON.stringify({ important: 'somebody else\'s settings' })]) {
      await writeFile(file, foreign);
      const store = open();
      await expect(store.top(10)).rejects.toBeInstanceOf(StoreUnavailableError);
      await expect(store.top(10)).rejects.toThrow(/not a leaderboard file/);
      await expect(store.add(entry('a', 5_000))).rejects.toBeInstanceOf(StoreUnavailableError);
      expect(await readFile(file, 'utf8')).toBe(foreign);
      expect(await readdir(path.dirname(file))).toEqual(['leaderboard.json']);
      /* once the file is put right the same server carries on, without a restart */
      await writeFile(file, peopleFileText([entry('b', 6_000, 'Bo')]));
      await store.add(entry('a', 5_000, 'Ada'));
      expect((await store.top(10)).entries.map((e) => e.name)).toEqual(['Ada', 'Bo']);
    }
  });

  it('reports a file that cannot be read as unavailable, and recovers when it can', async () => {
    /* a folder where the file should be */
    await mkdir(file, { recursive: true });
    const store = open();
    await expect(store.top(10)).rejects.toBeInstanceOf(StoreUnavailableError);
    await expect(store.add(entry('a', 5_000))).rejects.toBeInstanceOf(StoreUnavailableError);
    await rm(file, { recursive: true });
    await store.add(entry('a', 5_000));
    expect((await store.top(10)).entries.map((e) => e.id)).toEqual(['a']);
  });

  it.runIf(permissionsApply)('does not show a time it could not write', async () => {
    const store = open();
    await store.add(entry('a', 5_000));
    /* the folder becomes read-only: the file can still be read, but not replaced */
    await chmod(path.dirname(file), 0o500);
    await expect(store.add(entry('b', 4_000))).rejects.toBeInstanceOf(StoreUnavailableError);
    expect((await store.top(10)).entries.map((e) => e.id)).toEqual(['a']);
    expect(await readdir(path.dirname(file))).toEqual(['leaderboard.json']);
    /* and the next save works again once the folder is writable */
    await chmod(path.dirname(file), 0o700);
    await store.add(entry('c', 3_000));
    expect((await open().top(10)).entries.map((e) => e.id)).toEqual(['c', 'a']);
  });
});
