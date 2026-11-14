/** Bottom-left progress strip: elapsed time, wrong guesses, secondary search chips. */
import type { GameState, SecondaryTarget } from '../game/api';
import { el, setAttr, setHidden, setText } from './dom';
import { changed, secondaryStructureEqual } from './diff';
import { formatTime } from './format';
import { icon } from './icons';
import type { HudContext, HudPart } from './types';

/** Elapsed-time text refresh interval (at most ~4×/s). */
const CLOCK_MS = 250;

function stat(label: string, cls: string): { el: HTMLElement; value: HTMLElement } {
  const value = el('span', { className: 'wss-stat-value', text: '0' });
  return { el: el('div', { className: `wss-stat ${cls}` }, [el('span', { className: 'wss-stat-label', text: label }), value]), value };
}

function buildChip(t: SecondaryTarget): HTMLElement {
  const chip = el('li', { className: 'wss-chip' }, [
    el('span', { className: 'wss-chip-tick' }, [icon('check')]),
    el('span', { className: 'wss-chip-text', text: t.label }),
  ]);
  chip.dataset['id'] = t.id;
  return chip;
}

export function createProgressStrip(ctx: HudContext): HudPart {
  const time = stat('Time', 'wss-stat-time');
  const wrong = stat('Wrong', 'wss-stat-wrong');
  setAttr(time.value, 'role', 'timer');
  setAttr(time.value, 'aria-live', 'off');

  const chips = el('ul', { className: 'wss-chips', attrs: { 'aria-label': 'Also find' } });
  const chipRow = el('div', { className: 'wss-chip-row' }, [el('span', { className: 'wss-chip-head', text: 'Also find' }), chips]);
  chipRow.hidden = true;
  let chipNodes: HTMLElement[] = [];
  let lastList: readonly SecondaryTarget[] = [];

  const stats = el('div', { className: 'wss-stats' }, [time.el, wrong.el]);
  const root = el('section', { className: 'wss-progress wss-surface', attrs: { 'aria-label': 'Progress' } }, [stats, chipRow]);

  const refreshClock = (): void => setText(time.value, formatTime(ctx.api.getState().elapsedMs));
  const timer = window.setInterval(refreshClock, CLOCK_MS);
  ctx.disposer.add(() => window.clearInterval(timer));

  function syncChips(list: readonly SecondaryTarget[]): void {
    if (!secondaryStructureEqual(lastList, list) || chipNodes.length !== list.length) {
      chipNodes = list.map(buildChip);
      chips.replaceChildren(...chipNodes);
    }
    list.forEach((t, i) => {
      const chip = chipNodes[i];
      if (chip === undefined) return;
      const was = chip.dataset['found'] === 'true';
      if (was !== t.found) {
        chip.dataset['found'] = String(t.found);
        setAttr(chip, 'aria-label', `${t.label}${t.found ? ', found' : ', not found yet'}`);
        if (t.found && lastList.length > 0) chip.classList.add('wss-chip-pop');
      }
    });
    setHidden(chipRow, list.length === 0);
    lastList = list;
  }

  return {
    el: root,
    update(prev: GameState | null, next: GameState): void {
      if (changed(prev, next, 'status', 'seed')) refreshClock();
      if (changed(prev, next, 'wrongClicks')) setText(wrong.value, String(next.wrongClicks));
      if (changed(prev, next, 'secondary')) syncChips(next.secondary);
      if (changed(prev, next, 'status')) root.dataset['won'] = String(next.status === 'won');
    },
  };
}
