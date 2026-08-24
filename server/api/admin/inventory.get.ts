import { requireAdmin } from '../../utils/admin-auth'
import { getPool } from '../../utils/db'
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const threshold = Number(process.env.LOW_STOCK_THRESHOLD || 5)
  const values: unknown[] = []
  const where = ['v.active=true']
  if (query.status === 'low') where.push(`v.stock <= ${threshold}`)
  if (query.status === 'out') where.push('v.stock=0')
  if (typeof query.search === 'string' && query.search.trim()) {
    values.push(`%${query.search.trim()}%`)
    where.push(
      `(v.sku ILIKE $${values.length} OR p.name ILIKE $${values.length})`,
    )
  }
  const result = await getPool().query(
    `SELECT v.id,v.sku,v.color,v.size,v.stock,v.active,p.name AS product_name,p.slug FROM product_variants v JOIN products p ON p.id=v.product_id WHERE ${where.join(' AND ')} ORDER BY v.stock ASC,v.sku LIMIT 200`,
    values,
  )
  return { threshold, items: result.rows }
})
