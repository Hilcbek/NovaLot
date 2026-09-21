// namespaces/auctions/auctions.rooms.ts
import type { Namespace } from "socket.io";
import type {
  AuctionServerToClientEvents,
  AuctionClientToServerEvents,
} from "@novalot/shared/events";
import type { SocketData } from "@novalot/shared/events";

export type AuctionNamespace = Namespace<
  AuctionClientToServerEvents,
  AuctionServerToClientEvents,
  Record<string, never>,
  SocketData
>;

/** Canonical room name for a given auction */
export const auctionRoom = (auctionId: string) => `auction:${auctionId}`;

export async function joinAuctionRoom(
  ns: AuctionNamespace,
  socketId: string,
  auctionId: string,
): Promise<void> {
  const socket = ns.sockets.get(socketId);
  if (!socket) return;
  await socket.join(auctionRoom(auctionId));
}

export async function leaveAuctionRoom(
  ns: AuctionNamespace,
  socketId: string,
  auctionId: string,
): Promise<void> {
  const socket = ns.sockets.get(socketId);
  if (!socket) return;
  await socket.leave(auctionRoom(auctionId));
}
