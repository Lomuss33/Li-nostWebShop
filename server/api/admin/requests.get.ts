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
  if (typeof query.status === 'string') add('pr.status=?', query.status)
  if (typeof query.search === 'string' && query.search.trim()) {
    values.push(`%${query.search.trim()}%`)
    const parameter = `$${values.length}`
    where.push(
      `(pr.request_number ILIKE ${parameter} OR pr.email ILIKE ${parameter} OR (pr.first_name || ' ' || pr.last_name) ILIKE ${parameter})`,
    )
  }
  const count = await getPool().query(
    `SELECT count(*)::int AS total FROM purchase_requests pr WHERE ${where.join(' AND ')}`,
    values,
  )
  const offset = (page - 1) * size
  const rows = await getPool().query(
    `SELECT pr.id,pr.request_number,pr.created_at,pr.first_name,pr.last_name,pr.email,pr.country_code,pr.preferred_contact_method,pr.subtotal_minor,pr.currency,pr.status,count(pri.id)::int AS item_count FROM purchase_requests pr LEFT JOIN purchase_request_items pri ON pri.purchase_request_id=pr.id WHERE ${where.join(' AND ')} GROUP BY pr.id ORDER BY pr.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, size, offset],
  )
  return { items: rows.rows, page, pageSize: size, total: count.rows[0].total }
})
