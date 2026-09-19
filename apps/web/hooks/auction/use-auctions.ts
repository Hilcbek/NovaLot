// features/auctions/hooks/use-auctions.ts
import { useQuery } from "@tanstack/react-query";
import { fetchAuctions, type AuctionListFilters } from "@/api/auctions.api";
import { KEYS } from "@/lib/keys";

export function useAuctions(filters: AuctionListFilters = {}) {
  return useQuery({
    queryKey: KEYS.auctions.list(filters),
    queryFn: () => fetchAuctions(filters),
    staleTime: 30_000, // listings shift often (new bids, new auctions) — shorter than categories
  });
}