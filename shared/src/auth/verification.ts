import { randomBytes, createHash } from "node:crypto";

export function generateVerificationToken() {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}

export function hashVerificationToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}