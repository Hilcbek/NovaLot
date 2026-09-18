// components/auth/AuthLayout.tsx
"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AUCTION_ITEMS = [
  {
    id: 1,
    image: "/images/lot-12-watch.jpg",
    title: "Patek Philippe Perpetual Calendar Chronograph",
    lot: "Lot 12 · Fine Watches",
    timeLeft: "3m 42s left",
    currentBid: "$182,000",
    bids: [
      { time: "2m ago", bidder: "Bidder #7842", amount: "$182,000" },
      { time: "4m ago", bidder: "Bidder #6931", amount: "$178,000" },
      { time: "6m ago", bidder: "Bidder #5127", amount: "$172,000" },
    ],
  },
  {
    id: 2,
    image: "/images/lot-07-painting.jpg",
    title: "Monet-School Impressionist Landscape",
    lot: "Lot 7 · Fine Art",
    timeLeft: "1m 18s left",
    currentBid: "$96,500",
    bids: [
      { time: "1m ago", bidder: "Bidder #3120", amount: "$96,500" },
      { time: "3m ago", bidder: "Bidder #9981", amount: "$91,000" },
      { time: "5m ago", bidder: "Bidder #4456", amount: "$85,000" },
    ],
  },
  {
    id: 3,
    image: "/images/lot-19-ring.jpg",
    title: "Art Deco Emerald & Diamond Ring",
    lot: "Lot 19 · Fine Jewelry",
    timeLeft: "6m 05s left",
    currentBid: "$44,200",
    bids: [
      { time: "30s ago", bidder: "Bidder #6673", amount: "$44,200" },
      { time: "2m ago", bidder: "Bidder #2210", amount: "$41,000" },
      { time: "4m ago", bidder: "Bidder #8845", amount: "$38,500" },
    ],
  },
];

const ROTATE_INTERVAL_MS = 5000;

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left branding panel — stays brand-green in both themes, just a darker
          shade of green in dark mode via the --brand-panel token */}
      <div
        className="relative hidden w-[46%] flex-col justify-between overflow-hidden p-12 lg:flex"
        style={{
          backgroundColor: "var(--brand-panel)",
          color: "var(--brand-panel-foreground)",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_100%,rgba(255,255,255,0.06),transparent_60%)]" />

        <div className="relative z-10 flex flex-col gap-16">
          <div className="flex items-center gap-2">
            <ColumnIcon
              className="h-6 w-6"
              style={{ color: "var(--brand-gold)" }}
            />
            <span className="font-serif text-xl">NovaLot</span>
          </div>

          <div className="flex max-w-md flex-col gap-5">
            <h1 className="font-serif text-5xl leading-[1.1]">
              Where the gavel
              <br />
              falls live.
            </h1>
            <p className="text-base leading-relaxed opacity-70">
              Extraordinary items. Real people. Live bidding.
              <br />
              The world&apos;s most coveted treasures, at your fingertips.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <AuctionCarousel />
        </div>
      </div>

      {/* Right form panel — fully theme-aware via shadcn's background/foreground tokens */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

function AuctionCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % AUCTION_ITEMS.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const item = AUCTION_ITEMS[index];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-[268px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, y: -18 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <AuctionPreviewCard item={item} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-1.5">
        {AUCTION_ITEMS.map((auctionItem, i) => (
          <button
            key={auctionItem.id}
            onClick={() => setIndex(i)}
            aria-label={`Show ${auctionItem.title}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function ColumnIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path
        d="M4 4h16M5 4v2h14V4M6.5 6l-1 13h13l-1-13M9 9v7M12 9v7M15 9v7M4 21h16"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface AuctionItem {
  id: number;
  image: string;
  title: string;
  lot: string;
  timeLeft: string;
  currentBid: string;
  bids: { time: string; bidder: string; amount: string }[];
}

function AuctionPreviewCard({ item }: { item: AuctionItem }) {
  return (
    <div className="h-full rounded-2xl bg-card p-5 text-card-foreground shadow-xl">
      <div className="flex gap-3">
        <div
          className="h-20 w-20 shrink-0 rounded-lg bg-cover bg-center"
          style={{ backgroundImage: `url('${item.image}')` }}
        />
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center justify-between">
            <Badge className="gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-red-500">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              LIVE
            </Badge>
            <span className="text-xs font-medium text-red-500">{item.timeLeft}</span>
          </div>
          <p className="font-serif text-base leading-tight">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.lot}</p>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs text-muted-foreground">Current highest bid</p>
        <p
          className="font-serif text-2xl"
          style={{ color: "var(--brand-gold)" }}
        >
          {item.currentBid}
        </p>
      </div>

      <div className="mt-3 border-t border-border pt-3">
        <p className="mb-2 text-xs font-medium text-foreground/80">Recent bids</p>
        <div className="flex flex-col gap-2">
          {item.bids.map((b) => (
            <div key={b.bidder} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{b.time}</span>
              <span className="text-foreground/80">{b.bidder}</span>
              <span className="font-medium" style={{ color: "var(--brand-gold)" }}>
                {b.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}