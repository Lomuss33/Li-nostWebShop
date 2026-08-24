# Backup and restore drill

Use a TLS-capable PostgreSQL client and a secret-managed connection string. Never commit credentials or place them in shell history.

## Backup

```bash
pg_dump --format=custom --file=licnost-staging-$(date +%Y%m%d).dump "$DATABASE_URL"
```

Encrypt the dump and store it in a separate backup destination with retention appropriate to the business. Managed daily backups remain the primary recovery mechanism; this dump is an independent recovery copy.

## Restore drill

Create a disposable empty PostgreSQL database and restore without touching production:

```bash
createdb licnost_restore_check
pg_restore --exit-on-error --dbname=licnost_restore_check licnost-staging-YYYYMMDD.dump
psql licnost_restore_check -c "SELECT count(*) FROM products; SELECT count(*) FROM product_variants;"
dropdb licnost_restore_check
```

Verify products, variants, purchase requests, orders, payments, admin tables, outbox events, foreign keys, and inventory constraints. Record the date, dump location, restore result, and operator separately from the dump itself. The local staging drill used a disposable restore database and verified `8` products, `40` variants, and the admin schema.
