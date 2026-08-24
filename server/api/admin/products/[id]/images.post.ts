import { z } from 'zod'
import { requireRole } from '../../../../utils/admin-auth'
import { withTransaction } from '../../../../utils/db'
const schema = z.object({
  urlOrPath: z.string().trim().min(1).max(1000),
  altText: z.string().trim().min(1).max(300),
  position: z.number().int().min(0),
})
export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const productId = getRouterParam(event, 'id')
  const parsed = schema.safeParse(await readBody(event))
  if (!productId || !parsed.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid image metadata.',
    })
  return withTransaction(async (client) => {
    const image = await client.query(
      'INSERT INTO product_images (product_id,url_or_path,alt_text,position) VALUES ($1,$2,$3,$4) RETURNING id',
      [
        productId,
        parsed.data.urlOrPath,
        parsed.data.altText,
        parsed.data.position,
      ],
    )
    await client.query(
      'INSERT INTO admin_activity (admin_user_id,action,entity_type,entity_id,metadata_json) VALUES ($1,$2,$3,$4,$5)',
      [
        admin.id,
        'PRODUCT_IMAGE_ADDED',
        'product',
        productId,
        JSON.stringify({ imageId: image.rows[0].id }),
      ],
    )
    return image.rows[0]
  })
})
