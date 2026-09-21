// utils/async-handler.ts

/**
 * Wraps an async socket event handler so that any thrown error is forwarded
 * to the optional ack callback instead of crashing the process.
 *
 * Usage:
 *   socket.on("auction:place_bid", asyncHandler(async (payload, ack) => { ... }))
 */
export function asyncHandler<
  TPayload,
  TAck extends (res: { ok: boolean; error?: string }) => void,
>(
  fn: (payload: TPayload, ack: TAck) => Promise<void>,
): (payload: TPayload, ack: TAck) => void {
  return (payload, ack) => {
    fn(payload, ack).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : "INTERNAL_ERROR";
      ack({ ok: false, error: message });
    });
  };
}

/**
 * Wraps an async socket event handler that takes no ack.
 * Errors are swallowed after logging — use for fire-and-forget events.
 */
export function asyncHandlerNoAck<TPayload>(
  fn: (payload: TPayload) => Promise<void>,
  onError?: (err: unknown) => void,
): (payload: TPayload) => void {
  return (payload) => {
    fn(payload).catch((err: unknown) => {
      onError?.(err);
    });
  };
}
