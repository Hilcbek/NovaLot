// features/auctions/hooks/use-create-auction-mutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createAuction } from "@/api/auctions.api";

export function useCreateAuctionMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAuction,
    onSuccess: (auction) => {
      queryClient.invalidateQueries({ queryKey: ["auctions", "list"] });
      router.push(`/auctions/${auction.slug}`);
    },
  });
}