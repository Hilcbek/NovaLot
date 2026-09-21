// features/auctions/components/auction-card.tsx
"use client";

import type { AuctionListItem } from "@/api/auctions.api";
import { useCountdown } from "@/hooks";
import { formatPrice } from "@/lib/format";
import Image from "next/image";
import Link from "next/link";

export function AuctionCard({ auction }: { auction: AuctionListItem }) {
  const { ended, label } = useCountdown(auction.endTime);

  return (
    <Link
      href={`/auctions/${auction.slug}`}
      className="group block overflow-hidden rounded-lg border bg-card"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {auction.primaryImage ? (
          <Image
            loading="lazy"
            src={auction.primaryImage.thumbnailUrl ?? auction.primaryImage.url}
            alt={auction.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        <span
          className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-medium ${
            ended ? "bg-muted text-muted-foreground" : "bg-[#1F5D48] text-white"
          }`}
        >
          {label}
        </span>
      </div>

      <div className="p-3">
        <h3 className="truncate text-sm font-medium">{auction.title}</h3>
        <p className="mt-1 text-base font-semibold text-[#1F5D48]">
          {formatPrice(auction.currentPrice)}
        </p>
        <p className="text-xs text-muted-foreground">{auction.category.name}</p>
      </div>
    </Link>
  );
}
