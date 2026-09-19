// app/auctions/create/page.tsx

import { AuctionFormWizard } from "@/components/auctions/auction-form-wizard";

export default function CreateAuctionPage() {
  return (
    <div className="px-4 py-12">
      <AuctionFormWizard mode="create" />
    </div>
  );
}