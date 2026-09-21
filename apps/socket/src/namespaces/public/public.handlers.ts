// namespaces/public/public.handlers.ts
import type { Socket } from "socket.io";
import type {
  PublicServerToClientEvents,
  PublicClientToServerEvents,
} from "@novalot/shared/events";
import type { Logger } from "@novalot/shared/logger";
import type { PublicNamespace } from "./public.rooms";
import { joinPublicFeedRoom, leavePublicFeedRoom } from "./public.rooms";
import { asyncHandler } from "@/utils";

export type PublicSocket = Socket<
  PublicClientToServerEvents,
  PublicServerToClientEvents,
  Record<string, never>,
  Record<string, never>
>;

export interface PublicHandlerDeps {
  ns: PublicNamespace;
  logger: Logger;
}

export function registerPublicHandlers(
  socket: PublicSocket,
  deps: PublicHandlerDeps,
): void {
  const { ns, logger } = deps;

  // ── public:subscribe ──────────────────────────────────────────────────────
  socket.on(
    "public:subscribe",
    asyncHandler(async (_payload, ack) => {
      await joinPublicFeedRoom(ns, socket.id);
      logger.debug("Public: socket subscribed to live auctions feed", {
        socketId: socket.id,
      });
      ack({ ok: true });
    }),
  );

  // ── public:unsubscribe ────────────────────────────────────────────────────
  socket.on("public:unsubscribe", (_payload) => {
    void leavePublicFeedRoom(ns, socket.id);
    logger.debug("Public: socket unsubscribed from live auctions feed", {
      socketId: socket.id,
    });
  });
}
