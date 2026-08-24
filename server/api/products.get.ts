import { postgresProductRepository } from '../repositories/product-postgres-repository'
import { productRepository } from '../repositories/product-repository'
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const products = !process.env.DATABASE_URL && process.env.NODE_ENV !== 'production'
    ? await productRepository.list()
    : await postgresProductRepository.findAll({
    category: typeof query.category === 'string' ? query.category : undefined,
    collection:
      typeof query.collection === 'string' ? query.collection : undefined,
    size: typeof query.size === 'string' ? query.size : undefined,
    color: typeof query.color === 'string' ? query.color : undefined,
    sale: query.sale === 'true',
    availability: query.availability === 'true',
    sort: typeof query.sort === 'string' ? query.sort : undefined,
  })
  const excludedSlug = typeof query.exclude === 'string' ? query.exclude : undefined
  const category = typeof query.category === 'string' ? query.category : undefined
  const limit = typeof query.limit === 'string' ? Number.parseInt(query.limit, 10) : undefined
  const filtered = products.filter((product) =>
    product.slug !== excludedSlug
    && (!category || product.category === category),
  )
  return Number.isFinite(limit) && limit && limit > 0 ? filtered.slice(0, limit) : filtered
})
