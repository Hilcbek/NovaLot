// workers/auction-end.worker.ts
import type { Redis } from "ioredis";
import type { Logger } from "@novalot/shared/logger";
import type { IoServer } from "@/server";
import { auctionRoom } from "@/namespaces/auctions";
import { userNotificationRoom } from "@/namespaces/notifications";
import { PUBLIC_LIVE_AUCTIONS_ROOM } from "@/namespaces/public";

export interface AuctionEndWorkerDeps {
  io: IoServer;
  redis: Redis;
  logger: Logger;
}

/**
 * Subscribes to Redis pub/sub channels where the API server publishes events.
 *
 * Channels handled:
 *   "auction:ended"        — auction finished; fan-out to bidders, winner, and public feed
 *   "auction:bid_placed"   — new bid on a live auction; fan-out a price update to public feed
 *
 * The actual business logic (DB writes, winner resolution) lives in the API
 * server — this worker is purely responsible for real-time fan-out.
 */
export function createAuctionEndWorker(deps: AuctionEndWorkerDeps): {
  start: () => Promise<void>;
  stop: () => Promise<void>;
} {
  const { io, redis, logger } = deps;

  const CHANNEL_ENDED = "auction:ended";
  const CHANNEL_BID = "auction:bid_placed";

  async function start(): Promise<void> {
    await redis.subscribe(CHANNEL_ENDED, CHANNEL_BID);

    redis.on("message", (channel: string, raw: string) => {
      if (channel === CHANNEL_ENDED) handleAuctionEnded(raw);
      else if (channel === CHANNEL_BID) handleBidPlaced(raw);
    });

    logger.info("AuctionEndWorker started", {
      channels: [CHANNEL_ENDED, CHANNEL_BID],
    });
  }

  function handleAuctionEnded(raw: string): void {
    let payload: {
      auctionId: string;
      winnerId: string | null;
      finalAmount: number | null;
    };

    try {
      payload = JSON.parse(raw) as typeof payload;
    } catch (err) {
      logger.error("AuctionEndWorker: failed to parse auction:ended message", {
        raw,
        err,
      });
      return;
    }

    const { auctionId, winnerId, finalAmount } = payload;

    logger.info("AuctionEndWorker: broadcasting auction ended", { auctionId, winnerId });

    // 1. Broadcast to authenticated bidders/watchers in the auction room
    io.of("/auctions")
      .to(auctionRoom(auctionId))
      .emit("auction:ended", { auctionId, winnerId, finalAmount });

    // 2. Push a targeted notification to the winner (if there is one)
    if (winnerId) {
      io.of("/notifications")
        .to(userNotificationRoom(winnerId))
        .emit("notification:new", {
          id: `auction-won-${auctionId}`,
          title: "You won the auction!",
          body: `Congratulations — you won auction ${auctionId} with a bid of ${finalAmount}.`,
        });
    }

    // 3. Remove the auction from the public live feed
    io.of("/public")
      .to(PUBLIC_LIVE_AUCTIONS_ROOM)
      .emit("public:auction_ended", { auctionId, finalAmount });
  }

  function handleBidPlaced(raw: string): void {
    let payload: {
      auctionId: string;
      title: string;
      currentPrice: number;
      endsAt: string;
      totalBids: number;
      imageUrl: string | null;
    };

    try {
      payload = JSON.parse(raw) as typeof payload;
    } catch (err) {
      logger.error("AuctionEndWorker: failed to parse auction:bid_placed message", {
        raw,
        err,
      });
      return;
    }

    logger.debug("AuctionEndWorker: broadcasting public auction update", {
      auctionId: payload.auctionId,
    });

    // Push the updated auction snapshot to the public landing page feed
    io.of("/public")
      .to(PUBLIC_LIVE_AUCTIONS_ROOM)
      .emit("public:auction_updated", payload);
  }

  async function stop(): Promise<void> {
    await redis.unsubscribe(CHANNEL_ENDED, CHANNEL_BID);
    logger.info("AuctionEndWorker stopped");
  }

  return { start, stop };
}
