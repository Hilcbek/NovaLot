import "server-only";

export { sendEmail } from "@novalot/shared/email";
export * from "./auth";
export { db } from "./db";
export { logger } from "./logger";
export * from "./rate-limit";
export { redis } from "./redis";
export { requireAdmin, type AdminAuthResult } from "./require-admin";
export { createVerificationToken } from "./token-utils";
export * from "./auctions";
// apps/web/server/index.ts — add these lines
export { getAuthenticatedUser, type AuthContext } from "./auth-context";
export { createAuction, updateAuction, deleteAuctionDraft, cancelAuction } from "./auctions";
export * from './imagekit'