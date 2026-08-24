import { requireAdmin } from '../../../utils/admin-auth'
import { getPool } from '../../../utils/db'
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const product = await getPool().query('SELECT * FROM products WHERE id=$1', [
    id,
  ])
  if (!product.rowCount)
    throw createError({ statusCode: 404, statusMessage: 'Product not found.' })
  const [variants, images] = await Promise.all([
    getPool().query(
      'SELECT * FROM product_variants WHERE product_id=$1 ORDER BY color,size',
      [id],
    ),
    getPool().query(
      'SELECT * FROM product_images WHERE product_id=$1 ORDER BY position,id',
      [id],
    ),
  ])
  return {
    product: product.rows[0],
    variants: variants.rows,
    images: images.rows,
  }
})
