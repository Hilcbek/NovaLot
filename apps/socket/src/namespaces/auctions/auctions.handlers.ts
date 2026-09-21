// namespaces/auctions/auctions.handlers.ts
import type { Socket } from "socket.io";
import type {
  AuctionServerToClientEvents,
  AuctionClientToServerEvents,
} from "@novalot/shared/events";
import type { SocketData } from "@novalot/shared/events";
import type { Logger } from "@novalot/shared/logger";
import type { BidService } from "@/services";
import type { AuctionNamespace } from "./auctions.rooms";
import { auctionRoom, joinAuctionRoom, leaveAuctionRoom } from "./auctions.rooms";
import { asyncHandler } from "@/utils";

export type AuctionSocket = Socket<
  AuctionClientToServerEvents,
  AuctionServerToClientEvents,
  Record<string, never>,
  SocketData
>;

export interface AuctionHandlerDeps {
  ns: AuctionNamespace;
  bidService: BidService;
  logger: Logger;
}

export function registerAuctionHandlers(
  socket: AuctionSocket,
  deps: AuctionHandlerDeps,
): void {
  const { ns, bidService, logger } = deps;
  const userId = socket.data.sub;

  // ── auction:join ──────────────────────────────────────────────────────────
  socket.on(
    "auction:join",
    asyncHandler(async ({ auctionId }, ack) => {
      // TODO: verify auction exists and is accessible
      await joinAuctionRoom(ns, socket.id, auctionId);
      logger.debug("Socket joined auction room", { socketId: socket.id, auctionId });
      ack({ ok: true });
    }),
  );

  // ── auction:leave ─────────────────────────────────────────────────────────
  socket.on("auction:leave", ({ auctionId }) => {
    void leaveAuctionRoom(ns, socket.id, auctionId);
    logger.debug("Socket left auction room", { socketId: socket.id, auctionId });
  });

  // ── auction:place_bid ─────────────────────────────────────────────────────
  socket.on(
    "auction:place_bid",
    asyncHandler(async ({ auctionId, amount }, ack) => {
      const result = await bidService.placeBid({ auctionId, bidderId: userId, amount });

      // Broadcast to everyone in the room (including the bidder)
      ns.to(auctionRoom(auctionId)).emit("auction:bid_placed", {
        auctionId: result.auctionId,
        amount: result.amount,
        bidderId: result.bidderId,
        placedAt: result.placedAt,
      });

      ack({ ok: true });
    }),
  );
}
