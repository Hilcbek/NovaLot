// services/bid.service.ts
import type { Logger } from "@novalot/shared/logger";

export interface PlaceBidInput {
  auctionId: string;
  bidderId: string;
  amount: number;
}

export interface PlaceBidResult {
  ok: true;
  auctionId: string;
  amount: number;
  bidderId: string;
  placedAt: string;
}

export interface BidServiceDeps {
  logger: Logger;
  // TODO: inject db client here when wiring real logic
  // db: DrizzleClient;
}

export function createBidService(deps: BidServiceDeps) {
  const { logger } = deps;

  async function placeBid(input: PlaceBidInput): Promise<PlaceBidResult> {
    logger.debug("placeBid called", input);

    // TODO: implement real logic
    //  1. Load auction from DB, check status === "active"
    //  2. Validate amount > currentPrice + bidIncrement
    //  3. Insert bid row + update auction.currentPrice in a transaction
    //  4. Publish "auction:bid_placed" to Redis pub channel for other nodes

    return {
      ok: true,
      auctionId: input.auctionId,
      amount: input.amount,
      bidderId: input.bidderId,
      placedAt: new Date().toISOString(),
    };
  }

  return { placeBid };
}

export type BidService = ReturnType<typeof createBidService>;
