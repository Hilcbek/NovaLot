import { AuctionListFilters } from "@novalot/shared/auction";

export const KEYS = {
  auth: {
    session: () => ["profile"] as const,
  },
  // apps/web/lib/keys.ts — add this domain to the existing KEYS object
  categories: {
    all: () => ["categories"] as const,
    tree: () => ["categories", "tree"] as const,
    detail: (slug: string) => ["categories", "detail", slug] as const,
  },

  auctions: {
    list: (filters: AuctionListFilters) =>
      ["auctions", "list", filters] as const,
    detail: (slug: string) => ["auctions", "detail", slug] as const,
  },
};
