# Production deployment

Ličnost is intentionally deployed as one Nuxt/Nitro application with standard PostgreSQL. A managed Node deployment behind Cloudflare DNS/CDN is the default target for this phase: it preserves the existing `pg` pool, Stripe Node SDK, raw webhook handling, and portable outbox worker without forcing an edge runtime. Cloudflare Workers should only be selected after those runtime dependencies are verified against the chosen adapter.

## Required configuration

Set `DATABASE_URL` to a TLS-enabled PostgreSQL connection string. Use a provider pooler connection string where the hosting platform is short-lived/serverless, and keep the application pool small. Run migrations once during deployment, never from a request handler:

```bash
npm ci
npm run db:migrate
npm run build
```

Required production decisions/configuration include:

- `NUXT_PUBLIC_SITE_URL` must be the HTTPS canonical domain.
- Stripe live secret and webhook signing secret must be configured only in the platform secret manager.
- Resend must use a verified Ličnost sending domain with provider-generated SPF/DKIM records; publish a deliberate DMARC policy after reviewing reporting requirements.
- `TAX_MODE` must not be `DEVELOPMENT_ZERO` in production. `MANUAL_CONFIG` is technical groundwork, not tax advice or VAT compliance.
- Shipping rates are database records and must be confirmed by the operator (`SHIPPING_CONFIGURATION_CONFIRMED=true`) after carrier/business review.
- Merchant legal identity must be entered in `merchant_settings`; placeholders keep readiness blocked.

## Operations

Run `npm run outbox:process` from a portable scheduled job at least once per minute. Monitor `/api/health`, Stripe webhook failures, permanently failed outbox/email deliveries, and orders requiring review. Keep PostgreSQL managed daily backups plus an independent periodic `pg_dump` in a separate destination.

For restore drills, create a disposable PostgreSQL database, restore a dump, run migrations/checks, and verify products, orders, payments, outbox events, and inventory constraints before considering the procedure proven. Never test restoration by overwriting production.

Cloudflare may provide DNS, TLS, CDN, WAF, and privacy-conscious web analytics. Do not place database or provider secrets in public runtime configuration. Cash on Delivery is unsupported.
