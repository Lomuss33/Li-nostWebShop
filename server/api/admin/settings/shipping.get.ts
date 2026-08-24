import { requireRole } from '../../../utils/admin-auth'
import { getPool } from '../../../utils/db'
export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const [methods, countries] = await Promise.all([
    getPool().query(
      'SELECT * FROM shipping_methods ORDER BY market_id,price_minor',
    ),
    getPool().query(
      'SELECT * FROM market_country_settings ORDER BY market_id,country_code',
    ),
  ])
  return { methods: methods.rows, countries: countries.rows }
})
