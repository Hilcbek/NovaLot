// shared/src/auction/query-filters.ts
import { and, eq, ne, gt, gte, lte, or, ilike, inArray, type SQL } from "drizzle-orm";
import { auctions, type AuctionStatus } from "../db/schema";

export type EffectiveStatusFilter = Exclude<AuctionStatus, "draft">;

/**
 * Mirrors resolveEffectiveStatus's logic, but as a SQL condition for
 * filtering many rows at once instead of judging one already-loaded auction.
 * Only "scheduled" is ever actually stored for a published auction — active
 * and ended are derived from comparing the stored time window to `now`.
 */
export function buildEffectiveStatusCondition(
  status: EffectiveStatusFilter,
  now: Date = new Date(),
): SQL {
  switch (status) {
    case "cancelled":
      return eq(auctions.status, "cancelled");
    case "scheduled":
      return and(eq(auctions.status, "scheduled"), gt(auctions.startTime, now))!;
    case "active":
      return and(
        eq(auctions.status, "scheduled"),
        lte(auctions.startTime, now),
        gt(auctions.endTime, now),
      )!;
    case "ended":
      return and(eq(auctions.status, "scheduled"), lte(auctions.endTime, now))!;
  }
}

export interface AuctionListFilters {
  categoryIds?: string[]; // already expanded to include descendants by the caller
  status?: EffectiveStatusFilter;
  search?: string;
}

export function buildAuctionListWhere(
  filters: AuctionListFilters,
  now: Date = new Date(),
): SQL {
  // Draft auctions are never public, regardless of what the caller asks for.
  const conditions: SQL[] = [ne(auctions.status, "draft")];

  if (filters.status) {
    conditions.push(buildEffectiveStatusCondition(filters.status, now));
  }

  if (filters.categoryIds?.length) {
    conditions.push(inArray(auctions.categoryId, filters.categoryIds));
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(or(ilike(auctions.title, term), ilike(auctions.description, term))!);
  }

  return and(...conditions)!;
}