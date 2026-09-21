// eslint-barrel-rules.mjs (monorepo root)

export const WEB_BARREL_PATTERNS = [
  {
    group: ["@/server/*"],
    message:
      'Import from the "@/server" barrel instead of a deep path — e.g. import { db } from "@/server", not "@/server/db".',
  },
  {
    group: ["@/hooks/*"],
    message:
      'Import from the "@/hooks" barrel instead of a deep path — e.g. import { useAuthStore } from "@/hooks", not "@/hooks/use-auth".',
  },
];

// Exact-match only (no globbing) — blocks the bare "@novalot/shared" import
// without touching any of its subpaths, which are exactly what should be used.
export const SHARED_PACKAGE_PATHS = [
  {
    name: "@novalot/shared",
    message:
      'shared has no root export — import a subpath instead, e.g. "@novalot/shared/db/schema" or "@novalot/shared/auth-validation".',
  },
];