import "server-only";

/**
 * Fixed-window, in-memory rate limiter (per process).
 * Fine for a single instance; replace with a shared store (DB/Redis) when running several instances.
 */
type Window = { count: number; resetAt: number };

const allBuckets: Map<string, Window>[] = [];

export function createRateLimiter(limit: number, windowMs: number) {
  const buckets = new Map<string, Window>();
  allBuckets.push(buckets);
  return function check(key: string, now: number = Date.now()): { ok: boolean; retryAfterMs: number } {
    const current = buckets.get(key);
    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return { ok: true, retryAfterMs: 0 };
    }
    if (current.count >= limit) {
      return { ok: false, retryAfterMs: current.resetAt - now };
    }
    current.count += 1;
    return { ok: true, retryAfterMs: 0 };
  };
}

/** Doc §8: 5 submissions per 10 minutes per IP. */
export const formRateLimit = createRateLimiter(5, 10 * 60 * 1000);

/** Test helper. */
export function resetRateLimits() {
  allBuckets.forEach((b) => b.clear());
}
