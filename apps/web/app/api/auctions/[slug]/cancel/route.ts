// apps/web/app/api/auctions/[slug]/cancel/route.ts
import { cancelAuction, getAuthenticatedUser } from "@/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { slug } = await params;
  const outcome = await cancelAuction(slug, user);

  if ("error" in outcome) {
    const status = outcome.error === "not-found" ? 404 : 403;
    return NextResponse.json({ error: "You cannot cancel this auction." }, { status });
  }

  return NextResponse.json({ auction: outcome.auction });
}
