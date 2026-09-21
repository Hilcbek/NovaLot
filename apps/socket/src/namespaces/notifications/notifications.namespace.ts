// namespaces/notifications/notifications.namespace.ts
import type { IoServer } from "@/server";
import type { Logger } from "@novalot/shared/logger";
import type { NotificationService } from "@/services";
import { joinUserNotificationRoom } from "./notifications.rooms";
import type { NotificationNamespace } from "./notifications.rooms";
import { registerNotificationHandlers } from "./notifications.handlers";

export interface NotificationNamespaceDeps {
  io: IoServer;
  notificationService: NotificationService;
  logger: Logger;
}

export function registerNotificationNamespace(deps: NotificationNamespaceDeps): void {
  const { io, notificationService, logger } = deps;

  const ns = io.of("/notifications") as unknown as NotificationNamespace;

  ns.on("connection", async (socket) => {
    const userId = socket.data.sub;

    logger.info("Notifications namespace: client connected", {
      socketId: socket.id,
      userId,
    });

    // Auto-join the user's private room on connect — no client-side join needed
    await joinUserNotificationRoom(ns, socket.id, userId);

    registerNotificationHandlers(socket, { notificationService, logger });

    socket.on("disconnect", (reason) => {
      logger.info("Notifications namespace: client disconnected", {
        socketId: socket.id,
        reason,
      });
    });
  });
}
