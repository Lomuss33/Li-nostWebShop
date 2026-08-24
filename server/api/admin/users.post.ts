import { z } from 'zod'
import { requireRole } from '../../utils/admin-auth'
import { withTransaction } from '../../utils/db'
export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const parsed = z
    .object({ email: z.string().email(), role: z.enum(['ADMIN', 'OPERATOR']) })
    .safeParse(await readBody(event))
  if (!parsed.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Valid email and role are required.',
    })
  try {
    return await withTransaction(async (client) => {
      const row = await client.query(
        'INSERT INTO admin_users (email,role) VALUES ($1,$2) RETURNING id,email,role,active,created_at',
        [parsed.data.email.toLowerCase(), parsed.data.role],
      )
      await client.query(
        'INSERT INTO admin_activity (admin_user_id,action,entity_type,entity_id,metadata_json) VALUES ($1,$2,$3,$4,$5)',
        [
          admin.id,
          'ADMIN_USER_CREATED',
          'admin_user',
          row.rows[0].id,
          JSON.stringify({ email: parsed.data.email, role: parsed.data.role }),
        ],
      )
      return { user: row.rows[0] }
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate'))
      throw createError({
        statusCode: 409,
        statusMessage: 'An administrator with this email already exists.',
      })
    throw error
  }
})
