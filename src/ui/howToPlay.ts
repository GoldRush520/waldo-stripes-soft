/**
 * The how-to-play card shown once when the game is ready. Until the player presses Start the
 * clock waits and the town cannot be moved or clicked, so reading the card costs no time and
 * nobody can search with the clock stopped.
 */
import type { GameState } from '../game/api';
import { el, setHidden } from './dom';
import { enteredStatus } from './diff';
import type { HudContext, HudPart } from './types';

/* how to play only: nothing here says what Waldo looks like or where he is (no hints) */
const STEPS: readonly string[] = [
  'Waldo is hiding somewhere in the crowd.',
  'Drag to look around the town. You can also scroll or use the arrow keys.',
  'Click him when you spot him. The fastest times go on the leaderboard.',
];

export function createHowToPlay(ctx: HudContext): HudPart {
  const start = el('button', { className: 'wss-btn wss-btn-primary wss-howto-start', text: 'Start', attrs: { type: 'button' } });
  const card = el('div', { className: 'wss-howto-card', attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'wss-howto-title' } }, [
    el('h2', { className: 'wss-howto-title', text: 'Find Waldo', attrs: { id: 'wss-howto-title' } }),
    el('ol', { className: 'wss-howto-steps' }, STEPS.map((text) => el('li', { text }))),
    el('p', { className: 'wss-howto-clock', text: 'The clock starts when you press Start.' }),
    start,
  ]);
  /* the layer covers the whole screen so the town underneath cannot be dragged or clicked */
  const root = el('div', { className: 'wss-howto-root' }, [card]);
  root.hidden = true;
  let shown = false;
  /* hold the game from the outset, not from the first frame the card appears on: the clock must
   * read exactly zero when Start is pressed */
  ctx.api.setWaiting(true);

  start.addEventListener('click', () => {
    setHidden(root, true);
    ctx.api.setWaiting(false);
    ctx.announce('The clock is running. Find Waldo.');
  });

  return {
    el: root,
    update(prev: GameState | null, next: GameState): void {
      /* once per visit, the first time a puzzle is ready */
      if (shown || !enteredStatus(prev, next, 'playing')) return;
      shown = true;
      setHidden(root, false);
      start.focus({ preventScroll: true });
    },
  };
}
