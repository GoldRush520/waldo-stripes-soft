/** Loading pill (striped progress) and the discreet "Paused" pill. */
import type { GameState } from '../game/api';
import { button, el, setAttr, setHidden, setText } from './dom';
import { changed } from './diff';
import { icon, stripeMotif } from './icons';
import type { HudContext, HudPart } from './types';

export function createLoadingPill(): HudPart {
  const fill = el('span', { className: 'wss-loading-fill' });
  const pct = el('span', { className: 'wss-loading-pct', text: '0%' });
  const bar = el('span', {
    className: 'wss-loading-bar',
    attrs: { role: 'progressbar', 'aria-label': 'Building the town', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0' },
  }, [fill]);
  const root = el('div', { className: 'wss-loading wss-surface' }, [
    el('div', { className: 'wss-loading-title' }, [stripeMotif(), el('span', { text: 'Waldo Stripes Soft' })]),
    el('div', { className: 'wss-loading-row' }, [bar, pct]),
    el('p', { className: 'wss-loading-note', text: 'Setting up the festival town…' }),
  ]);
  let lastPct = -1;
  return {
    el: root,
    update(prev: GameState | null, next: GameState): void {
      if (changed(prev, next, 'status')) setHidden(root, next.status !== 'loading');
      if (next.status !== 'loading') return;
      const p = Math.round(Math.min(1, Math.max(0, Number.isFinite(next.progress) ? next.progress : 0)) * 100);
      if (p === lastPct) return;
      lastPct = p;
      fill.style.clipPath = `inset(0 ${100 - p}% 0 0)`;
      setText(pct, `${p}%`);
      setAttr(bar, 'aria-valuenow', String(p));
    },
  };
}

export function createPausedPill(ctx: HudContext): HudPart {
  const root = button({
    className: 'wss-pill wss-paused',
    label: 'Paused. Resume',
    icon: icon('play'),
    text: 'Paused',
    onClick: () => ctx.api.setPaused(false),
  });
  root.hidden = true;
  return {
    el: root,
    update(prev: GameState | null, next: GameState): void {
      if (!changed(prev, next, 'paused', 'status')) return;
      const show = next.paused && next.status !== 'loading';
      setHidden(root, !show);
      if (prev !== null && prev.paused !== next.paused) ctx.announce(next.paused ? 'Paused' : 'Resumed');
    },
  };
}
