import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { logger } from "@/config/logger";
import { users } from "@shared/src/db/schema";
import { verifyAccessToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let payload: { userId: string };
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    logger.warn("Access token invalid/expired on /auth/me", { error: (err as Error).message });
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const [user] = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      role: users.role,
      avatarUrl: users.avatar_url,
      isEmailVerified: users.isEmailVerified,
    })
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}