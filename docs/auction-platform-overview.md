# Live Auction Platform — Project Overview

## What It Is
A real-time online auction platform where sellers list items and buyers bid live, with bids updating instantly for everyone watching — similar in spirit to eBay auctions, but built for live, real-time bidding rather than slow async bidding.

## Core Idea
- **Sellers** list items for auction.
- **Buyers** place bids in real time — everyone watching the item sees bid updates instantly, no refresh needed.
- **Admins** monitor the whole platform (auctions, users, activity) from a dedicated dashboard.

## Tech Stack
- **Frontend:** React (Next.js)
- **State/data:** TanStack Query, Zustand
- **Forms/validation:** React Hook Form, Zod
- **Backend (app/API):** Next.js API routes (Node.js)
- **Backend (real-time):** Node.js / Express (Socket.io only, deployed separately)
- **Database:** PostgreSQL
- **ORM:** Drizzle
- **Auth:** JWT-based (access + refresh tokens), refresh tokens/revocation tracked in Redis
- **Real-time layer:** Socket.io
- **Caching / real-time state:** Redis
- **Job queue:** BullMQ (auction-end job, scheduled as a delayed job fired at each auction's end_time)
- **Logging:** Winston (with winston-daily-rotate-file for warn/error logs)
- **UI:** shadcn components, next-themes (light mode as priority, dark sidebar for admin)

## User Roles
- No fixed buyer/seller split — any user can both list auctions and place bids, same as real marketplaces (e.g. eBay). Users table just has `role: user/admin`.
- Selling could later be gated behind a `can_sell` permission flag if verification is ever required — not needed for now.

## Auction Settings / Rules (per-auction)
Each auction has its own linked `auction_settings` record so sellers can configure rules individually per listing:
- **Auto-extend (anti-sniping)** — extend the auction if a bid lands in the last X minutes
- **Max bids per user** — optional cap to prevent bid spamming (optional)
- **Require verified bidder** — restrict bidding to verified users only
- **Custom rules** — free-form text field for anything a seller wants to add beyond the structured options

Additionally, core pricing rules are stored directly in the `auctions` table:
- **Bid increment** — smallest amount a new bid must beat the current highest by
- **Reserve price** — hidden minimum; auction doesn't sell if unmet (optional)
- **Buy-now price** — instant purchase option to skip bidding (optional)

## Event Log (Scoped)
An `event_logs` table records key business events for auditing and powering the admin activity dashboard — scoped to **auction lifecycle, notifications, payments, and auth/account events** (password reset, password change, account updates). Bid events are NOT logged here — they live only in the `bids` table. Fields: `event_type`, `entity_type`, `entity_id`, `metadata` (jsonb), `created_at`. This is separate from Winston logging, which is for developer debugging, not business/product events.

## Business Rules
- A seller may have **at most 5 unpublished draft auctions** at once; creating a 6th draft is blocked until one is published or deleted.
- **Unsold auctions are terminal** — the record is archived as-is, not reused. A seller who wants to try again uses "Relist," which creates a brand new auction (new id, fresh bid history), optionally pre-filled from the old listing — matching how eBay-style platforms handle this.
- **Verification tokens** (password reset, email verification, email change) are single-use, hashed (sha256, raw token never stored), and expire — implemented via a dedicated `verification_tokens` table rather than reusing the JWT refresh token mechanism.

## Architecture (Confirmed Split)

**Next.js app** (deployable on Vercel):
- All frontend pages (auth, browse, user dashboard, admin dashboard)
- Regular API routes (create auction, fetch listings, user settings, auth)
- Talks directly to Postgres (via Prisma/Drizzle)

**Express + Node server** (deployed separately — Railway/Render/Fly.io/VPS, not Vercel):
- Handles only Socket.io — real-time connections and broadcasting
- Manages "rooms" per auction; broadcasts live bid updates to everyone watching
- Talks to Redis for fast pub/sub + tracking current highest bid / active bidders
- Also writes to the same Postgres DB to persist bids permanently

**Why split this way:**
- Socket.io needs a long-running server to hold open connections — serverless platforms like Vercel don't support that well
- Next.js stays simple and deploys cleanly on Vercel
- The real-time server can scale independently (e.g., multiple instances behind a load balancer using Redis adapter) without touching Next.js

**Bid flow:**
1. User clicks "Place Bid" on the Next.js frontend
2. Bid is sent to the Express/Socket.io server, which validates it, saves it to Postgres, updates Redis, then broadcasts the new highest bid to everyone in that auction's room
3. All viewers of that auction see the update instantly via their open Socket.io connection

**Note:** Bid validation logic should live primarily on the Socket.io server side (not just trusted from the frontend) to prevent cheating or double-bidding.

## Key Pages / Features

### Public / Buyer-Seller Side
- **Auth page** — sign up / login, with social auth support. Includes a live animated preview showing real bids happening in the background (to hook new visitors).
- **How It Works page** — explains the platform flow in detail for new users.
- **Browse/auction listing pages** — view live auctions.

### User Dashboard (separate from admin) — *not yet built*
- **Overview** — snapshot of the user's activity.
- **My Auctions** — auctions the user is selling.
- **My Bids** — auctions the user is bidding on.
- **Settings** — account management.

### Admin Dashboard
- Built with shadcn sidebar (dark themed).
- Used for monitoring the platform — auctions, users, overall activity.

## Payments (Confirmed)
- **Stripe only** for now — no multi-payment-method or country-aware payment logic planned at this stage.

## Design Direction
- Modern, professional, and vibrant — inspired by Dribbble-style design quality, not a generic template look.
- Light mode is the priority theme (admin sidebar is the exception, staying dark).

## Why This Project Matters (Portfolio Value)
- Demonstrates real-time systems (Socket.io + Redis), which is harder and more impressive than typical CRUD apps.
- Shows full-stack range: auth, real-time data, admin tooling, dashboards.
- More unique than common portfolio projects (e-commerce, inventory systems) — stands out to recruiters and in interviews.

## Sprint Plan

### Sprint 0 — Setup & Architecture
- Set up two repos/services: Next.js app + Express/Socket.io server
- Set up Postgres (schema for users, auctions, bids) and Redis
- Set up shared tooling: TanStack Query, Zustand, React Hook Form, Zod, shadcn, next-themes

### Sprint 1 — Auth
- Build sign up / login pages, social auth
- Add live animated bid preview on the auth page
- Build the "How It Works" page

### Sprint 2 — Core Auctions (CRUD)
- Seller can create/edit/delete an auction listing, assigning it a **category**
- Browse/listing pages (view all live auctions), filterable by category
- Auction detail page (item info, current highest bid, time left)

### Sprint 3 — Real-Time Bidding
- Connect Socket.io server to auction detail page
- Implement "rooms" per auction
- Bid placement flow: validate → save to Postgres → update Redis → broadcast to room
- Handle race conditions / prevent double-bidding

### Sprint 4 — User Dashboard
- Overview page
- My Auctions page
- My Bids page
- Settings page

### Sprint 5 — Admin Dashboard
- Shadcn dark sidebar layout
- Monitor auctions, users, and platform activity

### Sprint 6 — Payments
- Integrate Stripe for auction payments (winning bidder checkout)

### Sprint 7 — Polish & Deploy
- Full design/UI polish pass across all pages
- Deploy Next.js app (Vercel) + Socket.io server (Railway/Render/Fly.io)
- Final testing with real concurrent bidding
- Prepare to explain architecture decisions clearly (Socket.io flow, Redis usage, DB schema) for interviews
