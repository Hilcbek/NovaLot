// features/auctions/hooks/use-auction-for-edit.ts
import { useQuery } from "@tanstack/react-query";
import { fetchAuctionForEdit } from "@/api/auctions.api";

export function useAuctionForEdit(id: string) {
  return useQuery({
    queryKey: ["auctions", "edit", id],
    queryFn: () => fetchAuctionForEdit(id),
    enabled: !!id,
  });
}