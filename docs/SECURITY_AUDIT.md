# RenewCanvas Africa — Security Hardening Audit

> Date: 2026-06-02
> Scope: attacker-perspective review of the Next.js app (`src/app/api/**`,
> auth, payments, uploads, secrets) plus implementation of the requested
> hardening items.

This report lists what was found, the risk, and exactly what was changed.
Items marked **ACTION REQUIRED** need a human step (secret rotation, deleting
tracked files) that code changes alone cannot perform.

---

## Summary

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | Payment webhook accepted unsigned payloads when `PAYMENT_WEBHOOK_SECRET` unset | **Critical** | Fixed |
| 2 | Public registration allowed `role: "admin"` (privilege escalation / full takeover) | **Critical** | Fixed |
| 3 | No HTTP security headers (clickjacking, sniffing, no CSP) | High | Fixed |
| 4 | No CSRF defense beyond cookie SameSite | High | Fixed (Origin check) |
| 5 | Login endpoint had no rate limiting (credential brute force) | High | Fixed |
| 6 | Secrets printed to logs (MoMo config, Anthropic key) | High | Fixed |
| 7 | Live secrets present in working tree | High | **ACTION REQUIRED** (rotate) |
| 8 | Dev `*.log` artifacts tracked in git | Medium | Fixed (gitignore) + **ACTION** |
| 9 | Contact form had no rate limiting (spam / inbox flooding) | Medium | Fixed |
| 10 | Auth events not recorded in the security audit trail | Medium | Fixed |
| 11 | `.env.example` missing several real env vars | Low | Fixed |

Pre-existing, **out of scope** (not security, not introduced here): `orders.ts`
/ `artworks.ts` unit-test mocks are out of sync with their implementations
(3–4 failing tests); `payments/route.ts:164` has a lint `no-useless-escape`
issue. Flagged for follow-up.

---

## What was already solid (kept intact)

- **Password storage**: scrypt with per-user salt, `timingSafeEqual` verify. Good.
- **Sessions**: opaque 256-bit tokens, only the SHA-256 hash is stored; cookie is
  `httpOnly`, `SameSite=Lax`, `Secure` in production. Good.
- **Authorization**: nearly every protected route calls `requireRole(...)`; admin
  endpoints require `["admin"]`. No broken function-level authorization found.
- **IDOR**: ownership scoping verified on orders (`buyerId`/artist items),
  payments (`buyerId`), wishlist, and profile. No IDOR found.
- **Uploads**: images are re-encoded through `sharp` to WebP (strips polyglot /
  executable payloads), size-capped at 10MB, filename normalised, stored in an
  isolated Blob folder, behind `requireRole(["artist","admin"])`. Good.
- **Webhook signature** function itself uses HMAC-SHA256 + constant-time compare.
- `NEXT_PUBLIC_*`: only `NEXT_PUBLIC_SITE_URL` is exposed to the browser — no
  secret leaks through the public env surface.
- Secrets were **never committed to git history** (verified `git log --all -p`).

---

## Findings & fixes

### 1. Payment webhook auth bypass — **Critical**
`src/app/api/payments/webhook/route.ts` verified the signature only
`if (secret)`. `PAYMENT_WEBHOOK_SECRET` is **not** configured, so any
unauthenticated `POST` could reconcile a payment to `paid`, flip the order to
`paid`, and mark the artwork `sold` — payment fraud with no money received.

**Fix**: fail closed. In production the route now returns `503
webhook_not_configured` when no secret is set; outside production it warns and
continues (so sandbox testing still works). A configured secret is enforced
exactly as before.

### 2. Public admin self-registration — **Critical**
`src/app/api/auth/register/route.ts` passed `role` straight through, and
`assertSupportedRole` accepts `"admin"`. An attacker could
`POST /api/auth/register {"role":"admin"}` and obtain a fully active admin
account → total platform compromise.

**Fix**: the public route now only accepts `buyer`/`artist`; any other value is
rejected (`400`) and audit-logged as `auth.register.role_rejected`. Admin
accounts must be provisioned out-of-band (seed/DB).

### 3. Missing security headers — High
Empty `next.config.ts`, no middleware → no `X-Frame-Options`, `nosniff`, CSP,
`Referrer-Policy`, `Permissions-Policy`, or HSTS.

**Fix**: `next.config.ts` now sets, on every route: `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy:
strict-origin-when-cross-origin`, a locked-down `Permissions-Policy`,
`Strict-Transport-Security`, and a **Content-Security-Policy-Report-Only**
(report-only first, per the plan — flip to enforcing once the report stream is
clean). `poweredByHeader` is disabled.

### 4. CSRF — High
Session auth is cookie-based. `SameSite=Lax` already blocks the common CSRF
vectors, but there was no second layer and the existing `assertCsrfToken` helper
was unused.

**Fix**: added `src/middleware.ts` — for state-changing methods
(`POST/PUT/PATCH/DELETE`) to `/api/*`, the request `Origin` (or `Referer`) must
match the host, else `403 csrf_origin_mismatch`. The HMAC-signed
`/api/payments/webhook` and the bearer-authed `/api/admin/reminders` are exempt
(legitimately cross-origin).

### 5. Login brute force — High
`/api/auth/login` had no throttling.

**Fix**: per-IP+email rate limit (10 / 5 min → `429`). Also added limits to
register (5 / 10 min), password-reset request (5 / 15 min) and confirm (10 / 15
min).

### 6. Secret leakage in logs — High
`payments/status` logged the MoMo config; `pricing/listing-assistant` logged the
Anthropic key suffix; `auth.ts` logged role/status on every request.

**Fix**: removed all three. `auth.ts` per-request `console.info` calls deleted.

### 7. Live secrets in the working tree — High — **ACTION REQUIRED**
`.env` contains real, live credentials: Neon DB password, `ANTHROPIC_API_KEY`,
`RESEND_API_KEY`, Vercel `BLOB_READ_WRITE_TOKEN`, `CRON_SECRET`, MoMo keys;
`.env.local` holds a Vercel OIDC token. These are correctly gitignored and were
never committed — but they have been present in plaintext on disk (and were
visible to this tooling session).

**Recommended rotation** (treat as potentially exposed):
- Neon `DATABASE_URL` password — rotate in the Neon console.
- `ANTHROPIC_API_KEY` — revoke + reissue in the Anthropic console.
- `RESEND_API_KEY` — revoke + reissue in Resend.
- `BLOB_READ_WRITE_TOKEN` — rotate in Vercel Blob.
- `CRON_SECRET` and (new) `PAYMENT_WEBHOOK_SECRET` — regenerate long random strings.
- MoMo API user/key/subscription keys — rotate in the MTN MoMo portal.

Set all of these as server-only environment variables in Vercel (never as
`NEXT_PUBLIC_*`).

### 8. Tracked dev logs — Medium — **ACTION REQUIRED**
`.next-dev-*.log`, `.next-start-*.log`, `dev.log`, and `clear-session-fix.html`
were tracked in git. (Scanned — they do **not** currently contain secrets.)

**Fix**: `.gitignore` now ignores `*.log`, the `.next-*` log variants, and the
debug HTML, and uses `.env.*` + `!.env.example` so no env file can slip in.

**Action**: stop tracking the already-committed files (the user runs git):
```
git rm --cached .next-dev-*.log .next-start-*.log dev.log clear-session-fix.html
```

### 9. Contact form abuse — Medium
`/api/contact` persisted to the DB and emailed the admin with no rate limit →
spam / inbox flooding.

**Fix**: per-IP rate limit (5 / 10 min → `429`).

### 10. Auth security audit trail — Medium
Business actions (orders, payments, bids, payouts, verification, shipments,
auctions) were already written to the `AuditLog` table. Authentication events
were not recorded, and the `SecurityEvent` model / `recordSecurityEvent` helper
were unused.

**Fix**: added `src/lib/backend/security-log.ts` (`auditEvent` + `rateLimit`
helpers, best-effort so logging never breaks the request). Now recorded to
`SecurityEvent`: `auth.login.success` / `auth.login.failed` /
`auth.login.rate_limited`, `auth.logout`, `auth.register.success` /
`auth.register.role_rejected`, `auth.password_reset.requested` / `.completed`.

### 11. `.env.example` — Low
Was missing `PAYMENT_PROVIDER`, `PAYMENT_WEBHOOK_SECRET`, `BLOB_*`, `TWILIO_*`,
`NODE_ENV`.

**Fix**: rewritten with every variable as a placeholder, grouped, with
server-only vs public clearly noted.

---

## Tests added

- `tests/backend/hardening.test.ts` — CSRF token check + upload MIME/size validation.
- `tests/backend/security-log.test.ts` — rate-limit buckets, IP parsing, audit best-effort + payload shape.
- `tests/api/middleware-csrf.test.ts` — Origin/Referer enforcement, exemptions.
- `tests/api/payments-webhook-auth.test.ts` — fail-closed in prod, 401 on bad signature.
- `tests/api/security-headers.test.ts` — required headers + CSP present, `poweredByHeader` off.

**Result**: 20/20 new tests pass. `tsc --noEmit` clean. No regressions
introduced (the pre-existing `orders`/`artworks` mock failures reproduce on the
unmodified code).

## Recommended follow-ups (not done here)

- Move the in-memory rate limiter to a shared store (Redis/Upstash) before
  horizontal scaling — per-instance buckets don't coordinate across serverless
  instances.
- Add an email-verification gate (tokens are issued but `status` is set
  `active` immediately).
- Tighten the CSP from report-only to enforcing once violations are reviewed.
- Fix the out-of-sync `orders`/`artworks` test mocks and the
  `payments/route.ts` regex lint error.
