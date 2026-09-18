import {
  db,
  enforceRateLimit,
  logger,
  redis,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
} from "@/server";
import { loginSchema } from "@novalot/shared/auth-validation";
import { users } from "@novalot/shared/db/schema";
import { RATE_LIMITS } from "@novalot/shared/rate-limit";
import { validate } from "@novalot/shared/validation";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days — match your refresh token expiry

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(
    req,
    "login",
    RATE_LIMITS.login,
    "Too many login attempts. Try again later.",
  );
  if (limited) return limited;
  const body = await req.json();
  const result = validate(loginSchema, body);

  if (!result.success) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  const { email, password } = result.data;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const passwordMatches = await verifyPassword(password, user.password_hash);
  if (!passwordMatches) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  if (!user.isEmailVerified) {
    return NextResponse.json(
      {
        error: "Please verify your email before logging in.",
        code: "EMAIL_NOT_VERIFIED",
      },
      { status: 403 },
    );
  }

  const accessToken = await signAccessToken({
    id: user.id,
    email: user.email,
    role: user.role!,
  });
  const refreshToken = await signRefreshToken({ userId: user.id });

  await redis.set(
    `refresh:${user.id}`,
    refreshToken,
    "EX",
    REFRESH_TTL_SECONDS,
  );

  logger.info("User logged in", { userId: user.id });

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

  response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TTL_SECONDS,
  });

  return response;
}
