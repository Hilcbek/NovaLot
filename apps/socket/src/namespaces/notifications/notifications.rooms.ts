// namespaces/notifications/notifications.rooms.ts
import type { Namespace } from "socket.io";
import type {
  NotificationServerToClientEvents,
  NotificationClientToServerEvents,
} from "@novalot/shared/events";
import type { SocketData } from "@novalot/shared/events";

export type NotificationNamespace = Namespace<
  NotificationClientToServerEvents,
  NotificationServerToClientEvents,
  Record<string, never>,
  SocketData
>;

/** Each user gets their own private room so we can push targeted notifications */
export const userNotificationRoom = (userId: string) => `notifications:user:${userId}`;

export async function joinUserNotificationRoom(
  ns: NotificationNamespace,
  socketId: string,
  userId: string,
): Promise<void> {
  const socket = ns.sockets.get(socketId);
  if (!socket) return;
  await socket.join(userNotificationRoom(userId));
}
