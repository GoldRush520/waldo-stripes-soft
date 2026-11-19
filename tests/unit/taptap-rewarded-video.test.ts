import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTapTapRewardedVideo, TAPTAP_AD_UNIT_ID_PLACEHOLDER } from '../../src/ui/ads/taptap';

type CloseListener = (result?: { isEnded: boolean }) => void;

function host() {
  const close = new Set<CloseListener>();
  const errors = new Set<() => void>();
  const ad = {
    show: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
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
    expect(create).toHaveBeenCalledExactlyOnceWith({ adUnitId: 'test-id' });
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

  it('quarantines a timed out singleton so a late close cannot reward a later attempt', async () => {
    vi.useFakeTimers();
    const { close } = host();
    const video = createTapTapRewardedVideo('test-id', 10);
    const pending = video.play(vi.fn());
    const listener = [...close][0];
    await vi.advanceTimersByTimeAsync(10);
    expect(await pending).toBe('timeout');
    listener({ isEnded: true });
    expect(video.available()).toBe(false);
    expect(await video.play(vi.fn())).toBe('failed');
  });
});
