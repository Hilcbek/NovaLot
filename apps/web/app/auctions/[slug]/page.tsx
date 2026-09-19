// app/auctions/[slug]/page.tsx

import { AuctionDetailView } from "@/components/auctions/auction-detail-view";

export default async function AuctionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <AuctionDetailView slug={slug} />;
}