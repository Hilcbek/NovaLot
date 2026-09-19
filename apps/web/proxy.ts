// apps/web/middleware.ts
import {
  AUTH_PAGES,
  PROTECTED_API_MUTATION_PREFIXES,
  PROTECTED_API_PREFIXES,
  PROTECTED_PAGE_PREFIXES,
  REFRESH_COOKIE_NAME,
} from "@novalot/shared/constants";
import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

// /auctions/:id/edit can't be expressed as a simple prefix — "/auctions/"
// would also match the public detail page /auctions/some-slug. This checks
// specifically for the two-segment ".../edit" shape instead.
const AUCTION_EDIT_PAGE_REGEX = /^\/auctions\/[^/]+\/edit$/;

async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    await jwtVerify(token, refreshSecret);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const method = req.method;
  const authenticated = await hasValidSession(req);

  const isProtectedPage =
    PROTECTED_PAGE_PREFIXES.some((p) => pathname.startsWith(p)) ||
    AUCTION_EDIT_PAGE_REGEX.test(pathname);

  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  const isProtectedApi = PROTECTED_API_PREFIXES.some((p) =>
    pathname.startsWith(p),
  );

  // GET stays public on these prefixes; every other method needs auth.
  const isProtectedApiMutation =
    method !== "GET" &&
    PROTECTED_API_MUTATION_PREFIXES.some((p) => pathname.startsWith(p));

  // Protected page, no session -> bounce to sign-in, remembering where they were headed
  if (isProtectedPage && !authenticated) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirectTo", pathname + search);
    return NextResponse.redirect(signInUrl);
  }

  // Already authenticated, hitting sign-in/sign-up -> send them back to where
  // they were trying to go, or home if there's no redirectTo
  if (isAuthPage && authenticated) {
    const redirectTo = req.nextUrl.searchParams.get("redirectTo");
    const safeRedirect =
      redirectTo && redirectTo.startsWith("/") ? redirectTo : "/";
    return NextResponse.redirect(new URL(safeRedirect, req.url));
  }

  // Protected API (any method), no session cookie at all -> reject early
  if (isProtectedApi && !authenticated) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Protected API mutation (non-GET only), no session -> reject early
  if (isProtectedApiMutation && !authenticated) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account/:path*",
    "/watchlist/:path*",
    "/bids/:path*",
    "/auctions/create/:path*",
    "/auctions/:id/edit",
    "/admin/:path*",
    "/sign-in",
    "/sign-up",
    "/api/account/:path*",
    "/api/bids/:path*",
    "/api/watchlist/:path*",
    "/api/auth/set-new-password",
    "/api/admin/:path*",
    "/api/auctions/:path*",
  ],
};