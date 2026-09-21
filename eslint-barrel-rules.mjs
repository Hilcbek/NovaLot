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

/**
 * Socket app barrel rules.
 * Each entry blocks deep imports into a folder that has an index.ts barrel.
 * Intra-folder relative imports (e.g. "./auctions.rooms") are unaffected —
 * this rule only fires on @/ alias imports.
 */
export const SOCKET_BARREL_PATTERNS = [
  {
    group: ["@/config/*"],
    message:
      'Import from the "@/config" barrel — e.g. import { buildSocketConfig } from "@/config".',
  },
  {
    group: ["@/middleware/*"],
    message:
      'Import from the "@/middleware" barrel — e.g. import { registerAuthMiddleware } from "@/middleware".',
  },
  {
    group: ["@/server/*"],
    message:
      'Import from the "@/server" barrel — e.g. import { createSocketServer } from "@/server".',
  },
  {
    group: ["@/services/*"],
    message:
      'Import from the "@/services" barrel — e.g. import { createBidService } from "@/services".',
  },
  {
    group: ["@/workers/*"],
    message:
      'Import from the "@/workers" barrel — e.g. import { createAuctionEndWorker } from "@/workers".',
  },
  {
    group: ["@/utils/*"],
    message: 'Import from the "@/utils" barrel — e.g. import { logger } from "@/utils".',
  },
  {
    group: ["@/namespaces/auctions/*"],
    message:
      'Import from the "@/namespaces/auctions" barrel — e.g. import { auctionRoom } from "@/namespaces/auctions".',
  },
  {
    group: ["@/namespaces/notifications/*"],
    message:
      'Import from the "@/namespaces/notifications" barrel — e.g. import { userNotificationRoom } from "@/namespaces/notifications".',
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
