# NovaLot Sprint Plan — Comprehensive Implementation Guide

## Current Status: Sprint 2 (In Progress)
**Completed:** Sprint 0, Sprint 1 (partial), Sprint 2 (partial)

---

## Sprint 0 — Foundation & Architecture ✅ COMPLETED

### Infrastructure Setup
- [x] Set up monorepo structure with shared package
- [x] Initialize Next.js app with App Router
- [x] Initialize Express + Socket.io server (separate service)
- [x] Configure PostgreSQL database connection
- [x] Configure Redis connection
- [x] Set up Drizzle ORM with migrations
- [x] Create initial database schema (users, categories, auctions, auction_settings, auction_images, verification_tokens)

### Development Tooling
- [x] Install and configure TanStack Query
- [x] Install and configure Zustand for global state
- [x] Set up React Hook Form + Zod validation
- [x] Install shadcn/ui components
- [x] Configure next-themes (light/dark mode support)
- [x] Set up TypeScript strict mode
- [x] Configure ESLint + Prettier

### Shared Logic Setup
- [x] Create shared validation schemas (auction, auth, categories)
- [x] Create shared types and utilities
- [x] Set up shared auction business logic (status resolution, permissions, query filters)

**Definition of Done:**
- Dev environment runs without errors
- Database migrations work
- Redis connection established
- Both Next.js and Socket.io servers can start

---

## Sprint 1 — Authentication & User Management ✅ MOSTLY COMPLETED

### Core Auth Features
- [x] JWT-based authentication (access + refresh tokens)
- [x] Refresh token storage and revocation in Redis
- [x] Sign up page with email verification flow
- [x] Login page
- [x] Password reset flow (forgot password + reset password pages)
- [x] Email verification page
- [x] Logout functionality
- [x] Protected route middleware
- [x] Auth context/hooks (useAuth, useAuthStore)

### Auth-Related API Routes
- [x] POST /api/auth/sign-up
- [x] POST /api/auth/sign-in
- [x] POST /api/auth/logout
- [x] POST /api/auth/refresh
- [x] GET /api/auth/me
- [x] POST /api/auth/forgot-password
- [x] POST /api/auth/reset-password

### Outstanding Tasks
- [ ] Social auth integration (Google, GitHub)
- [ ] Live animated bid preview on auth page background
- [ ] "How It Works" page explaining platform flow
- [ ] Rate limiting for auth endpoints
- [ ] Account lockout after failed login attempts

**Definition of Done:**
- Users can sign up, verify email, log in, and log out
- Password reset flow works end-to-end
- JWT tokens refresh automatically
- Protected pages redirect unauthenticated users

---

## Sprint 2 — Core Auctions (CRUD) 🔄 IN PROGRESS

### Category Management
- [x] Admin can create/edit/delete categories
- [x] Category hierarchy support (parent-child relationships)
- [x] Category slugs for SEO
- [x] Category images and descriptions
- [x] Display order control
- [x] API routes: /api/admin/categories

### Auction CRUD
- [x] Create auction form (5-step wizard: Details, Pricing, Settings, Schedule, Images)
- [x] Edit auction (sellers can edit their own draft/scheduled auctions)
- [x] Delete auction (draft only)
- [x] Cancel auction (published auctions)
- [x] Per-auction settings (reserve price, buy-now, bid increment, auto-extend, etc.)
- [x] Image upload with ImageKit integration
- [x] Auction status management (draft, scheduled, active, ended, cancelled)
- [x] Auction detail page (public view)
- [x] My Auctions page (seller's auction list)

### Browse & Discovery
- [x] Browse/listing page (view all auctions)
- [x] Category filtering
- [x] Status filtering (active, ended, etc.)
- [x] Search functionality
- [x] Sorting (ending soon, newest, price asc/desc)
- [x] Pagination

### Outstanding Tasks
- [ ] Watchlist feature (users can "favorite" auctions to track)
- [ ] Auction countdown timer component (shows time remaining)
- [ ] "Relist" feature (create new auction from unsold listing)
- [ ] Auction history/archive view
- [ ] Advanced filters (price range, condition, date posted)
- [ ] Draft limit enforcement (max 5 drafts per seller)

### API Routes Created
- [x] GET /api/auctions (list with filters)
- [x] POST /api/auctions (create)
- [x] GET /api/auctions/[slug] (public view)
- [x] GET /api/auctions/[slug]/manage (owner view for editing)
- [x] PATCH /api/auctions/[slug]/manage (update)
- [x] DELETE /api/auctions/[slug] (delete draft)
- [x] PATCH /api/auctions/[slug]/cancel (cancel published)
- [x] GET /api/auctions/me (my auctions)

**Definition of Done:**
- Sellers can create, edit, and delete auctions
- Browse page shows filterable auction listings
- Auction detail page displays all info
- Categories work with hierarchy
- Images upload successfully

---

## Sprint 3 — Real-Time Bidding ⏳ NOT STARTED

### Socket.io Setup
- [ ] Set up Socket.io server with Redis adapter (for multi-instance scaling)
- [ ] Create Socket.io connection hook on frontend (useSocket)
- [ ] Implement auction "rooms" (users join room when viewing auction)
- [ ] Handle connection/disconnection events
- [ ] Implement heartbeat/ping-pong for connection health

### Bidding Logic
- [ ] Create `bids` table in database
- [ ] Bid validation logic (server-side):
  - [ ] Auction must be active
  - [ ] Bid must exceed current highest by at least bidIncrement
  - [ ] User cannot bid on own auction
  - [ ] Respect maxBidsPerUser if set
  - [ ] Check requireVerifiedBidder if enabled
- [ ] Handle race conditions (optimistic locking or Redis-based mutex)
- [ ] Update Redis cache with current highest bid
- [ ] Broadcast bid updates to all clients in auction room
- [ ] Real-time bid history updates on auction detail page
- [ ] "You've been outbid" notifications

### Buy Now Feature
- [ ] Buy now button on auction detail page
- [ ] Instant purchase flow (ends auction immediately)
- [ ] Validation (buyNowPrice must be set and auction active)

### Auto-Extend (Anti-Sniping)
- [ ] Check if bid placed in auto-extend window
- [ ] Extend auction end_time by autoExtendMinutes
- [ ] Broadcast time extension to all viewers

### Frontend Components
- [ ] Bid placement form/button
- [ ] Real-time bid list (shows all bids as they come in)
- [ ] Current highest bid display
- [ ] "Place Bid" button state management
- [ ] Bid confirmation modal
- [ ] Optimistic UI updates

### API/Socket Events
- [ ] Socket event: `bid:place` (client → server)
- [ ] Socket event: `bid:accepted` (server → room)
- [ ] Socket event: `bid:rejected` (server → client)
- [ ] Socket event: `auction:extended` (server → room)
- [ ] Socket event: `auction:ended` (server → room)

**Definition of Done:**
- Users can place bids in real time
- All viewers see bid updates instantly
- Bid validation prevents invalid bids
- Auto-extend works when enabled
- No race conditions or double-bidding

---

## Sprint 4 — Auction Lifecycle Automation ⏳ NOT STARTED

### BullMQ Job Queue Setup
- [ ] Install and configure BullMQ
- [ ] Create Redis queue connection
- [ ] Set up queue workers

### Auction End Job
- [ ] Create `auction-end` job that runs at auction.endTime
- [ ] Schedule job when auction is published
- [ ] Job logic:
  - [ ] Mark auction as `ended`
  - [ ] Determine winner (highest bid)
  - [ ] Check if reserve price met
  - [ ] Update auction status to `sold` or `unsold`
  - [ ] Create notification for winner
  - [ ] Log event to event_logs table
  - [ ] Broadcast `auction:ended` via Socket.io
- [ ] Handle job failures and retries
- [ ] Cancel job if auction is cancelled early

### Notifications System
- [ ] Create `notifications` table
- [ ] Create notification creation logic
- [ ] Notification types:
  - [ ] "You won the auction!"
  - [ ] "Auction ended - no winner (reserve not met)"
  - [ ] "You've been outbid"
  - [ ] "Auction ending soon (5 min warning)"
  - [ ] "Payment required"
- [ ] In-app notification center (bell icon in header)
- [ ] Mark notifications as read
- [ ] Email notifications (optional, using SendGrid/Resend)

### Event Logging
- [ ] Create `event_logs` table
- [ ] Log key events:
  - [ ] auction.created, auction.closed, auction.sold, auction.unsold, auction.cancelled
  - [ ] payment.succeeded, payment.failed
  - [ ] notification.sent
  - [ ] auth.* events (login, logout, password_reset, etc.)

**Definition of Done:**
- Auctions automatically end at their scheduled time
- Winners are determined correctly
- Notifications are created and visible
- Event log captures all key actions

---

## Sprint 5 — User Dashboard ⏳ NOT STARTED

### Dashboard Layout
- [ ] Create account layout with sidebar navigation
- [ ] Dashboard home/overview page
- [ ] Profile settings page
- [ ] Navigation between dashboard pages

### My Auctions Page
- [ ] List all auctions created by user
- [ ] Status indicators (draft, active, ended, sold, unsold)
- [ ] Quick actions (edit, cancel, relist)
- [ ] Stats: total auctions, active, sold, unsold

### My Bids Page
- [ ] List all auctions user has bid on
- [ ] Show current bid status (winning, outbid, won, lost)
- [ ] Filter by status
- [ ] Quick link to auction detail page
- [ ] Stats: total bids, winning, won, lost

### Watchlist Page
- [ ] List all favorited auctions
- [ ] Quick actions (remove from watchlist, view auction)
- [ ] Notifications when watched auction is ending soon

### Account Settings
- [ ] Update profile (name, avatar)
- [ ] Change password
- [ ] Email preferences
- [ ] Delete account (with confirmation)

### API Routes
- [ ] GET /api/account/profile
- [ ] PATCH /api/account/profile
- [ ] PATCH /api/account/password
- [ ] GET /api/account/bids
- [ ] GET /api/account/watchlist
- [ ] POST /api/account/watchlist
- [ ] DELETE /api/account/watchlist/[auctionId]

**Definition of Done:**
- Users can see all their auctions and bids
- Settings page allows profile updates
- Watchlist feature works
- Dashboard provides clear activity overview

---

## Sprint 6 — Admin Dashboard ⏳ NOT STARTED

### Admin Layout
- [ ] Dark themed sidebar (using shadcn)
- [ ] Admin-only route protection
- [ ] Navigation menu

### Admin Pages
- [ ] **Dashboard Overview**
  - [ ] Platform stats (total users, auctions, bids, revenue)
  - [ ] Charts (auctions over time, bids over time)
  - [ ] Recent activity feed from event_logs
- [ ] **Users Management**
  - [ ] List all users
  - [ ] Search and filter users
  - [ ] View user details
  - [ ] Ban/unban users
  - [ ] Verify users manually
- [ ] **Auctions Management**
  - [ ] List all auctions
  - [ ] Filter by status, category, seller
  - [ ] Cancel auctions (moderator action)
  - [ ] View auction details and bid history
- [ ] **Categories Management** ✅ COMPLETED
  - [x] Create/edit/delete categories
  - [x] Manage hierarchy
- [ ] **Reports/Analytics**
  - [ ] Revenue reports
  - [ ] User growth charts
  - [ ] Most active categories
  - [ ] Top sellers/bidders

### API Routes
- [ ] GET /api/admin/stats
- [ ] GET /api/admin/users
- [ ] PATCH /api/admin/users/[id]
- [ ] GET /api/admin/auctions (with admin filters)
- [ ] PATCH /api/admin/auctions/[id]/moderate

**Definition of Done:**
- Admins can monitor platform activity
- User and auction management works
- Analytics provide business insights
- Admin actions are logged

---

## Sprint 7 — Payments (Stripe Integration) ⏳ NOT STARTED

### Stripe Setup
- [ ] Set up Stripe account and get API keys
- [ ] Install Stripe SDK
- [ ] Create Stripe webhook endpoint
- [ ] Verify webhook signatures

### Payment Flow
- [ ] Create `payments` table
- [ ] Winner sees "Pay Now" button after auction ends
- [ ] Create Stripe Checkout session
- [ ] Redirect to Stripe hosted checkout
- [ ] Handle successful payment webhook
- [ ] Handle failed payment webhook
- [ ] Update payment status in database
- [ ] Send confirmation email/notification

### Seller Payouts (Optional, can defer)
- [ ] Stripe Connect setup for sellers
- [ ] Payout schedule configuration
- [ ] Payout history for sellers

### API Routes
- [ ] POST /api/payments/create-checkout-session
- [ ] POST /api/webhooks/stripe
- [ ] GET /api/payments/history

**Definition of Done:**
- Winners can pay via Stripe
- Payment success/failure is tracked
- Notifications sent on payment completion
- Sellers can see which auctions are paid

---

## Sprint 8 — Polish, Testing & Deployment ⏳ NOT STARTED

### UI/UX Polish
- [ ] Design consistency pass across all pages
- [ ] Responsive design testing (mobile, tablet, desktop)
- [ ] Loading states for all async operations
- [ ] Error boundaries and error handling
- [ ] Empty states (no auctions, no bids, etc.)
- [ ] Accessibility audit (WCAG AA compliance)
- [ ] Performance optimization (lazy loading, code splitting)

### Testing
- [ ] Unit tests for business logic (permissions, status resolution, etc.)
- [ ] Integration tests for API routes
- [ ] E2E tests for critical flows:
  - [ ] Sign up → create auction → place bid → win auction → pay
  - [ ] Real-time bidding with multiple users
- [ ] Load testing Socket.io server (simulate 100+ concurrent bidders)

### Deployment
- [ ] Deploy Next.js app to Vercel
  - [ ] Set environment variables
  - [ ] Configure custom domain (if applicable)
- [ ] Deploy Socket.io server to Railway/Render/Fly.io
  - [ ] Set environment variables
  - [ ] Configure Redis connection
  - [ ] Set up health checks
- [ ] Configure PostgreSQL (managed instance or self-hosted)
- [ ] Configure Redis (managed instance or self-hosted)
- [ ] Set up monitoring (Sentry for errors, Datadog/NewRelic for metrics)
- [ ] Set up logging aggregation

### Documentation
- [ ] README with setup instructions
- [ ] Architecture diagram
- [ ] API documentation
- [ ] Deployment guide
- [ ] Interview prep guide (explain technical decisions)

**Definition of Done:**
- All features work in production
- Platform handles concurrent users
- Monitoring and logging in place
- Documentation complete
- Ready for portfolio presentation

---

## Post-Launch Enhancements (Future Sprints)

### Phase 1 — Trust & Safety
- [ ] User verification system (email, phone, ID)
- [ ] Fraud detection (suspicious bidding patterns)
- [ ] Dispute resolution system
- [ ] Escrow service integration
- [ ] User ratings and reviews

### Phase 2 — Discovery & Engagement
- [ ] Email marketing (auction reminders, recommendations)
- [ ] Push notifications (PWA)
- [ ] Personalized recommendations (AI/ML)
- [ ] Auction highlights/featured listings
- [ ] Saved searches with alerts

### Phase 3 — Advanced Features
- [ ] Multi-currency support
- [ ] International shipping calculator
- [ ] Auction insights (view count, watch count)
- [ ] Bulk auction upload (CSV import)
- [ ] API for third-party integrations

---

## Testing Checklist (Per Sprint)

After completing each sprint, verify:
- [ ] All features work as expected
- [ ] No console errors or warnings
- [ ] Responsive on mobile, tablet, desktop
- [ ] Loading and error states handled
- [ ] TypeScript types are correct
- [ ] API routes return expected data
- [ ] Database migrations run successfully
- [ ] Tests pass (if applicable)
- [ ] Code is reviewed and merged

---

## Technical Debt & Known Issues (Track as You Go)

_Document issues/shortcuts taken during development that need to be addressed later:_

- [ ] TODO: Add indexes for frequently queried fields
- [ ] TODO: Implement proper logging (Winston)
- [ ] TODO: Add rate limiting to all API routes
- [ ] TODO: Optimize image loading (next/image, CDN)
- [ ] TODO: Add pagination to all list endpoints
- [ ] TODO: Implement caching strategy (Redis for hot data)

---

## Risk Management

### High-Risk Items
1. **Real-time bidding race conditions** - Mitigate with Redis locks or optimistic locking
2. **Socket.io scaling** - Use Redis adapter for horizontal scaling
3. **Payment security** - Never store card data, use Stripe exclusively
4. **Auction end timing accuracy** - BullMQ guarantees delivery, but test edge cases

### Dependencies
- Vercel free tier limits (may need to upgrade)
- Redis instance availability (use managed service)
- Stripe account approval
- Image hosting limits (ImageKit/Cloudinary quotas)

---

## Definition of "Done" for Entire Project

- ✅ All 8 sprints completed
- ✅ Platform deployed and accessible
- ✅ Real concurrent users can bid without issues
- ✅ Payment flow works end-to-end
- ✅ Admin can manage platform
- ✅ Documentation complete
- ✅ Portfolio-ready: clear README, architecture explanation, demo video

