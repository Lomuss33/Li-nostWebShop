import { z } from 'zod'
import { requireAdmin } from '../../../../utils/admin-auth'
import { withTransaction } from '../../../../utils/db'
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const number = getRouterParam(event, 'orderNumber')
  const body = z
    .object({ resolutionNote: z.string().trim().min(2).max(1000) })
    .safeParse(await readBody(event))
  if (!number || !body.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'A resolution note is required.',
    })
  return withTransaction(async (client) => {
    const order = await client.query(
      'SELECT id,requires_review FROM orders WHERE order_number=$1 FOR UPDATE',
      [number],
    )
    if (!order.rowCount)
      throw createError({ statusCode: 404, statusMessage: 'Order not found.' })
    if (!order.rows[0].requires_review)
      throw createError({
        statusCode: 409,
        statusMessage: 'This order does not require review.',
      })
    await client.query(
      'UPDATE orders SET requires_review=false,review_resolved_at=now(),review_resolved_by=$1,review_resolution_note=$2,updated_at=now() WHERE id=$3',
      [admin.id, body.data.resolutionNote, order.rows[0].id],
    )
    await client.query(
      'INSERT INTO admin_activity (admin_user_id,action,entity_type,entity_id,metadata_json) VALUES ($1,$2,$3,$4,$5)',
      [
        admin.id,
        'ORDER_REVIEW_RESOLVED',
        'order',
        order.rows[0].id,
        JSON.stringify({ resolutionNote: body.data.resolutionNote }),
      ],
    )
    return { success: true }
  })
})
