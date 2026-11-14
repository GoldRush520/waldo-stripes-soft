/**
 * Leaderboard section of the win card: asks for a username and saves the time. The list itself
 * is the always-visible top ten under the clock (sideBoard.ts); both share one model.
 */
import { NAME_MAX, cleanName, formatRunTime } from '../../../shared/leaderboard';
import { el, setHidden, setText } from '../dom';
import { LeaderboardError, submitTime } from './client';
import { type BoardModel, type BoardState, boardSlots } from './model';

const NAME_KEY = 'wss-player-name';

export interface FinishedRun {
  readonly timeMs: number;
  readonly wrongClicks: number;
  readonly seed: string;
}

export interface LeaderboardPanel {
  readonly el: HTMLElement;
  /** Show the form for a run that has just been won. */
  open(run: FinishedRun): void;
  /** Stop listening to the model. */
  dispose(): void;
}

function rememberedName(): string {
  try {
    return cleanName(window.localStorage.getItem(NAME_KEY) ?? '');
  } catch {
    return '';
  }
}

function rememberName(name: string): void {
  try {
    window.localStorage.setItem(NAME_KEY, name);
  } catch {
    /* storage unavailable: the name is simply not remembered */
  }
}

/** What the card says once the time is saved: the player's place, and whether this run improved it. */
export function savedNote(state: BoardState): string {
  const { mine, ownRank, improved, rankIsLowerBound } = boardSlots(state);
  if (!state.board || !mine || ownRank === null) return 'Saved.';
  const place = `number ${ownRank}${rankIsLowerBound ? ' or lower' : ''}`;
  return improved ? `Saved. You are ${place}.` : `Saved. Your best is still ${formatRunTime(mine.timeMs)}, ${place}.`;
}

export function createLeaderboardPanel(model: BoardModel, announce: (text: string) => void): LeaderboardPanel {
  const input = el('input', {
    className: 'wss-board-name',
    attrs: { type: 'text', maxlength: String(NAME_MAX), placeholder: 'Username', 'aria-label': 'Username', autocomplete: 'username', enterkeyhint: 'send', spellcheck: 'false' },
  });
  const save = el('button', { className: 'wss-btn wss-btn-primary', text: 'Save my time', attrs: { type: 'submit' } });
  const ask = el('p', { className: 'wss-board-ask', text: 'Enter a username to put your time on the leaderboard.' });
  const form = el('form', { className: 'wss-board-form', attrs: { novalidate: '' } }, [ask, el('div', { className: 'wss-board-fields' }, [input, save])]);
  const note = el('p', { className: 'wss-board-note', attrs: { role: 'status' } });
  const root = el('section', { className: 'wss-board', attrs: { 'aria-label': 'Leaderboard' } }, [
    el('h2', { className: 'wss-board-title', text: 'Leaderboard' }),
    form,
    note,
  ]);

  let run: FinishedRun | null = null;
  /** a message from this form (validation, saving, refusal); shown instead of the model's status */
  let message = '';
  /** bumped for every run so an answer to an earlier run's request is ignored */
  let serial = 0;

  const render = (): void => {
    const state = model.get();
    if (state.own) {
      setHidden(form, true);
      setText(note, savedNote(state));
      return;
    }
    /* the board never answered: nothing can be saved */
    const down = state.board === null && state.error !== null;
    setHidden(form, down);
    setText(note, down ? (state.error ?? '') : message);
  };
  const dispose = model.subscribe(render);

  const setBusy = (busy: boolean): void => {
    input.disabled = busy;
    save.disabled = busy;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const current = run;
    if (!current || model.get().own) return;
    const name = cleanName(input.value);
    if (name === '') {
      message = 'Enter a username first.';
      render();
      input.focus();
      return;
    }
    const ticket = serial;
    setBusy(true);
    message = 'Saving…';
    render();
    submitTime({ name, timeMs: Math.floor(current.timeMs), wrongClicks: current.wrongClicks, seed: current.seed.slice(0, 40).replace(/[^A-Za-z0-9_-]/g, '') })
      .then((entry) => {
        if (ticket !== serial) return;
        rememberName(name);
        message = '';
        model.setOwn(entry);
        announce(savedNote(model.get()));
      })
      .catch((error: unknown) => {
        if (ticket !== serial) return;
        setBusy(false);
        message = error instanceof LeaderboardError ? error.message : 'The leaderboard is not available right now.';
        render();
      });
  });

  return {
    el: root,
    dispose,
    open(next: FinishedRun): void {
      serial++;
      run = next;
      message = '';
      input.value = rememberedName();
      setBusy(false);
      model.startRun();
      render();
      /* the board may have moved on since the game started */
      void model.refresh();
    },
  };
}
