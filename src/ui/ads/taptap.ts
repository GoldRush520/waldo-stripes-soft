export const TAPTAP_AD_UNIT_ID_PLACEHOLDER = 'TAPTAP_REWARDED_AD_UNIT_ID_PLACEHOLDER';

export type AdOutcome = 'completed' | 'closed' | 'failed' | 'timeout';

export interface RewardedVideo {
  available(): boolean;
  play(onShown: () => void): Promise<AdOutcome>;
}

type CloseListener = (result?: { readonly isEnded?: boolean }) => void;
type ErrorListener = (error: unknown) => void;

interface TapRewardedVideo {
  show(): Promise<void>;
  load(): Promise<void>;
  onClose(listener: CloseListener): void;
  offClose(listener: CloseListener): void;
  onError(listener: ErrorListener): void;
  offError(listener: ErrorListener): void;
}

function runtime() {
  return (globalThis as { tap?: { createRewardedVideoAd?(options: { adUnitId: string }): TapRewardedVideo } }).tap;
}

export function createTapTapRewardedVideo(id: string, timeoutMs = 120_000): RewardedVideo {
  const adUnitId = id.trim();
  const configured = adUnitId !== '' && adUnitId !== TAPTAP_AD_UNIT_ID_PLACEHOLDER;
  let video: TapRewardedVideo | undefined;
  let pending = false;
  let timedOut = false;
  const available = (): boolean => configured && !timedOut && typeof runtime()?.createRewardedVideoAd === 'function';

  return {
    available,
    async play(onShown): Promise<AdOutcome> {
      if (!available() || pending) return 'failed';
      pending = true;
      try {
        const tap = runtime();
        if (typeof tap?.createRewardedVideoAd !== 'function') return 'failed';
        video ??= tap.createRewardedVideoAd({ adUnitId });
        const ad = video;
        return await new Promise<AdOutcome>((resolve) => {
          let settled = false;
          let shown = false;
          const reportShown = (): void => {
            if (shown) return;
            shown = true;
            onShown();
          };
          const close: CloseListener = (result) => {
            if (settled) return;
            reportShown();
            finish(result?.isEnded === true ? 'completed' : 'closed');
          };
          const error: ErrorListener = () => finish('failed');
          const timer = setTimeout(() => {
            timedOut = true;
            finish('timeout');
          }, timeoutMs);

          function finish(outcome: AdOutcome): void {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            resolve(outcome);
            ad.offClose(close);
            ad.offError(error);
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
            if (!settled) reportShown();
          }

          try {
            ad.onClose(close);
            ad.onError(error);
            if (!settled) void show().catch(error);
          } catch {
            finish('failed');
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
