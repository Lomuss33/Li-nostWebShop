import { getPool } from '../../server/utils/db'
import { products } from '../../server/repositories/product-seed'
const pool = getPool()
const client = await pool.connect()
try {
  await client.query('BEGIN')
  for (const p of products) {
    const product = await client.query(
      `INSERT INTO products (slug, name, short_description, description, category, collection, material, fit, care, featured, is_new, active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true) ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, short_description=EXCLUDED.short_description, description=EXCLUDED.description, category=EXCLUDED.category, collection=EXCLUDED.collection, material=EXCLUDED.material, fit=EXCLUDED.fit, care=EXCLUDED.care, featured=EXCLUDED.featured, is_new=EXCLUDED.is_new, active=true, updated_at=now() RETURNING id`,
      [
        p.slug,
        p.name,
        p.description,
        p.description,
        p.category,
        p.collection,
        p.material,
        p.fit,
        p.care,
        p.featured ?? false,
        p.isNew ?? false,
      ],
    )
    const id = product.rows[0].id
    await client.query(
      'DELETE FROM product_variants WHERE product_id=$1 AND sku <> ALL($2::text[])',
      [id, p.variants.map((v) => v.sku)],
    )
    for (const v of p.variants) {
      const salePrice =
        v.salePrice?.amount ??
        (p.onSale ? Math.max(0, v.price.amount - 500) : null)
      await client.query(
        `INSERT INTO product_variants (product_id, sku, color, size, price_minor, sale_price_minor, currency, stock, active, weight_grams) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (sku) DO UPDATE SET stock=EXCLUDED.stock, price_minor=EXCLUDED.price_minor, sale_price_minor=EXCLUDED.sale_price_minor, updated_at=now()`,
        [
          id,
          v.sku,
          v.color,
          v.size,
          v.price.amount,
          salePrice,
          v.price.currency,
          v.stock,
          v.active,
          v.weightGrams,
        ],
      )
    }
    for (const image of p.images)
      await client.query(
        `INSERT INTO product_images (product_id, url_or_path, alt_text, position) VALUES ($1,$2,$3,$4) ON CONFLICT (product_id, position) DO UPDATE SET url_or_path=EXCLUDED.url_or_path, alt_text=EXCLUDED.alt_text`,
        [id, image.url, image.alt, image.position],
      )
    await client.query(
      'DELETE FROM product_images WHERE product_id=$1 AND position >= $2',
      [id, p.images.length],
    )
  }
  await client.query('COMMIT')
  console.log(`Seeded ${products.length} products.`)
} catch (error) {
  await client.query('ROLLBACK')
  throw error
} finally {
  client.release()
  await pool.end()
}
