/**
 * Pure failed-login spike detection. Kept free of server-only imports so it can
 * be unit-tested and reused by the security dashboard.
 */

export interface LoginEventLike {
  type: string;
  targetEmail: string | null;
  ip: string | null;
  createdAt: Date;
}

export interface FailedLoginAlert {
  key: string;
  email: string;
  ip: string;
  count: number;
  firstAt: Date;
  lastAt: Date;
}

export interface SpikeOptions {
  /** Rolling window length in ms. Default: 15 minutes. */
  windowMs?: number;
  /** Minimum failures in the window to raise an alert. Default: 5. */
  threshold?: number;
  /** "Now" reference, for deterministic testing. */
  now?: Date;
}

/**
 * Group `login_failure` events by email + IP within a rolling time window and
 * return one alert per group that meets or exceeds the threshold, busiest first.
 */
export function detectFailedLoginSpikes(
  events: readonly LoginEventLike[],
  options: SpikeOptions = {},
): FailedLoginAlert[] {
  const windowMs = options.windowMs ?? 15 * 60 * 1000;
  const threshold = options.threshold ?? 5;
  const now = options.now ?? new Date();
  const cutoff = now.getTime() - windowMs;

  const groups = new Map<string, FailedLoginAlert>();

  for (const event of events) {
    if (event.type !== "login_failure") continue;
    if (event.createdAt.getTime() < cutoff) continue;

    const email = event.targetEmail ?? "unknown";
    const ip = event.ip ?? "unknown";
    const key = `${email}|${ip}`;

    const existing = groups.get(key);
    if (existing) {
      existing.count += 1;
      if (event.createdAt < existing.firstAt) existing.firstAt = event.createdAt;
      if (event.createdAt > existing.lastAt) existing.lastAt = event.createdAt;
    } else {
      groups.set(key, {
        key,
        email,
        ip,
        count: 1,
        firstAt: event.createdAt,
        lastAt: event.createdAt,
      });
    }
  }

  return [...groups.values()]
    .filter((g) => g.count >= threshold)
    .sort((a, b) => b.count - a.count);
}
