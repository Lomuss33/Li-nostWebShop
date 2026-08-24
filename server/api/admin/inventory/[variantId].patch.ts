import { z } from 'zod'
import { requireRole } from '../../../utils/admin-auth'
import { withTransaction } from '../../../utils/db'

const schema = z.object({
  quantityDelta: z
    .number()
    .int()
    .min(-100000)
    .max(100000)
    .refine((value) => value !== 0),
  type: z.enum(['MANUAL_CORRECTION', 'RESTOCK', 'DAMAGE', 'RETURN']),
  reason: z.string().trim().min(2).max(500),
})

export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const input = schema.safeParse(await readBody(event))
  if (!input.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid inventory adjustment.',
    })
  const variantId = getRouterParam(event, 'variantId')
  if (!variantId)
    throw createError({
      statusCode: 400,
      statusMessage: 'Variant is required.',
    })
  try {
    return await withTransaction(async (client) => {
      const variant = await client.query(
        'SELECT id,stock FROM product_variants WHERE id=$1 FOR UPDATE',
        [variantId],
      )
      if (!variant.rowCount)
        throw createError({
          statusCode: 404,
          statusMessage: 'Variant not found.',
        })
      const nextStock = Number(variant.rows[0].stock) + input.data.quantityDelta
      if (nextStock < 0)
        throw createError({
          statusCode: 409,
          statusMessage: 'Stock cannot become negative.',
        })
      await client.query(
        'UPDATE product_variants SET stock=$1,updated_at=now() WHERE id=$2',
        [nextStock, variantId],
      )
      await client.query(
        'INSERT INTO inventory_adjustments (variant_id,admin_user_id,type,quantity_delta,reason) VALUES ($1,$2,$3,$4,$5)',
        [
          variantId,
          admin.id,
          input.data.type,
          input.data.quantityDelta,
          input.data.reason,
        ],
      )
      await client.query(
        'INSERT INTO admin_activity (admin_user_id,action,entity_type,entity_id,metadata_json) VALUES ($1,$2,$3,$4,$5)',
        [
          admin.id,
          'INVENTORY_ADJUSTED',
          'product_variant',
          variantId,
          JSON.stringify({
            quantityDelta: input.data.quantityDelta,
            type: input.data.type,
          }),
        ],
      )
      return { success: true, stock: nextStock }
    })
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'Inventory adjustment failed.',
    })
  }
})
