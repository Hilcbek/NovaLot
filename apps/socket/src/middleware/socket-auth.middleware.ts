// middleware/socket-auth.middleware.ts
import { verifyAccessToken } from "@novalot/shared/auth";
import type { IoServer } from "@/server";
import type { Logger } from "@novalot/shared/logger";

/**
 * Runs before every connection on the given io instance (or namespace).
 * Expects the client to pass its JWT either as:
 *   - socket.handshake.auth.token  (preferred — not visible in browser network tab)
 *   - socket.handshake.headers.authorization  Bearer <token>
 *
 * On success the decoded payload is attached to socket.data so handlers
 * can read socket.data.sub (userId), socket.data.role, etc.
 */
export function registerAuthMiddleware(io: IoServer, logger: Logger): void {
  io.use(async (socket, next) => {
    try {
      const token =
        (socket.handshake.auth?.token as string | undefined) ??
        extractBearer(socket.handshake.headers.authorization);

      if (!token) {
        return next(new Error("AUTH_MISSING_TOKEN"));
      }

      const payload = await verifyAccessToken(token);

      // Attach to socket.data — available in every handler
      socket.data.sub = payload.sub;
      socket.data.role = payload.role!;

      next();
    } catch (err) {
      logger.warn("Socket auth failed", { err });
      next(new Error("AUTH_INVALID_TOKEN"));
    }
  });
}

function extractBearer(header: string | undefined): string | undefined {
  if (!header?.startsWith("Bearer ")) return undefined;
  return header.slice(7);
}
