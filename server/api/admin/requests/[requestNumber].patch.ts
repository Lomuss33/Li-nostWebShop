import { z } from 'zod'
import { requireAdmin } from '../../../utils/admin-auth'
import { withTransaction } from '../../../utils/db'
const transitions: Record<string, string[]> = {
  NEW: ['REVIEWING', 'DECLINED', 'CANCELLED'],
  REVIEWING: ['CONTACTED', 'WAITING_FOR_CUSTOMER', 'DECLINED', 'CANCELLED'],
  CONTACTED: [
    'WAITING_FOR_CUSTOMER',
    'PAYMENT_LINK_SENT',
    'DECLINED',
    'CANCELLED',
  ],
  WAITING_FOR_CUSTOMER: [
    'CONTACTED',
    'PAYMENT_LINK_SENT',
    'EXPIRED',
    'CANCELLED',
  ],
  PAYMENT_LINK_SENT: ['CONVERTED_TO_ORDER', 'EXPIRED', 'CANCELLED'],
}
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const input = z
    .object({ status: z.string(), note: z.string().max(2000).optional() })
    .safeParse(await readBody(event))
  if (!input.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request workflow input.',
    })
  return withTransaction(async (client) => {
    const current = await client.query(
      'SELECT id,status FROM purchase_requests WHERE request_number=$1 FOR UPDATE',
      [getRouterParam(event, 'requestNumber')],
    )
    if (!current.rows[0])
      throw createError({
        statusCode: 404,
        statusMessage: 'Request not found.',
      })
    if (
      !(transitions[current.rows[0].status] || []).includes(input.data.status)
    )
      throw createError({
        statusCode: 409,
        statusMessage: 'This request status transition is not allowed.',
      })
    await client.query(
      'UPDATE purchase_requests SET status=$1,updated_at=now() WHERE id=$2',
      [input.data.status, current.rows[0].id],
    )
    if (input.data.note)
      await client.query(
        'INSERT INTO purchase_request_notes (purchase_request_id,admin_user_id,note) VALUES ($1,$2,$3)',
        [current.rows[0].id, admin.id, input.data.note],
      )
    await client.query(
      'INSERT INTO admin_activity (admin_user_id,action,entity_type,entity_id,metadata_json) VALUES ($1,$2,$3,$4,$5)',
      [
        admin.id,
        'REQUEST_STATUS_CHANGED',
        'PURCHASE_REQUEST',
        current.rows[0].id,
        JSON.stringify({ from: current.rows[0].status, to: input.data.status }),
      ],
    )
    return { success: true }
  })
})
