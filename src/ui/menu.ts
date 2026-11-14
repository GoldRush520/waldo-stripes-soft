/** The "more" popover menu: open/close, Escape, outside-click and focus return. */
import type { GameState } from '../game/api';
import { button, el, focusables, setAttr } from './dom';
import { icon } from './icons';
import {
  createLegendSection,
  createMotionSection,
  createPuzzleSection,
  createQualitySection,
} from './menuSections';
import type { HudContext, HudPart } from './types';

export interface MenuPart extends HudPart {
  toggle(): void;
  close(returnFocus: boolean): void;
  isOpen(): boolean;
}

export function createMenu(ctx: HudContext, anchor: HTMLButtonElement): MenuPart {
  const panel = el('div', {
    className: 'wss-menu wss-surface',
    attrs: { id: 'wss-menu', role: 'dialog', 'aria-modal': 'false', 'aria-label': 'More options' },
  });
  panel.hidden = true;

  const close = (returnFocus: boolean): void => {
    if (panel.hidden) return;
    panel.hidden = true;
    setAttr(anchor, 'aria-expanded', 'false');
    if (returnFocus) anchor.focus();
  };
  const open = (): void => {
    panel.hidden = false;
    setAttr(anchor, 'aria-expanded', 'true');
    const first = focusables(panel)[0];
    first?.focus();
  };
  const toggle = (): void => (panel.hidden ? open() : close(true));

  const closeBtn = button({
    className: 'wss-btn wss-btn-icon wss-btn-plain wss-menu-close',
    label: 'Close menu',
    icon: icon('close'),
    onClick: () => close(true),
  });
  const parts: HudPart[] = [
    createMotionSection(ctx),
    createQualitySection(ctx),
    createPuzzleSection(ctx, () => close(true)),
  ];
  panel.append(
    el('div', { className: 'wss-menu-head' }, [el('p', { className: 'wss-menu-title', text: 'Options' }), closeBtn]),
    ...parts.map((p) => p.el),
    createLegendSection(),
  );

  ctx.disposer.listen(panel, 'keydown', (ev) => {
    if (ev instanceof KeyboardEvent && ev.key === 'Escape') {
      ev.stopPropagation();
      close(true);
    }
  });
  ctx.disposer.listen(document, 'pointerdown', (ev) => {
    const t = ev.target;
    if (panel.hidden || !(t instanceof Node)) return;
    if (!panel.contains(t) && !anchor.contains(t)) close(false);
  }, { capture: true });

  return {
    el: panel,
    toggle,
    close,
    isOpen: () => !panel.hidden,
    update(prev: GameState | null, next: GameState): void {
      parts.forEach((p) => p.update(prev, next));
    },
  };
}
