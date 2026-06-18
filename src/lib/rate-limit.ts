export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * In-memory fixed-window rate limiter. Returns a `check(key)` function with its
 * own store, so it is easy to unit-test with an injectable `now`.
 *
 * Note: in-memory means per-process — fine for this app; a multi-instance
 * deployment would back this with Redis or similar.
 */
export function createRateLimiter(options: { limit: number; windowMs: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function check(key: string, now: number = Date.now()): RateLimitResult {
    const entry = hits.get(key);
    if (!entry || now >= entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + options.windowMs });
      return { allowed: true, remaining: options.limit - 1, retryAfterMs: 0 };
    }
    entry.count += 1;
    const allowed = entry.count <= options.limit;
    return {
      allowed,
      remaining: Math.max(0, options.limit - entry.count),
      retryAfterMs: allowed ? 0 : entry.resetAt - now,
    };
  };
}
