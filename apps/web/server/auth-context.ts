// apps/web/server/auth-context.ts
import "server-only";
import { NextRequest } from "next/server";
import { verifyAccessToken } from "./auth";

export interface AuthContext {
  id: string;
  email: string;
  role?: string;
}

export async function getAuthenticatedUser(
  req: NextRequest,
): Promise<AuthContext | null> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  try {
    const payload = await verifyAccessToken(token);
    return { id: payload.id, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}