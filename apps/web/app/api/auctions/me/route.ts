// apps/web/app/api/auctions/me/route.ts
import { getAuthenticatedUser, listMyAuctions } from "@/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const data = await listMyAuctions(user.id);
  return NextResponse.json({ data });
}