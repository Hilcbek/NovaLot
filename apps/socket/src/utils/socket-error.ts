// utils/socket-error.ts

/**
 * HTTP-style status codes that make sense in a Socket.IO context.
 * Kept as a plain enum so values are readable in logs and ack payloads.
 */
export enum SocketErrorCode {
  // 4xx — client faults
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE = 422,
  TOO_MANY_REQUESTS = 429,

  // 5xx — server faults
  INTERNAL = 500,
  SERVICE_UNAVAILABLE = 503,
}

export interface SocketErrorOptions {
  /** Machine-readable code surfaced to the client (e.g. "AUCTION_NOT_FOUND"). */
  code?: string;
  /** Extra structured context attached to the error (never sent to clients). */
  meta?: Record<string, unknown>;
  /** Original cause — preserved for logging, never serialised over the wire. */
  cause?: unknown;
}

/**
 * Base error class for the socket server.
 *
 * - `message`       — human-readable description (may reach the client)
 * - `status`        — numeric status code ({@link SocketErrorCode})
 * - `isOperational` — `true` means "expected, domain-level failure" (e.g.
 *                     validation error, not-found). `false` means "programmer
 *                     error or unexpected runtime fault" and should trigger an
 *                     alert / process restart.
 * - `code`          — optional machine-readable string code for the client
 * - `meta`          — optional structured context for internal logging
 * - `cause`         — original error that triggered this one
 */
export class SocketError extends Error {
  readonly status: SocketErrorCode;
  readonly isOperational: boolean;
  readonly code: string;
  readonly meta: Record<string, unknown>;
  override readonly cause: unknown;

  constructor(
    message: string,
    status: SocketErrorCode,
    isOperational: boolean,
    options: SocketErrorOptions = {},
  ) {
    super(message);

    // Maintain correct prototype chain when targeting ES5
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = new.target.name;
    this.status = status;
    this.isOperational = isOperational;
    this.code = options.code ?? SocketErrorCode[status] ?? "UNKNOWN";
    this.meta = options.meta ?? {};
    this.cause = options.cause;

    // Keep a clean stack that points at the throw site, not this constructor
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, new.target);
    }
  }

  /** Serialise to a safe shape suitable for ack payloads sent to the client. */
  toClientPayload(): { ok: false; error: string; code: string } {
    return { ok: false, error: this.message, code: this.code };
  }

  /** Full representation for internal logging. */
  toLogContext(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      isOperational: this.isOperational,
      meta: this.meta,
      stack: this.stack,
      ...(this.cause !== undefined ? { cause: this.cause } : {}),
    };
  }
}

// ── Operational subclasses ────────────────────────────────────────────────────
// These represent expected domain errors. isOperational = true.

export class BadRequestError extends SocketError {
  constructor(message: string, options?: SocketErrorOptions) {
    super(message, SocketErrorCode.BAD_REQUEST, true, options);
  }
}

export class UnauthorizedError extends SocketError {
  constructor(message = "Unauthorized", options?: SocketErrorOptions) {
    super(message, SocketErrorCode.UNAUTHORIZED, true, options);
  }
}

export class ForbiddenError extends SocketError {
  constructor(message = "Forbidden", options?: SocketErrorOptions) {
    super(message, SocketErrorCode.FORBIDDEN, true, options);
  }
}

export class NotFoundError extends SocketError {
  constructor(message: string, options?: SocketErrorOptions) {
    super(message, SocketErrorCode.NOT_FOUND, true, options);
  }
}

export class ConflictError extends SocketError {
  constructor(message: string, options?: SocketErrorOptions) {
    super(message, SocketErrorCode.CONFLICT, true, options);
  }
}

export class UnprocessableError extends SocketError {
  constructor(message: string, options?: SocketErrorOptions) {
    super(message, SocketErrorCode.UNPROCESSABLE, true, options);
  }
}

export class TooManyRequestsError extends SocketError {
  constructor(message = "Too many requests", options?: SocketErrorOptions) {
    super(message, SocketErrorCode.TOO_MANY_REQUESTS, true, options);
  }
}

// ── Non-operational subclass ──────────────────────────────────────────────────
// Unexpected failures that should alert / trigger a restart.

export class InternalError extends SocketError {
  constructor(message = "Internal server error", options?: SocketErrorOptions) {
    super(message, SocketErrorCode.INTERNAL, false, options);
  }
}

// ── Type guard ────────────────────────────────────────────────────────────────

export function isSocketError(err: unknown): err is SocketError {
  return err instanceof SocketError;
}
