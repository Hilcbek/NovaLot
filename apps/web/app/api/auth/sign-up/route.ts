
import { createVerificationToken, db, enforceRateLimit, hashPassword, sendEmail } from "@/server";
import { signupSchema } from "@novalot/shared/auth-validation";
import { GENERIC_SIGNUP_MESSAGE } from "@novalot/shared/constants";
import { users } from "@novalot/shared/db/schema";
import { RATE_LIMITS } from "@novalot/shared/rate-limit";
import { validate } from "@novalot/shared/validation";
import { eq } from "drizzle-orm";
import httpStatus from "http-status";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(
    req,
    "signup",
    RATE_LIMITS.signup,
    "Too many login attempts. Try again later.",
  );
  if (limited) return limited;
  const body = await req.json();

  const result = validate(signupSchema, body);

  if (!result.success) {
    return NextResponse.json(
      { errors: result.errors },
      { status: httpStatus.BAD_REQUEST },
    );
  }

  const { firstName, lastName, confirmPassword, email, password } = result.data;

  if (password !== confirmPassword) {
    return NextResponse.json(
      { errors: { confirmPassword: "Passwords do not match" } },
      { status: httpStatus.BAD_REQUEST },
    );
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existing) {
    return NextResponse.json(
      { message: GENERIC_SIGNUP_MESSAGE },
      { status: httpStatus.OK },
    );
  }

  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({
      firstName,
      lastName,
      email,
      password_hash: passwordHash,
      isEmailVerified: false,
    })
    .returning();

  const rawToken = await createVerificationToken({
    userId: user.id,
    type: "email_verification",
  });

  const emailResult = await sendEmail({
    template: "verifyEmail",
    params: {
      recipientName: firstName,
      verifyUrl: `${process.env.APP_URL}/verify-email?token=${rawToken}`,
      expiresInMinutes: 60 * 24,
    },
    to: email,
    idempotencyKey: rawToken,
  });

  if (!emailResult.success) {
    console.error("signup: verification email failed", emailResult.error);
  }

  return NextResponse.json(
    { message: GENERIC_SIGNUP_MESSAGE },
    { status: httpStatus.OK },
  );
}
