import { z } from 'zod'
import { requireRole } from '../../../../utils/admin-auth'
import { withTransaction } from '../../../../utils/db'
const schema = z
  .object({
    sku: z.string().trim().min(1).max(80),
    color: z.string().trim().min(1).max(80),
    size: z.string().trim().min(1).max(20),
    priceMinor: z.number().int().min(0),
    salePriceMinor: z.number().int().min(0).nullable().default(null),
    currency: z.enum(['EUR', 'USD']),
    stock: z.number().int().min(0).default(0),
    weightGrams: z.number().int().min(0).nullable().default(null),
    active: z.boolean().default(true),
  })
  .refine((v) => v.salePriceMinor == null || v.salePriceMinor < v.priceMinor, {
    message: 'Sale price must be lower than regular price.',
  })
export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const productId = getRouterParam(event, 'id')
  const parsed = schema.safeParse(await readBody(event))
  if (!productId || !parsed.success)
    throw createError({
      statusCode: 400,
      statusMessage: parsed.success
        ? 'Product is required.'
        : 'Invalid variant.',
    })
  try {
    return await withTransaction(async (client) => {
      const p = await client.query(
        'SELECT id FROM products WHERE id=$1 FOR UPDATE',
        [productId],
      )
      if (!p.rowCount)
        throw createError({
          statusCode: 404,
          statusMessage: 'Product not found.',
        })
      const v = await client.query(
        'INSERT INTO product_variants (product_id,sku,color,size,price_minor,sale_price_minor,currency,stock,weight_grams,active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id',
        [
          productId,
          parsed.data.sku,
          parsed.data.color,
          parsed.data.size,
          parsed.data.priceMinor,
          parsed.data.salePriceMinor,
          parsed.data.currency,
          parsed.data.stock,
          parsed.data.weightGrams,
          parsed.data.active,
        ],
      )
      await client.query(
        'INSERT INTO admin_activity (admin_user_id,action,entity_type,entity_id,metadata_json) VALUES ($1,$2,$3,$4,$5)',
        [
          admin.id,
          'VARIANT_CREATED',
          'product_variant',
          v.rows[0].id,
          JSON.stringify({ sku: parsed.data.sku }),
        ],
      )
      return { id: v.rows[0].id }
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
      statusMessage: 'Variant could not be created.',
    })
  }
})
