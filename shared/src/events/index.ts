import type { AuctionServerToClientEvents, AuctionClientToServerEvents } from "./auction.events";
import type { NotificationServerToClientEvents, NotificationClientToServerEvents } from "./notification.events";
import type { PublicServerToClientEvents, PublicClientToServerEvents } from "./public.events";
import type { SocketData } from "@novalot/shared/auth";

export interface ServerToClientEvents
  extends AuctionServerToClientEvents,
    NotificationServerToClientEvents,
    PublicServerToClientEvents {}

export interface ClientToServerEvents
  extends AuctionClientToServerEvents,
    NotificationClientToServerEvents,
    PublicClientToServerEvents {}

export interface InterServerEvents {
  ping: () => void;
}

export type { SocketData };

export * from "./auction.events";
export * from "./notification.events";
export * from "./public.events";