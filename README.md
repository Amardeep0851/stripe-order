# RickCart Secure Stripe Checkout (Next.js + Prisma + PostgreSQL)

This repository now includes a full checkout-to-order-completion flow using **Next.js**, **Prisma**, **PostgreSQL** (`rickcart` database), and **Stripe Checkout**.

## Security hardening included

- Strict request validation with Zod.
- No raw SQL or string interpolation for DB writes (Prisma parameterization).
- CSP + security headers through middleware.
- Stripe webhook signature verification.
- Server-side pricing source of truth (never trust browser-submitted amount).
- Basic IP rate limiting on checkout endpoint.
- Auto-escaping in React pages and no `dangerouslySetInnerHTML`.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env values:
   ```bash
   cp .env.example .env
   ```
3. Create and migrate database:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Seed starter product:
   ```bash
   npm run prisma:seed
   ```
5. Run app:
   ```bash
   npm run dev
   ```

## Stripe webhook local testing

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Set the returned signing secret to `STRIPE_WEBHOOK_SECRET`.

## Flow overview

1. User opens product list (`/`).
2. User checks out (`/checkout?productId=...`) and submits email/quantity.
3. `POST /api/checkout` validates payload, creates `Order`, creates Stripe session, redirects user to Stripe.
4. Stripe sends webhook to `POST /api/webhooks/stripe`.
5. Webhook verifies signature and updates `Order` status to `PAID` or `FAILED`.

