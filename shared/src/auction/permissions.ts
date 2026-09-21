// shared/src/auction/permissions.ts
import type { Auction } from "../db/schema";
import { resolveEffectiveStatus } from "./status";

type UserRole = "user" | "admin"; // adjust if your actual role type has more values

interface PermissionUser {
  id: string;
  role?: UserRole | string;
}

/**
 * Only the seller can edit their own auction, and only before it could have
 * received bids — i.e. while still draft or scheduled. Once active, core
 * fields (price, timing, images) are locked to keep the listing stable for
 * anyone who has already bid or is watching it.
 */
export function canEditAuction(auction: Auction, user: PermissionUser): boolean {
  if (auction.sellerId !== user.id) return false;

  const effectiveStatus = resolveEffectiveStatus(auction);
  return effectiveStatus === "draft" || effectiveStatus === "scheduled";
}

/**
 * The seller can cancel freely before the auction goes live (draft/scheduled)
 * — no one else is affected yet. Once active, cancelling impacts anyone
 * already bidding/watching, so only an admin can do it (and that action will
 * likely need a reason + notification once those systems exist).
 */
export function canCancelAuction(auction: Auction, user: PermissionUser): boolean {
  const effectiveStatus = resolveEffectiveStatus(auction);

  if (effectiveStatus === "ended" || effectiveStatus === "cancelled") {
    return false; // nothing to cancel
  }

  const isOwner = auction.sellerId === user.id;
  const isAdmin = user.role === "admin";

  if (effectiveStatus === "draft" || effectiveStatus === "scheduled") {
    return isOwner || isAdmin;
  }

  // effectiveStatus === "active"
  return isAdmin;
}
export function canPublishAuction(auction: Auction, user: PermissionUser): boolean {
  return auction.sellerId === user.id && auction.status === "draft";
}