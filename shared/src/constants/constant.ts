export const REFRESH_COOKIE_NAME = "refreshToken";
export const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days — match your refresh token expiry
export const GENERIC_SIGNUP_MESSAGE =
  "If that email isn't already registered, check your inbox to verify your account.";

export const GENERIC_MESSAGE =
  "If that email is registered, you'll receive a password reset link shortly.";


// Pages that require a session — redirected to /sign-in if missing.
export const PROTECTED_PAGE_PREFIXES = [
  "/account",
  "/watchlist",
  "/bids",
  "/auctions/create",
  "/admin",
];

// Pages an already-authenticated user shouldn't see.
export const AUTH_PAGES = ["/sign-in", "/sign-up"];

export const CATEGORIES_STALE_TIME = 1000 * 60 * 30;

export const PROTECTED_API_PREFIXES = [
  "/api/account",
  "/api/bids",
  "/api/watchlist",
  "/api/auth/set-new-password",
  "/api/admin",
];

// Paths where GET stays public, but any mutating method requires auth.
// /api/auctions is the first case of this — listing/detail are public,
// create/update/cancel are not.
export const PROTECTED_API_MUTATION_PREFIXES = ["/api/auctions"];

export const ALLOWED_METHODS = ['POST', 'GET', 'PUT', 'PATCH', 'DELETE']