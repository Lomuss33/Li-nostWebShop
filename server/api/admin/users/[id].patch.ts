import { z } from 'zod'
import { requireRole } from '../../../utils/admin-auth'
import { withTransaction } from '../../../utils/db'
export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  const parsed = z
    .object({ role: z.enum(['ADMIN', 'OPERATOR']), active: z.boolean() })
    .safeParse(await readBody(event))
  if (!id || !parsed.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid administrator update.',
    })
  return withTransaction(async (client) => {
    const current = await client.query(
      'SELECT id,email,role,active FROM admin_users WHERE id=$1 FOR UPDATE',
      [id],
    )
    if (!current.rowCount)
      throw createError({
        statusCode: 404,
        statusMessage: 'Administrator not found.',
      })
    const demoting =
      current.rows[0].role === 'ADMIN' &&
      (!parsed.data.active || parsed.data.role !== 'ADMIN')
    if (demoting) {
      const count = await client.query(
        "SELECT count(*)::int AS count FROM admin_users WHERE role='ADMIN' AND active=true AND id<>$1",
        [id],
      )
      if (count.rows[0].count < 1)
        throw createError({
          statusCode: 409,
          statusMessage: 'At least one active ADMIN must remain.',
        })
    }
    await client.query(
      'UPDATE admin_users SET role=$1,active=$2,updated_at=now() WHERE id=$3',
      [parsed.data.role, parsed.data.active, id],
    )
    if (!parsed.data.active)
      await client.query('DELETE FROM admin_sessions WHERE admin_user_id=$1', [
        id,
      ])
    await client.query(
      'INSERT INTO admin_activity (admin_user_id,action,entity_type,entity_id,metadata_json) VALUES ($1,$2,$3,$4,$5)',
      [
        admin.id,
        parsed.data.active ? 'ADMIN_ROLE_CHANGED' : 'ADMIN_USER_DISABLED',
        'admin_user',
        id,
        JSON.stringify({ role: parsed.data.role, active: parsed.data.active }),
      ],
    )
    return { success: true }
  })
})
