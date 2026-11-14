/** The only completion UI: congratulations, the time, a share link and the save-my-time form. */
import { formatRunTime } from '../../shared/leaderboard';
import type { GameState } from '../game/api';
import { el, setAttr, setHidden, setText } from './dom';
import { enteredStatus } from './diff';
import type { BoardModel } from './leaderboard/model';
import { createLeaderboardPanel } from './leaderboard/panel';
import { shareUrl } from './share';
import type { HudContext, HudPart } from './types';

export function createWinCard(ctx: HudContext, model: BoardModel): HudPart {
  const message = el('p', { className: 'wss-congrats', text: 'Congrats!' });
  const time = el('p', { className: 'wss-win-time' });
  const share = el('a', {
    className: 'wss-btn wss-btn-dark wss-share',
    text: 'Share on X',
    attrs: { target: '_blank', rel: 'noopener noreferrer', href: 'https://x.com/intent/post' },
  });
  const board = createLeaderboardPanel(model, ctx.announce);
  ctx.disposer.add(board.dispose);
  const card = el('div', { className: 'wss-win-card', attrs: { role: 'dialog', 'aria-label': 'You found Waldo' } }, [message, time, share, board.el]);
  const root = el('div', { className: 'wss-win-root' }, [card]);
  root.hidden = true;

  return {
    el: root,
    update(prev: GameState | null, next: GameState): void {
      setHidden(root, next.status !== 'won');
      if (!enteredStatus(prev, next, 'won')) return;
      const found = formatRunTime(next.elapsedMs);
      setText(time, `You found Waldo in ${found}`);
      setAttr(share, 'href', shareUrl(next.elapsedMs, window.location.href));
      board.open({ timeMs: next.elapsedMs, wrongClicks: next.wrongClicks, seed: next.seed });
      ctx.announce(`Congrats! You found Waldo in ${found}.`);
    },
  };
}
