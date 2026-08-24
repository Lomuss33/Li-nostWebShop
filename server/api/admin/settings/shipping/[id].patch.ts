import { z } from 'zod'
import { requireRole } from '../../../../utils/admin-auth'
import { withTransaction } from '../../../../utils/db'
const schema = z
  .object({
    name: z.string().trim().min(1).max(120),
    carrierLabel: z.string().max(120),
    enabled: z.boolean(),
    currency: z.enum(['EUR', 'USD', 'CHF']),
    priceMinor: z.number().int().min(0),
    freeShippingThresholdMinor: z.number().int().min(0).nullable(),
    minimumWeightGrams: z.number().int().min(0).nullable(),
    maximumWeightGrams: z.number().int().min(0).nullable(),
    estimatedDaysMin: z.number().int().min(0),
    estimatedDaysMax: z.number().int().min(0),
    trackingSupported: z.boolean(),
  })
  .refine(
    (value) =>
      value.maximumWeightGrams == null ||
      value.minimumWeightGrams == null ||
      value.minimumWeightGrams <= value.maximumWeightGrams,
    { message: 'Minimum weight cannot exceed maximum weight.' },
  )
  .refine((value) => value.estimatedDaysMin <= value.estimatedDaysMax, {
    message: 'Minimum delivery days cannot exceed maximum.',
  })
export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  const parsed = schema.safeParse(await readBody(event))
  if (!id || !parsed.success)
    throw createError({
      statusCode: 400,
      statusMessage: parsed.success
        ? 'Shipping method is required.'
        : parsed.error.issues[0]?.message || 'Invalid shipping method.',
    })
  return withTransaction(async (client) => {
    const row = await client.query(
      'UPDATE shipping_methods SET name=$1,carrier_label=$2,enabled=$3,currency=$4,price_minor=$5,free_shipping_threshold_minor=$6,minimum_weight_grams=$7,maximum_weight_grams=$8,estimated_days_min=$9,estimated_days_max=$10,tracking_supported=$11,updated_at=now() WHERE id=$12 RETURNING id,market_id',
      [
        parsed.data.name,
        parsed.data.carrierLabel,
        parsed.data.enabled,
        parsed.data.currency,
        parsed.data.priceMinor,
        parsed.data.freeShippingThresholdMinor,
        parsed.data.minimumWeightGrams,
        parsed.data.maximumWeightGrams,
        parsed.data.estimatedDaysMin,
        parsed.data.estimatedDaysMax,
        parsed.data.trackingSupported,
        id,
      ],
    )
    if (!row.rowCount)
      throw createError({
        statusCode: 404,
        statusMessage: 'Shipping method not found.',
      })
    await client.query(
      'INSERT INTO admin_activity (admin_user_id,action,entity_type,entity_id,metadata_json) VALUES ($1,$2,$3,$4,$5)',
      [
        admin.id,
        'SHIPPING_METHOD_UPDATED',
        'shipping_method',
        id,
        JSON.stringify({ marketId: row.rows[0].market_id }),
      ],
    )
    return { success: true }
  })
})
