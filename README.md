# RenewCanvas Africa

[![Tests](https://github.com/FLAMMARYON/RenewCanvas_Africa/actions/workflows/test.yml/badge.svg)](https://github.com/FLAMMARYON/RenewCanvas_Africa/actions/workflows/test.yml)

**Live site → [renewcanvas.page](https://renewcanvas.page)**

A circular-art marketplace that turns plastic waste into sustainable creative value across Africa.

---

## What it is

RenewCanvas Africa is a curated (not open) platform that closes the loop between
waste and art:

1. **Collect** — approved plastics and recyclables are sourced from waste pickers,
   schools, offices, and hospitality partners.
2. **Create** — cleaned, sorted materials are distributed to vetted artists who
   produce upcycled artwork (paintings, sculptures, décor, jewellery).
3. **Sell** — artwork is sold through a digital marketplace with verified impact
   stories, AI-assisted pricing, and an optional 3D/AR gallery.
4. **Report** — every piece tracks the kilograms of waste it diverted, and the
   platform reports aggregate environmental impact.

It serves three audiences from one codebase: **buyers** (browse, wishlist, order),
**artists** (list work, track materials, manage orders), and **admins** (verify
artists, moderate listings, reconcile payments, monitor impact).

## Tech stack

| Layer | Choice |
|-------|--------|
| **Framework** | Next.js 16 (App Router) + React 19 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Database** | PostgreSQL (Neon) via Prisma 7 (`@prisma/adapter-pg`) |
| **API** | Next.js Route Handlers (`src/app/api/**`) |
| **Storage** | Vercel Blob (artwork media) |
| **Payments** | MTN Mobile Money (MoMo Collection API) + manual bank transfer |
| **Email** | Resend (transactional) |
| **AI** | Anthropic (listing assistant, pricing helper) |
| **3D / AR** | three.js + React Three Fiber (virtual gallery) |
| **i18n** | i18next / react-i18next |
| **Testing** | Jest + React Testing Library, `node:test` + tsx, Playwright (e2e) |
| **Hosting** | Vercel |

## Getting started

### Prerequisites

- **Node.js 20+**
- npm
- A PostgreSQL database (the project uses [Neon](https://neon.tech))

### Setup

```bash
# 1. Clone
git clone https://github.com/FLAMMARYON/RenewCanvas_Africa.git
cd RenewCanvas_Africa

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
#   then fill in the values (see .env.example for the full list)

# 4. Generate the Prisma client and push the schema
npm run db:generate
npm run db:push

# 5. Start the dev server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** to view the app.

The minimum environment variables to boot locally are `DATABASE_URL` and
`NEXT_PUBLIC_SITE_URL`; payments, email, AI, and blob storage each need their own
keys (all documented as placeholders in [`.env.example`](.env.example)).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Production build (`prisma generate` + `next build`) |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check with `tsc --noEmit` |
| `npm run test:jest` | Run the Jest + React Testing Library suite (`__tests__/`) |
| `npm test` | Run the `node:test` unit/integration suite (`tests/`) |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:push` | Push the schema to the database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |

## Testing

There are three layers of tests:

- **`__tests__/`** — Jest + **React Testing Library**. Component and pure-unit
  tests (e.g. `ArtworkCard`, `Footer`, the shared Zod validation schemas). This is
  the suite that runs in CI on every push.

  ```bash
  npm run test:jest
  ```

- **`tests/`** — `node:test` + `tsx`. Backend/API, ML, and foundation
  unit/integration tests.

  ```bash
  npm test
  ```

- **`tests/e2e/`** — Playwright browser tests.

  ```bash
  npm run test:e2e
  ```

Continuous integration runs the Jest suite automatically — see
[`.github/workflows/test.yml`](.github/workflows/test.yml).

## Project structure

```
src/
├── app/             # Next.js App Router
│   ├── api/         # Route handlers (auth, artworks, orders, payments, …)
│   ├── dashboard/   # Buyer, artist, and admin dashboards
│   └── …            # Public pages (home, marketplace, artwork, impact, …)
├── components/      # Shared React components (Navbar, Footer, ArtworkCard, …)
├── lib/
│   ├── backend/     # Server-side logic (auth, db, security, hardening)
│   ├── frontend/    # Client-side API helpers
│   ├── ml/          # AI/ML features (pricing, curation, impact)
│   └── validation/  # Shared Zod schemas (client + server)
└── middleware.ts    # CSRF / origin checks on mutating API requests
__tests__/           # Jest + React Testing Library suite
tests/               # node:test suite + Playwright e2e
prisma/              # Schema, migrations, seed
```

## Features

**For artists** — portfolio and profile management, artwork listings with
AI-assisted pricing, material tracking and impact reporting, order management and
analytics.

**For buyers** — browse curated upcycled art, 3D/AR virtual-room preview,
wishlist, order tracking, and multiple payment options (MTN MoMo, bank transfer).

**For admins** — user and artist verification, artwork moderation, order and
payment management, and an aggregate impact dashboard.

## Deployment

The app is deployed on **Vercel** at **[renewcanvas.page](https://renewcanvas.page)**.

1. Push to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Set the environment variables (see [`.env.example`](.env.example)) in the
   Vercel dashboard.
4. Deploy.

`PAYMENT_WEBHOOK_SECRET` is **required in production** — the payment webhook
rejects unsigned events when it is set.

## License

Proprietary — all rights reserved.

## Contact

Visit [renewcanvas.page](https://renewcanvas.page) or email
[hello.renewcanvas@gmail.com](mailto:hello.renewcanvas@gmail.com).
