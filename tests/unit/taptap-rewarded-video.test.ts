import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTapTapRewardedVideo, TAPTAP_AD_UNIT_ID_PLACEHOLDER } from '../../src/ui/ads/taptap';

type CloseListener = (result?: { isEnded: boolean }) => void;

function host() {
  const close = new Set<CloseListener>();
  const errors = new Set<() => void>();
  const ad = {
    show: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    destroy: vi.fn(),
    load: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    onClose: (listener: CloseListener) => close.add(listener),
    offClose: (listener: CloseListener) => close.delete(listener),
    onError: (listener: () => void) => errors.add(listener),
    offError: (listener: () => void) => errors.delete(listener),
  };
  const create = vi.fn(() => ad);
  vi.stubGlobal('tap', { createRewardedVideoAd: create });
  return { ad, create, close, errors };
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('TapTap rewarded video', () => {
  it('keeps the placeholder inactive even when the host is present', async () => {
    const { create } = host();
    const video = createTapTapRewardedVideo(TAPTAP_AD_UNIT_ID_PLACEHOLDER);
    expect(video.available()).toBe(false);
    expect(await video.play(vi.fn())).toBe('failed');
    expect(create).not.toHaveBeenCalled();
  });

  it('settles only on close and ignores duplicate callbacks or concurrent playback', async () => {
    const { create, close, errors } = host();
    const video = createTapTapRewardedVideo('test-id');
    const shown = vi.fn();
    const complete = vi.fn();
    const pending = video.play(shown).then(complete);
    expect(await video.play(vi.fn())).toBe('failed');
    expect(complete).not.toHaveBeenCalled();
    const listener = [...close][0];
    listener({ isEnded: true });
    listener({ isEnded: true });
    await pending;
    expect(complete).toHaveBeenCalledExactlyOnceWith('completed');
    expect(shown).toHaveBeenCalledTimes(1);
    expect(close.size).toBe(0);
    expect(errors.size).toBe(0);
    const next = video.play(vi.fn());
    listener({ isEnded: true });
    [...close][0]({ isEnded: false });
    expect(await next).toBe('closed');
    expect(create).toHaveBeenCalledTimes(2);
    expect(create).toHaveBeenCalledWith({ adUnitId: 'test-id', multiton: true });
  });

  it('retries an unloaded video once and leaves no listeners after a failure', async () => {
    const { ad, close, errors } = host();
    ad.show.mockRejectedValueOnce(new Error('unloaded'));
    ad.load.mockRejectedValueOnce(new Error('no fill'));
    const shown = vi.fn();
    expect(await createTapTapRewardedVideo('test-id').play(shown)).toBe('failed');
    expect(ad.load).toHaveBeenCalledTimes(1);
    expect(shown).not.toHaveBeenCalled();
    expect(close.size).toBe(0);
    expect(errors.size).toBe(0);
  });

  it('keeps a shown ad eligible after 120 seconds until the SDK confirms completion', async () => {
    vi.useFakeTimers();
    const { close, ad } = host();
    const video = createTapTapRewardedVideo('test-id');
    const shown = vi.fn();
    const pending = video.play(shown);
    await vi.advanceTimersByTimeAsync(150_000);
    expect(shown).toHaveBeenCalledTimes(1);
    expect(ad.destroy).not.toHaveBeenCalled();
    [...close][0]({ isEnded: true });
    expect(await pending).toBe('completed');
    expect(ad.destroy).toHaveBeenCalledOnce();
  });

  it('counts foreground loading time only and allows a retry without accepting a stale close', async () => {
    vi.useFakeTimers();
    const page = Object.assign(new EventTarget(), { hidden: false });
    vi.stubGlobal('document', page);
    const { close, ad } = host();
    let resolveShow!: () => void;
    ad.show.mockImplementationOnce(() => new Promise<void>(resolve => { resolveShow = resolve; }));
    const video = createTapTapRewardedVideo('test-id', 15_000);
    const shown = vi.fn();
    const pending = video.play(shown);
    const oldClose = [...close][0];
    await vi.advanceTimersByTimeAsync(5_000);
    page.hidden = true;
    page.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(150_000);
    expect(ad.destroy).not.toHaveBeenCalled();
    page.hidden = false;
    page.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(10_000);
    expect(await pending).toBe('timeout');
    expect(video.available()).toBe(true);
    const retry = video.play(vi.fn());
    resolveShow();
    oldClose({ isEnded: true });
    [...close][0]({ isEnded: false });
    expect(await retry).toBe('closed');
    expect(shown).not.toHaveBeenCalled();
  });

  it('drops callbacks and pending loads when the originating run ends', async () => {
    const { ad, close } = host();
    let loaded!: () => void;
    ad.show.mockRejectedValueOnce(new Error('unloaded'));
    ad.load.mockImplementationOnce(() => new Promise<void>(resolve => { loaded = resolve; }));
    const signal = new AbortController();
    const video = createTapTapRewardedVideo('test-id');
    const shown = vi.fn();
    const pending = video.play(shown, signal.signal);
    await Promise.resolve();
    const oldClose = [...close][0];
    signal.abort();
    expect(await pending).toBe('failed');
    loaded();
    oldClose({ isEnded: true });
    await Promise.resolve();
    expect(shown).not.toHaveBeenCalled();
    expect(ad.show).toHaveBeenCalledOnce();
    expect(ad.destroy).toHaveBeenCalledOnce();
    expect(video.available()).toBe(true);
  });
});
