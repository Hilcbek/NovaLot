# Socket Server — Architecture & Status

> Reference document for AI assistants and new contributors. Read this before making changes to the socket app.

---

## What this app is

A standalone **Socket.IO** server (TypeScript, Node.js) that handles real-time bidding and notifications for the Novalot auction platform. It lives at `apps/socket` inside a monorepo.

It is **not** the API server. It does not own the database. Its job is:

- Accept authenticated WebSocket connections
- Route events to the right namespace handlers
- Fan-out real-time updates to rooms
- Listen to Redis pub/sub messages from the API server and broadcast them

---

## Directory structure

```
apps/socket/src/
├── index.ts                    # Composition root — wires everything together
├── config/
│   ├── index.ts
│   ├── socket-config.ts        # Port, CORS origin, JWT secret from env
│   └── redis-config.ts         # Redis connection options from env
├── server/
│   ├── create-http-server.ts   # Creates the raw http.Server
│   ├── create-socket.server.ts # Creates Socket.IO Server, attaches Redis adapter
│   ├── graceful-shutdown.ts    # SIGTERM/SIGINT handlers
│   └── index.ts
├── middleware/
│   ├── socket-auth.middleware.ts  # JWT verification — runs before all namespaces
│   └── index.ts
├── namespaces/
│   ├── index.ts                # registerNamespaces() — single call from index.ts
│   ├── auctions/
│   │   ├── auctions.namespace.ts   # Registers /auctions namespace, on("connection")
│   │   ├── auctions.handlers.ts    # auction:join / auction:leave / auction:place_bid
│   │   ├── auctions.rooms.ts       # AuctionNamespace type + joinAuctionRoom / leaveAuctionRoom
│   │   └── index.ts
│   └── notifications/
│       ├── notifications.namespace.ts  # Registers /notifications namespace, auto-joins user room
│       ├── notifications.handlers.ts   # notification:mark_read
│       ├── notifications.rooms.ts      # NotificationNamespace type + joinUserNotificationRoom
│       └── index.ts
├── services/
│   ├── bid.service.ts          # placeBid() — stub with TODOs for DB logic
│   ├── notification.service.ts # markRead() / markAllRead() — stubs with TODOs
│   ├── bid.server.ts
│   └── index.ts
├── workers/
│   ├── auction-end.worker.ts   # Redis subscriber for "auction:ended" channel
│   └── index.ts
└── utils/
    ├── async-handler.ts        # asyncHandler (with ack) + asyncHandlerNoAck
    ├── logger.ts
    ├── socket-error.ts
    └── index.ts
```

---

## Startup sequence (`src/index.ts`)

1. Load config from env (`buildSocketConfig`, `buildRedisOptions`)
2. Create `http.Server` → create `Socket.IO Server` with Redis adapter (pub/sub for multi-node)
3. Register global JWT auth middleware (`registerAuthMiddleware`) — runs before any namespace handler
4. Create services (`BidService`, `NotificationService`)
5. Register namespaces (`/auctions`, `/notifications`)
6. Start `AuctionEndWorker` (dedicated Redis client, separate from pub/sub adapter clients)
7. Register graceful shutdown handlers
8. Start listening

---

## Auth middleware

File: `middleware/socket-auth.middleware.ts`

- Applied globally via `io.use(...)` — fires for every connecting socket, all namespaces
- Reads JWT from `socket.handshake.auth.token` (preferred) or `Authorization: Bearer <token>` header
- Verifies with `verifyAccessToken` (from `@novalot/shared/auth`)
- On success, attaches `socket.data.sub` (userId) and `socket.data.role`
- On failure, calls `next(new Error("AUTH_INVALID_TOKEN"))` — client gets an error, no connection

---

## Namespaces

### `/auctions`

**Purpose:** Real-time bidding — clients join auction rooms to receive bid updates.

**Client → Server events:**

| Event               | Payload                 | Ack            |
| ------------------- | ----------------------- | -------------- |
| `auction:join`      | `{ auctionId }`         | `{ ok: true }` |
| `auction:leave`     | `{ auctionId }`         | none           |
| `auction:place_bid` | `{ auctionId, amount }` | `{ ok: true }` |

**Server → Client events:**

| Event                | Payload                                     | Sent to                                |
| -------------------- | ------------------------------------------- | -------------------------------------- |
| `auction:bid_placed` | `{ auctionId, amount, bidderId, placedAt }` | everyone in `auction:<auctionId>` room |
| `auction:ended`      | `{ auctionId, winnerId, finalAmount }`      | everyone in `auction:<auctionId>` room |

**Room pattern:** `auction:<auctionId>` — clients opt in by sending `auction:join`.

**Type alias:** `AuctionNamespace` (in `auctions.rooms.ts`) — used to cast `io.of("/auctions")` so handlers get narrowly typed events.

---

### `/notifications`

**Purpose:** Push targeted notifications to individual users.

**Client → Server events:**

| Event                    | Payload  | Ack  |
| ------------------------ | -------- | ---- |
| `notification:mark_read` | `{ id }` | none |

**Server → Client events:**

| Event              | Payload               | Sent to           |
| ------------------ | --------------------- | ----------------- |
| `notification:new` | `{ id, title, body }` | private user room |

**Room pattern:** `notifications:user:<userId>` — the server auto-joins the socket to this room on connect. No client-side join call needed.

**Type alias:** `NotificationNamespace` (in `notifications.rooms.ts`) — cast with `as unknown as NotificationNamespace` because `io.of()` returns the broadly-typed server namespace; the cast is safe since the namespace only handles notification events.

---

## Workers

### `AuctionEndWorker` (`workers/auction-end.worker.ts`)

- Subscribes to the Redis channel `auction:ended`
- The **API server** publishes to this channel when it finishes ending an auction (DB writes, winner resolution)
- On message:
  1. Broadcasts `auction:ended` to everyone in `auction:<auctionId>` room via `/auctions` namespace
  2. If there is a winner, pushes `notification:new` to `notifications:user:<winnerId>` room via `/notifications` namespace
- Uses a **dedicated Redis client** (not the adapter pub/sub clients) to avoid cross-contamination

---

## Services (stubs — not yet connected to DB)

### `BidService`

- `placeBid({ auctionId, bidderId, amount })` → returns `PlaceBidResult`
- **TODO:** validate auction is active, enforce bid increment, write bid row + update `auction.currentPrice` in a transaction, publish to Redis for other nodes

### `NotificationService`

- `markRead({ notificationId, userId })` → void
- `markAllRead(userId)` → void
- **TODO:** both methods need DB queries; verify ownership before marking read

---

## Shared packages used

All from `@novalot/shared` (monorepo internal):

| Import                   | What it provides                                                                                                                                                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@novalot/shared/events` | `ClientToServerEvents`, `ServerToClientEvents`, `AuctionClientToServerEvents`, `AuctionServerToClientEvents`, `NotificationClientToServerEvents`, `NotificationServerToClientEvents`, `InterServerEvents`, `SocketData` |
| `@novalot/shared/auth`   | `verifyAccessToken(token)`                                                                                                                                                                                              |
| `@novalot/shared/env`    | Typed env access (`env.SOCKET_PORT`, etc.)                                                                                                                                                                              |
| `@novalot/shared/logger` | `Logger` type                                                                                                                                                                                                           |

---

## Type pattern for namespaces

Because `IoServer` is typed with the union of all events, `io.of(path)` returns a namespace with those broad types. Each namespace has its own narrower type alias in its `*.rooms.ts` file:

```ts
// Example from auctions.rooms.ts
export type AuctionNamespace = Namespace<
  AuctionClientToServerEvents,
  AuctionServerToClientEvents,
  Record<string, never>,
  SocketData
>;
```

The namespace file casts it:

```ts
const ns = io.of("/auctions") as unknown as AuctionNamespace;
```

This is intentional and safe — the double cast through `unknown` is required because `Server<BroadEvents>` is not structurally assignable to `Server<NarrowEvents>`.

---

## Utilities

### `asyncHandler`

Wraps async handlers that send an ack. Catches thrown errors and calls `ack({ ok: false, error: message })` instead of crashing.

### `asyncHandlerNoAck`

Wraps async fire-and-forget handlers. Calls optional `onError` callback on failure.

---

## What's done

- [x] HTTP + Socket.IO server with Redis adapter (multi-node ready)
- [x] Global JWT auth middleware
- [x] `/auctions` namespace — join/leave rooms, place bid, broadcast bid updates
- [x] `/notifications` namespace — auto-join private user room, mark-read handler
- [x] `AuctionEndWorker` — Redis subscriber, broadcasts ended event + winner notification
- [x] Graceful shutdown (SIGTERM, SIGINT, uncaughtException, unhandledRejection)
- [x] Type-safe namespace casting pattern

## What's not done yet

- [ ] `BidService.placeBid` — real DB logic (auction validation, bid increment, transaction)
- [ ] `NotificationService.markRead` / `markAllRead` — real DB queries
- [ ] `auction:join` — verify the auction exists and the user has access before joining
- [ ] Multi-node bid sync — after a bid is placed, publish to Redis so other nodes broadcast too (currently only the receiving node broadcasts)
- [ ] Error codes / structured error responses for socket events
- [ ] Any tests
