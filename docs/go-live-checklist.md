# Ličnost go-live checklist

These are deliberately unchecked. Technical support does not constitute legal, tax, carrier, or provider approval.

- [ ] Production domain and HTTPS active
- [ ] Canonical `NUXT_PUBLIC_SITE_URL` configured
- [ ] PostgreSQL production database uses TLS/pooling
- [ ] Managed daily backup configured
- [ ] Independent `pg_dump` backup configured
- [ ] Restore procedure tested against a disposable database
- [ ] Stripe LIVE account and production webhook configured
- [ ] Stripe test flow verified before live launch
- [ ] Resend sending domain verified
- [ ] SPF/DKIM/DMARC reviewed
- [ ] Shipping prices and delivery ranges confirmed
- [ ] Germany checkout tested
- [ ] EU checkout tested
- [ ] Balkan request-only/customs communication reviewed
- [ ] Switzerland/USA enabled only after pricing and shipping confirmation
- [ ] VAT/tax configuration reviewed with qualified adviser
- [ ] Impressum/merchant identity complete
- [ ] Privacy policy reviewed
- [ ] Terms and withdrawal/returns information reviewed
- [ ] Cookie/analytics consent reviewed for the actual tools enabled
- [ ] Admin readiness page has no BLOCKED items
- [ ] Outbox scheduler and failed-delivery monitoring active
- [ ] `/api/health` monitored externally
- [ ] No test keys, console email mode, localhost URLs, or placeholder legal data in production
