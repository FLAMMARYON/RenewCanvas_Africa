# RenewCanvas Africa

A circular art marketplace transforming plastic waste into sustainable creative value across Africa.

## About

RenewCanvas Africa is a technology-driven circular arts platform that:
- Collects specific kinds of plastics and recyclables
- Distributes collected items to curated artists
- Facilitates the sale of upcycled art via a digital marketplace
- Tracks and reports environmental impact

## Tech Stack

- **Framework:** Next.js 16 with React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Payments:** MTN Mobile Money
- **Storage:** Vercel Blob
- **Email:** Resend

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- PostgreSQL database (we use [Neon](https://neon.tech))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/renewcanvas-africa.git
   cd renewcanvas-africa
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

   Configure the following variables in `.env`:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXT_PUBLIC_SITE_URL` - Your site URL
   - `RESEND_API_KEY` - For transactional emails
   - `ANTHROPIC_API_KEY` - For AI pricing assistant
   - MTN MoMo credentials (for payments)

4. Set up the database:
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test` | Run tests |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages (buyer, artist, admin)
│   └── ...               # Public pages
├── lib/
│   ├── backend/          # Server-side logic
│   ├── frontend/         # Client-side API utilities
│   └── ml/               # AI/ML features
└── components/           # React components
```

## Features

### For Artists
- Portfolio and profile management
- Artwork listing with AI-powered pricing recommendations
- Material tracking and impact reporting
- Order management and analytics

### For Buyers
- Browse curated upcycled artworks
- Virtual room preview (3D gallery)
- Wishlist and order tracking
- Multiple payment options (MTN MoMo, Bank Transfer)

### For Admins
- User and artist verification
- Artwork moderation
- Order and payment management
- Impact dashboard and analytics

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/renewcanvas-africa)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy

### Required Environment Variables for Production

```
DATABASE_URL=
NEXT_PUBLIC_SITE_URL=
RESEND_API_KEY=
EMAIL_FROM=
ANTHROPIC_API_KEY=
MOMO_API_USER=
MOMO_API_KEY=
MOMO_SUBSCRIPTION_KEY=
MOMO_TARGET_ENVIRONMENT=
MOMO_BASE_URL=
MOMO_CALLBACK_URL=
MOMO_CURRENCY=
```

## License

Proprietary - All rights reserved.

## Contact

For inquiries, visit [renewcanvas.africa](https://renewcanvas.africa) or email hello@renewcanvas.africa.
