// apps/web/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const REFRESH_COOKIE_NAME = "refreshToken";

// Pages that require a session — redirected to /sign-in if missing.
const PROTECTED_PAGE_PREFIXES = [
  "/account",
  "/watchlist",
  "/bids",
  "/auctions/create",
];

// Pages an already-authenticated user shouldn't see.
const AUTH_PAGES = ["/sign-in", "/sign-up"];

// API routes that require at least a valid session cookie to proceed.
// Everything under /api/auth/ is public EXCEPT the entries listed here.
const PROTECTED_API_PREFIXES = [
  "/api/account",
  "/api/bids",
  "/api/watchlist",
  "/api/auth/set-new-password",
];

const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

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
  const authenticated = await hasValidSession(req);

  const isProtectedPage = PROTECTED_PAGE_PREFIXES.some((p) =>
    pathname.startsWith(p),
  );
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));
  const isProtectedApi = PROTECTED_API_PREFIXES.some((p) =>
    pathname.startsWith(p),
  );

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

  // Protected API, no session cookie at all -> reject early, before hitting the route handler
  if (isProtectedApi && !authenticated) {
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
    "/sign-in",
    "/sign-up",
    "/api/account/:path*",
    "/api/bids/:path*",
    "/api/watchlist/:path*",
    "/api/auth/set-new-password",
  ],
};