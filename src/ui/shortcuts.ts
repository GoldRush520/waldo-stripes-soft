/** HUD keyboard shortcuts: P / Space = pause, M = menu. Look-around keys live elsewhere. */
import { isTypingTarget } from './dom';

export type ShortcutAction = 'pause' | 'menu';

/** Pure key -> action mapping. Space is ignored on interactive targets so it can activate them. */
export function shortcutFor(key: string, onInteractive: boolean): ShortcutAction | null {
  switch (key.toLowerCase()) {
    case 'p':
      return 'pause';
    case ' ':
    case 'spacebar':
      return onInteractive ? null : 'pause';
    case 'm':
      return 'menu';
    default:
      return null;
  }
}

export type ShortcutHandlers = Readonly<Record<ShortcutAction, () => void>>;

function isInteractive(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.closest('button, a, summary, [role="switch"]') !== null;
}

export function bindShortcuts(handlers: ShortcutHandlers): () => void {
  const onKey = (ev: KeyboardEvent): void => {
    if (ev.defaultPrevented || ev.repeat || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    if (isTypingTarget(ev.target)) return;
    const action = shortcutFor(ev.key, isInteractive(ev.target));
    if (action === null) return;
    ev.preventDefault();
    handlers[action]();
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}
