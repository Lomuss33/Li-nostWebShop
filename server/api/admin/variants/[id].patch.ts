import { z } from 'zod'
import { requireRole } from '../../../utils/admin-auth'
import { withTransaction } from '../../../utils/db'
const schema = z
  .object({
    sku: z.string().trim().min(1).max(80),
    color: z.string().trim().min(1).max(80),
    size: z.string().trim().min(1).max(20),
    priceMinor: z.number().int().min(0),
    salePriceMinor: z.number().int().min(0).nullable(),
    currency: z.enum(['EUR', 'USD']),
    weightGrams: z.number().int().min(0).nullable(),
    active: z.boolean(),
  })
  .refine((v) => v.salePriceMinor == null || v.salePriceMinor < v.priceMinor, {
    message: 'Sale price must be lower than regular price.',
  })
export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  const parsed = schema.safeParse(await readBody(event))
  if (!id || !parsed.success)
    throw createError({ statusCode: 400, statusMessage: 'Invalid variant.' })
  try {
    return await withTransaction(async (client) => {
      const current = await client.query(
        'SELECT product_id FROM product_variants WHERE id=$1 FOR UPDATE',
        [id],
      )
      if (!current.rowCount)
        throw createError({
          statusCode: 404,
          statusMessage: 'Variant not found.',
        })
      await client.query(
        'UPDATE product_variants SET sku=$1,color=$2,size=$3,price_minor=$4,sale_price_minor=$5,currency=$6,weight_grams=$7,active=$8,updated_at=now() WHERE id=$9',
        [
          parsed.data.sku,
          parsed.data.color,
          parsed.data.size,
          parsed.data.priceMinor,
          parsed.data.salePriceMinor,
          parsed.data.currency,
          parsed.data.weightGrams,
          parsed.data.active,
          id,
        ],
      )
      await client.query(
        'INSERT INTO admin_activity (admin_user_id,action,entity_type,entity_id,metadata_json) VALUES ($1,$2,$3,$4,$5)',
        [
          admin.id,
          parsed.data.active ? 'VARIANT_UPDATED' : 'VARIANT_ARCHIVED',
          'product_variant',
          id,
          JSON.stringify({ sku: parsed.data.sku }),
        ],
      )
      return { success: true }
    })
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    if (error instanceof Error && error.message.includes('duplicate'))
      throw createError({
        statusCode: 409,
        statusMessage: 'SKU or color/size combination already exists.',
      })
    throw createError({
      statusCode: 500,
      statusMessage: 'Variant could not be updated.',
    })
  }
})
