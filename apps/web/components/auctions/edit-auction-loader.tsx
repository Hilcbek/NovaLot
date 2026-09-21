// features/auctions/components/edit-auction-loader.tsx
"use client";

import { canEditAuction } from "@novalot/shared/auction";
import { useAuctionForEdit, useAuthStore } from "@/hooks";
import { AuctionFormWizard } from "./auction-form-wizard";
import type { AuctionImage } from "@novalot/shared/db/schema";

export function EditAuctionLoader({ auctionId }: { auctionId: string }) {
  const { data: auction, isLoading } = useAuctionForEdit(auctionId);
  const user = useAuthStore((s) => s.user);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  if (!auction || !user) {
    return (
      <p className="text-sm text-destructive">
        This auction could not be found, or you don&apos;t have access to it.
      </p>
    );
  }

  if (!canEditAuction(auction, user)) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-2xl text-brand-accent">
          This auction can no longer be edited
        </h1>
        <p className="text-sm text-muted-foreground">
          Auctions can only be edited while they haven&apos;t started yet. This
          auction is currently <strong>{auction.effectiveStatus}</strong>.
        </p>
      </div>
    );
  }

  return (
    <AuctionFormWizard
      mode="edit"
      auctionId={auctionId}
      defaultValues={{
        title: auction.title,
        description: auction.description,
        categoryId: auction.categoryId,
        condition: auction.condition,
        startingPrice: auction.startingPrice,
        reservePrice: auction.reservePrice ?? undefined,
        buyNowPrice: auction.buyNowPrice ?? undefined,
        bidIncrement: auction.bidIncrement,
        autoExtendEnabled: auction.settings?.autoExtendEnabled ?? false,
        autoExtendMinutes: auction.settings?.autoExtendMinutes ?? undefined,
        maxBidsPerUser: auction.settings?.maxBidsPerUser ?? undefined,
        requireVerifiedBidder: auction.settings?.requireVerifiedBidder ?? false,
        customRules: auction.settings?.customRules ?? undefined,
        startTime: new Date(auction.startTime),
        endTime: new Date(auction.endTime),
        images: auction.images.map((img: AuctionImage) => ({
          fileId: img.fileId,
          url: img.url,
          thumbnailUrl: img.thumbnailUrl,
          isPrimary: img.isPrimary,
          displayOrder: img.displayOrder,
        })),
      }}
    />
  );
}