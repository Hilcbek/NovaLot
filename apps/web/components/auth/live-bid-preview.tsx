// components/auth/live-bid-preview.tsx
"use client";

import { useEffect, useState } from "react";

interface MockBid {
  lot: string;
  category: string;
  amount: number;
  bidder: string;
}

const MOCK_BIDS: MockBid[] = [
  {
    lot: "1960 Rolex Submariner",
    category: "Fine Watches",
    amount: 18500,
    bidder: "J. M.",
  },
  {
    lot: "Untitled, oil on canvas",
    category: "Fine Art",
    amount: 42000,
    bidder: "R. K.",
  },
  {
    lot: "Art Deco Diamond Brooch",
    category: "Fine Jewelry",
    amount: 7200,
    bidder: "A. T.",
  },
  {
    lot: "1967 Jaguar E-Type",
    category: "Classic Cars",
    amount: 128000,
    bidder: "S. D.",
  },
  {
    lot: "1982 Bordeaux, Case of 12",
    category: "Rare Wine & Spirits",
    amount: 3400,
    bidder: "L. P.",
  },
];

export function LiveBidPreview() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % MOCK_BIDS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const bid = MOCK_BIDS[index];

  return (
    <div className="w-full max-w-sm rounded-lg border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/60">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E1523D] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E1523D]" />
        </span>
        Live bidding
      </div>

      <p className="text-xs text-white/50">{bid.category}</p>
      <p className="mb-2 font-serif text-lg text-white">{bid.lot}</p>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-white/50">Current bid</p>
          <p className="font-sans text-2xl text-[#C89B3C]">
            ${bid.amount.toLocaleString()}
          </p>
        </div>
        <p className="text-xs text-white/50">by {bid.bidder}</p>
      </div>
    </div>
  );
}
