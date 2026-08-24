import { z } from 'zod'
import { requireRole } from '../../utils/admin-auth'
import { withTransaction } from '../../utils/db'

const schema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  shortDescription: z.string().max(500).default(''),
  description: z.string().trim().min(1),
  category: z.string().trim().min(1).max(80),
  collection: z.string().max(120).default(''),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  isNew: z.boolean().default(false),
})

export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success)
    throw createError({ statusCode: 400, statusMessage: 'Invalid product.' })
  try {
    return await withTransaction(async (client) => {
      const r = await client.query(
        'INSERT INTO products (name,slug,short_description,description,category,collection,active,featured,is_new) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id',
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
        ],
      )
      await client.query(
        'INSERT INTO admin_activity (admin_user_id,action,entity_type,entity_id,metadata_json) VALUES ($1,$2,$3,$4,$5)',
        [
          admin.id,
          'PRODUCT_CREATED',
          'product',
          r.rows[0].id,
          JSON.stringify({ slug: parsed.data.slug }),
        ],
      )
      return { id: r.rows[0].id }
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate'))
      throw createError({
        statusCode: 409,
        statusMessage: 'A product with this slug already exists.',
      })
    throw createError({
      statusCode: 500,
      statusMessage: 'Product could not be created.',
    })
  }
})
