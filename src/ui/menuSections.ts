/** Content blocks of the "more" menu: motion, quality, puzzle/seed, controls legend. */
import type { GameState, QualitySetting } from '../game/api';
import { button, el, setAttr, setText } from './dom';
import { changed } from './diff';
import { sanitizeSeed } from './format';
import { icon } from './icons';
import type { HudContext, HudPart } from './types';

const QUALITIES: readonly { readonly value: QualitySetting; readonly label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const LEGEND = 'Drag or use the arrow keys to look around · Click or tap the person you think is Waldo · P pause · M menu';

function section(title: string, children: readonly Node[]): HTMLElement {
  const id = `wss-menu-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  return el('section', { className: 'wss-menu-section', attrs: { 'aria-labelledby': id } }, [
    el('h2', { className: 'wss-menu-heading', text: title, attrs: { id } }),
    ...children,
  ]);
}

export function createMotionSection(ctx: HudContext): HudPart {
  const sw = button({
    className: 'wss-switch',
    label: 'Reduced motion',
    onClick: () => {
      const on = !ctx.api.getState().reducedMotion;
      ctx.rememberReducedMotion(on);
      ctx.api.setReducedMotion(on);
    },
  });
  setAttr(sw, 'role', 'switch');
  sw.append(el('span', { className: 'wss-switch-track' }, [el('span', { className: 'wss-switch-knob' })]));
  const row = el('div', { className: 'wss-menu-row' }, [
    el('span', { className: 'wss-menu-row-label', text: 'Reduced motion', attrs: { 'aria-hidden': 'true' } }),
    sw,
  ]);
  return {
    el: section('Comfort', [row]),
    update(prev, next) {
      if (changed(prev, next, 'reducedMotion')) setAttr(sw, 'aria-checked', String(next.reducedMotion));
    },
  };
}

export function createQualitySection(ctx: HudContext): HudPart {
  const buttons = QUALITIES.map((q) => {
    const b = button({
      className: 'wss-seg',
      label: `Quality ${q.label}`,
      text: q.label,
      onClick: () => ctx.api.setQuality(q.value),
    });
    b.dataset['value'] = q.value;
    return b;
  });
  const group = el('div', { className: 'wss-segmented', attrs: { role: 'group', 'aria-label': 'Quality' } }, buttons);
  return {
    el: section('Quality', [group]),
    update(prev, next) {
      if (!changed(prev, next, 'quality')) return;
      buttons.forEach((b) => setAttr(b, 'aria-pressed', String(b.dataset['value'] === next.quality)));
    },
  };
}

export function createPuzzleSection(ctx: HudContext, close: () => void): HudPart {
  const seedOut = el('output', { className: 'wss-seed-current', attrs: { 'aria-label': 'Current seed' } });
  const input = el('input', {
    className: 'wss-input',
    attrs: { type: 'text', autocomplete: 'off', spellcheck: 'false', maxlength: '40', placeholder: 'seed', 'aria-label': 'Seed for a new puzzle' },
  });
  const error = el('p', { className: 'wss-field-note', attrs: { role: 'status' } });
  const submit = (seed: string | undefined): void => {
    ctx.api.newPuzzle(seed);
    input.value = '';
    setText(error, '');
    close();
  };
  const go = button({
    className: 'wss-btn wss-btn-small',
    label: 'Start puzzle from seed',
    text: 'Go',
    onClick: () => {
      const seed = sanitizeSeed(input.value);
      if (seed === null) setText(error, 'Use letters, digits, - or _.');
      else submit(seed);
    },
  });
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') go.click();
  });
  const fresh = button({
    className: 'wss-btn wss-btn-wide wss-btn-coral',
    label: 'New puzzle',
    icon: icon('dice'),
    text: 'New puzzle',
    onClick: () => submit(undefined),
  });
  const restart = button({
    className: 'wss-btn wss-btn-wide',
    label: 'Restart this puzzle',
    text: 'Restart',
    onClick: () => {
      ctx.api.restart();
      close();
    },
  });
  const seedDisclosure = el('details', { className: 'wss-disclosure' }, [
    el('summary', { className: 'wss-disclosure-summary', text: 'Use a seed' }),
    el('div', { className: 'wss-menu-row' }, [el('span', { className: 'wss-menu-row-label', text: 'Current' }), seedOut]),
    el('div', { className: 'wss-seed-form' }, [input, go]),
    error,
  ]);
  return {
    el: section('Puzzle', [
      el('div', { className: 'wss-puzzle-actions' }, [fresh, restart]),
      el('p', { className: 'wss-field-note', text: 'Every refresh makes a new scene.' }),
      seedDisclosure,
    ]),
    update(prev, next) {
      if (changed(prev, next, 'seed')) setText(seedOut, next.seed);
    },
  };
}

export function createLegendSection(): HTMLElement {
  return section('How to play', [el('p', { className: 'wss-legend', text: LEGEND })]);
}
