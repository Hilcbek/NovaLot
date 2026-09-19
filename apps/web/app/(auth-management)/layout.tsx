// app/(auth-management)/layout.tsx
import { Gavel } from "lucide-react";
import Link from "next/link";
import { LiveBidPreview } from "@/components/auth/live-bid-preview";

export default function AuthManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — branding + live bid preview, hidden below lg */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#14231C] p-10 lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <Gavel className="h-6 w-6 text-[#C89B3C]" strokeWidth={2} />
          <span className="font-serif text-2xl text-white">NovaLot</span>
        </Link>

        <div className="flex flex-col gap-8">
          <div>
            <h2 className="mb-2 font-serif text-3xl text-white">
              Bid on exceptional items, live.
            </h2>
            <p className="max-w-sm text-sm text-white/60">
              Join collectors bidding in real time on fine watches, art,
              jewelry, classic cars, and rare wine.
            </p>
          </div>

          <LiveBidPreview />
        </div>

        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} NovaLot. All rights reserved.
        </p>
      </div>

      {/* Right — form content */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}