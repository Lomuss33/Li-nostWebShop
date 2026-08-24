import { z } from 'zod'
import { requireRole } from '../../../../../utils/admin-auth'
import { withTransaction } from '../../../../../utils/db'
export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const countryCode = getRouterParam(event, 'countryCode')
  const parsed = z
    .object({
      enabled: z.boolean(),
      onlineCheckout: z.boolean(),
      purchaseRequest: z.boolean(),
      currency: z.enum(['EUR', 'USD', 'CHF']),
      customsMode: z.enum(['NONE', 'DAP', 'DDP']),
    })
    .safeParse(await readBody(event))
  if (!countryCode || !parsed.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid market setting.',
    })
  if (parsed.data.customsMode === 'DDP')
    throw createError({
      statusCode: 422,
      statusMessage: 'DDP requires a verified duty calculation provider.',
    })
  return withTransaction(async (client) => {
    const row = await client.query(
      'UPDATE market_country_settings SET enabled=$1,online_checkout=$2,purchase_request=$3,currency=$4,customs_mode=$5,updated_at=now() WHERE country_code=$6 RETURNING country_code',
      [
        parsed.data.enabled,
        parsed.data.onlineCheckout,
        parsed.data.purchaseRequest,
        parsed.data.currency,
        parsed.data.customsMode,
        countryCode.toUpperCase(),
      ],
    )
    if (!row.rowCount)
      throw createError({
        statusCode: 404,
        statusMessage: 'Country setting not found.',
      })
    await client.query(
      'INSERT INTO admin_activity (admin_user_id,action,entity_type,metadata_json) VALUES ($1,$2,$3,$4)',
      [
        admin.id,
        'MARKET_COUNTRY_UPDATED',
        'market_country',
        JSON.stringify({ countryCode: countryCode.toUpperCase() }),
      ],
    )
    return { success: true }
  })
})
