// namespaces/public/public.rooms.ts
import type { Namespace } from "socket.io";
import type {
  PublicServerToClientEvents,
  PublicClientToServerEvents,
} from "@novalot/shared/events";

export type PublicNamespace = Namespace<
  PublicClientToServerEvents,
  PublicServerToClientEvents,
  Record<string, never>,
  Record<string, never> // no socket.data needed — unauthenticated
>;

/** Single shared room all landing page visitors join */
export const PUBLIC_LIVE_AUCTIONS_ROOM = "public:live-auctions";

export async function joinPublicFeedRoom(
  ns: PublicNamespace,
  socketId: string,
): Promise<void> {
  const socket = ns.sockets.get(socketId);
  if (!socket) return;
  await socket.join(PUBLIC_LIVE_AUCTIONS_ROOM);
}

export async function leavePublicFeedRoom(
  ns: PublicNamespace,
  socketId: string,
): Promise<void> {
  const socket = ns.sockets.get(socketId);
  if (!socket) return;
  await socket.leave(PUBLIC_LIVE_AUCTIONS_ROOM);
}
