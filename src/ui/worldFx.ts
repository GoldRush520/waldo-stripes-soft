/** World-anchored effects: the win 'found' ring and click feedback ripples (transforms only). No hints. */
import type { ClickFeedback, GameState } from '../game/api';
import { el, setHidden } from './dom';
import { markerEqual, newClick } from './diff';
import { icon } from './icons';
import type { HudContext, HudPart } from './types';

const MAX_FX = 6;
const FX_LIFETIME: Readonly<Record<ClickFeedback['kind'], number>> = { miss: 1100, decoy: 1100, secondary: 1500, hit: 0 };
const SPARKS = 8;

function translate(x: number, y: number): string {
  return `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
}

export function createMarker(): HudPart {
  const ring = el('div', { className: 'wss-marker-ring' });
  const sparks = el('div', { className: 'wss-marker-sparks', attrs: { 'aria-hidden': 'true' } },
    Array.from({ length: SPARKS }, (_, i) => {
      const s = el('span', { className: 'wss-spark' });
      s.style.setProperty('--wss-a', `${(360 / SPARKS) * i}deg`);
      return s;
    }));
  const size = el('div', { className: 'wss-marker-size' }, [ring, sparks]);
  const root = el('div', { className: 'wss-marker', attrs: { 'aria-hidden': 'true' } }, [size]);
  root.hidden = true;
  let lastRadius = -1;
  let lastKind = '';

  return {
    el: root,
    update(prev: GameState | null, next: GameState): void {
      // only the celebratory 'found' ring is drawn; hint markers (vicinity / reveal) are ignored
      const m = next.marker !== null && next.marker.kind === 'found' ? next.marker : null;
      const before = prev !== null && prev.marker !== null && prev.marker.kind === 'found' ? prev.marker : null;
      if (prev !== null && markerEqual(before, m)) return;
      setHidden(root, m === null);
      if (m === null) {
        lastKind = '';
        return;
      }
      root.style.transform = translate(m.x, m.y);
      if (Math.abs(m.radius - lastRadius) >= 0.5) {
        lastRadius = m.radius;
        size.style.setProperty('--wss-r', `${Math.max(4, m.radius).toFixed(1)}px`);
      }
      if (m.kind !== lastKind) {
        lastKind = m.kind;
        root.dataset['kind'] = m.kind;
      }
    },
  };
}

function buildFx(click: ClickFeedback): HTMLElement {
  // decoys get exactly the same neutral feedback as a miss (no feature-describing message)
  const kind = click.kind === 'decoy' ? 'miss' : click.kind;
  const fx = el('div', { className: `wss-fx wss-fx-${kind}`, attrs: { 'aria-hidden': 'true' } });
  fx.style.transform = translate(click.x, click.y);
  fx.appendChild(el('span', { className: 'wss-ripple' }));
  if (kind === 'miss') fx.appendChild(el('span', { className: 'wss-fx-label', text: 'not him' }));
  if (kind === 'secondary') {
    fx.appendChild(el('span', { className: 'wss-fx-tick' }, [icon('check')]));
    for (let i = 0; i < SPARKS; i++) {
      const s = el('span', { className: 'wss-spark' });
      s.style.setProperty('--wss-a', `${(360 / SPARKS) * i + 22}deg`);
      fx.appendChild(s);
    }
  }
  return fx;
}

export function createClickFeedback(ctx: HudContext): HudPart {
  const root = el('div', { className: 'wss-fx-layer', attrs: { 'aria-hidden': 'true' } });
  let live: readonly HTMLElement[] = [];

  const removeFx = (fx: HTMLElement): void => {
    live = live.filter((n) => n !== fx);
    fx.remove();
  };

  return {
    el: root,
    update(prev: GameState | null, next: GameState): void {
      const click = newClick(prev, next);
      if (click === null || click.kind === 'hit') return;
      if (prev === null) return;
      const oldest = live.length >= MAX_FX ? live[0] : undefined;
      if (oldest !== undefined) removeFx(oldest);
      const fx = buildFx(click);
      live = [...live, fx];
      root.appendChild(fx);
      ctx.disposer.timeout(() => removeFx(fx), FX_LIFETIME[click.kind]);
      if (click.kind !== 'secondary') ctx.announce('Not him.');
      if (click.kind === 'secondary') ctx.announce('Found one of the extras!');
    },
  };
}
