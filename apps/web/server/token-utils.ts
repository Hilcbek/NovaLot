import {
  generateVerificationToken,
  hashVerificationToken,
} from "@novalot/shared/auth";
import { tokenTypeEnum, verificationTokens } from "@novalot/shared/db/schema";
import { and, eq } from "drizzle-orm";

import "server-only";
import { db } from "./db";

const EXPIRY_HOURS = 24;

type TokenType = (typeof tokenTypeEnum.enumValues)[number];

export async function createVerificationToken(input: {
  userId: string;
  type: TokenType;
}): Promise<string> {
  const { rawToken, tokenHash } = generateVerificationToken();

  await db.insert(verificationTokens).values({
    userId: input.userId,
    tokenHash,
    type: input.type,
    expiresAt: new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000),
  });

  return rawToken;
}

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
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.id, row.id));
    return { success: false };
  }

  // Single-use: delete immediately so the same link can't be replayed.
  await db.delete(verificationTokens).where(eq(verificationTokens.id, row.id));

  return { success: true, userId: row.userId };
}
