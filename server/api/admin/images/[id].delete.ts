import { requireRole } from '../../../utils/admin-auth'
import { withTransaction } from '../../../utils/db'
export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN'])
  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError({ statusCode: 400, statusMessage: 'Image is required.' })
  return withTransaction(async (client) => {
    const row = await client.query(
      'DELETE FROM product_images WHERE id=$1 RETURNING product_id',
      [id],
    )
    if (!row.rowCount)
      throw createError({ statusCode: 404, statusMessage: 'Image not found.' })
    await client.query(
      'INSERT INTO admin_activity (admin_user_id,action,entity_type,entity_id,metadata_json) VALUES ($1,$2,$3,$4,$5)',
      [
        admin.id,
        'PRODUCT_IMAGE_REMOVED',
        'product',
        row.rows[0].product_id,
        JSON.stringify({ imageId: id }),
      ],
    )
    return { success: true }
  })
})
