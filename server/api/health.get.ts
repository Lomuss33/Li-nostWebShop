import { getPool } from '../utils/db'
export default defineEventHandler(async (event) => {
  try {
    await getPool().query('SELECT 1')
    return { status: 'ok', database: 'ok' }
  } catch {
    setResponseStatus(event, 503)
    return { status: 'error', database: 'unavailable' }
  }
})
