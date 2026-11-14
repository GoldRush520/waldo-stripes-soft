/** Inline SVG icons built in code (24×24 grid, stroke = currentColor, rounded caps). */

const NS = 'http://www.w3.org/2000/svg';

export type IconName =
  | 'pause'
  | 'play'
  | 'more'
  | 'close'
  | 'check'
  | 'dice';

interface Shape {
  readonly tag: 'path' | 'circle' | 'rect';
  readonly attrs: Readonly<Record<string, string>>;
  readonly fill?: boolean;
}

const p = (d: string, fill = false): Shape => ({ tag: 'path', attrs: { d }, fill });
const c = (cx: number, cy: number, r: number, fill = false): Shape => ({
  tag: 'circle',
  attrs: { cx: String(cx), cy: String(cy), r: String(r) },
  fill,
});

const SHAPES: Readonly<Record<IconName, readonly Shape[]>> = {
  pause: [p('M9 6.5v11M15 6.5v11')],
  play: [p('M8.5 6.2v11.6l9.3-5.8z', true)],
  more: [c(6, 12, 1.7, true), c(12, 12, 1.7, true), c(18, 12, 1.7, true)],
  close: [p('M7 7l10 10M17 7L7 17')],
  check: [p('M6 12.5l4 4 8-9')],
  dice: [
    { tag: 'rect', attrs: { x: '4.5', y: '4.5', width: '15', height: '15', rx: '4' } },
    c(9, 9, 1.4, true),
    c(15, 15, 1.4, true),
    c(15, 9, 1.4, true),
    c(9, 15, 1.4, true),
  ],
};

export function icon(name: IconName, className = 'wss-icon'): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', className);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  for (const shape of SHAPES[name]) {
    const node = document.createElementNS(NS, shape.tag);
    for (const [k, v] of Object.entries(shape.attrs)) node.setAttribute(k, v);
    node.setAttribute('class', shape.fill === true ? 'wss-icon-fill' : 'wss-icon-stroke');
    svg.appendChild(node);
  }
  return svg;
}

/** Small coral/ivory striped motif (a rounded stripe badge) for the title lockup. */
export function stripeMotif(): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 20 20');
  svg.setAttribute('class', 'wss-motif');
  svg.setAttribute('aria-hidden', 'true');
  const clipId = 'wss-motif-clip';
  const defs = document.createElementNS(NS, 'defs');
  const clip = document.createElementNS(NS, 'clipPath');
  clip.setAttribute('id', clipId);
  const circle = document.createElementNS(NS, 'circle');
  circle.setAttribute('cx', '10');
  circle.setAttribute('cy', '10');
  circle.setAttribute('r', '9');
  clip.appendChild(circle);
  defs.appendChild(clip);
  svg.appendChild(defs);
  const group = document.createElementNS(NS, 'g');
  group.setAttribute('clip-path', `url(#${clipId})`);
  for (let i = 0; i < 5; i++) {
    const r = document.createElementNS(NS, 'rect');
    r.setAttribute('x', '0');
    r.setAttribute('y', String(i * 4));
    r.setAttribute('width', '20');
    r.setAttribute('height', '4');
    r.setAttribute('class', i % 2 === 0 ? 'wss-motif-coral' : 'wss-motif-ivory');
    group.appendChild(r);
  }
  svg.appendChild(group);
  const ring = document.createElementNS(NS, 'circle');
  ring.setAttribute('cx', '10');
  ring.setAttribute('cy', '10');
  ring.setAttribute('r', '9');
  ring.setAttribute('class', 'wss-motif-ring');
  svg.appendChild(ring);
  return svg;
}
