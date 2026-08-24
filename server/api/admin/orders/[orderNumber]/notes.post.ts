import { z } from 'zod'
import { requireAdmin } from '../../../../utils/admin-auth'
import { withTransaction } from '../../../../utils/db'
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const number = getRouterParam(event, 'orderNumber')
  const body = z
    .object({ note: z.string().trim().min(1).max(2000) })
    .safeParse(await readBody(event))
  if (!number || !body.success)
    throw createError({ statusCode: 400, statusMessage: 'A note is required.' })
  return withTransaction(async (client) => {
    const order = await client.query(
      'SELECT id FROM orders WHERE order_number=$1',
      [number],
    )
    if (!order.rowCount)
      throw createError({ statusCode: 404, statusMessage: 'Order not found.' })
    await client.query(
      'INSERT INTO order_notes (order_id,admin_user_id,note) VALUES ($1,$2,$3)',
      [order.rows[0].id, admin.id, body.data.note],
    )
    return { success: true }
  })
})
