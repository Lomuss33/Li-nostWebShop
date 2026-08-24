import { requireAdmin } from '../../../utils/admin-auth'
import { getPool } from '../../../utils/db'
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const number = getRouterParam(event, 'requestNumber')
  const result = await getPool().query(
    'SELECT * FROM purchase_requests WHERE request_number=$1',
    [number],
  )
  if (!result.rows[0])
    throw createError({ statusCode: 404, statusMessage: 'Request not found.' })
  const [items, notes] = await Promise.all([
    getPool().query(
      'SELECT * FROM purchase_request_items WHERE purchase_request_id=$1 ORDER BY created_at',
      [result.rows[0].id],
    ),
    getPool().query(
      'SELECT n.*,u.email AS admin_email FROM purchase_request_notes n JOIN admin_users u ON u.id=n.admin_user_id WHERE purchase_request_id=$1 ORDER BY n.created_at DESC',
      [result.rows[0].id],
    ),
  ])
  return { request: result.rows[0], items: items.rows, notes: notes.rows }
})
