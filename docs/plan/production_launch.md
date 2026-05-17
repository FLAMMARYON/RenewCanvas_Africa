# Production Launch Runbook

This runbook moves RenewCanvas Africa from local backend operation to a live global deployment.

## Target Stack

- App: Vercel production deployment.
- Database: managed PostgreSQL with pooled runtime connection and direct migration connection.
- DNS: Cloudflare-managed DNS for the chosen domain.
- Payments: Flutterwave or Paystack first, MTN MoMo when merchant API access is approved, manual bank fallback.
- Email: Resend.
- SMS/WhatsApp: Twilio Messaging Service.

## Required External Accounts

- Business bank account for RenewCanvas Africa.
- Flutterwave or Paystack merchant account in live mode.
- Optional MTN MoMo merchant API access.
- Resend account with verified sending domain.
- Twilio account with approved SMS/WhatsApp sender or Messaging Service.
- Vercel team/project.
- Managed PostgreSQL project.
- Cloudflare zone for the production domain.

## Production Environment Variables

Set these in the hosting provider dashboard, not in committed files.

```env
DATABASE_URL=
NEXT_PUBLIC_SITE_URL=https://www.renewcanvas.africa
PAYMENT_PROVIDER=flutterwave
PAYMENT_WEBHOOK_SECRET=
FLUTTERWAVE_SECRET_KEY=
FLUTTERWAVE_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
RESEND_API_KEY=
EMAIL_FROM=RenewCanvas Africa <orders@renewcanvas.africa>
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_MESSAGING_SERVICE_SID=
```

Use sandbox keys in staging and live keys only in production.

## Deployment Commands

CI should run:

```bash
npm ci
npm run db:generate
npm run deploy:verify
```

Production migration step:

```bash
npm run db:deploy
```

Do not run `npm run db:migrate` against production. That script uses Prisma development migrations.

## Payment Webhooks

Configure the payment provider webhook URL:

```text
https://www.renewcanvas.africa/api/payments/webhook
```

For provider payloads that do not include a `provider` field, send one of these request headers when the provider dashboard supports custom headers:

```text
x-renewcanvas-provider: flutterwave
x-renewcanvas-provider: paystack
```

Set `PAYMENT_WEBHOOK_SECRET` to the provider webhook secret where supported. The route verifies `x-renewcanvas-signature` using HMAC SHA-256.

## Notification Dispatch

Queued notifications are sent by:

```http
POST /api/notifications
```

This endpoint is admin-protected. For production, call it from a scheduled job or deployment cron every few minutes. It sends:

- email through Resend
- SMS through Twilio
- WhatsApp through Twilio
- in-app notifications without an external provider

Failed sends remain persisted with an error message for admin review.

## DNS

Minimum records:

```text
www CNAME cname.vercel-dns.com
@   A/CNAME per hosting provider instructions
```

Email records come from Resend:

- SPF
- DKIM
- DMARC

Keep Cloudflare SSL/TLS in full strict mode after certificates are active.

## Staging Acceptance Test

Run this before production launch:

1. Register buyer.
2. Register artist.
3. Artist creates artwork.
4. Admin approves and lists artwork.
5. Buyer checks out.
6. Payment session is created with provider reference.
7. Provider webhook marks order paid.
8. Shipment is created and delivered.
9. Payout record is created after delivery.
10. Notification dispatch sends email/SMS/WhatsApp or records provider errors.
11. `/api/health` returns app and database status `ok`.

## Production Launch Gate

Launch only after:

- database migrations are deployed
- production build passes
- production domain resolves over HTTPS
- webhook endpoint is reachable
- live low-value payment succeeds
- email domain is verified
- notification send succeeds to an internal test account
- database backup and restore process is documented
- admin account credentials are stored securely
