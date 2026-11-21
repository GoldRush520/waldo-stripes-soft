/** Game overlay: elapsed time and the top ten in the corner, then congratulations when Waldo is found. */
import './hud.css';
import { debugParams } from '../dev/debugParams';
import type { GameApi, GameState } from '../game/api';
import { createSearchHintPanel } from './ads/searchHintPanel';
import { createTapTapRewardedVideo, TAPTAP_AD_UNIT_ID_PLACEHOLDER } from './ads/taptap';
import { changed, enteredStatus } from './diff';
import { createDisposer, el, setText } from './dom';
import { formatTime } from './format';
import { createHowToPlay } from './howToPlay';
import { createBoardModel } from './leaderboard/model';
import { createSideBoard } from './leaderboard/sideBoard';
import { TAPTAP_LEADERBOARD_ID_PLACEHOLDER } from './leaderboard/taptap';
import { createTapTapWinCard, type CampaignNavigation } from './leaderboard/taptapPanel';
import { rememberReducedMotion } from './preferences';
import { trackSafeInsets } from './safeInsets';
import type { HudContext, HudPart } from './types';
import { createWinCard } from './winCard';

export { hudSafeInsets, onHudSafeInsetsChange } from './safeInsets';
export type { HudRect, HudSafeInsets } from './safeInsets';

export interface HudHandle {
  dispose(): void;
}

function createAnnouncer(): { el: HTMLElement; announce(text: string): void } {
  const node = el('div', { className: 'wss-sr', attrs: { 'aria-live': 'polite', 'aria-atomic': 'true' } });
  let flip = false;
  return {
    el: node,
    announce(text: string): void {
      // a trailing invisible toggle makes repeated identical messages announce again
      flip = !flip;
      setText(node, flip ? text : `${text} `);
    },
  };
}

function syncRootFlags(hud: HTMLElement, prev: GameState | null, next: GameState): void {
  if (changed(prev, next, 'status')) hud.dataset['status'] = next.status;
  if (changed(prev, next, 'reducedMotion')) hud.dataset['reducedMotion'] = String(next.reducedMotion);
  if (changed(prev, next, 'paused')) hud.dataset['paused'] = String(next.paused);
}

export function mountHud(root: HTMLElement, api: GameApi, navigation?: CampaignNavigation): HudHandle {
  const disposer = createDisposer();
  const announcer = createAnnouncer();
  const ctx: HudContext = { api, disposer, announce: announcer.announce, rememberReducedMotion };
  const hud = el('div', { className: 'wss-hud', attrs: { 'data-status': 'loading' } });

  const timer = el('div', {
    className: 'wss-timer',
    text: '00:00',
    attrs: { role: 'timer', 'aria-label': import.meta.env.MODE === 'taptap' ? '本局用时' : 'Elapsed time', 'aria-live': 'off' },
  });
  // Game time advances without emitting state changes every frame.
  const refreshClock = (): void => setText(timer, formatTime(api.getState().elapsedMs));
  const clock = window.setInterval(refreshClock, 250);
  disposer.add(() => window.clearInterval(clock));
  const board = import.meta.env.MODE === 'taptap' ? null : createBoardModel();
  const corner = el('div', { className: 'wss-corner' }, [timer]);
  if (api.campaign) {
    corner.classList.add('wss-campaign-corner');
    corner.prepend(el('span', {text:`第 ${api.campaign.stage} 关 · ${api.campaign.name}`}));
  }
  if (board) {
    const side = createSideBoard(board);
    disposer.add(side.dispose);
    corner.append(side.el);
  }
  const win = board ? createWinCard(ctx, board) : createTapTapWinCard(
    ctx, import.meta.env.VITE_TAPTAP_LEADERBOARD_ID || TAPTAP_LEADERBOARD_ID_PLACEHOLDER, navigation,
  );
  const parts: HudPart[] = api.campaign ? [win] : [createHowToPlay(ctx), win];
  if (import.meta.env.MODE === 'taptap') {
    const id: string = import.meta.env.VITE_TAPTAP_REWARDED_AD_UNIT_ID || TAPTAP_AD_UNIT_ID_PLACEHOLDER;
    const mock = debugParams(location).get('mockAds') === '1';
    parts.push(createSearchHintPanel(ctx, mock ? null : createTapTapRewardedVideo(id)));
  }

  hud.append(
    corner,
    ...parts.map((part) => part.el),
    announcer.el,
  );
  root.appendChild(hud);

  let prev: GameState | null = null;
  const render = (next: GameState): void => {
    if (next === prev) return;
    syncRootFlags(hud, prev, next);
    refreshClock();
    /* a puzzle has started: show the current top ten (the win card refreshes it again later) */
    if (board && enteredStatus(prev, next, 'playing')) {
      board.startRun();
      void board.refresh();
    }
    parts.forEach((p) => p.update(prev, next));
    prev = next;
  };

  /* The game always starts fully animated. It used to switch itself to reduced motion from the
   * operating system's "reduce motion" setting, but this overlay has no control to switch it back,
   * so on such machines the whole crowd simply stood frozen. */
  render(api.getState());
  disposer.add(api.subscribe(render));
  disposer.add(trackSafeInsets(hud));

  return {
    dispose(): void {
      disposer.dispose();
      hud.remove();
    },
  };
}
