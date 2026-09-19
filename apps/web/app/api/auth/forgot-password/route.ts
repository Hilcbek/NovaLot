// apps/web/app/api/auth/forgot-password/route.ts
import {
  createVerificationToken,
  db,
  enforceRateLimit,
  logger,
  sendEmail,
} from "@/server";
import { GENERIC_MESSAGE } from "@novalot/shared/constants";
import { users } from "@novalot/shared/db/schema";
import { RATE_LIMITS } from "@novalot/shared/rate-limit";
import { forgotPasswordSchema, validate } from "@novalot/shared/validation";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(
    req,
    "forgot-password",
    RATE_LIMITS.passwordResetRequest,
    "Too many reset requests. Try again later.",
  );
  if (limited) return limited;

  const body = await req.json();
  const result = validate(forgotPasswordSchema, body);

  if (!result.success) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  const { email } = result.data;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Always return the same response — don't reveal whether the email exists.
  if (!user) {
    return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
  }

  const rawToken = await createVerificationToken({
    userId: user.id,
    type: "password_reset",
  });

  const emailResult = await sendEmail({
    template: "resetPassword",
    params: {
      recipientName: user.firstName,
      resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${rawToken}`,
      expiresInMinutes: 30,
    },
    to: email,
    idempotencyKey: rawToken,
  });

  if (!emailResult.success) {
    logger.error("forgot-password: email failed", emailResult.error);
  }

  return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
}
