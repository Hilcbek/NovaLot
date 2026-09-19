// shared/src/auction/validate-timing.ts
export function isValidAuctionWindow(startTime: Date, endTime: Date): boolean {
  return endTime > startTime;
}

export function isValidBuyNowPrice(
  startingPrice: number,
  buyNowPrice: number | undefined,
): boolean {
  if (buyNowPrice === undefined) return true;
  return buyNowPrice > startingPrice;
}