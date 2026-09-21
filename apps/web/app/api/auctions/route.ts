// apps/web/app/api/auctions/route.ts
import { createAuction, getAuthenticatedUser, listAuctions } from "@/server";
import { createAuctionSchema } from "@novalot/shared/auction-validation";
import { validate } from "@novalot/shared/validation";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const listAuctionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  categoryId: z.uuid().optional(),
  status: z.enum(["scheduled", "active", "ended", "cancelled"]).optional(),
  search: z.string().max(200).optional(),
  sort: z
    .enum(["ending-soon", "newest", "price-asc", "price-desc"])
    .default("newest"),
});

export async function GET(req: NextRequest) {
  const rawParams = Object.fromEntries(req.nextUrl.searchParams);
  const result = validate(listAuctionsQuerySchema, rawParams);

  if (!result.success) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  const response = await listAuctions(result.data);


  return NextResponse.json(response);
}
export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const result = validate(createAuctionSchema, body);
  if (!result.success) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  const auction = await createAuction(result.data, user.id);
  return NextResponse.json({ auction }, { status: 201 });
}
