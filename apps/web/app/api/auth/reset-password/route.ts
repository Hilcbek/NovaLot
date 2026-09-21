// apps/web/app/api/auth/reset-password/route.ts
import { consumePasswordResetToken, db, enforceRateLimit, hashPassword, logger, redis } from "@/server";
import { resetPasswordSchema } from "@novalot/shared/auth-validation";
import { users } from "@novalot/shared/db/schema";
import { RATE_LIMITS } from "@novalot/shared/rate-limit";
import { validate } from "@novalot/shared/validation";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(
    req,
    "reset-password",
    RATE_LIMITS.passwordResetRequest, // reuse the same generous-but-bounded limit
    "Too many attempts. Try again later.",
  );
  if (limited) return limited;

  const body = await req.json();
  const result = validate(resetPasswordSchema, body);

  if (!result.success) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  const { token, password } = result.data;

  const { success, userId } = await consumePasswordResetToken(token);

  if (!success || !userId) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired." },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(password);

  await db
    .update(users)
    .set({ password_hash: passwordHash })
    .where(eq(users.id, userId));

  // Force re-login everywhere — invalidate any existing refresh session.
  await redis.del(`refresh:${userId}`);

  logger.info("Password reset completed", { userId });

  return NextResponse.json({
    message: "Your password has been reset. Please log in again.",
  });
}