// apps/web/server/password-reset.ts
import "server-only";
import { db } from "./db";
import { users, verificationTokens } from "@novalot/shared/db/schema";
import { hashVerificationToken } from "@novalot/shared/auth"; // same hasher used to create tokens
import { and, eq } from "drizzle-orm";

interface ConsumeResult {
  success: boolean;
  userId?: string;
}

/**
 * Verifies a raw password-reset token, and — if valid — deletes it (single use).
 * Does NOT update the password; caller does that once this returns success.
 */
export async function consumePasswordResetToken(
  rawToken: string,
): Promise<ConsumeResult> {
  const tokenHash = hashVerificationToken(rawToken);

  const [row] = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.tokenHash, tokenHash),
        eq(verificationTokens.type, "password_reset"),
      ),
    )
    .limit(1);

  if (!row) return { success: false };

  if (row.expiresAt && new Date(row.expiresAt) < new Date()) {
    // Expired — clean it up while we're here, then reject.
    await db.delete(verificationTokens).where(eq(verificationTokens.id, row.id));
    return { success: false };
  }

  // Single-use: delete immediately so the same link can't be replayed.
  await db.delete(verificationTokens).where(eq(verificationTokens.id, row.id));

  return { success: true, userId: row.userId };
}