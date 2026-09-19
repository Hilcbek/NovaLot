// features/auctions/components/auction-detail-view.tsx
"use client";

import { useAuction, useCountdown } from "@/hooks";
import { formatPrice } from "@/lib/format";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";
import Link from "next/link";
import { Key, SetStateAction, useState } from "react";

export function AuctionDetailView({ slug }: { slug: string }) {
  const { data: auction, isLoading, isError } = useAuction(slug);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { ended, label } = useCountdown(auction?.endTime ?? new Date());

  if (isLoading) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Loading…
      </p>
    );
  }

  if (isError || !auction) {
    return (
      <p className="py-12 text-center text-sm text-destructive">
        Auction not found.
      </p>
    );
  }

  const images = auction.images.length > 0 ? auction.images : [];
  const activeImage = images[activeImageIndex];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/browse" className="hover:text-foreground">
          Browse
        </Link>
        {" / "}
        <Link
          href={`/categories/${auction.category.slug}`}
          className="hover:text-foreground"
        >
          {auction.category.name}
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
            {activeImage ? (
              <Image
                src={activeImage.url}
                alt={auction.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No image
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-2 flex gap-2">
              {images.map(
                (
                  img: {
                    id: Key | null | undefined;
                    url: string | StaticImport;
                  },
                  i: SetStateAction<number>,
                ) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative h-16 w-16 overflow-hidden rounded border ${
                      i === activeImageIndex
                        ? "border-[#1F5D48]"
                        : "border-transparent"
                    }`}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" />
                  </button>
                ),
              )}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-serif text-3xl">{auction.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {auction.location}
          </p>

          <div className="mt-4 rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Current bid</p>
            <p className="text-2xl font-semibold text-[#1F5D48]">
              {formatPrice(auction.currentPrice)}
            </p>
            <p
              className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${
                ended
                  ? "bg-muted text-muted-foreground"
                  : "bg-[#1F5D48]/10 text-[#1F5D48]"
              }`}
            >
              {label}
            </p>
            {auction.buyNowPrice && (
              <p className="mt-2 text-sm text-muted-foreground">
                Buy now: {formatPrice(auction.buyNowPrice)}
              </p>
            )}
          </div>

          <div className="mt-6 space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Condition:</span>{" "}
              {auction.condition}
            </p>
            <p>
              <span className="text-muted-foreground">Seller:</span>{" "}
              {auction.seller.fullName}
            </p>
          </div>

          <p className="mt-6 whitespace-pre-line text-sm text-muted-foreground">
            {auction.description}
          </p>
        </div>
      </div>
    </div>
  );
}
