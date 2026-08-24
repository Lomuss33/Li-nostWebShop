import { postgresProductRepository } from '../../repositories/product-postgres-repository'
import { productRepository } from '../../repositories/product-repository'
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug') || ''
  const product = !process.env.DATABASE_URL && process.env.NODE_ENV !== 'production'
    ? await productRepository.findBySlug(slug)
    : await postgresProductRepository.findBySlug(slug)
  if (!product)
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  return product
})
