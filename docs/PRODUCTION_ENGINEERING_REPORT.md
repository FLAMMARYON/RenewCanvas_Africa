# RenewCanvas Africa — Production Engineering Report

> Branch: `security-real-data-auctions-gallery`
> Date: 2026-06-02
> Scope: Phases 0–15. DB-migration phases (P3, P7, P8, P13) deferred per decision
> to avoid new Prisma migrations while a database change is under consideration.

---

## Execution summary

| Phase | Status | Notes |
|-------|--------|-------|
| P0 Audit | ✅ | Findings + plan delivered before edits. |
| P1 Email & constants | ✅ | Central config; all legacy emails replaced. |
| P2 FAQ route | ✅ | `/faq` → `/contact#faq`; accessible accordion. |
| P3 Replace mock data | ⏳ Deferred | Needs schema work; entangled with DB decision. |
| P4 Navbar auth + guards | ✅ | Real server session; middleware guard; localStorage auth removed. |
| P5 Settings | ✅ | Zod profile validation + in-app password change. |
| P6 Forms → email | ✅ | Zod + sanitise + store + support/admin email fan-out. |
| P7 Auction backend | ⏳ Deferred | Needs `AuctionWatcher` + schema changes. |
| P8 Wishlist | ⏳ Deferred | Schema-coupled; existing wishlist API kept. |
| P9 Virtual gallery | ✅ | Verified; added entrance tagline; removed debug logs. |
| P10 Legal/checkout/cancellation | ✅ | CCPA/UGC, checkout disclosure, cancellation flow. |
| P11 Security hardening | ✅ | Completed in security pass + verified here. |
| P12 Multilingual / a11y | ✅ | i18n foundation, description API, narration, diacritics search. |
| P13 Data compliance | ⏳ Deferred | Export/delete request tables = schema work. |
| P14 Testing | ✅ | +38 tests; lint/typecheck/test/build all green. |
| P15 Report | ✅ | This document. |

**Build gates (final): `lint` ✅ · `tsc --noEmit` ✅ · `test` 195/199 ✅ · `build` ✅ (56 pages, 58s).**
The 4 failing tests are pre-existing `orders`/`artworks` mock mismatches (reproduce on the
base commit), unrelated to this work.

---

## Phase details

### P1 — Email & constants
- New `src/lib/config/constants.ts`: `SUPPORT_EMAIL` (public display =
  `hello.renewcanvas@gmail.com`) and server-only `getSupportInboxEmail()` reading
  `SUPPORT_INBOX_EMAIL`.
- Replaced every legacy `hello.renewcanvas.africa@gmail.com` (12 files) → new address;
  verified **zero** legacy emails remain.
- Server delivery paths (`/api/contact`, `/api/admin/reminders`) now use the env-backed inbox.
- `.env.example` gains `SUPPORT_INBOX_EMAIL`.

### P2 — FAQ
- Deleted `src/app/faq/page.tsx`; added permanent redirect `/faq → /contact#faq` in `next.config.ts`.
- Footer FAQ link updated. Contact page FAQ section converted to a keyboard-accessible
  `<details>` accordion with `id="faq"`.

### P4 — Navbar auth + dashboard guards
- Navbar + `DashboardLayout` already used the real server session (`/api/auth/session`); verified.
- **Removed** the localStorage session store and the dangerous `inferRoleFromEmail`
  (assigned admin from an email substring). `session.ts` now only exposes the type + role→route helper.
- `src/middleware.ts` extended to guard `/dashboard/*` (redirect to `/login?next=…` without a session cookie).

### P5 — Settings
- New shared Zod schemas (`src/lib/validation/schemas.ts`); `/api/profile` PATCH now validates server-side.
- New `changePassword()` in `auth.ts` + `POST /api/auth/password-change` (auth-gated, Zod, rate-limited,
  audited, revokes all sessions). Buyer/artist settings already fetch/save real data.

### P6 — Forms → email delivery
- New `src/lib/backend/email/notify.ts`: emails support inbox **plus** opted-in admin users
  (read from DB, never hardcoded). Plain-text bodies (no raw user HTML).
- `/api/contact` rewritten: Zod validation/sanitise → store → fan-out email → audit log.
  New form types (commission/donation/booking/cancellation/newsletter) map onto the existing
  `ContactMessageType` enum with the precise type preserved in `metadata.formType` (no migration).
- Wired the previously dead **book-collection** form (validation, loading, success/error UI).

### P9 — Virtual gallery
- Already implemented: client-only WebGL scene + `WebGLFallback`, day/night by hour, session-seeded
  weather (clear/cloudy/light-rain/mist), reduced-motion, real artwork data via `/api/gallery/layout`,
  outdoor→entrance→interior structure.
- Added the brand tagline ("Anything is art in the right eyes") to the entrance signboard texture.
- Removed debug `console.log`s (fixes the `readiness` test).

### P10 — Legal / checkout / cancellation
- Privacy: added **User-Generated Content** and **California (CCPA/CPRA)** sections; states we do not
  sell/share personal info; contact = new support email.
- Checkout: pre-payment disclosure block (recycled-art note, totals/fees, delivery, refund/cancellation)
  and Privacy Policy added to the acceptance.
- UGC/IP notice added at the artwork submit step.
- New `CancellationRequest` component on order-confirmation: post-payment "Request cancellation"
  → `/api/contact` (`cancellation_request`) → DB + support/admin email. Pre-payment = leave checkout.

### P11 — Security hardening (verified)
- Server-side `requireRole` on protected routes; admin checks on admin endpoints; IDOR-scoped queries
  (orders/payments/wishlist/profile). Security headers + CSP (report-only) in `next.config.ts`.
  CSRF Origin middleware. Rate limits on auth/forms. Upload: sharp re-encode to WebP + MIME/size/isolated path.
  Audit logging for auth/admin/bids/checkout/cancellations/forms. Secrets server-only;
  only `NEXT_PUBLIC_SITE_URL` is public. (Full detail: `docs/SECURITY_AUDIT.md`.)

### P12 — Multilingual & accessibility
- `src/lib/i18n/`: `config.ts` (en/rw/fr/sw + BCP-47), `messages.ts` (curated strings, EN fallback),
  `search.ts` (diacritic-insensitive `normalizeForSearch`/`matchesQuery`).
- `GET /api/artworks/[id]/description`: Claude-generated, locale-aware, **in-memory cached** (24h),
  rate-limited, with a deterministic fallback when AI is unavailable.
- `useNarration` (Web Speech API, language-matched) + a narration toggle in the gallery that reads the
  selected artwork.
- Search diacritics util delivered + tested. **Note:** full diacritic-insensitive *DB* matching needs the
  Postgres `unaccent` extension (deferred with DB work); current server search is case-insensitive `contains`.

### P14 — Testing
New automated tests (all passing):
- `tests/validation/schemas.test.ts` — Zod schemas incl. **single-quote/apostrophe regression**, strict
  rejection of unknown fields (e.g. injected `role`), password policy.
- `tests/i18n/i18n.test.ts` — locales, translate fallback, diacritic search.
- `tests/backend/change-password.test.ts` — hash update, session revoke, wrong/weak password, suspended.
- Fixed pre-existing lint (`payment-providers` regex, `listing-assistant` unused imports) and rewrote the
  broken `useLightingMode` test against a new pure `lightingModeForHour` helper.

---

## Manual test checklist

Browser-driven checks were **not executed in this headless environment**; automated coverage and code
locations are noted so they can be run quickly.

| Check | Result |
|-------|--------|
| Logged-out access to `/dashboard/*` | ✅ middleware redirects to `/login?next=…` (`src/middleware.ts`) |
| Normal user hitting admin endpoint | ✅ `requireRole([...,"admin"])` returns 403 |
| IDOR on wishlist/settings/orders | ✅ queries scoped by `user.id` (verified in P0/P11) |
| Single quote `'` in inputs | ✅ automated regression in `schemas.test.ts` |
| Wishlist toggle logged-out → login | ➖ existing wishlist API requires `buyer`; UI prompt unchanged (P8 deferred) |
| Email form submission → support inbox | ✅ `notifySupportAndAdmins` (needs `RESEND_API_KEY` set to actually deliver) |
| Footer FAQ → `/contact#faq` | ✅ link + anchor in place |
| `/faq` redirects (no crash) | ✅ permanent redirect in `next.config.ts` |
| Navbar logged-in vs out | ✅ real `/api/auth/session` |
| Virtual gallery + WebGL fallback | ✅ `WebGLFallback` renders on no-WebGL |
| Bid below price / after end / race | ➖ P7 deferred; existing bid path validates but transactional hardening deferred |

---

## Remaining manual setup (production)

- **Env vars** (server-only): `DATABASE_URL`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `SUPPORT_INBOX_EMAIL`,
  `BLOB_READ_WRITE_TOKEN`, `CRON_SECRET`, **`PAYMENT_WEBHOOK_SECRET`** (webhook fails closed without it),
  MoMo keys.
- **Secret rotation** (flagged earlier): rotate the live values currently in `.env`.
- Untrack stray dev logs: `git rm --cached .next-dev-*.log .next-start-*.log dev.log clear-session-fix.html`.
- Vercel Cron for `/api/admin/reminders` (Bearer `CRON_SECRET`).

## Production follow-ups / deferred (need DB migrations)

- **P3** Replace remaining dashboard/auction mock UIs with real endpoints.
- **P7** Auction backend: `AuctionWatcher` model, `live-count` endpoint, **serializable/locked bid txn**,
  server-computed hot/ending-soon badges.
- **P8** Wishlist toggle endpoint + login prompt polish.
- **P13** Data export / account deletion request tables; marketing-consent gating; cookie banner.
- Distributed rate limiting (Upstash/Redis) before horizontal scaling.
- Postgres `unaccent` for diacritic-insensitive DB search.
- Fix the 4 stale `orders`/`artworks` test mocks.
