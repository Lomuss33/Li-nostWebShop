import type { Product, ProductVariant } from '~/../shared/types/domain'
import type { QueryResultRow } from 'pg'
import { getPool } from '../utils/db'
type Row = QueryResultRow & Record<string, unknown>
const mapProduct = (
  row: Row,
  variants: ProductVariant[],
  images: Product['images'],
): Product => ({
  id: String(row.id),
  slug: String(row.slug),
  name: String(row.name),
  category: row.category as Product['category'],
  description: String(row.description),
  material: String(row.material ?? 'See product details'),
  fit: String(row.fit ?? 'Unisex'),
  care: String(row.care ?? 'Wash cold, inside out.'),
  collection: String(row.collection),
  featured: Boolean(row.featured),
  isNew: Boolean(row.is_new),
  onSale: variants.some((variant) => Boolean(variant.salePrice)),
  variants,
  images,
})
const mapVariant = (r: Row): ProductVariant => ({
  id: String(r.id),
  sku: String(r.sku),
  productId: String(r.product_id),
  color: String(r.color),
  size: String(r.size),
  price: {
    amount: Number(r.price_minor),
    currency: r.currency as ProductVariant['price']['currency'],
  },
  salePrice:
    r.sale_price_minor == null
      ? undefined
      : {
          amount: Number(r.sale_price_minor),
          currency: r.currency as ProductVariant['price']['currency'],
        },
  stock: Number(r.stock),
  active: Boolean(r.active),
  weightGrams: Number(r.weight_grams ?? 0),
})
const hydrate = async (rows: Row[]) => {
  const pool = getPool()
  return Promise.all(
    rows.map(async (row) => {
      const [v, i] = await Promise.all([
        pool.query(
          'SELECT * FROM product_variants WHERE product_id=$1 AND active=true ORDER BY size',
          [row.id],
        ),
        pool.query(
          'SELECT id,url_or_path,alt_text AS alt,position FROM product_images WHERE product_id=$1 ORDER BY position',
          [row.id],
        ),
      ])
      return mapProduct(row, v.rows.map(mapVariant), i.rows)
    }),
  )
}
export const postgresProductRepository = {
  async findAll(
    filters: {
      category?: string
      collection?: string
      size?: string
      color?: string
      sale?: boolean
      availability?: boolean
      minPrice?: number
      maxPrice?: number
      sort?: string
    } = {},
  ) {
    const values: unknown[] = []
    const where = ['p.active=true']
    const add = (sql: string, value: unknown) => {
      values.push(value)
      where.push(sql.replace('?', `$${values.length}`))
    }
    if (filters.category) add('p.category=?', filters.category)
    if (filters.collection) add('p.collection=?', filters.collection)
    if (filters.size)
      add(
        'EXISTS (SELECT 1 FROM product_variants f WHERE f.product_id=p.id AND f.size=? AND f.active=true)',
        filters.size,
      )
    if (filters.color)
      add(
        'EXISTS (SELECT 1 FROM product_variants f WHERE f.product_id=p.id AND lower(f.color)=lower(? ) AND f.active=true)',
        filters.color,
      )
    if (filters.sale)
      where.push(
        'EXISTS (SELECT 1 FROM product_variants f WHERE f.product_id=p.id AND f.sale_price_minor IS NOT NULL)',
      )
    if (filters.availability)
      where.push(
        'EXISTS (SELECT 1 FROM product_variants f WHERE f.product_id=p.id AND f.stock>0)',
      )
    if (filters.minPrice != null)
      add(
        'EXISTS (SELECT 1 FROM product_variants f WHERE f.product_id=p.id AND f.price_minor>=?)',
        filters.minPrice,
      )
    if (filters.maxPrice != null)
      add(
        'EXISTS (SELECT 1 FROM product_variants f WHERE f.product_id=p.id AND f.price_minor<=?)',
        filters.maxPrice,
      )
    const order =
      filters.sort === 'price-asc'
        ? 'p.name ASC'
        : filters.sort === 'price-desc'
          ? 'p.name DESC'
          : 'p.created_at DESC'
    const result = await getPool().query(
      `SELECT p.* FROM products p WHERE ${where.join(' AND ')} ORDER BY ${order}`,
      values,
    )
    return hydrate(result.rows)
  },
  async findBySlug(slug: string) {
    const result = await getPool().query(
      'SELECT * FROM products WHERE slug=$1 AND active=true',
      [slug],
    )
    return (await hydrate(result.rows))[0]
  },
  async findById(id: string) {
    const result = await getPool().query(
      'SELECT * FROM products WHERE id=$1 AND active=true',
      [id],
    )
    return (await hydrate(result.rows))[0]
  },
  async findVariantsForProduct(productId: string) {
    const result = await getPool().query(
      'SELECT * FROM product_variants WHERE product_id=$1 AND active=true',
      [productId],
    )
    return result.rows.map(mapVariant)
  },
}
