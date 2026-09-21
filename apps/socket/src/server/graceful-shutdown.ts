// server/graceful-shutdown.ts
import type http from "http";
import type { Redis } from "ioredis";
import type { IoServer } from "./create-socket.server";
import type { Logger } from "@novalot/shared/logger";

export interface ShutdownDeps {
  httpServer: http.Server;
  io: IoServer;
  pubClient: Redis;
  subClient: Redis;
  logger: Logger;
}

export function registerGracefulShutdown(deps: ShutdownDeps): void {
  const { httpServer, io, pubClient, subClient, logger } = deps;

  async function shutdown(signal: string): Promise<void> {
    logger.info(`Received ${signal} — shutting down gracefully`);

    // 1. Stop accepting new socket connections
    await io.close();

    // 2. Close the HTTP server (stops new HTTP requests)
    await new Promise<void>((resolve, reject) =>
      httpServer.close((err) => (err ? reject(err) : resolve())),
    );

    // 3. Disconnect Redis clients
    await Promise.all([pubClient.quit(), subClient.quit()]);

    logger.info("Shutdown complete");
    process.exit(0);
  }

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));

  process.on("uncaughtException", (err) => {
    logger.error("Uncaught exception", { err });
    void shutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled rejection", { reason });
    void shutdown("unhandledRejection");
  });
}
