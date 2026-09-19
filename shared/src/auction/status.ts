// shared/src/auction/status.ts
import type { Auction, AuctionStatus } from "../db/schema";

/**
 * The DB's stored `status` reflects the seller's intent (draft, published,
 * cancelled) — it is NOT the live state. This function derives what an
 * auction actually IS right now, by comparing time against startTime/endTime.
 * Every read path (list, detail, "can I bid?") should call this rather than
 * trusting the raw column directly.
 */
export function resolveEffectiveStatus(
  auction: Pick<Auction, "status" | "startTime" | "endTime">,
  now: Date = new Date(),
): AuctionStatus {
  // Draft and cancelled are explicit seller/admin decisions — never overridden by time.
  if (auction.status === "draft" || auction.status === "cancelled") {
    return auction.status;
  }

  // From here, status is "scheduled", "active", or "ended" in the DB — but
  // the actual live state is derived purely from the time window.
  if (now < auction.startTime) {
    return "scheduled";
  }
  if (now >= auction.startTime && now < auction.endTime) {
    return "active";
  }
  return "ended";
}