# RenewCanvas Africa - Development Progress

> Last updated: 2026-06-02

## Project Status

**Frontend:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4
**Backend:** Next.js API routes (`src/app/api/**`) + Prisma 7 (`@prisma/adapter-pg`) on PostgreSQL (Neon)
**Storage:** Vercel Blob (artwork media, re-encoded to WebP via `sharp`)
**Payments:** MTN Mobile Money (MoMo Collection API) + manual bank; webhook reconciliation
**Email:** Resend  ·  **AI:** Anthropic (listing assistant, pricing helper)
**Tests:** `node --test` + `tsx` (unit/integration), Playwright (e2e), c8 (coverage)

> ⚠️ Tech-stack-in-flux (2026-06): considering changing parts of the stack
> **including the database**. If the DB moves off Neon/Postgres, revisit
> `src/lib/backend/db.ts` (Prisma + pg adapter) and ensure the
> `SecurityEvent` / `AuditLog` tables (or equivalents) survive the migration —
> the auth audit trail depends on them.

## Backend / API (built)

Full REST surface under `src/app/api/`: auth (login/logout/register/session/
password-reset), artworks + media uploads, orders, payments (+ status +
webhook), payouts, shipments, commissions, auctions (+ bid/close), wishlist,
profile, notifications, verification, virtual-room, gallery, analytics, impact,
metrics, contact, admin messages/reminders.

- **Auth:** opaque session tokens (SHA-256 hashed at rest), scrypt password
  hashing, `httpOnly`/`SameSite=Lax`/`Secure` cookie. `requireRole(...)` gates
  protected routes; ownership-scoped queries prevent IDOR.
- **Audit:** business actions → `AuditLog`; security/auth events → `SecurityEvent`.

## Pages Built (42 Total)

### Public Pages (13)
- [x] `/` - Home page
- [x] `/about` - About page
- [x] `/how-it-works` - How It Works
- [x] `/impact` - Impact metrics
- [x] `/marketplace` - Artwork marketplace
- [x] `/artwork/[id]` - Artwork detail
- [x] `/artists` - Artist directory
- [x] `/artists/[id]` - Artist profile
- [x] `/contact` - Contact form
- [x] `/faq` - FAQ
- [x] `/book-collection` - Book collection
- [x] `/virtual-room` - Virtual AR museum gallery
- [x] `/auctions` - Live auctions page

### Auth Pages (4)
- [x] `/login` - Login
- [x] `/register` - Register
- [x] `/forgot-password` - Forgot password
- [x] `/reset-password` - Reset password

### Buyer Dashboard (4)
- [x] `/dashboard/buyer` - Overview
- [x] `/dashboard/buyer/orders` - Orders
- [x] `/dashboard/buyer/wishlist` - Wishlist
- [x] `/dashboard/buyer/profile` - Profile

### Artist Dashboard (7)
- [x] `/dashboard/artist` - Overview
- [x] `/dashboard/artist/profile` - Profile setup
- [x] `/dashboard/artist/artworks` - Artwork list
- [x] `/dashboard/artist/artworks/create` - Create artwork
- [x] `/dashboard/artist/artworks/[id]` - Edit artwork
- [x] `/dashboard/artist/orders` - Orders
- [x] `/dashboard/artist/analytics` - Analytics

### Admin Dashboard (9)
- [x] `/dashboard/admin` - Overview
- [x] `/dashboard/admin/users` - User management
- [x] `/dashboard/admin/artists` - Artist verification
- [x] `/dashboard/admin/artworks` - Artwork moderation
- [x] `/dashboard/admin/auctions` - Auction management (create/manage auctions)
- [x] `/dashboard/admin/materials` - Material records
- [x] `/dashboard/admin/impact` - Impact dashboard
- [x] `/dashboard/admin/orders` - Order management
- [x] `/dashboard/admin/settings` - Settings

### Other Pages (5)
- [x] `/checkout` - Checkout
- [x] `/order-confirmation` - Order confirmation
- [x] `/terms` - Terms & Conditions
- [x] `/privacy` - Privacy Policy
- [x] `/refund-policy` - Refund Policy

## Components
- `Navbar.tsx` - Main navigation with scroll fade-out
- `DashboardLayout.tsx` - Dashboard wrapper for buyer/artist/admin
- `GoogleTranslate.tsx` - Translation widget (collapsed by default, expands on click)

## Security & Hardening (2026-06-02)

Full attacker-perspective audit + hardening pass. Details in
[`docs/SECURITY_AUDIT.md`](docs/SECURITY_AUDIT.md).

**Critical vulns found & fixed:**
- **Payment webhook auth bypass** — `/api/payments/webhook` verified the
  signature only `if (secret)`, and `PAYMENT_WEBHOOK_SECRET` was unset → anyone
  could mark orders **paid** / artworks **sold**. Now **fails closed** (503 in
  production without a secret; 401 on bad signature).
- **Admin self-registration** — `/api/auth/register` accepted `role:"admin"` →
  instant full-admin takeover. Public signup now restricted to `buyer`/`artist`.

**Hardening added:**
- **Security headers** in `next.config.ts`: X-Frame-Options DENY, nosniff,
  Referrer-Policy, Permissions-Policy, HSTS, **CSP (report-only first)**;
  `poweredByHeader` disabled.
- **CSRF middleware** (`src/middleware.ts`): Origin/Referer check on all mutating
  `/api/*` requests (layered on SameSite=Lax). Webhook + cron exempt.
- **Rate limiting** on login, register, password-reset (request + confirm), and
  contact form (`src/lib/backend/security-log.ts`).
- **Auth audit trail** wired to `SecurityEvent` (login success/fail/rate-limited,
  logout, register, password-reset).
- **Removed secret-leaking debug logs** (MoMo config, Anthropic key, per-request
  auth logs).
- **`.env.example`** rewritten (all vars, placeholders only); **`.gitignore`**
  tightened (`.env.*` + `!.env.example`, all `*.log`).

**New tests (20, all passing):** `tests/backend/hardening.test.ts`,
`tests/backend/security-log.test.ts`, `tests/api/middleware-csrf.test.ts`,
`tests/api/payments-webhook-auth.test.ts`, `tests/api/security-headers.test.ts`.
`tsc --noEmit` clean; no regressions introduced.

**Open ACTION ITEMS (user-side, not code):**
- 🔴 **Rotate live secrets** present in `.env` (Neon DB password, Anthropic,
  Resend, Vercel Blob token, MoMo keys) — they were never committed but sat in
  plaintext. See `docs/SECURITY_AUDIT.md` for per-provider steps.
- 🔴 Set `PAYMENT_WEBHOOK_SECRET` in production (webhook now refuses events
  without it).
- 🟡 `git rm --cached` the previously-tracked dev logs
  (`.next-dev-*.log`, `.next-start-*.log`, `dev.log`, `clear-session-fix.html`).

**Pre-existing issues flagged (out of scope, not security):** `orders`/`artworks`
unit-test mocks are out of sync with their implementations (3–4 failing tests);
`payments/route.ts:164` has a `no-useless-escape` lint error.

## Recent Updates

### 2026-06-02 — Security hardening pass
- See **Security & Hardening** section above (webhook fail-closed, admin-signup
  block, headers, CSRF middleware, rate limits, audit logging, secret hygiene).

### 2026-05-01
- Added "About" link to home page navigation
- Implemented navbar fade-out when scrolling away from top of page
- Navigation now includes: Home, How It Works, Marketplace, Artists, Impact, About, Contact
- Updated "Why Choose RenewCanvas" cards to orange theme
- Added `/virtual-room` - Virtual AR museum gallery with 3D artwork viewing
- Added `/auctions` - Live auctions page for bidding on artworks
- Added `/dashboard/admin/auctions` - Admin auction management
  - Admin can list artworks for auction
  - Minimum price automatically set to artist's listed price
  - Configure auction duration, start time, and featured status
- Updated `GoogleTranslate.tsx` - Now collapsed by default as small icon, expands on click
- Added experience links to `/marketplace` page:
  - Virtual Gallery link (always visible)
  - Live Auctions link (only visible when auctions exist)

## Next Steps
- [ ] **Rotate live secrets** + set `PAYMENT_WEBHOOK_SECRET` in prod (see Security section)
- [ ] Decide tech-stack/database changes (in flux as of 2026-06)
- [ ] Fix out-of-sync `orders`/`artworks` test mocks + `payments/route.ts` lint error
- [ ] Flip CSP from report-only → enforcing once violation reports are reviewed
- [ ] Add email-verification gate (tokens issued, but accounts go `active` immediately)
- [ ] Move rate limiter to a shared store (Redis/Upstash) before horizontal scaling
- [ ] Testing and refinement → Soft launch
- [x] Backend API (built — Prisma + Postgres + full REST surface)
- [x] Payments (MTN MoMo + manual bank; webhook reconciliation)

## Development Notes
- **Do NOT modify colors** - Keep existing teal color scheme
- **Do NOT create separate mock data files** - Use inline mock data in pages
- **NEVER commit or push** - the user handles all git operations themselves
- Navigation fades out when scrolling past 50px from top
- Auctions link on marketplace only shows when `hasActiveAuctions = true` (line 22 in marketplace/page.tsx)
- Google Translate widget starts collapsed - click globe icon to expand

### Security notes (important)
- `PAYMENT_WEBHOOK_SECRET` is **required in production** — the webhook refuses
  unsigned events without it (fail-closed). Sandbox/dev still works unsigned.
- Public registration (`/api/auth/register`) may only create `buyer`/`artist`.
  Admin accounts are provisioned out-of-band (seed/DB) — never via the API.
- `src/middleware.ts` blocks cross-origin mutating `/api/*` calls; the webhook
  and `/api/admin/reminders` (Bearer `CRON_SECRET`) are the only exemptions.
- Audit logging helpers live in `src/lib/backend/security-log.ts`
  (`auditEvent`, `rateLimit`); CSRF/upload validators in `src/lib/backend/hardening.ts`.
- Keep all secrets server-only — only `NEXT_PUBLIC_SITE_URL` may be browser-exposed.
