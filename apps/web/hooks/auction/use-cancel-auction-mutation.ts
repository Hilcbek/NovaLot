// features/auctions/hooks/use-cancel-auction-mutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelAuction } from "@/api/auctions.api";
import { KEYS } from "@/lib/keys";

export function useCancelAuctionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelAuction,
    onSuccess: (auction) => {
      queryClient.invalidateQueries({ queryKey: ["auctions", "list"] });
      queryClient.invalidateQueries({ queryKey: KEYS.auctions.detail(auction.slug) });
    },
  });
}