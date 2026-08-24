import { z } from 'zod'
import { requireRole } from '../../../../utils/admin-auth'
import { withTransaction } from '../../../../utils/db'
const transitions: Record<string, string[]> = {
  UNFULFILLED: ['PICKING'],
  PICKING: ['PACKED'],
  PACKED: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['RETURNED'],
}
export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN', 'OPERATOR'])
  const input = z
    .object({
      status: z.enum(['PICKING', 'PACKED', 'SHIPPED', 'DELIVERED', 'RETURNED']),
      carrier: z.string().max(40).optional(),
      trackingNumber: z.string().max(120).optional(),
      trackingUrl: z.string().url().startsWith('https://').optional(),
    })
    .safeParse(await readBody(event))
  if (!input.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid fulfillment update.',
    })
  return withTransaction(async (client) => {
    const row = await client.query(
      'SELECT * FROM orders WHERE order_number=$1 FOR UPDATE',
      [getRouterParam(event, 'orderNumber')],
    )
    if (!row.rows[0])
      throw createError({ statusCode: 404, statusMessage: 'Order not found.' })
    const order = row.rows[0]
    if (order.payment_status !== 'PAID')
      throw createError({
        statusCode: 409,
        statusMessage: 'Only paid orders can enter fulfillment.',
      })
    if (
      !(transitions[order.fulfillment_status] || []).includes(input.data.status)
    )
      throw createError({
        statusCode: 409,
        statusMessage: 'This fulfillment transition is not allowed.',
      })
    await client.query(
      "UPDATE orders SET fulfillment_status=$1,carrier=COALESCE($2,carrier),tracking_number=COALESCE($3,tracking_number),tracking_url=COALESCE($4,tracking_url),shipped_at=CASE WHEN $1='SHIPPED' THEN now() ELSE shipped_at END,updated_at=now() WHERE id=$5",
      [
        input.data.status,
        input.data.carrier || null,
        input.data.trackingNumber || null,
        input.data.trackingUrl || null,
        order.id,
      ],
    )
    if (input.data.status === 'SHIPPED')
      await client.query(
        "INSERT INTO outbox_events (event_type,aggregate_type,aggregate_id,payload_json) VALUES ('ORDER_SHIPPED','ORDER',$1,$2) ON CONFLICT DO NOTHING",
        [order.id, JSON.stringify({ orderNumber: order.order_number })],
      )
    await client.query(
      'INSERT INTO admin_activity (admin_user_id,action,entity_type,entity_id,metadata_json) VALUES ($1,$2,$3,$4,$5)',
      [
        admin.id,
        'ORDER_FULFILLMENT_CHANGED',
        'ORDER',
        order.id,
        JSON.stringify({
          from: order.fulfillment_status,
          to: input.data.status,
        }),
      ],
    )
    return { success: true }
  })
})
