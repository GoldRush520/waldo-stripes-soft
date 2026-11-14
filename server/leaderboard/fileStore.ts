/**
 * The board kept in one JSON file on this machine: each person's best time.
 *
 *   { "version": 1, "people": [ { "id", "name", "timeMs", "at" }, … ] }
 *
 * The file is the board. Every request looks at it (what was read is remembered once the file has
 * been left alone for a few seconds, and only until it changes), so editing or deleting the file
 * takes effect at once, and the development and preview servers can share one file. A save reads
 * the file, adds the time and writes the result to a temporary file that then replaces the real
 * one in a single step, so a server that stops halfway never leaves half a file behind. Saves on
 * one server take turns. (Two servers saving at the very same instant could still lose one of the
 * two times; nothing guards that.)
 *
 * A file that is not a leaderboard is never overwritten, moved or deleted: the board is reported
 * as unavailable until the file is put right or removed.
 */
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { type Board, type LeaderboardEntry, TIME_MAX_MS, TIME_MIN_MS, bestPerName, cleanName, compareEntries, nameKey } from '../../shared/leaderboard.js';
import { MAX_PEOPLE, type ScoreStore, StoreUnavailableError } from './store.js';

const FILE_VERSION = 1;
/** only the person running the game needs to read or change the file */
const FILE_MODE = 0o600;
/**
 * A file that changed this recently is read again on the next request. Some disks record the time
 * of a change only to a second or two, so a further edit could leave no trace in the file's details.
 */
const SETTLED_AFTER_MS = 3_000;

/* the file can be edited by hand, so it is checked like any other input */
const entrySchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
  name: z.string().refine((name) => name !== '' && cleanName(name) === name),
  timeMs: z.number().int().min(TIME_MIN_MS).max(TIME_MAX_MS),
  at: z.number().int().min(0),
});
const fileSchema = z.object({ version: z.literal(FILE_VERSION), people: z.array(entrySchema) });

/** File text -> one entry per person, best first. Throws on anything that is not a leaderboard file. */
export function parsePeopleFile(text: string): LeaderboardEntry[] {
  const { people } = fileSchema.parse(JSON.parse(text));
  return bestPerName(people.map((p) => ({ id: p.id, name: p.name, timeMs: p.timeMs, at: p.at })));
}

export function peopleFileText(people: readonly LeaderboardEntry[]): string {
  return `${JSON.stringify({ version: FILE_VERSION, people }, null, 2)}\n`;
}

const reason = (error: unknown): string => (error instanceof Error ? error.message : String(error));
const isMissing = (error: unknown): boolean => error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT';

/** What the file looks like from the outside: changes whenever it is replaced or edited. */
interface Stamp {
  readonly key: string;
  /** when the file last changed, milliseconds since the epoch */
  readonly changedAt: number;
}

/** What was read from the file, and what the file looked like at that moment. */
interface Seen {
  readonly stamp: string;
  readonly people: readonly LeaderboardEntry[];
}

export class FileStore implements ScoreStore {
  private seen: Seen | null = null;
  /** the save in progress; the next one starts when it has finished */
  private last: Promise<unknown> = Promise.resolve();

  /**
   * @param file absolute path of the JSON file (its folder is created on the first save)
   * @param capacity how many people the board keeps (best first; beyond this the slowest drop off)
   */
  constructor(
    private readonly file: string,
    private readonly capacity = MAX_PEOPLE,
  ) {}

  /** The file's details; null when there is no file. */
  private async stamp(): Promise<Stamp | null> {
    try {
      const info = await stat(this.file);
      return { key: `${info.ino}:${info.mtimeMs}:${info.size}`, changedAt: info.mtimeMs };
    } catch (error) {
      if (isMissing(error)) return null;
      throw new StoreUnavailableError(`The leaderboard file could not be read: ${reason(error)}`);
    }
  }

  private async text(): Promise<string | null> {
    try {
      return await readFile(this.file, 'utf8');
    } catch (error) {
      if (isMissing(error)) return null;
      throw new StoreUnavailableError(`The leaderboard file could not be read: ${reason(error)}`);
    }
  }

  /** The board as the file has it now. */
  private async read(): Promise<readonly LeaderboardEntry[]> {
    const stamp = await this.stamp();
    if (stamp !== null && this.seen?.stamp === stamp.key) return this.seen.people;
    const text = stamp === null ? null : await this.text();
    /* nothing has been saved yet, or the file was deleted to clear the board */
    if (stamp === null || text === null) return [];
    try {
      const people = parsePeopleFile(text).slice(0, this.capacity);
      const settled = Date.now() - stamp.changedAt > SETTLED_AFTER_MS;
      this.seen = settled ? { stamp: stamp.key, people } : null;
      return people;
    } catch {
      throw new StoreUnavailableError(`${this.file} is not a leaderboard file. It has been left as it is: put it right, delete it, or keep the times in another file.`);
    }
  }

  private async write(people: readonly LeaderboardEntry[]): Promise<void> {
    const temporary = `${this.file}.${process.pid}.tmp`;
    try {
      await mkdir(path.dirname(this.file), { recursive: true });
      await writeFile(temporary, peopleFileText(people), { encoding: 'utf8', mode: FILE_MODE });
      await rename(temporary, this.file);
    } catch (error) {
      await rm(temporary, { force: true }).catch(() => undefined);
      throw new StoreUnavailableError(`The leaderboard file could not be written: ${reason(error)}`);
    }
  }

  private async addNow(entry: LeaderboardEntry): Promise<void> {
    const people = await this.read();
    const earlier = people.find((p) => nameKey(p.name) === nameKey(entry.name));
    /* an earlier, better time by the same person stands: nothing to write */
    if (earlier && compareEntries(earlier, entry) <= 0) return;
    const next = bestPerName([...people, entry]).slice(0, this.capacity);
    /* the board is full and this time is slower than everyone on it */
    if (!next.includes(entry)) return;
    await this.write(next);
    /* the next request reads the file again: the file is the board, not this server's memory */
    this.seen = null;
  }

  add(entry: LeaderboardEntry): Promise<void> {
    const run = (): Promise<void> => this.addNow(entry);
    const result = this.last.then(run, run);
    this.last = result.catch(() => undefined);
    return result;
  }

  async top(limit: number): Promise<Board> {
    const people = await this.read();
    return { entries: people.slice(0, limit), total: people.length, more: false };
  }
}
