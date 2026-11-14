/** Top-left compact title lockup with the coral/ivory stripe motif. */
import { el } from './dom';
import { stripeMotif } from './icons';

export function createTitle(): HTMLElement {
  return el('div', { className: 'wss-title' }, [
    stripeMotif(),
    el('h1', { className: 'wss-title-text' }, [
      el('span', { className: 'wss-title-main', text: 'Waldo Stripes' }),
      el('span', { className: 'wss-title-soft', text: ' Soft' }),
    ]),
  ]);
}
