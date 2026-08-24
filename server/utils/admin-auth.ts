import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { getPool } from './db'
const cookieName = 'licnost_admin_session'
const hash = (value: string) => createHash('sha256').update(value).digest('hex')
export type AdminUser = {
  id: string
  email: string
  role: 'ADMIN' | 'OPERATOR'
}
export const requireAdmin = async (event: Parameters<typeof getCookie>[0]) => {
  const token = getCookie(event, cookieName)
  if (!token)
    throw createError({
      statusCode: 401,
      statusMessage: 'Administrator authentication required.',
    })
  const result = await getPool().query(
    'SELECT u.id,u.email,u.role FROM admin_sessions s JOIN admin_users u ON u.id=s.admin_user_id WHERE s.token_hash=$1 AND s.expires_at>now() AND u.active=true',
    [hash(token)],
  )
  if (!result.rows[0])
    throw createError({
      statusCode: 401,
      statusMessage: 'Administrator session expired.',
    })
  return result.rows[0] as AdminUser
}
export const requireRole = async (
  event: Parameters<typeof getCookie>[0],
  roles: AdminUser['role'][],
) => {
  const user = await requireAdmin(event)
  if (!roles.includes(user.role))
    throw createError({
      statusCode: 403,
      statusMessage: 'Insufficient administrator permissions.',
    })
  return user
}
export const loginAdmin = async (
  event: Parameters<typeof getCookie>[0],
  email: string,
  token: string,
) => {
  const expected = process.env.ADMIN_BOOTSTRAP_TOKEN
  if (
    !expected ||
    !token ||
    token.length !== expected.length ||
    !timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  )
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid administrator credentials.',
    })
  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    const user = await client.query(
      "INSERT INTO admin_users (email,role) VALUES ($1,'ADMIN') ON CONFLICT (email) DO UPDATE SET active=true,updated_at=now() RETURNING id,email,role",
      [email],
    )
    const raw = randomBytes(32).toString('hex')
    await client.query(
      "INSERT INTO admin_sessions (admin_user_id,token_hash,expires_at) VALUES ($1,$2,now()+interval '12 hours')",
      [user.rows[0].id, hash(raw)],
    )
    await client.query('COMMIT')
    setCookie(event, cookieName, raw, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 12,
      path: '/',
    })
    return user.rows[0] as AdminUser
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
export const logoutAdmin = async (event: Parameters<typeof getCookie>[0]) => {
  const token = getCookie(event, cookieName)
  if (token)
    await getPool().query('DELETE FROM admin_sessions WHERE token_hash=$1', [
      hash(token),
    ])
  deleteCookie(event, cookieName, { path: '/' })
}
