// apps/web/app/api/imagekit/auth/route.ts
import { getAuthenticatedUser, imagekit } from "@/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const authParams = imagekit.getAuthenticationParameters();
  return NextResponse.json(authParams);
}