import { db, enforceRateLimit } from "@/server";
import { hashVerificationToken } from "@novalot/shared/auth";
import { verifyEmailSchema } from "@novalot/shared/auth-validation";
import { users, verificationTokens } from "@novalot/shared/db/schema";
import { RATE_LIMITS } from "@novalot/shared/rate-limit";
import { validate } from "@novalot/shared/validation";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(
    req,
    "verify-email",
    RATE_LIMITS.verifyEmailResend,
    "Too many login attempts. Try again later.",
  );
  if (limited) return limited;
  const body = await req.json().catch(() => null);
  const parsed = validate(verifyEmailSchema, body);

  if (!parsed.success) {
    const firstError = Object.values(parsed.errors)[0]?.[0];
    return NextResponse.json(
      { error: firstError ?? "Invalid request body" },
      { status: 400 },
    );
  }

  const tokenHash = hashVerificationToken(parsed.data.token);

  const [record] = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.tokenHash, tokenHash),
        eq(verificationTokens.type, "email_verification"),
      ),
    )
    .limit(1);

  if (!record) {
    return NextResponse.json(
      { error: "Invalid or unknown token" },
      { status: 400 },
    );
  }

  if (record.usedAt) {
    return NextResponse.json(
      { error: "Token has already been used" },
      { status: 400 },
    );
  }

  if (record.expiresAt < new Date()) {
    return NextResponse.json({ error: "Token has expired" }, { status: 400 });
  }

  await db.transaction(async (tx) => {
    await tx
      .update(verificationTokens)
      .set({ usedAt: new Date() })
      .where(eq(verificationTokens.id, record.id));

    await tx
      .update(users)
      .set({ isEmailVerified: true })
      .where(eq(users.id, record.userId));
  });

  return NextResponse.json({ success: true });
}
