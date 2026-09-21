// src/index.ts — composition root (only file that reads env directly)
import { logger } from "@/utils";
import { buildSocketConfig, buildRedisOptions } from "@/config";
import { createHttpServer, createSocketServer, registerGracefulShutdown } from "@/server";
import { registerAuthMiddleware } from "@/middleware";
import { registerNamespaces } from "@/namespaces";
import { createBidService, createNotificationService } from "@/services";
import { createAuctionEndWorker } from "@/workers";
import { Redis } from "ioredis";

async function main(): Promise<void> {
  const config = buildSocketConfig();
  const redisOptions = buildRedisOptions();

  // ── HTTP + Socket.IO ──────────────────────────────────────────────────────
  const httpServer = createHttpServer(config);
  const { io, pubClient, subClient } = createSocketServer({
    httpServer,
    config,
    redisOptions,
  });

  // ── Auth middleware (applied globally before any namespace handler) ───────
  registerAuthMiddleware(io, logger);

  // ── Services ──────────────────────────────────────────────────────────────
  const bidService = createBidService({ logger });
  const notificationService = createNotificationService({ logger });

  // ── Namespaces ────────────────────────────────────────────────────────────
  registerNamespaces({ io, bidService, notificationService, logger });

  // ── Auction-end worker (dedicated Redis subscriber client) ────────────────
  const workerRedis = new Redis(redisOptions);
  const auctionEndWorker = createAuctionEndWorker({
    io,
    redis: workerRedis,
    logger,
  });
  await auctionEndWorker.start();

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  registerGracefulShutdown({ httpServer, io, pubClient, subClient, logger });

  // ── Listen ────────────────────────────────────────────────────────────────
  httpServer.listen(config.port, () => {
    logger.info(`Socket server listening on :${config.port}`);
  });
}

main().catch((err) => {
  logger.error("Fatal startup error", { err });
  process.exit(1);
});
