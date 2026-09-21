// apps/web/app/api/auctions/[slug]/manage/route.ts
import { getAuctionForOwner, getAuthenticatedUser, updateAuction } from "@/server";
import { updateAuctionSchema } from "@novalot/shared/auction-validation";
import { validate } from "@novalot/shared/validation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { slug } = await params;
  const auction = await getAuctionForOwner(slug, user.id);

  if (!auction) {
    return NextResponse.json(
      { error: "Auction not found or you don't have access" },
      { status: 404 },
    );
  }

  return NextResponse.json({ auction });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await req.json();
  const result = validate(updateAuctionSchema, body);
  if (!result.success) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  const outcome = await updateAuction(slug, result.data, user);

  if ("error" in outcome) {
    const responses = {
      "not-found": [{ error: "Auction not found" }, 404] as const,
      forbidden: [{ error: "You cannot edit this auction." }, 403] as const,
      "invalid-window": [
        { error: "End time must be after start time." },
        400,
      ] as const,
      "invalid-buy-now": [
        { error: "Buy-now price must be greater than the starting price." },
        400,
      ] as const,
    };
    const [body, status] = responses[outcome.error];
    return NextResponse.json(body, { status });
  }

  return NextResponse.json({ auction: outcome.auction });
}
