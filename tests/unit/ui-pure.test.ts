import { describe, expect, it } from 'vitest';
import type { GameState } from '../../src/game/api';
import {
  changed,
  enteredStatus,
  initialReducedMotion,
  markerEqual,
  newClick,
  secondaryEqual,
  secondaryStructureEqual,
} from '../../src/ui/diff';
import { formatTime, formatTimeSpoken, plural, sanitizeSeed, winSummary } from '../../src/ui/format';
import { shortcutFor } from '../../src/ui/shortcuts';

const base: GameState = {
  status: 'playing', seed: 'abc', paused: false, reducedMotion: false, quality: 'auto', hintLevel: 0,
  hintText: null, elapsedMs: 0, wrongClicks: 0, hintsUsed: 0, secondary: [], lastClick: null, marker: null, progress: 1,
};
const withState = (patch: Partial<GameState>): GameState => ({ ...base, ...patch });

describe('formatTime', () => {
  it('formats mm:ss', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(999)).toBe('00:00');
    expect(formatTime(61_000)).toBe('01:01');
    expect(formatTime(125_500)).toBe('02:05');
    expect(formatTime(6_000_000)).toBe('100:00');
  });
  it('clamps invalid input', () => {
    expect(formatTime(-5)).toBe('00:00');
    expect(formatTime(Number.NaN)).toBe('00:00');
    expect(formatTime(Number.POSITIVE_INFINITY)).toBe('00:00');
  });
  it('has a spoken form and plural helper', () => {
    expect(formatTimeSpoken(125_000)).toBe('2 minutes 5 seconds');
    expect(formatTimeSpoken(1_000)).toBe('1 second');
    expect(plural(1, 'hint')).toBe('1 hint');
    expect(plural(2, 'wrong guess', 'wrong guesses')).toBe('2 wrong guesses');
    expect(winSummary(61_000, 1)).toBe('Time 1 minute 1 second, 1 wrong guess.');
  });
});

describe('sanitizeSeed', () => {
  it('keeps safe characters and collapses whitespace', () => {
    expect(sanitizeSeed('  soft harbour  01 ')).toBe('soft-harbour-01');
    expect(sanitizeSeed('a<script>b')).toBe('ascriptb');
    expect(sanitizeSeed('--x--y--')).toBe('x-y');
  });
  it('rejects empty results and caps length', () => {
    expect(sanitizeSeed('   ')).toBeNull();
    expect(sanitizeSeed('!!!')).toBeNull();
    expect(sanitizeSeed('x'.repeat(100))).toHaveLength(32);
  });
});

describe('state diff helpers', () => {
  it('changed() compares selected keys and treats a missing prev as changed', () => {
    expect(changed(null, base, 'seed')).toBe(true);
    expect(changed(base, withState({ elapsedMs: 5 }), 'seed', 'paused')).toBe(false);
    expect(changed(base, withState({ paused: true }), 'seed', 'paused')).toBe(true);
  });
  it('compares secondary lists by value and by structure', () => {
    const a = [{ id: 'a', label: 'A', found: false }];
    const b = [{ id: 'a', label: 'A', found: true }];
    expect(secondaryEqual(a, [{ id: 'a', label: 'A', found: false }])).toBe(true);
    expect(secondaryEqual(a, b)).toBe(false);
    expect(secondaryStructureEqual(a, b)).toBe(true);
    expect(secondaryStructureEqual(a, [])).toBe(false);
  });
  it('ignores sub-pixel marker jitter', () => {
    const m = { x: 10, y: 10, radius: 30, kind: 'vicinity' as const };
    expect(markerEqual(m, { ...m, x: 10.1 })).toBe(true);
    expect(markerEqual(m, { ...m, x: 11 })).toBe(false);
    expect(markerEqual(m, { ...m, kind: 'reveal' })).toBe(false);
    expect(markerEqual(null, m)).toBe(false);
    expect(markerEqual(null, null)).toBe(true);
  });
  it('detects new clicks by serial', () => {
    const click = { kind: 'miss' as const, x: 1, y: 2, serial: 4, message: null };
    expect(newClick(base, withState({ lastClick: click }))?.serial).toBe(4);
    expect(newClick(withState({ lastClick: click }), withState({ lastClick: { ...click } }))).toBeNull();
    expect(newClick(withState({ lastClick: click }), withState({ lastClick: { ...click, serial: 5 } }))?.serial).toBe(5);
    expect(newClick(base, base)).toBeNull();
  });
  it('detects status transitions', () => {
    expect(enteredStatus(base, withState({ status: 'won' }), 'won')).toBe(true);
    expect(enteredStatus(withState({ status: 'won' }), withState({ status: 'won' }), 'won')).toBe(false);
    expect(enteredStatus(null, base, 'playing')).toBe(true);
  });
});

describe('initial reduced motion', () => {
  it('follows the OS preference only when the player has not chosen', () => {
    expect(initialReducedMotion(null, true, false)).toBe(true);
    expect(initialReducedMotion(null, true, true)).toBeNull();
    expect(initialReducedMotion(null, false, false)).toBeNull();
    expect(initialReducedMotion('off', true, false)).toBeNull();
    expect(initialReducedMotion('off', true, true)).toBe(false);
    expect(initialReducedMotion('on', false, false)).toBe(true);
    expect(initialReducedMotion('garbage', true, false)).toBe(true);
  });
});

describe('shortcuts', () => {
  it('maps P, Space and M only (no hint key); Space defers to focused buttons', () => {
    expect(shortcutFor('h', false)).toBeNull();
    expect(shortcutFor('H', true)).toBeNull();
    expect(shortcutFor('p', false)).toBe('pause');
    expect(shortcutFor(' ', false)).toBe('pause');
    expect(shortcutFor(' ', true)).toBeNull();
    expect(shortcutFor('M', false)).toBe('menu');
    expect(shortcutFor('q', false)).toBeNull();
    expect(shortcutFor('ArrowLeft', false)).toBeNull();
  });
});

describe('safe insets', () => {
  it('reduces measured blocks into bands and margins', async () => {
    const { computeInsets, hudSafeInsets } = await import('../../src/ui/safeInsets');
    const insets = computeInsets(1000, 800, [
      { anchor: 'top', rect: { x: 14, y: 14, w: 180, h: 36 } },
      { anchor: 'top', rect: { x: 14, y: 58, w: 260, h: 112 } },
      { anchor: 'top', rect: { x: 820, y: 14, w: 166, h: 48 } },
      { anchor: 'bottom', rect: { x: 14, y: 740, w: 300, h: 46 } },
      { anchor: 'bottom', rect: { x: 0, y: 0, w: 0, h: 0 } },
    ]);
    expect(insets).toMatchObject({ top: 170, bottom: 60, left: 14, right: 14 });
    expect(insets.blocks).toHaveLength(4);
    expect(computeInsets(1000, 800, [])).toEqual({ top: 0, right: 0, bottom: 0, left: 0, blocks: [] });
    expect(hudSafeInsets().blocks).toEqual([]);
  });
});
