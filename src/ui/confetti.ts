/** Palette confetti: bounded DOM pieces animated by CSS, removed automatically. */
import { createRng } from '../core/rng';
import { el } from './dom';

export const CONFETTI_MAX = 140;
const COLORS = ['coral', 'ivory', 'blue', 'butter', 'sage', 'clay'] as const;
const SHAPES = ['rect', 'dot', 'strip'] as const;
/** longest fall (s) + longest delay (s), plus slack, in ms */
const LIFETIME_MS = (3.4 + 0.9) * 1000 + 200;

export interface ConfettiOptions {
  readonly count: number;
  readonly seed: string;
  /** narrow screens get fewer pieces */
  readonly narrow: boolean;
}

/** Builds a confetti layer; caller appends it and calls the returned remover (also auto-scheduled). */
export function buildConfetti(opts: ConfettiOptions): { el: HTMLElement; lifetimeMs: number } {
  const rng = createRng(`confetti:${opts.seed}`);
  const count = Math.min(CONFETTI_MAX, Math.max(0, Math.round(opts.narrow ? opts.count * 0.6 : opts.count)));
  const layer = el('div', { className: 'wss-confetti', attrs: { 'aria-hidden': 'true' } });
  for (let i = 0; i < count; i++) {
    const piece = el('span', {
      className: `wss-piece wss-piece-${rng.pick(SHAPES)} wss-c-${rng.pick(COLORS)}`,
    });
    const s = piece.style;
    s.setProperty('--wss-x', `${rng.range(2, 98).toFixed(1)}%`);
    s.setProperty('--wss-drift', `${rng.range(-90, 90).toFixed(0)}px`);
    s.setProperty('--wss-spin', `${rng.range(-720, 720).toFixed(0)}deg`);
    s.setProperty('--wss-dur', `${rng.range(2.2, 3.4).toFixed(2)}s`);
    s.setProperty('--wss-delay', `${rng.range(0, 0.9).toFixed(2)}s`);
    s.setProperty('--wss-scale', rng.range(0.7, 1.25).toFixed(2));
    layer.appendChild(piece);
  }
  return { el: layer, lifetimeMs: LIFETIME_MS };
}

/** Static flourish for reduced motion: a few still bunting pennants above the win card. */
export function buildFlourish(): HTMLElement {
  return el('div', { className: 'wss-flourish', attrs: { 'aria-hidden': 'true' } },
    COLORS.concat(COLORS).map((c) => el('span', { className: `wss-pennant wss-c-${c}` })));
}
