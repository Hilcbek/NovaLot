import { EditAuctionLoader } from "@/components/auctions/edit-auction-loader";

// app/auctions/[id]/edit/page.tsx
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAuctionPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="px-4 py-12">
      <EditAuctionLoader auctionId={id} />
    </div>
  );
}