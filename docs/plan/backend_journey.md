# Backend Integration Journey

This plan divides backend implementation into sequential slices. Each phase should leave the product more operational without depending on unfinished later phases.

## B0: Backend Foundations

Goal: create the backend base safely.

Current status: verified. PostgreSQL, Prisma, environment validation, the health route, seed script, backend tests, local schema push, seed execution, and build gates have passed.

Deliver:

- PostgreSQL database target.
- Prisma ORM, schema, generated client, and migration workflow.
- Environment validation that allows frontend builds without a database but requires `DATABASE_URL` for database-backed operations.
- Server-side database and health-check helpers.
- Idempotent seed data for baseline users, artist profile, artwork, materials, and audit log.
- API response conventions for backend health and later routes.
- Backend test setup for config and health behavior.

Done when:

- App connects to the local database.
- `db:push` or `db:migrate` runs cleanly against PostgreSQL.
- `db:seed` loads idempotent baseline data.
- Basic API health check passes.
- Test command covers backend utilities.

## B1: Auth And Sessions

Goal: replace frontend-only auth with real accounts.

Current status: verified. Auth/session schema, migration, password hashing, register/login/logout/session APIs, password reset token flow, dashboard session checks, tests, local migration, seed execution, E2E, and build gates have passed.

Deliver:

- Use the B0 `User` table for real account records.
- Add any auth-specific tables not created in B0, including sessions, password reset tokens, and email verification tokens.
- Password hashing.
- Register, login, and logout APIs.
- Secure session cookie.
- Server-side role checks for buyer, artist, and admin.
- Dashboard route protection backed by real session state.

Done when:

- Login persists across refresh.
- Logout clears the session.
- Wrong-role users cannot access protected APIs or pages.
- Password reset flow stores and validates real tokens.

## B2: Profiles And Roles

Goal: persist buyer, artist, and admin profile data.

Current status: verified. Buyer, artist, and admin profile persistence, default buyer address storage, authenticated profile API, role profile pages, seed data, migration, tests, typecheck, lint, build, and E2E gates have passed.

Deliver:

- Buyer profile.
- Artist profile.
- Admin profile and permissions baseline.
- Address book.
- Profile update APIs.
- Avatar/profile image upload placeholder or real storage.
- Replace frontend `localStorage` profile saves.

Done when:

- Buyer and artist dashboards load real user data.
- Artist profile edits survive refresh.
- Role-specific pages use the real session user.

## B2A: Commissioned Work Requests

Goal: let buyers request custom commissioned work through admin mediation.

Current status: verified. Buyer commission form, admin assignment queue, artist accept/reject queue, Prisma schema, API routes, migration, tests, seed, and migration status gates have passed.

Deliver:

- Buyer-side commissioned work request form.
- Project description and product specifics.
- Optional preferred recycled/upcycled materials.
- Buyer budget amount.
- Approximate size selection: small, medium, large, or specific dimensions.
- Commission request table with lifecycle status.
- Admin queue for reviewing buyer requests.
- Admin assignment of a request to an active artist.
- Artist queue for assigned commission requests.
- Artist accept/reject response.
- Keep buyer and artist contact mediated by RenewCanvas admins.

Done when:

- Buyer can submit a custom-work request to admins.
- Admin can assign the request to an artist.
- Assigned artist can accept or reject the request.
- Requests are scoped by role: buyer sees own, admin sees all, artist sees assigned.
- Workflow actions are role-protected.

## B3: Artwork Data And Media

Goal: replace mock artwork data.

Current status: verified. Artwork ownership, moderation fields, image upload metadata placeholders, artwork create/list/detail/update/delete/review APIs, marketplace/detail/artist/admin artwork page wiring, seed inventory, migration, tests, typecheck, lint, build, and E2E gates have passed.

Deliver:

- Use and extend the B0 artwork, image, material, and artist ownership schema where needed.
- Add artwork ownership type for `artist` versus `renewcanvas`.
- Artwork create, edit, and delete APIs.
- Draft, submitted, approved, rejected, listed, and sold states.
- Image upload pipeline or signed upload abstraction.
- Replace hardcoded marketplace, detail, and artist artwork data.

Done when:

- Artist can create artwork.
- Admin can list RenewCanvas-owned artwork.
- Admin can see submitted artwork.
- Marketplace shows approved listed artwork only.
- Artwork detail pages use real IDs.
- RenewCanvas-owned artwork is clearly marked as platform-owned inventory.

## B4: Marketplace, Search, And Wishlist

Goal: make browsing real.

Current status: verified. Marketplace query filtering, sorting, pagination, persistent buyer wishlist, wishlist counters, artwork view tracking, migration, seed, tests, typecheck, lint, build, and E2E gates have passed.

Deliver:

- Marketplace listing API.
- Filtering by category, material, price, and availability.
- Search by title, artist, category, and material.
- Sorting and pagination.
- Wishlist table and APIs.
- Artwork view tracking.
- Replace local wishlist state.

Done when:

- Marketplace filters and searches real data.
- Buyer wishlist persists across devices.
- Artwork view and wishlist counts are stored.

## B5: Pricing And Impact Persistence

Goal: connect existing pricing and impact engines to real records.

Current status: verified. Pricing and impact snapshot tables, artwork create/update recalculation, server-side demand input sanitization, artist/admin recommendation displays, migration, seed, typecheck, lint, build, and E2E gates have passed.

Deliver:

- Persist pricing recommendations.
- Persist impact estimates.
- Link pricing and impact records to artwork drafts.
- Store engine inputs and explanations.
- Recalculate on artwork changes.
- Prevent manipulated demand inputs.
- Admin and artist views for recommendation history.

Done when:

- Artist artwork creation calls pricing API and saves the result.
- Artwork impact data is stored and visible.
- Admin can review pricing and impact records.

## B6: Admin Verification And Moderation

Goal: make P1 admin verification operational.

Current status: verified. Verification review and evidence tables, backend verification APIs, admin decision workflow, artist request-more-info evidence flow, audit logging, migration, seed, tests, typecheck, lint, build, and E2E gates have passed.

Deliver:

- Verification review table.
- Evidence attachment model.
- Admin decision APIs.
- Artist request-more-info flow.
- Rejection and approval notes.
- Audit log for every admin action.
- Replace static admin verification queue with a real database-backed queue.

Done when:

- Admin can approve, reject, or request information.
- Artist sees status changes.
- Decisions are audit logged.
- Approved artworks can become listed.

## B7: Checkout And Orders

Goal: real order creation before payment.

Current status: verified. Order and order item persistence, address and price snapshots, artwork reservation during checkout, role-scoped order APIs, checkout/order-confirmation wiring, tests, typecheck, lint, Prisma validation, and build gates have passed.

Deliver:

- Order table.
- Order item table.
- Order status lifecycle.
- Address snapshot.
- Price snapshot.
- Artwork reservation during checkout.
- Replace frontend local order storage.
- Buyer, artist, and admin order dashboards backed by database records.

Done when:

- Buyer creates a real order.
- Order confirmation loads by real order ID.
- Sold or reserved inventory cannot be double-purchased.

## B8: Payments

Goal: collect buyer money safely into RenewCanvas-controlled accounts.

Current status: verified. Payment transaction and refund schema, payment session creation, MTN MoMo prompt and USSD reference support, provider webhook reconciliation with signature/idempotency handling, paid-order inventory reconciliation, audit logging, APIs, tests, typecheck, lint, Prisma validation, and build gates have passed.

Deliver:

- Choose provider: Flutterwave, Paystack, Stripe, MTN MoMo, or another supported provider.
- Payment intent/session creation.
- Payment transaction table.
- Webhook endpoint.
- Webhook signature verification.
- Idempotency handling.
- Payment success/failure reconciliation.
- MTN MoMo phone approval prompt as the primary mobile money flow.
- MTN MoMo USSD fallback payment instructions.
- Store provider references for prompt payments and buyer-entered order references for USSD reconciliation.
- Refund model baseline.
- Ensure buyer payments go to RenewCanvas Africa, not directly to artists.
- Hide artist payout details from buyers.
- Mark RenewCanvas-owned artwork payments as platform revenue with no artist payout.

Done when:

- Checkout creates a provider payment.
- Webhook marks order paid.
- Failed payments do not mark orders paid.
- Duplicate webhooks do not duplicate records.
- MTN MoMo buyers can approve payment from a phone prompt without typing merchant codes manually.
- MTN MoMo buyers can complete payment through USSD when prompts or payment links are unavailable.
- Prompt payments reconcile through provider callbacks, and admins can reconcile fallback USSD payments to the correct order reference.
- Paid orders record RenewCanvas as payment recipient.
- RenewCanvas-owned artwork orders do not create payout records.

## B9: Shipping And Fulfillment

Goal: operational delivery tracking.

Current status: verified. Shipment schema, paid-order shipment creation, delivery fee/address snapshots, shipment lifecycle updates, order status synchronization, role-scoped shipment APIs, audit logging, tests, typecheck, lint, Prisma validation, and build gates have passed.

Deliver:

- Shipment table.
- Delivery address validation.
- Delivery fee calculation.
- Shipment status lifecycle.
- Artist preparation flow.
- Buyer delivery status.
- Admin shipment controls.

Done when:

- Paid order moves into fulfillment.
- Buyer, artist, and admin see the same shipment state.
- Delivery status changes are persisted.

## B10: Artist Payouts

Goal: prepare marketplace economics with RenewCanvas as the order middleman.

Current status: verified. Payout ledger schema, platform fee baseline, artist payout records for delivered marketplace orders, RenewCanvas-owned inventory exclusion, 48-hour return-window enforcement, admin payout status updates, role-scoped payout APIs, audit logging, tests, typecheck, lint, Prisma validation, and build gates have passed.

Deliver:

- Platform fee and commission config.
- Artist payout account.
- Payout ledger.
- Payout status lifecycle.
- Manual payout approval or provider payout integration.
- Payout reports.
- Private artist payout details visible only to the artist and authorized admins.
- Payout eligibility starts 48 hours after confirmed delivery when no eligible return request is open.
- Admin-controlled payout release; buyers and artists do not exchange payment or contact details.
- No payout is created for RenewCanvas-owned artwork; 100% of net sale revenue belongs to RenewCanvas after payment and delivery costs.

Done when:

- Paid and delivered orders produce payout records.
- Admin can mark payouts paid or failed.
- Artist sees payout history.
- Payouts cannot be released before the 48-hour return request window closes.
- RenewCanvas-owned artwork sales are excluded from artist payout queues.

## B11: Notifications

Goal: users get operational messages.

Current status: verified. Notification and preference schema, queued/sent/skipped status handling, channel/category preference enforcement, notification listing and preference APIs, tests, typecheck, lint, Prisma validation, and build gates have passed.

Deliver:

- Notification table.
- Email provider.
- Optional SMS or WhatsApp provider.
- Templates for auth, orders, payment, moderation, shipment, and auction events.
- Retry and failure logging.
- User notification preferences.

Done when:

- Key events create notification records.
- Emails send through the staging/dev provider.
- Failed notification attempts are visible.

## B12: Auctions

Goal: make auction pages operational.

Current status: verified. Auction and bid schema, admin scheduling/closing, live bid validation, minimum increment enforcement, winner tracking, auction APIs, audit logging, tests, typecheck, lint, Prisma validation, and build gates have passed.

Deliver:

- Auction table.
- Bid table.
- Auction lifecycle.
- Bid validation.
- Anti-sniping rules if wanted.
- Winner selection.
- Winner payment flow.
- Admin auction controls.

Done when:

- Admin can schedule, start, and end auctions.
- Buyer can bid.
- Highest valid bidder wins.
- Winning order/payment flow is created.

## B13: Virtual Room Backend

Goal: make the 3D experience data-driven.

Current status: verified. Virtual room state schema, approved/listed artwork feed, saved room state, public share tokens, viewed artwork tracking, APIs, tests, typecheck, lint, Prisma validation, and build gates have passed.

Deliver:

- Feed approved artworks into the virtual room.
- Persist saved room and tour state server-side.
- Shareable curation links.
- User preferences.
- Viewed artwork tracking.
- Optional curation snapshot table.

Done when:

- Virtual room uses real approved artworks.
- User can resume saved room or tour.
- Shared room links work.

## B14: Analytics And Reporting

Goal: understand usage and impact.

Current status: verified. Analytics event and daily aggregate schema, event ingestion service/API, daily aggregation helper, user/session/entity metadata support, tests, typecheck, lint, Prisma validation, and build gates have passed.

Deliver:

- Analytics event API.
- Event schema.
- Track page views, artwork views, wishlist actions, checkout, payment, and virtual-room movement.
- Aggregation jobs.
- Admin reports.
- Artist analytics from real data.

Done when:

- Dashboards use real analytics.
- Funnel data exists.
- Impact, revenue, and order reports are queryable.

## B15: Security, Compliance, And Production Hardening

Goal: make the backend production-safe.

Current status: verified. Security event schema, legal acceptance timestamps, CSRF helper, webhook signature verification, upload metadata validation, audit-oriented service hooks, API endpoint for legal acceptance, tests, typecheck, lint, Prisma validation, and build gates have passed. Production provider credentials, backup execution, and live monitoring integrations remain deployment responsibilities.

Deliver:

- Rate limits on sensitive APIs.
- CSRF protection if cookie auth is used.
- Complete webhook signature checks.
- Audit log review.
- File upload scanning and validation.
- Backup and restore process.
- Monitoring and error tracking.
- Data export and deletion.
- Terms/privacy acceptance timestamps.
- Security audit gate.
- Production dependency-audit exception review for any unresolved transitive advisories.

Done when:

- Staging behaves like production.
- Backups are tested.
- Sensitive flows are rate-limited.
- Admin, audit, and payment logs are reliable.
- Any unresolved dependency advisories have documented exposure assessment, compensating controls, owner sign-off, and review expiry.

## Recommended Order

1. B0 foundations
2. B1 auth
3. B2 profiles
4. B2A commissioned work requests
5. B3 artworks/media
6. B4 marketplace/wishlist
7. B5 pricing/impact persistence
8. B6 admin verification
9. B7 orders
10. B8 payments
11. B9 shipping
12. B10 payouts
13. B11 notifications
14. B12 auctions
15. B13 virtual room backend
16. B14 analytics
17. B15 production hardening

## Sequencing Rules

- Do not start B1 until B0 has passed live PostgreSQL schema push or migration and seed verification.
- Do not start payments before real orders exist.
- Do not start orders before artwork inventory exists.
- Do not start admin verification persistence before artist and artwork records exist.
- Do not expand frontend `localStorage` as a backend substitute after B0 starts.
- Each phase should include implementation, tests, documentation updates, and a fresh build before moving to the next phase.
