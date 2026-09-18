import "server-only";
import { generateVerificationToken } from "@novalot/shared/auth";
import { verificationTokens, tokenTypeEnum } from "@novalot/shared/db/schema";
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