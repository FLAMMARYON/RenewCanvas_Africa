# RenewCanvas Africa — Production Engineering Prompt
**For: Claude Code | Stack: TypeScript / Next.js (assumed; confirm on audit)**

---

## STANDING RULES (apply to every phase, never repeat them)

- TypeScript everywhere applicable.
- Secrets → server-only env vars only. Never `NEXT_PUBLIC_*` for secrets.
- Auth checks → server-side on every protected route and API endpoint.
- Input validation → use existing lib (Zod/Yup) or add one; validate body, query, params.
- Sanitise all user strings before DB writes and template rendering.
- Preserve existing design language, colour palette, branding, logo, typography.
- No mock/hardcoded data in production paths after replacement.
- Add loading, empty, and error states everywhere data is fetched.
- Rate-limit auth, forms, bids, wishlist, uploads (server-side; Redis/Upstash preferred).
- `.env.example` → placeholder names only; `.gitignore` → all `.env*` files.
- Run `lint → typecheck → test → build` after each phase. Report failures; do not hide them.

---

## PHASE 0 — AUDIT FIRST (do not edit yet)

Produce a single structured report covering:

1. Full directory tree (2 levels).
2. Framework, DB/ORM, auth provider, email provider, package manager, deploy target.
3. All mock data locations (arrays, hardcoded metrics, placeholder stats).
4. All existing API routes, server actions, DB models, auth utilities.
5. All forms and their current submission handlers.
6. All routes that need auth guards (not yet guarded).
7. All API endpoints missing auth/admin checks.
8. Secrets scan — flag any match for: `API_KEY`, `SECRET`, `TOKEN`, `PASSWORD`, `PRIVATE_KEY`, `DATABASE_URL`, `STRIPE`, `PAYSTACK`, `FLUTTERWAVE`, `RESEND`, `SMTP`, any `NEXT_PUBLIC_*` that contains a secret.
9. All hardcoded emails.

Output: numbered findings list, then a **phased execution plan** you will follow. Stop and wait for approval before Phase 1.

---

## PHASE 1 — EMAIL & CONSTANTS

1. Create `lib/config/constants.ts` (or equivalent central config).
2. Add `SUPPORT_EMAIL = "hello.renewcanvas@gmail.com"` (public display).
3. Add server-side env var reference `SUPPORT_INBOX_EMAIL` (used in email delivery).
4. Replace every old contact/support email across: footer, contact page, legal pages, checkout, form handlers, admin notifications, email templates.
5. Verify zero legacy emails remain.

---

## PHASE 2 — FAQ ROUTE

1. Delete dedicated `/faq` page/route.
2. Add redirect `/faq` → `/contact#faq` (or controlled 404 per project convention).
3. Update footer FAQ link to `/contact#faq`.
4. Remove all nav/sitemap/metadata references to old FAQ route.
5. Ensure Contact page has `id="faq"` section with accessible heading and keyboard-friendly accordion.

---

## PHASE 3 — REPLACE MOCK DATA

For each item below, create/reuse a typed backend endpoint, fetch server-side, remove the mock:

| Surface | Data needed |
|---|---|
| Homepage stats | real DB aggregates |
| Impact dashboard | real metrics |
| Artist dashboard | real per-artist metrics |
| Admin dashboard | real aggregates |
| Artwork listings + detail | real records, pagination |
| Auction listings | real records, status, end time |
| Live auction counters | actual `status='live'` count |
| Current/winning bids | real highest bid per auction |
| Wishlist state | per-user, auth-gated |
| User profile & settings | real user record |
| Contact/form submissions | DB-stored |
| Orders/checkout | real order records |
| Badges: "hot", "ending soon", "featured", "live" | computed server-side per rules in Phase 7 |

Schema gaps: create migrations; do not fake missing tables.  
Seed data: `prisma/seed.ts` or equivalent — never imported by production code.

---

## PHASE 4 — NAVBAR AUTH STATE

Behaviour:
- Logged out → show **Login** + **Get Started**.
- Logged in → hide those; show user avatar (default if no image) linking to account page.

Requirements:
- Use real session/user object (server-side verified).
- No localStorage-only auth.
- Hydration-safe (SSR + CSR consistent).
- Accessible alt text, keyboard navigation.
- Auth state updates on login/logout without full reload.
- Middleware route guards for all private pages.

---

## PHASE 5 — SETTINGS PAGE

Build/audit settings with these sections (real data fetch + save for each):

1. **Profile** — name, email, phone (optional), avatar, bio (optional).
2. **Security** — password change or auth-provider flow; sessions list if supported.
3. **Notifications** — outbid alerts, ending-soon alerts, order updates, artist updates, marketing opt-in.
4. **Privacy** — profile visibility, data export request, delete account request.
5. **Addresses** — billing, delivery.
6. **Buyer preferences** — saved interests, materials, art categories.
7. **Artist settings** *(if role = artist)* — public profile toggle, commission availability, payout status.
8. **Accessibility** — theme preference, reduced-motion toggle.
9. **Legal** — links to privacy policy, terms, consent preferences.

Validation: Zod schemas on both client and server. Success/error feedback on every save. Prevent cross-user access.

---

## PHASE 6 — FORMS → EMAIL DELIVERY

Every form must: validate → sanitise → store in DB → send email → return success/error UI.

Forms in scope: contact, newsletter, artist application, commission request, checkout enquiry, donation/school donation, booking/collection, cancellation request.

Email routing:
- Always send to `SUPPORT_INBOX_EMAIL`.
- Also send to active admin users with notification preference enabled.
- Fetch admin recipients from DB; do not hardcode.

Email service:
- Use existing provider if present.
- Otherwise create `lib/email/provider.ts` abstraction supporting SMTP/Resend via env vars.
- All provider keys → server-only env vars.
- No raw user HTML in email bodies.
- Rate-limit form endpoints (e.g. 5 req/min per IP).
- Audit-log each submission.

---

## PHASE 7 — LIVE AUCTION BACKEND

### Schema (add if missing)
`Auction`: id, artworkId, status (scheduled|live|ended|cancelled), startTime, endTime, reservePrice, startingBid, bidIncrement, currentHighestBid, currentWinnerId.  
`Bid`: id, auctionId, userId, amount, createdAt.  
`AuctionWatcher`: auctionId, userId (unique constraint).

### Endpoints (create or fix)
- `GET /api/auctions` — list with filters, pagination.
- `GET /api/auctions/[id]` — single auction + current bid.
- `POST /api/auctions/[id]/bid` — authenticated; full bid validation inside DB transaction.
- `GET /api/auctions/live-count` — count of `status='live'`.
- `POST /api/auctions` — admin/artist only; create listing.
- `PATCH /api/auctions/[id]/end` — cron or on-fetch status reconciliation.
- `POST /api/wishlist/toggle` — authenticated; upsert/delete.

### Bid validation (server-side, inside transaction)
- User authenticated.
- Auction status = `live`.
- `now` is between startTime and endTime.
- Bid ≥ currentHighestBid + bidIncrement.
- Re-check inside transaction to prevent race conditions (row lock or serialisable isolation).
- Return descriptive error codes.

### Computed badges (server-side only)
- **hot**: bids ≥ threshold OR watcher count ≥ threshold in last N hours (define constants).
- **ending soon**: endTime − now ≤ configured threshold (e.g. 1 hour).
- **live count**: real DB count.

### Timer
- Return server `endTime` timestamp; client counts down against it.
- On fetch/bid, server reconciles status if past endTime.

---

## PHASE 8 — WISHLIST

- Authenticated toggle (add/remove) stored in DB with unique constraint.
- Prompt unauthenticated users to log in.
- Wishlist page uses real data.
- Users cannot access each other's wishlists.

---

## PHASE 9 — VIRTUAL GALLERY (React Three Fiber)

**Packages**: `@react-three/fiber`, `@react-three/drei`. Dynamic-import the entire gallery route (client-only, Suspense boundary, WebGL fallback).

### Scene structure
1. **Outdoor street** — user starts here; museum building visible ahead.
2. **Entrance** — signboard text: `"ANYTHING IS ART IN THE RIGHT EYES"` (RenewCanvas branding).
3. **Indoor gallery** — rooms below; artworks fetched from backend API.

### Museum rooms (AI Curator — see below)
Generate room layout server-side based on artwork tags:
- PET Bottle Wing, Women Artists Gallery, Youth Climate Innovators, E-Waste Sculptures, Kigali Recycled Futures, School Collection Showcase.
- Each artwork gets tags: category, material, color palette, theme, size, impact score, artist location.
- Room assignment: tag-matching algorithm (no external ML call required for MVP; use weighted tag scoring).
- Return room layout JSON from `/api/gallery/layout` endpoint.

### Lighting
- Read `new Date().getHours()` client-side.
- ≥ 18:00 → night mode (dark sky, interior bulb lights on).
- < 18:00 → daylight (ambient + directional sun).

### Weather
- Pick one condition per session from: clear, cloudy, light rain, mist.
- `Math.random()` seeded to session (e.g. `sessionStorage`) for determinism.
- Affects outdoor ambience only (fog, particle rain, sky colour). No external API.

### Performance
- Lazy-load models; use `useGLTF` with Draco compression.
- Assets → `public/models/` (glTF/GLB, web-optimised).
- Reduced-motion: skip animations if `prefers-reduced-motion`.
- WebGL fallback: static image gallery with same artwork data.

---

## PHASE 10 — LEGAL / CHECKOUT / CANCELLATION

### Privacy Policy
Update to be accurate and specific:
- Data categories collected, purpose, sharing, user rights.
- CCPA/CPRA disclosures (California users).
- Cookie/analytics disclosure.
- UGC handling.
- Contact: `hello.renewcanvas@gmail.com`.
- Do not claim compliance you haven't implemented.

### UGC Terms
Add disclosure at upload/submit points: user responsibility, prohibited content, moderation rights, IP licence for marketplace display, reporting contact.

### Checkout Disclosure
Before payment confirmation surface: item details, total, fees/taxes/shipping, refund/cancellation summary, delivery expectations, recycled-art material note, terms/privacy acceptance.

### Cancellation
- Pre-payment: simple cancel button.
- Post-payment: "Request cancellation" form → stores in DB → emails `SUPPORT_INBOX_EMAIL` + admins.

---

## PHASE 11 — SECURITY HARDENING

1. Move all secrets to server-only env vars; audit `NEXT_PUBLIC_*`.
2. Update `.env.example` (placeholders only) and `.gitignore`.
3. Flag any secret that may have been committed (recommend rotation).
4. Enforce server-side auth on every protected route and API.
5. Enforce admin-role check on admin endpoints.
6. Enforce user-ownership checks (no IDOR on wishlist, settings, orders).
7. Add security headers in `next.config.js` / middleware: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy` (report-only first).
8. File uploads: validate MIME type, max size, safe filename, no executables, isolated storage path.
9. CSRF: verify for cookie-session auth (SameSite + token if needed).
10. Audit log sensitive events: login/logout, admin actions, bids, settings changes, checkout, cancellations, form submissions.

---

## PHASE 12 — MULTILINGUAL ACCESSIBILITY

Add i18n foundation for: **English, Kinyarwanda, French, Swahili**.

- Use Next.js built-in i18n routing or `next-intl` (whichever fits existing setup).
- Artwork detail pages: auto-generate plain-language description from title + tags via `/api/artworks/[id]/description` (call Claude API server-side, cache result).
- Virtual museum: add voice narration toggle (Web Speech API, language-matched to i18n locale).
- Search: normalise diacritics; accept queries in any supported language.

---

## PHASE 13 — DATA COMPLIANCE

1. User data export → request form → stores request → emails admin.
2. Account deletion → request form → soft-delete or hard-delete per business rules → confirmation email.
3. Marketing consent → stored in DB → checked before sending marketing email.
4. Cookie banner if analytics/cookies present.
5. All legal contact references → `hello.renewcanvas@gmail.com`.

---

## PHASE 14 — TESTING

### Manual test checklist (run and report pass/fail)
- Logged-out access to every protected page/endpoint.
- Normal user accessing admin endpoint.
- IDOR attempt: change user ID param to another user's ID on wishlist/settings/orders.
- Single quote `'` in every input (contact, settings, artist form, bid, search).
- Bid below current price → rejected.
- Bid after auction end → rejected.
- Two near-simultaneous bids → only highest wins, no duplicate highest bid.
- Wishlist toggle logged out → redirect to login.
- Wishlist toggle logged in → persists.
- Email form submission → email received at support inbox.
- Footer FAQ link → lands on `/contact#faq`.
- `/faq` → redirects or 404 (not crash).
- Navbar logged-in state vs logged-out state.
- Virtual gallery loads; WebGL fallback renders without crash.

### Automated tests (add where test framework exists)
- Zod schema unit tests for all validation schemas.
- Bid rule tests (price, timing, status).
- Auth/authorisation tests (protected routes return 401/403).
- Wishlist toggle tests.
- Form submission tests (mocked email provider).
- Single-quote regression test for each input schema.

### Build checks
```
<npm|pnpm|yarn> run lint
<npm|pnpm|yarn> run typecheck
<npm|pnpm|yarn> run test
<npm|pnpm|yarn> run build
```
Report every failure with error output. Do not suppress.

---

## PHASE 15 — FINAL REPORT

Deliver a structured report:

1. Changes per phase (files created/modified/deleted).
2. Mock data removed and replaced with.
3. New/updated backend endpoints.
4. Auth/security protections added.
5. Secrets audit result + any requiring rotation.
6. Rate limiting: endpoints covered, store used.
7. Validation/sanitisation: library used, schemas added.
8. Auction implementation: schema, endpoints, race condition handling.
9. Wishlist implementation.
10. Virtual gallery: scene structure, asset locations, lighting/weather logic, fallback.
11. FAQ/contact route result.
12. Legal/privacy/UGC/checkout/cancellation updates.
13. Test results (manual checklist + automated).
14. Build command results.
15. Remaining manual setup required (env vars, provider config, Redis, cron, payment webhooks, Blender asset pipeline).
16. Production follow-ups (secret rotation, provider onboarding, etc.).

---

## EXECUTION ORDER

```
Phase 0 → STOP, report findings, wait for go-ahead
Phase 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15
Run lint/typecheck/test/build after phases 3, 7, 9, 11, and 14.
```

**Before Phase 1 begins**, create a git branch: `security-real-data-auctions-gallery`.

---

*End of prompt. Token budget: spend on code and findings, not on restating these instructions.*
