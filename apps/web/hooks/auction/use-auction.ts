// features/auctions/hooks/use-auction.ts
import { useQuery } from "@tanstack/react-query";
import { fetchAuctionBySlug } from "@/api/auctions.api";
import { KEYS } from "@/lib/keys";

export function useAuction(slug: string) {
  return useQuery({
    queryKey: KEYS.auctions.detail(slug),
    queryFn: () => fetchAuctionBySlug(slug),
    enabled: !!slug,
  });
}