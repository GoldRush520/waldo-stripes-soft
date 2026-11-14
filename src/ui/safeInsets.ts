/**
 * Screen rectangles occupied by the persistent HUD (CSS px, relative to the HUD root / canvas).
 * Measured after mount, on resize and when a measured element changes size; never per frame.
 */

export interface HudRect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface HudSafeInsets {
  /** height of the band covered by top-anchored HUD blocks */
  readonly top: number;
  /** horizontal edge margin on the right (safe area + HUD gap) */
  readonly right: number;
  /** height of the band covered by bottom-anchored HUD blocks */
  readonly bottom: number;
  /** horizontal edge margin on the left (safe area + HUD gap) */
  readonly left: number;
  /** every persistent HUD block, so placement can test exact overlap */
  readonly blocks: readonly HudRect[];
}

export interface MeasuredBlock {
  readonly rect: HudRect;
  readonly anchor: 'top' | 'bottom';
}

const EMPTY: HudSafeInsets = { top: 0, right: 0, bottom: 0, left: 0, blocks: [] };
let cache: HudSafeInsets = EMPTY;
let listeners: ReadonlyArray<(insets: HudSafeInsets) => void> = [];

const round = (n: number): number => Math.round(n * 10) / 10;

/** Pure reduction of measured blocks into insets. */
export function computeInsets(hostW: number, hostH: number, measured: readonly MeasuredBlock[]): HudSafeInsets {
  const visible = measured.filter((m) => m.rect.w > 0 && m.rect.h > 0);
  if (visible.length === 0) return EMPTY;
  const tops = visible.filter((m) => m.anchor === 'top').map((m) => m.rect.y + m.rect.h);
  const bottoms = visible.filter((m) => m.anchor === 'bottom').map((m) => hostH - m.rect.y);
  const lefts = visible.map((m) => m.rect.x);
  const rights = visible.map((m) => hostW - (m.rect.x + m.rect.w));
  return {
    top: round(Math.max(0, ...tops)),
    bottom: round(Math.max(0, ...bottoms)),
    left: round(Math.max(0, Math.min(...lefts))),
    right: round(Math.max(0, Math.min(...rights))),
    blocks: visible.map((m) => ({ x: round(m.rect.x), y: round(m.rect.y), w: round(m.rect.w), h: round(m.rect.h) })),
  };
}

/** Latest cached measurement (a fresh copy; zeros before the HUD is mounted and laid out). */
export function hudSafeInsets(): HudSafeInsets {
  return { ...cache, blocks: cache.blocks.map((b) => ({ ...b })) };
}

/** Get notified whenever the cached insets change. Returns an unsubscribe function. */
export function onHudSafeInsetsChange(listener: (insets: HudSafeInsets) => void): () => void {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

const TARGETS: readonly (readonly [string, MeasuredBlock['anchor']])[] = [
  ['.wss-timer', 'top'],
];

function measure(hud: HTMLElement): HudSafeInsets {
  const host = hud.getBoundingClientRect();
  const measured = TARGETS.flatMap(([selector, anchor]) => {
    const node = hud.querySelector<HTMLElement>(selector);
    if (node === null) return [];
    const r = node.getBoundingClientRect();
    return [{ anchor, rect: { x: r.left - host.left, y: r.top - host.top, w: r.width, h: r.height } }];
  });
  return computeInsets(host.width, host.height, measured);
}

/** Start measuring; returns a stop function. Measurements are coalesced to one per animation frame. */
export function trackSafeInsets(hud: HTMLElement): () => void {
  let frame = 0;
  const run = (): void => {
    frame = 0;
    cache = measure(hud);
    const snapshot = cache;
    listeners.forEach((l) => l(snapshot));
  };
  const schedule = (): void => {
    if (frame === 0) frame = window.requestAnimationFrame(run);
  };
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
  TARGETS.forEach(([selector]) => {
    const node = hud.querySelector(selector);
    if (node !== null) observer?.observe(node);
  });
  window.addEventListener('resize', schedule);
  schedule();
  return () => {
    if (frame !== 0) window.cancelAnimationFrame(frame);
    observer?.disconnect();
    window.removeEventListener('resize', schedule);
    cache = EMPTY;
  };
}
