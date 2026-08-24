import { z } from 'zod'
import { requireRole } from '../../../utils/admin-auth'
import { withTransaction } from '../../../utils/db'
const schema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  shortDescription: z.string().max(500),
  description: z.string().trim().min(1),
  category: z.string().trim().min(1).max(80),
  collection: z.string().max(120),
  active: z.boolean(),
  featured: z.boolean(),
  isNew: z.boolean(),
  updatedAt: z.string().optional(),
})
export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  const parsed = schema.safeParse(await readBody(event))
  if (!id || !parsed.success)
    throw createError({ statusCode: 400, statusMessage: 'Invalid product.' })
  try {
    return await withTransaction(async (client) => {
      const current = await client.query(
        'SELECT updated_at FROM products WHERE id=$1 FOR UPDATE',
        [id],
      )
      if (!current.rowCount)
        throw createError({
          statusCode: 404,
          statusMessage: 'Product not found.',
        })
      if (
        parsed.data.updatedAt &&
        new Date(parsed.data.updatedAt).getTime() <
          new Date(current.rows[0].updated_at).getTime()
      )
        throw createError({
          statusCode: 409,
          statusMessage: 'This product changed. Reload before saving.',
        })
      await client.query(
        'UPDATE products SET name=$1,slug=$2,short_description=$3,description=$4,category=$5,collection=$6,active=$7,featured=$8,is_new=$9,updated_at=now() WHERE id=$10',
        [
          parsed.data.name,
          parsed.data.slug,
          parsed.data.shortDescription,
          parsed.data.description,
          parsed.data.category,
          parsed.data.collection,
          parsed.data.active,
          parsed.data.featured,
          parsed.data.isNew,
          id,
        ],
      )
      await client.query(
        'INSERT INTO admin_activity (admin_user_id,action,entity_type,entity_id,metadata_json) VALUES ($1,$2,$3,$4,$5)',
        [
          admin.id,
          parsed.data.active ? 'PRODUCT_UPDATED' : 'PRODUCT_ARCHIVED',
          'product',
          id,
          JSON.stringify({
            fields: [
              'name',
              'slug',
              'description',
              'category',
              'collection',
              'active',
              'featured',
              'is_new',
            ],
          }),
        ],
      )
      return { success: true }
    })
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    if (error instanceof Error && error.message.includes('duplicate'))
      throw createError({
        statusCode: 409,
        statusMessage: 'This slug is already in use.',
      })
    throw createError({
      statusCode: 500,
      statusMessage: 'Product could not be updated.',
    })
  }
})
