// apps/web/app/api/auth/refresh/route.ts
import {
  db,
  logger,
  redis,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/server";
import { REFRESH_COOKIE_NAME, REFRESH_TTL_SECONDS } from "@novalot/shared/constants";
import { users } from "@novalot/shared/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let payload: { sub: string; tokenVersion?: number };
  try {
    payload = await verifyRefreshToken(refreshToken);
  } catch {
    return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
  }

  const userId = payload.sub;

  // Confirm this exact refresh token is still the one on record for this user
  const storedToken = await redis.get(`refresh:${userId}`);
  if (!storedToken || storedToken !== refreshToken) {
    return NextResponse.json({ error: "Session no longer valid" }, { status: 401 });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const accessToken = await signAccessToken({
    id: user.id,
    email: user.email,
    role: user.role!,
  });

  // Rotate the refresh token on each use
  const newRefreshToken = await signRefreshToken({
    userId: user.id,
    tokenVersion: payload.tokenVersion,
  });
  await redis.set(`refresh:${user.id}`, newRefreshToken, "EX", REFRESH_TTL_SECONDS);

  logger.info("Access token refreshed", { userId: user.id });

  const response = NextResponse.json({
    accessToken,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatar_url,
      isEmailVerified: user.isEmailVerified,
    },
  });

  response.cookies.set(REFRESH_COOKIE_NAME, newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TTL_SECONDS,
  });

  return response;
}