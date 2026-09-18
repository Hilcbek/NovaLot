// shared/src/rate-limit/index.ts
import type Redis from "ioredis";

const RATE_LIMIT_SCRIPT = `
local current = redis.call("INCR", KEYS[1])
if tonumber(current) == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("PTTL", KEYS[1])
return { current, ttl }
`;

export interface RateLimitOptions {
  limit: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

export async function rateLimit(
  redis: Redis,
  key: string,
  { limit, windowSeconds }: RateLimitOptions,
): Promise<RateLimitResult> {
  const windowMs = windowSeconds * 1000;
  const [current, ttlMs] = (await redis.eval(
    RATE_LIMIT_SCRIPT,
    1,
    key,
    windowMs,
  )) as [number, number];

  const resetAt = new Date(Date.now() + (ttlMs > 0 ? ttlMs : windowMs));

  return {
    success: current <= limit,
    limit,
    remaining: Math.max(limit - current, 0),
    resetAt,
  };
}

// Tune per endpoint — these are reasonable starting points for auth flows.
export const RATE_LIMITS = {
  login: { limit: 5, windowSeconds: 60 },
  signup: { limit: 3, windowSeconds: 60 * 60 },
  passwordResetRequest: { limit: 3, windowSeconds: 60 * 60 },
  verifyEmailResend: { limit: 3, windowSeconds: 60 * 15 },
} as const satisfies Record<string, RateLimitOptions>;