/** Tiny DOM construction helpers (plain DOM APIs, no innerHTML). */

export interface ElOptions {
  readonly className?: string;
  readonly text?: string;
  readonly attrs?: Readonly<Record<string, string>>;
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts: ElOptions = {},
  children: readonly Node[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (opts.className !== undefined) node.className = opts.className;
  if (opts.text !== undefined) node.textContent = opts.text;
  for (const [k, v] of Object.entries(opts.attrs ?? {})) node.setAttribute(k, v);
  for (const c of children) node.appendChild(c);
  return node;
}

export interface ButtonOptions {
  readonly className: string;
  readonly label: string;
  readonly text?: string;
  readonly icon?: SVGSVGElement;
  readonly onClick: (ev: MouseEvent) => void;
}

/** A real <button type="button"> with an aria-label, optional icon and visible text. */
export function button(opts: ButtonOptions): HTMLButtonElement {
  const children: Node[] = [];
  if (opts.icon !== undefined) children.push(opts.icon);
  if (opts.text !== undefined) children.push(el('span', { className: 'wss-btn-text', text: opts.text }));
  const b = el('button', { className: opts.className, attrs: { type: 'button', 'aria-label': opts.label } }, children);
  b.addEventListener('click', opts.onClick);
  return b;
}

/** Set text only when it differs (avoids needless DOM mutation in the hot update path). */
export function setText(node: Node, text: string): void {
  if (node.textContent !== text) node.textContent = text;
}

export function setAttr(node: Element, name: string, value: string | null): void {
  if (value === null) {
    if (node.hasAttribute(name)) node.removeAttribute(name);
  } else if (node.getAttribute(name) !== value) {
    node.setAttribute(name, value);
  }
}

export function setHidden(node: HTMLElement, hidden: boolean): void {
  if (node.hidden !== hidden) node.hidden = hidden;
}

/** Collects teardown callbacks; run them all with `dispose()`. */
export interface Disposer {
  add(fn: () => void): void;
  listen<T extends EventTarget>(target: T, type: string, fn: EventListener, opts?: AddEventListenerOptions): void;
  timeout(fn: () => void, ms: number): number;
  dispose(): void;
}

export function createDisposer(): Disposer {
  const fns: Array<() => void> = [];
  const timers = new Set<number>();
  return {
    add: (fn) => {
      fns.push(fn);
    },
    listen: (target, type, fn, opts) => {
      target.addEventListener(type, fn, opts);
      fns.push(() => target.removeEventListener(type, fn, opts));
    },
    timeout: (fn, ms) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
      return id;
    },
    dispose: () => {
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
      fns.splice(0).reverse().forEach((fn) => fn());
    },
  };
}

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export function focusables(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => !n.closest('[hidden]'));
}

/** Keep Tab / Shift+Tab inside `container`. Returns a remover. */
export function trapFocus(container: HTMLElement): () => void {
  const onKey = (ev: KeyboardEvent): void => {
    if (ev.key !== 'Tab') return;
    const items = focusables(container);
    const first = items[0];
    const last = items[items.length - 1];
    if (first === undefined || last === undefined) return;
    const active = document.activeElement;
    if (ev.shiftKey && (active === first || !container.contains(active))) {
      ev.preventDefault();
      last.focus();
    } else if (!ev.shiftKey && (active === last || !container.contains(active))) {
      ev.preventDefault();
      first.focus();
    }
  };
  container.addEventListener('keydown', onKey);
  return () => container.removeEventListener('keydown', onKey);
}

/** True when keyboard events from this target belong to a text field. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}
