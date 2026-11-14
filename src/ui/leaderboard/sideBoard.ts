/**
 * The top ten under the clock. Ten numbered places are shown even while few times exist; the
 * player's own saved time is highlighted (or added as an extra line when it ranks lower). The panel
 * can be closed to a small "Top 10" button and opened again; the choice is remembered. Text
 * reaches the page through textContent only.
 */
import { formatRunTime } from '../../../shared/leaderboard';
import { el, setAttr, setHidden } from '../dom';
import { initialBoardOpen, rememberBoardOpen, storedBoardChoice } from '../preferences';
import { type BoardModel, type Slot, boardSlots } from './model';

const SMALL_SCREEN = '(max-width: 520px), (max-height: 520px)';

function row(slot: Slot): HTMLElement {
  const classes = ['wss-board-row', slot.own ? 'wss-board-own' : '', slot.entry ? '' : 'wss-board-empty'].filter((c) => c !== '');
  return el('li', { className: classes.join(' ') }, [
    el('span', { className: 'wss-board-rank', text: `${slot.rank}` }),
    el('span', { className: 'wss-board-who', text: slot.entry ? slot.entry.name : '—' }),
    el('span', { className: 'wss-board-time', text: slot.entry ? formatRunTime(slot.entry.timeMs) : '' }),
  ]);
}

function smallScreen(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(SMALL_SCREEN).matches;
}

/** Returns the element to place under the clock and a function that stops it listening. */
export function createSideBoard(model: BoardModel): { readonly el: HTMLElement; dispose(): void } {
  const list = el('ol', { className: 'wss-board-list', attrs: { 'aria-label': 'Best times' } });
  const close = el('button', { className: 'wss-side-close', text: '×', attrs: { type: 'button', 'aria-label': 'Close the leaderboard' } });
  const panel = el('aside', { className: 'wss-side-board', attrs: { id: 'wss-side-board', 'aria-label': 'Leaderboard, top ten' } }, [
    el('div', { className: 'wss-side-head' }, [el('h2', { className: 'wss-board-title', text: 'Top 10' }), close]),
    list,
  ]);
  const reopen = el('button', {
    className: 'wss-side-open',
    text: 'Top 10',
    attrs: { type: 'button', 'aria-label': 'Open the leaderboard', 'aria-controls': 'wss-side-board', 'aria-expanded': 'false' },
  });
  const root = el('div', { className: 'wss-side' }, [reopen, panel]);

  let open = initialBoardOpen(storedBoardChoice(), smallScreen());
  let hasBoard = false;
  const show = (): void => {
    /* nothing at all until the board has answered once */
    setHidden(panel, !hasBoard || !open);
    setHidden(reopen, !hasBoard || open);
    setAttr(reopen, 'aria-expanded', String(open));
  };
  const setOpen = (next: boolean): void => {
    open = next;
    rememberBoardOpen(next);
    show();
    (next ? close : reopen).focus({ preventScroll: true });
  };
  close.addEventListener('click', () => setOpen(false));
  reopen.addEventListener('click', () => setOpen(true));

  const dispose = model.subscribe((state) => {
    hasBoard = state.board !== null || state.own !== null;
    const { slots, extra } = boardSlots(state);
    list.replaceChildren(...slots.map(row), ...(extra ? [row(extra)] : []));
    show();
  });
  return { el: root, dispose };
}
