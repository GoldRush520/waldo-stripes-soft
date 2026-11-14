/**
 * Fixed-window request limiter, kept in the server's memory (it starts again when the server
 * restarts): a brake on bursts, not a hard guarantee.
 */
export interface RateLimiter {
  /** True when `key` may make another request now (and counts it). */
  allow(key: string, now: number): boolean;
}

/** callers remembered at once; beyond this the oldest windows are forgotten, so memory stays bounded */
const DEFAULT_MAX_KEYS = 5_000;

export function createRateLimiter(limit: number, windowMs: number, maxKeys = DEFAULT_MAX_KEYS): RateLimiter {
  const hits = new Map<string, { readonly start: number; readonly count: number }>();
  return {
    allow(key: string, now: number): boolean {
      const seen = hits.get(key);
      if (!seen || now - seen.start >= windowMs) {
        if (hits.size >= maxKeys) {
          for (const [k, v] of hits) if (now - v.start >= windowMs) hits.delete(k);
          if (hits.size >= maxKeys) hits.clear();
        }
        hits.set(key, { start: now, count: 1 });
        return true;
      }
      if (seen.count >= limit) return false;
      hits.set(key, { start: seen.start, count: seen.count + 1 });
      return true;
    },
  };
}
