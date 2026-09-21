export interface BidPlacedPayload {
  auctionId: string;
  amount: number;
  bidderId: string;
  placedAt: string;
}

export interface AuctionEndedPayload {
  auctionId: string;
  winnerId: string | null;
  finalAmount: number | null;
}

export interface AuctionServerToClientEvents {
  "auction:bid_placed": (payload: BidPlacedPayload) => void;
  "auction:ended": (payload: AuctionEndedPayload) => void;
  "auction:error": (payload: { message: string; code: string }) => void;
}

export interface AuctionClientToServerEvents {
  "auction:join": (
    payload: { auctionId: string },
    ack: (res: { ok: boolean; error?: string }) => void,
  ) => void;
  "auction:leave": (payload: { auctionId: string }) => void;
  "auction:place_bid": (
    payload: { auctionId: string; amount: number },
    ack: (res: { ok: boolean; error?: string }) => void,
  ) => void;
}