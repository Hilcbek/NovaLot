// apps/web/lib/auth/require-admin.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@novalot/shared/auth"; // ← confirm actual export name/signature

export type AdminAuthResult =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse };

export async function requireAdmin(req: NextRequest): Promise<AdminAuthResult> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Missing access token" }, { status: 401 }),
    };
  }

  let payload;
  try {
    payload = await verifyAccessToken(token); // ← confirm payload shape includes `role` and `sub`/`userId`
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }),
    };
  }

  if (payload.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Admin access required" }, { status: 403 }),
    };
  }

  return { ok: true, userId: payload.sub };
}