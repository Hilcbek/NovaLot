// namespaces/notifications/notifications.handlers.ts
import type { Socket } from "socket.io";
import type {
  NotificationServerToClientEvents,
  NotificationClientToServerEvents,
} from "@novalot/shared/events";
import type { SocketData } from "@novalot/shared/events";
import type { Logger } from "@novalot/shared/logger";
import type { NotificationService } from "@/services";
import { asyncHandlerNoAck } from "@/utils";

type NotificationSocket = Socket<
  NotificationClientToServerEvents,
  NotificationServerToClientEvents,
  Record<string, never>,
  SocketData
>;

export interface NotificationHandlerDeps {
  notificationService: NotificationService;
  logger: Logger;
}

export function registerNotificationHandlers(
  socket: NotificationSocket,
  deps: NotificationHandlerDeps,
): void {
  const { notificationService, logger } = deps;
  const userId = socket.data.sub;

  // ── notification:mark_read ────────────────────────────────────────────────
  socket.on(
    "notification:mark_read",
    asyncHandlerNoAck(
      async ({ id }) => {
        await notificationService.markRead({ notificationId: id, userId });
        logger.debug("Notification marked read", { notificationId: id, userId });
      },
      (err) => logger.error("Failed to mark notification read", { err }),
    ),
  );
}
