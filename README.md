# Ličnost

Ličnost is a Nuxt 4 clothing storefront foundation for the Balkans, DACH, EU, and USA. It is intentionally a modular monolith: Nuxt UI and Nitro API in one deployable application, with provider-neutral seams for PostgreSQL/Supabase, Stripe, Resend, and R2.

## Run locally

```bash
npm ci
npm run dev
```

Prerequisites: Node 22+ (see `.nvmrc`), npm 10.9+ or npm 11, and PostgreSQL 17 for database-backed routes. Docker is optional and only provides local PostgreSQL. The committed lockfile is authoritative; use `npm ci`.

The original installation stall was npm 10.9.7's Arborist resolver crashing with `Cannot read properties of null (reading 'edgesOut')` while resolving the peer graph. Registry access was healthy. npm 11.6.2 generated the lockfile successfully; subsequent plain `npm ci` works with npm 10.9.7 as well. ESLint is pinned to the current Nuxt ESLint peer line.

Useful checks: `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build`.

## PostgreSQL

Set `DATABASE_URL` in `.env`. Supabase, Neon, self-hosted PostgreSQL, and other compatible providers work through their standard PostgreSQL connection string. For local development, Docker is optional:

```bash
docker compose -f docker-compose.dev.yml up -d
cp .env.example .env
npm run db:migrate
npm run db:seed
```

The catalog and purchase-request APIs require `DATABASE_URL`; they do not silently fall back to fake persistence. Purchase requests re-read active variants and authoritative prices inside a transaction, create snapshot items, and never reserve or decrement stock.

## Structure

`app/` contains storefront and admin pages. `server/api/` exposes Nitro endpoints; services and repositories keep business logic and persistence out of components. `shared/` contains portable domain types, regions, and validation. `database/` contains PostgreSQL migrations and repeatable seeds.

## Status and future architecture

The database schema is in numbered migrations; the repeatable seed is in `database/scripts/seed.ts`. Market country eligibility, shipping methods, merchant tax configuration, customs mode, and order tax/shipping snapshots are PostgreSQL-backed. Stripe and Resend remain provider-configured but unverified without credentials. Tax and carrier integrations are intentionally not production-complete.

## Admin operations

The protected operations area is available at `/admin`. V1 uses a server-only `ADMIN_BOOTSTRAP_TOKEN` to create the first administrator and issue a short-lived, HttpOnly session cookie; there is no public administrator registration route. Authorization is enforced on every admin API endpoint, with `ADMIN` and `OPERATOR` roles stored in PostgreSQL. Supabase Auth can replace this authentication seam later without coupling commerce data to Supabase APIs.

Configure locally:

```env
ADMIN_BOOTSTRAP_TOKEN=use-a-long-random-development-secret
LOW_STOCK_THRESHOLD=5
```

The admin supports request review/status transitions, request-to-order conversion with current price and stock checks, paginated orders, fulfillment and tracking transitions, product creation/listing, inventory adjustments with history, low-stock visibility, and operational settings. Paid state remains Stripe-webhook authoritative; unpaid orders cannot normally enter fulfillment.

The ADMIN-only `/admin/readiness` page identifies blocked and warning conditions such as development-zero tax, missing Stripe/webhook configuration, console email mode, unconfirmed shipping, incomplete legal identity, localhost URLs, backups, and monitoring. Germany/EU are seeded as online-enabled; several non-EU destinations are request-only or disabled until shipping/payment decisions are confirmed. Country eligibility is separate from purchase-request eligibility.

Manual inventory changes are transactional and recorded in `inventory_adjustments` plus append-only `admin_activity`. Marking an order shipped records carrier/tracking data and creates an `ORDER_SHIPPED` outbox event. The existing outbox worker sends shipping confirmations asynchronously and retries failures without changing order state.

## Transactional email and outbox

Email is asynchronous and cannot roll back a paid order. `ORDER_PAID` and `PURCHASE_REQUEST_RECEIVED` are stored in PostgreSQL, claimed with `FOR UPDATE SKIP LOCKED`, and processed with:

```bash
npm run outbox:process
```

Development defaults to `EMAIL_MODE=console`. Resend mode requires `RESEND_API_KEY`, a verified `EMAIL_FROM`, optional `EMAIL_REPLY_TO`, and `ADMIN_NOTIFICATION_EMAIL`. Delivery records are idempotent by outbox event, email type, and recipient. Failures retry with bounded delays and remain inspectable after the final attempt. Production can invoke the batch processor from a scheduler; no scheduler is coupled to the application.

## Stripe test-mode checkout

Stripe Checkout is server-created from authoritative PostgreSQL order snapshots. Configure test-mode values only:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Then run the app and forward Stripe CLI events locally:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The checkout endpoint is `POST /api/checkout`. It accepts variant IDs, quantities, email, destination country, and currency; prices are always reloaded from PostgreSQL. Hosted Checkout redirects to `/checkout/success`, but the webhook remains authoritative.

Orders start as `PENDING_PAYMENT` / `UNPAID` / `UNFULFILLED`. A verified successful webhook atomically marks payment/order state, decrements stock with a non-negative guard, and writes one `ORDER_PAID` outbox event. Duplicate webhook events are ignored through the unique `(provider, provider_event_id)` key. Tax remains explicitly configurable and must be reviewed before production. Cash on Delivery is unsupported.

See [`docs/production.md`](docs/production.md) and [`docs/go-live-checklist.md`](docs/go-live-checklist.md) for deployment, backups, monitoring, provider setup, and launch gates. Production tax/legal readiness must be confirmed by the merchant and qualified advisers; the application only records configuration and refuses unsafe development tax mode in production.

```text
Cloudflare → Nuxt/Nitro → PostgreSQL-compatible database (Supabase later)
External adapters: Stripe payments · Resend email · R2 media storage
```

Copy `.env.example` to `.env` when configuring future integrations. Never commit credentials.
