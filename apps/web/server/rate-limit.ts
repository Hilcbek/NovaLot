// apps/web/lib/rate-limit.ts
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, type RateLimitOptions } from "@novalot/shared/rate-limit";
import { redis } from "@/server";

export function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function enforceRateLimit(
  req: NextRequest,
  keyPrefix: string,
  options: RateLimitOptions,
  message = "Too many attempts. Try again later.",
): Promise<NextResponse | null> {
  const ip = getClientIp(req);
  const { success, resetAt } = await rateLimit(redis, `rl:${keyPrefix}:ip:${ip}`, options);

  if (success) return null;

  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: {
        "Retry-After": Math.ceil((resetAt.getTime() - Date.now()) / 1000).toString(),
      },
    },
  );
}