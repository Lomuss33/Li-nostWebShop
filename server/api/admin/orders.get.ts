import { requireAdmin } from '../../utils/admin-auth'
import { getPool } from '../../utils/db'
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const page = Math.max(1, Number(query.page || 1))
  const size = Math.min(100, Math.max(1, Number(query.pageSize || 25)))
  const values: unknown[] = []
  const where = ['1=1']
  const add = (sql: string, value: unknown) => {
    values.push(value)
    where.push(sql.replace('?', `$${values.length}`))
  }
  if (typeof query.paymentStatus === 'string')
    add('o.payment_status=?', query.paymentStatus)
  if (typeof query.fulfillmentStatus === 'string')
    add('o.fulfillment_status=?', query.fulfillmentStatus)
  if (typeof query.search === 'string' && query.search.trim()) {
    values.push(`%${query.search.trim()}%`)
    const parameter = `$${values.length}`
    where.push(
      `(o.order_number ILIKE ${parameter} OR o.email ILIKE ${parameter})`,
    )
  }
  const count = await getPool().query(
    `SELECT count(*)::int AS total FROM orders o WHERE ${where.join(' AND ')}`,
    values,
  )
  const rows = await getPool().query(
    `SELECT o.id,o.order_number,o.created_at,o.email,o.shipping_country_code,o.grand_total_minor,o.currency,o.order_status,o.payment_status,o.fulfillment_status,o.requires_review FROM orders o WHERE ${where.join(' AND ')} ORDER BY o.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, size, (page - 1) * size],
  )
  return { items: rows.rows, page, pageSize: size, total: count.rows[0].total }
})
