export const REDIS_TTL = {
  AUCTION_CACHE_SECONDS: 30,
  RATE_LIMIT_WINDOW_SECONDS: 60,
} as const;

export const redisKeys = {
  auction: (auctionId: string) => `auction:${auctionId}`,
  auctionHighestBid: (auctionId: string) => `auction:${auctionId}:highest-bid`,
  bidRateLimit: (userId: string) => `ratelimit:bid:${userId}`,
} as const;