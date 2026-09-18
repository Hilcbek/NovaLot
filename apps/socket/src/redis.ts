import Redis from "ioredis";

// apps/socket/src/logger.ts — already exists from earlier
import { createLogger } from "@novalot/shared/logger";
export const logger = createLogger("socket");
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("Missing REDIS_URL in apps/socket");
}

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 200, 5000),
});

redis.on("error", (err) => logger.error("redis connection error", { error: err }));
redis.on("connect", () => logger.info("redis connected"));