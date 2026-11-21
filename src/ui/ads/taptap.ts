export const TAPTAP_AD_UNIT_ID_PLACEHOLDER = 'TAPTAP_REWARDED_AD_UNIT_ID_PLACEHOLDER';

export type AdOutcome = 'completed' | 'closed' | 'failed' | 'timeout';

export interface RewardedVideo {
  available(): boolean;
  play(onShown: () => void, signal?: AbortSignal): Promise<AdOutcome>;
}

type CloseListener = (result?: { readonly isEnded?: boolean }) => void;
type ErrorListener = (error: unknown) => void;

interface TapRewardedVideo {
  show(): Promise<void>;
  load(): Promise<void>;
  destroy?(): void;
  onClose(listener: CloseListener): void;
  offClose(listener: CloseListener): void;
  onError(listener: ErrorListener): void;
  offError(listener: ErrorListener): void;
}

function runtime() {
  return (globalThis as { tap?: { createRewardedVideoAd?(options: { adUnitId: string; multiton: true }): TapRewardedVideo } }).tap;
}

export function createTapTapRewardedVideo(id: string, loadTimeoutMs = 15_000): RewardedVideo {
  const adUnitId = id.trim();
  const configured = adUnitId !== '' && adUnitId !== TAPTAP_AD_UNIT_ID_PLACEHOLDER;
  let pending = false;
  const available = (): boolean => configured && !pending && typeof runtime()?.createRewardedVideoAd === 'function';

  return {
    available,
    async play(onShown, signal): Promise<AdOutcome> {
      const tap = runtime();
      if (!available() || signal?.aborted || !tap?.createRewardedVideoAd) return 'failed';
      pending = true;
      try {
        const ad = tap.createRewardedVideoAd({ adUnitId, multiton: true });
        return await new Promise<AdOutcome>((resolve) => {
          let settled = false;
          let shown = false;
          let remaining = loadTimeoutMs;
          let started = 0;
          let timer: ReturnType<typeof setTimeout> | undefined;
          const page = globalThis.document;

          function stopTimer(): void {
            if (timer === undefined) return;
            clearTimeout(timer);
            remaining -= performance.now() - started;
            timer = undefined;
          }

          function trackLoading(): void {
            stopTimer();
            if (settled || shown || page?.hidden) return;
            started = performance.now();
            timer = setTimeout(() => finish('timeout'), Math.max(0, remaining));
          }

          function reportShown(): void {
            if (shown || settled) return;
            shown = true;
            stopTimer();
            onShown();
          }

          const close: CloseListener = (result) => {
            reportShown();
            finish(result?.isEnded === true ? 'completed' : 'closed');
          };
          const fail = (): void => finish('failed');

          function finish(outcome: AdOutcome): void {
            if (settled) return;
            settled = true;
            stopTimer();
            signal?.removeEventListener('abort', fail);
            page?.removeEventListener('visibilitychange', trackLoading);
            resolve(outcome);
            try {
              ad.offClose(close);
              ad.offError(fail);
            } finally {
              ad.destroy?.();
            }
          }

          async function show(): Promise<void> {
            try {
              await ad.show();
            } catch {
              if (settled) return;
              await ad.load();
              if (settled) return;
              await ad.show();
            }
            reportShown();
          }

          try {
            signal?.addEventListener('abort', fail);
            page?.addEventListener('visibilitychange', trackLoading);
            trackLoading();
            ad.onClose(close);
            ad.onError(fail);
            if (!settled) void show().catch(fail);
          } catch {
            fail();
          }
        });
      } catch {
        return 'failed';
      } finally {
        pending = false;
      }
    },
  };
}
