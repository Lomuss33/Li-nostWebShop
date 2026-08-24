import { z } from 'zod'
import { requireRole } from '../../../utils/admin-auth'
import { withTransaction } from '../../../utils/db'
const schema = z.object({
  urlOrPath: z.string().trim().min(1).max(1000),
  altText: z.string().trim().min(1).max(300),
  position: z.number().int().min(0),
})
export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  const parsed = schema.safeParse(await readBody(event))
  if (!id || !parsed.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid image metadata.',
    })
  return withTransaction(async (client) => {
    const row = await client.query(
      'UPDATE product_images SET url_or_path=$1,alt_text=$2,position=$3 WHERE id=$4 RETURNING product_id',
      [parsed.data.urlOrPath, parsed.data.altText, parsed.data.position, id],
    )
    if (!row.rowCount)
      throw createError({ statusCode: 404, statusMessage: 'Image not found.' })
    await client.query(
      'INSERT INTO admin_activity (admin_user_id,action,entity_type,entity_id,metadata_json) VALUES ($1,$2,$3,$4,$5)',
      [
        admin.id,
        'PRODUCT_IMAGE_UPDATED',
        'product',
        row.rows[0].product_id,
        JSON.stringify({ imageId: id }),
      ],
    )
    return { success: true }
  })
})
