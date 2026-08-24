import { requireAdmin } from '../../utils/admin-auth'
import { getPool } from '../../utils/db'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const page = Math.max(1, Number(query.page || 1))
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize || 25)))
  const search = typeof query.search === 'string' ? query.search.trim() : ''
  const values: unknown[] = []
  let where = '1=1'
  if (search) {
    values.push(`%${search}%`)
    where += ` AND (p.name ILIKE $${values.length} OR p.slug ILIKE $${values.length} OR EXISTS (SELECT 1 FROM product_variants sv WHERE sv.product_id=p.id AND sv.sku ILIKE $${values.length}))`
  }
  const count = await getPool().query(
    `SELECT count(*)::int AS total FROM products p WHERE ${where}`,
    values,
  )
  const offset = (page - 1) * pageSize
  const rows = await getPool().query(
    `SELECT p.id,p.name,p.slug,p.category,p.collection,p.active,p.featured,p.is_new,
      count(v.id)::int AS variant_count, coalesce(sum(v.stock),0)::int AS stock,
      min(v.price_minor)::int AS min_price, max(coalesce(v.sale_price_minor,v.price_minor))::int AS max_price
     FROM products p LEFT JOIN product_variants v ON v.product_id=p.id
     WHERE ${where} GROUP BY p.id ORDER BY p.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, pageSize, offset],
  )
  return { items: rows.rows, total: count.rows[0].total, page, pageSize }
})
