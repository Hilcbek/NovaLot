// features/auctions/hooks/use-my-auctions.ts
import { useQuery } from "@tanstack/react-query";
import { fetchMyAuctions } from "@/api/auctions.api";

export function useMyAuctions() {
  return useQuery({
    queryKey: ["auctions", "mine"],
    queryFn: fetchMyAuctions,
  });
}