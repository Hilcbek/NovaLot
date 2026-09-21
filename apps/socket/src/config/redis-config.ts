// config/redis-config.ts
import type { RedisOptions } from "ioredis";
import { env } from "@novalot/shared/env";

/**
 * Returns per-connection ioredis option overrides.
 * We create two clients (pub + sub) for the redis adapter —
 * both share the same base options.
 */
export function buildRedisOptions(): RedisOptions {
  const url = env.REDIS_URL;

  return {
    // ioredis accepts a connection string via the `lazyConnect` path;
    // we parse it into explicit fields so options merge cleanly.
    host: parseRedisHost(url),
    port: parseRedisPort(url),
    password: parseRedisPassword(url),
    maxRetriesPerRequest: null, // required for BullMQ workers
    enableReadyCheck: false,
    retryStrategy: (times) => Math.min(times * 100, 3_000),
  };
}

// ── minimal URL helpers (no extra deps) ──────────────────────────────────────

function parseRedisHost(url: string): string {
  try {
    return new URL(url).hostname || "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

function parseRedisPort(url: string): number {
  try {
    return Number(new URL(url).port) || 6379;
  } catch {
    return 6379;
  }
}

function parseRedisPassword(url: string): string | undefined {
  try {
    return new URL(url).password || undefined;
  } catch {
    return undefined;
  }
}
