// namespaces/public/public.namespace.ts
import type { IoServer } from "@/server";
import type { Logger } from "@novalot/shared/logger";
import type { PublicNamespace } from "./public.rooms";
import { registerPublicHandlers } from "./public.handlers";
import type { PublicSocket } from "./public.handlers";

export interface PublicNamespaceDeps {
  io: IoServer;
  logger: Logger;
}

export function registerPublicNamespace(deps: PublicNamespaceDeps): void {
  const { io, logger } = deps;

  const ns = io.of("/public") as unknown as PublicNamespace;

  /**
   * Override the global auth middleware for this namespace only.
   * Any socket reaching /public is allowed through without a JWT.
   */
  ns.use((_socket, next) => next());

  ns.on("connection", (socket) => {
    logger.info("Public namespace: client connected", { socketId: socket.id });

    registerPublicHandlers(socket as PublicSocket, { ns, logger });

    socket.on("disconnect", (reason) => {
      logger.info("Public namespace: client disconnected", {
        socketId: socket.id,
        reason,
      });
    });
  });
}
