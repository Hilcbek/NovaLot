// app/account/auctions/page.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore, useCancelAuctionMutation, useMyAuctions } from "@/hooks";
import { canCancelAuction } from "@novalot/shared/auction";
import type { AuctionListItem } from "@/api/auctions.api";
import Link from "next/link";
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  scheduled: "secondary",
  active: "default",
  ended: "outline",
  cancelled: "destructive",
};

export default function MyAuctionsPage() {
  const { data: auctions, isLoading } = useMyAuctions();
  const user = useAuthStore((s) => s.user);
  const cancelMutation = useCancelAuctionMutation();

  if (isLoading) {
    return <p className="p-8 text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-brand-accent">My Auctions</h1>
        <Button asChild>
          <Link href="/auctions/create">Create Auction</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {auctions?.map((auction: AuctionListItem) => {
          const canCancel = user && canCancelAuction(auction, user);

          return (
            <div
              key={auction.id}
              className="flex items-center gap-4 rounded-md border border-border p-4"
            >
              {auction.primaryImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={auction.primaryImage.thumbnailUrl || auction.primaryImage.url}
                  alt=""
                  className="h-16 w-16 rounded-md object-cover"
                />
              )}

              <div className="flex-1">
                <Link
                  href={`/auctions/${auction.slug}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {auction.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  ${auction.currentPrice.toLocaleString()} · {auction.category.name}
                </p>
              </div>

              <Badge variant={STATUS_VARIANT[auction.effectiveStatus] ?? "outline"}>
                {auction.effectiveStatus}
              </Badge>

              {canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cancelMutation.mutate(auction.id)}
                  disabled={cancelMutation.isPending}
                >
                  Cancel
                </Button>
              )}
            </div>
          );
        })}

        {auctions?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            You haven&apos;t listed any auctions yet.
          </p>
        )}
      </div>
    </div>
  );
}