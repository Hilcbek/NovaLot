// shared/src/events/public.events.ts

/** Snapshot of a live auction pushed to the public landing page feed */
export interface PublicAuctionUpdatedPayload {
  auctionId: string;
  title: string;
  currentPrice: number;
  endsAt: string;
  totalBids: number;
  /** URL of the primary listing image */
  imageUrl: string | null;
}

export interface PublicAuctionEndedPayload {
  auctionId: string;
  finalAmount: number | null;
}

/**
 * Server → Client events on /public.
 * All unauthenticated connections receive these.
 */
export interface PublicServerToClientEvents {
  /** A live auction's price or bid count just changed */
  "public:auction_updated": (payload: PublicAuctionUpdatedPayload) => void;
  /** A live auction has ended — remove it from the feed */
  "public:auction_ended": (payload: PublicAuctionEndedPayload) => void;
}

/**
 * Client → Server events on /public.
 * Clients subscribe/unsubscribe from the live auctions feed room.
 */
export interface PublicClientToServerEvents {
  "public:subscribe": (
    payload: Record<string, never>,
    ack: (res: { ok: boolean; error?: string }) => void,
  ) => void;
  "public:unsubscribe": (payload: Record<string, never>) => void;
}
