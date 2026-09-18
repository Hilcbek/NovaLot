import "server-only";
import Redis from "ioredis";
import { logger } from "./logger";

const globalForRedis = globalThis as unknown as { redis?: Redis };

function createClient() {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("Missing REDIS_URL in apps/web");

  const client = new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
    connectTimeout: 5000,
    enableOfflineQueue: false,
  });

  client.on("error", (err) => logger.error("redis connection error", { error: err }));
  client.on("connect", () => logger.info("redis connected"));

  return client;
}

export const redis = globalForRedis.redis ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}