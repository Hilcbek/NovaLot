import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { env } from "../env/env.server";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "30d";

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);

export interface AccessTokenPayload extends JWTPayload {
  sub: string;
  id: string;
  email: string;
  role?: "user" | "admin";
}

export interface RefreshTokenPayload extends JWTPayload {
  sub: string;
  tokenVersion?: number;
}

type SignAccessTokenInput = {
  id: string;
  email: string;
  role?: "user" | "admin";
};

type SignRefreshTokenInput = {
  userId: string;
  tokenVersion?: number;
};

export async function signAccessToken(
  input: SignAccessTokenInput,
): Promise<string> {
  const payload: AccessTokenPayload = {
    sub: input.id,
    id: input.id,
    email: input.email,
    role: input.role,
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(accessSecret);
}

export async function signRefreshToken(
  input: SignRefreshTokenInput,
): Promise<string> {
  const payload: RefreshTokenPayload = {
    sub: input.userId,
    tokenVersion: input.tokenVersion,
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(refreshSecret);
}

export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, accessSecret);
  return payload as AccessTokenPayload;
}

export async function verifyRefreshToken(
  token: string,
): Promise<RefreshTokenPayload> {
  const { payload } = await jwtVerify(token, refreshSecret);
  return payload as RefreshTokenPayload;
}
