import { requireRole } from '../../utils/admin-auth'
import { getPool } from '../../utils/db'
export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const result = await getPool().query(
    'SELECT id,email,role,active,created_at,updated_at FROM admin_users ORDER BY created_at',
  )
  return { users: result.rows }
})
