import { requireRole } from '../../../../utils/admin-auth'
import { withTransaction } from '../../../../utils/db'
export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN', 'OPERATOR'])
  const number = getRouterParam(event, 'orderNumber')
  if (!number)
    throw createError({
      statusCode: 400,
      statusMessage: 'Order number is required.',
    })
  return withTransaction(async (client) => {
    const order = await client.query(
      'SELECT id,order_status,payment_status,fulfillment_status FROM orders WHERE order_number=$1 FOR UPDATE',
      [number],
    )
    if (!order.rowCount)
      throw createError({ statusCode: 404, statusMessage: 'Order not found.' })
    const row = order.rows[0]
    if (row.payment_status === 'PAID')
      throw createError({
        statusCode: 409,
        statusMessage:
          'Paid orders require refund handling before cancellation.',
      })
    if (
      row.order_status !== 'PENDING_PAYMENT' ||
      row.fulfillment_status !== 'UNFULFILLED'
    )
      throw createError({
        statusCode: 409,
        statusMessage: 'Only unpaid pending orders can be cancelled.',
      })
    await client.query(
      "UPDATE orders SET order_status='CANCELLED',updated_at=now() WHERE id=$1",
      [row.id],
    )
    await client.query(
      'INSERT INTO admin_activity (admin_user_id,action,entity_type,entity_id,metadata_json) VALUES ($1,$2,$3,$4,$5)',
      [admin.id, 'ORDER_CANCELLED', 'order', row.id, '{}'],
    )
    return { success: true }
  })
})
