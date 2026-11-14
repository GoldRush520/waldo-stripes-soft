/** Top-right control cluster: pause/resume and the "more" menu toggle. */
import type { GameState } from '../game/api';
import { button, el, setAttr } from './dom';
import { changed } from './diff';
import { icon } from './icons';
import type { HudContext, HudPart } from './types';

export interface ControlsHooks {
  toggleMenu(): void;
}

export interface ControlsPart extends HudPart {
  readonly moreButton: HTMLButtonElement;
  togglePause(): void;
}

export function createControls(ctx: HudContext, hooks: ControlsHooks): ControlsPart {
  const { api } = ctx;
  const togglePause = (): void => {
    const s = api.getState();
    if (s.status === 'loading') return;
    api.setPaused(!s.paused);
  };

  const pauseBtn = button({ className: 'wss-btn wss-btn-icon', label: 'Pause', onClick: togglePause });
  pauseBtn.append(icon('pause'), icon('play'));
  setAttr(pauseBtn, 'aria-keyshortcuts', 'P Space');

  const moreButton = button({
    className: 'wss-btn wss-btn-icon',
    label: 'More options',
    icon: icon('more'),
    onClick: () => hooks.toggleMenu(),
  });
  setAttr(moreButton, 'aria-haspopup', 'dialog');
  setAttr(moreButton, 'aria-expanded', 'false');
  setAttr(moreButton, 'aria-controls', 'wss-menu');
  setAttr(moreButton, 'aria-keyshortcuts', 'M');

  const root = el('div', { className: 'wss-controls wss-surface', attrs: { role: 'toolbar', 'aria-label': 'Game controls' } }, [
    pauseBtn,
    moreButton,
  ]);

  return {
    el: root,
    moreButton,
    togglePause,
    update(prev: GameState | null, next: GameState): void {
      if (!changed(prev, next, 'paused', 'status')) return;
      setAttr(pauseBtn, 'aria-label', next.paused ? 'Resume' : 'Pause');
      setAttr(pauseBtn, 'aria-pressed', String(next.paused));
      pauseBtn.dataset['paused'] = String(next.paused);
      pauseBtn.disabled = next.status === 'loading';
    },
  };
}
