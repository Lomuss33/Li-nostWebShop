import { requireAdmin } from '../../../utils/admin-auth'
import { getPool } from '../../../utils/db'
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const number = getRouterParam(event, 'orderNumber')
  const order = await getPool().query(
    'SELECT * FROM orders WHERE order_number=$1',
    [number],
  )
  if (!order.rows[0])
    throw createError({ statusCode: 404, statusMessage: 'Order not found.' })
  const [items, payments, notes] = await Promise.all([
    getPool().query(
      'SELECT * FROM order_items WHERE order_id=$1 ORDER BY created_at',
      [order.rows[0].id],
    ),
    getPool().query(
      'SELECT id,provider,provider_payment_id,provider_checkout_session_id,amount_minor,currency,status,paid_at FROM payments WHERE order_id=$1 ORDER BY created_at DESC',
      [order.rows[0].id],
    ),
    getPool().query(
      'SELECT n.*,u.email AS admin_email FROM order_notes n JOIN admin_users u ON u.id=n.admin_user_id WHERE order_id=$1 ORDER BY n.created_at DESC',
      [order.rows[0].id],
    ),
  ])
  return {
    order: order.rows[0],
    items: items.rows,
    payments: payments.rows,
    notes: notes.rows,
  }
})
