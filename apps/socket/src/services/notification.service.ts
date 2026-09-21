// services/notification.service.ts
import type { Logger } from "@novalot/shared/logger";

export interface MarkReadInput {
  notificationId: string;
  userId: string;
}

export interface NotificationServiceDeps {
  logger: Logger;
  // TODO: inject db client here when wiring real logic
  // db: DrizzleClient;
}

export function createNotificationService(deps: NotificationServiceDeps) {
  const { logger } = deps;

  async function markRead(input: MarkReadInput): Promise<void> {
    logger.debug("markRead called", input);

    // TODO: implement real logic
    //  1. Verify the notification belongs to input.userId
    //  2. Set notification.readAt = now() in DB
  }

  async function markAllRead(userId: string): Promise<void> {
    logger.debug("markAllRead called", { userId });

    // TODO: implement real logic
    //  UPDATE notifications SET read_at = now() WHERE user_id = userId AND read_at IS NULL
  }

  return { markRead, markAllRead };
}

export type NotificationService = ReturnType<typeof createNotificationService>;
