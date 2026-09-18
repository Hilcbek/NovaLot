// apps/web/app/api/auth/logout/route.ts
import { logger, redis, verifyRefreshToken } from "@/server";
import { NextRequest, NextResponse } from "next/server";

const REFRESH_COOKIE_NAME = "refreshToken";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (refreshToken) {
    try {
      const { sub: userId } = await verifyRefreshToken(refreshToken);
      await redis.del(`refresh:${userId}`);
      logger.info("User logged out", { userId });
    } catch {
      // Token was already invalid/expired — nothing to revoke, just clear the cookie below
    }
  }

  const response = NextResponse.json({ message: "Logged out" });

  response.cookies.set(REFRESH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // expires immediately
  });

  return response;
}