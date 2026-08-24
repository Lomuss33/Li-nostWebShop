import { z } from 'zod'
import { requireAdmin } from '../../../../utils/admin-auth'
import { withTransaction } from '../../../../utils/db'
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const number = getRouterParam(event, 'requestNumber')
  const body = z
    .object({ note: z.string().trim().min(1).max(2000) })
    .safeParse(await readBody(event))
  if (!number || !body.success)
    throw createError({ statusCode: 400, statusMessage: 'A note is required.' })
  return withTransaction(async (client) => {
    const request = await client.query(
      'SELECT id FROM purchase_requests WHERE request_number=$1',
      [number],
    )
    if (!request.rowCount)
      throw createError({
        statusCode: 404,
        statusMessage: 'Request not found.',
      })
    await client.query(
      'INSERT INTO purchase_request_notes (purchase_request_id,admin_user_id,note) VALUES ($1,$2,$3)',
      [request.rows[0].id, admin.id, body.data.note],
    )
    return { success: true }
  })
})
