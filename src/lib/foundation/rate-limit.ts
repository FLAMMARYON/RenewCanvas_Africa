export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function checkInMemoryRateLimit(
  key: string,
  options: {
    limit: number;
    windowMs: number;
    now?: number;
  }
): RateLimitResult {
  if (!Number.isInteger(options.limit) || options.limit < 1) {
    throw new Error("Rate limit must be a positive integer.");
  }

  if (!Number.isInteger(options.windowMs) || options.windowMs < 1) {
    throw new Error("Rate limit windowMs must be a positive integer.");
  }

  if (key.trim().length === 0) {
    throw new Error("Rate limit key must not be empty.");
  }

  const now = options.now ?? Date.now();
  const existing = buckets.get(key);
  const bucket =
    existing && existing.resetAt > now
      ? existing
      : { count: 0, resetAt: now + options.windowMs };

  bucket.count += 1;
  buckets.set(key, bucket);

  const remaining = Math.max(options.limit - bucket.count, 0);

  return {
    allowed: bucket.count <= options.limit,
    limit: options.limit,
    remaining,
    resetAt: bucket.resetAt,
  };
}

export function clearInMemoryRateLimits() {
  buckets.clear();
}
