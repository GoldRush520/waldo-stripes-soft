/** The only completion UI: congratulations, the time, a share link and the save-my-time form. */
import { formatRunTime } from '../../shared/leaderboard';
import type { GameState } from '../game/api';
import { el, setAttr, setHidden, setText } from './dom';
import { enteredStatus } from './diff';
import type { BoardModel } from './leaderboard/model';
import { createLeaderboardPanel } from './leaderboard/panel';
import { shareUrl } from './share';
import type { HudContext, HudPart } from './types';

interface WinActions {
  readonly elements: readonly HTMLElement[];
  open(state: GameState): void;
  close?(): void;
}

export function createCompletionCard(ctx: HudContext, actions: WinActions, localized = false): HudPart {
  const title = localized ? '找到了！' : 'Congrats!';
  const message = el('p', { className: 'wss-congrats', text: title });
  const time = el('p', { className: 'wss-win-time' });
  const card = el('div', {
    className: 'wss-win-card',
    attrs: { role: 'dialog', 'aria-label': localized ? '通关结算' : 'You found Waldo' },
  }, [message, time, ...actions.elements]);
  const root = el('div', { className: 'wss-win-root' }, [card]);
  root.hidden = true;

  return {
    el: root,
    update(prev: GameState | null, next: GameState): void {
      setHidden(root, next.status !== 'won');
      if (prev?.status === 'won' && next.status !== 'won') actions.close?.();
      if (!enteredStatus(prev, next, 'won')) return;
      const found = formatRunTime(next.elapsedMs);
      const result = localized ? `本局用时 ${found} · 误点 ${next.wrongClicks} 次` : `You found Waldo in ${found}`;
      setText(time, result);
      actions.open(next);
      ctx.announce(`${title} ${result}`);
    },
  };
}

export function createWinCard(ctx: HudContext, model: BoardModel): HudPart {
  const share = el('a', {
    className: 'wss-btn wss-btn-dark wss-share',
    text: 'Share on X',
    attrs: { target: '_blank', rel: 'noopener noreferrer', href: 'https://x.com/intent/post' },
  });
  const board = createLeaderboardPanel(model, ctx.announce);
  ctx.disposer.add(board.dispose);
  return createCompletionCard(ctx, {
    elements: [share, board.el],
    open(next): void {
      setAttr(share, 'href', shareUrl(next.elapsedMs, window.location.href));
      board.open({ timeMs: next.elapsedMs, wrongClicks: next.wrongClicks, seed: next.seed });
    },
  });
}
