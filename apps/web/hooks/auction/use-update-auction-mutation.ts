// features/auctions/hooks/use-update-auction-mutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateAuction } from "@/api/auctions.api";
import { KEYS } from "@/lib/keys";
import type { UpdateAuctionInput } from "@novalot/shared/auction-validation";

export function useUpdateAuctionMutation(auctionId: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAuctionInput) => updateAuction(auctionId, input),
    onSuccess: (auction) => {
      queryClient.invalidateQueries({ queryKey: ["auctions", "list"] });
      queryClient.invalidateQueries({ queryKey: KEYS.auctions.detail(auction.slug) });
      router.push(`/auctions/${auction.slug}`);
    },
  });
}