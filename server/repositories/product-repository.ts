import type { Product, ProductVariant } from '~/../shared/types/domain'

type Spec = {
  slug: string
  name: string
  category: string
  price: number
  collection: string
  colors?: string[]
  sale?: boolean
  featured?: boolean
  isNew?: boolean
  limited?: boolean
}
const groups: [string, string, string, number, string][] = [
  ['form-tee', 'Form T-Shirt', 'T-Shirts', 3900, 'Core'],
  ['identity-logo-tee', 'Identity Logo Tee', 'T-Shirts', 3900, 'Core'],
  ['core-logo-tee', 'Core Logo Tee', 'T-Shirts', 3500, 'Essentials'],
  [
    'essential-black-tee',
    'Essential Black Tee',
    'T-Shirts',
    2900,
    'Essentials',
  ],
  [
    'essential-white-tee',
    'Essential White Tee',
    'T-Shirts',
    2900,
    'Essentials',
  ],
  ['heavyweight-tee', 'Heavyweight T-Shirt', 'T-Shirts', 4900, 'Studio'],
  [
    'backprint-signature-tee',
    'Backprint Signature Tee',
    'T-Shirts',
    4500,
    'Studio',
  ],
  [
    'minimal-chest-logo-tee',
    'Minimal Chest Logo Tee',
    'T-Shirts',
    3500,
    'Core',
  ],
  ['world-tour-tee', 'World Tour Tee', 'T-Shirts', 4500, 'Archive'],
  ['studio-tee', 'Studio Tee', 'T-Shirts', 3900, 'Studio'],
  ['archive-tee', 'Archive Tee', 'T-Shirts', 4500, 'Archive'],
  ['distorted-logo-tee', 'Distorted Logo Tee', 'T-Shirts', 4200, 'Midnight'],
  ['midnight-tee', 'Midnight Tee', 'T-Shirts', 3900, 'Midnight'],
  ['concrete-tee', 'Concrete Tee', 'T-Shirts', 3900, 'Studio'],
  [
    'balkan-edition-tee',
    'Balkan Edition Tee',
    'T-Shirts',
    4900,
    'Balkan Edition',
  ],
  ['coordinates-tee', 'Coordinates Tee', 'T-Shirts', 4200, 'Balkan Edition'],
  ['limited-drop-tee', 'Limited Drop Tee', 'T-Shirts', 4900, 'Limited Edition'],
  [
    'oversized-signature-tee',
    'Oversized Signature Tee',
    'Oversized T-Shirts',
    4900,
    'New Season',
  ],
  [
    'heavy-oversized-tee',
    'Heavy Oversized Tee',
    'Oversized T-Shirts',
    5900,
    'Studio',
  ],
  [
    'oversized-concrete-tee',
    'Oversized Concrete Tee',
    'Oversized T-Shirts',
    5200,
    'Studio',
  ],
  [
    'oversized-studio-tee',
    'Oversized Studio Tee',
    'Oversized T-Shirts',
    5200,
    'Studio',
  ],
  [
    'oversized-backprint-tee',
    'Oversized Backprint Tee',
    'Oversized T-Shirts',
    5500,
    'New Season',
  ],
  [
    'oversized-washed-tee',
    'Oversized Washed Tee',
    'Oversized T-Shirts',
    4900,
    'Archive',
  ],
  [
    'oversized-shadow-tee',
    'Oversized Shadow Tee',
    'Oversized T-Shirts',
    5200,
    'Midnight',
  ],
  [
    'logo-long-sleeve',
    'Logo Long Sleeve',
    'Long Sleeve T-Shirts',
    4900,
    'Core',
  ],
  [
    'sleeve-print-long-sleeve',
    'Sleeve Print Long Sleeve',
    'Long Sleeve T-Shirts',
    5500,
    'Studio',
  ],
  [
    'coordinates-long-sleeve',
    'Coordinates Long Sleeve',
    'Long Sleeve T-Shirts',
    5200,
    'Balkan Edition',
  ],
  [
    'archive-long-sleeve',
    'Archive Long Sleeve',
    'Long Sleeve T-Shirts',
    4900,
    'Archive',
  ],
  ['essential-hoodie', 'Essential Hoodie', 'Hoodies', 7900, 'Essentials'],
  [
    'heavyweight-identity-hoodie',
    'Heavyweight Identity Hoodie',
    'Hoodies',
    8900,
    'Core',
  ],
  [
    'oversized-logo-hoodie',
    'Oversized Logo Hoodie',
    'Hoodies',
    9500,
    'New Season',
  ],
  [
    'minimal-embroidery-hoodie',
    'Minimal Embroidery Hoodie',
    'Hoodies',
    8500,
    'Core',
  ],
  ['backprint-hoodie', 'Backprint Hoodie', 'Hoodies', 8900, 'Studio'],
  ['washed-black-hoodie', 'Washed Black Hoodie', 'Hoodies', 7900, 'Archive'],
  ['studio-hoodie', 'Studio Hoodie', 'Hoodies', 8900, 'Studio'],
  ['core-zip-hoodie', 'Core Zip Hoodie', 'Zip Hoodies', 8900, 'Essentials'],
  [
    'midnight-zip-hoodie',
    'Midnight Zip Hoodie',
    'Zip Hoodies',
    9900,
    'Midnight',
  ],
  [
    'utility-zip-hoodie',
    'Utility Zip Hoodie',
    'Zip Hoodies',
    10900,
    'New Season',
  ],
  ['core-crewneck', 'Core Crewneck', 'Sweatshirts', 6500, 'Essentials'],
  ['embroidered-crewneck', 'Embroidered Crewneck', 'Sweatshirts', 7500, 'Core'],
  ['studio-sweatshirt', 'Studio Sweatshirt', 'Sweatshirts', 6900, 'Studio'],
  ['soft-knit', 'Soft Knit Crew', 'Sweatshirts', 9900, 'Winter Drop'],
  [
    'heavyweight-crewneck',
    'Heavyweight Crewneck',
    'Sweatshirts',
    7900,
    'Winter Drop',
  ],
  ['coach-jacket', 'Coach Jacket', 'Jackets', 9900, 'New Season'],
  ['varsity-jacket', 'Varsity Jacket', 'Jackets', 15900, 'Limited Edition'],
  [
    'lightweight-windbreaker',
    'Lightweight Windbreaker',
    'Jackets',
    10900,
    'Summer Drop',
  ],
  ['work-jacket', 'Work Jacket', 'Jackets', 12900, 'Studio'],
  ['utility-jacket', 'Utility Jacket', 'Jackets', 15900, 'Core'],
  ['everyday-overshirt', 'Everyday Overshirt', 'Jackets', 12900, 'Essentials'],
  ['essential-sweatpants', 'Essential Sweatpants', 'Pants', 6900, 'Essentials'],
  ['heavyweight-joggers', 'Heavyweight Joggers', 'Pants', 7900, 'Winter Drop'],
  ['relaxed-cargo-pants', 'Relaxed Cargo Pants', 'Pants', 8900, 'Studio'],
  ['studio-track-pants', 'Studio Track Pants', 'Pants', 7900, 'Studio'],
  ['essential-shorts', 'Essential Shorts', 'Shorts', 4500, 'Summer Drop'],
  [
    'heavyweight-sweat-shorts',
    'Heavyweight Sweat Shorts',
    'Shorts',
    5900,
    'Summer Drop',
  ],
  ['sport-shorts', 'Sport Shorts', 'Shorts', 4900, 'Summer Drop'],
  ['studio-cap', 'Studio Cap', 'Caps', 3500, 'Studio'],
  ['logo-cap', 'Logo Cap', 'Caps', 2900, 'Core'],
  ['essential-cap', 'Essential Cap', 'Caps', 2500, 'Essentials'],
  ['washed-cap', 'Washed Cap', 'Caps', 3500, 'Archive'],
  ['logo-beanie', 'Logo Beanie', 'Beanies', 2900, 'Winter Drop'],
  ['core-beanie', 'Core Beanie', 'Beanies', 2500, 'Essentials'],
  ['heavy-knit-beanie', 'Heavy Knit Beanie', 'Beanies', 3900, 'Winter Drop'],
  ['canvas-tote', 'Canvas Tote Bag', 'Bags', 2900, 'Essentials'],
  ['logo-tote', 'Logo Tote', 'Bags', 3900, 'Core'],
  ['crossbody-bag', 'Crossbody Bag', 'Bags', 5900, 'New Season'],
  ['utility-shoulder-bag', 'Utility Shoulder Bag', 'Bags', 4900, 'Studio'],
  ['logo-socks', 'Logo Socks', 'Accessories', 1500, 'Essentials'],
  ['sticker-pack', 'Sticker Pack', 'Accessories', 900, 'Core'],
  ['keychain', 'Identity Keychain', 'Accessories', 1200, 'Core'],
  ['metal-pin-set', 'Metal Pin Set', 'Accessories', 1900, 'Archive'],
  ['phone-lanyard', 'Phone Lanyard', 'Accessories', 2500, 'New Season'],
  ['patch-set', 'Patch Set', 'Accessories', 2200, 'Balkan Edition'],
  ['wristband', 'Wristband', 'Accessories', 900, 'Summer Drop'],
  ['studio-poster', 'Studio Poster', 'Accessories', 1500, 'Studio'],
  ['founders-tee', 'Founders Tee', 'T-Shirts', 5900, 'Limited Edition'],
  [
    'edition-001-hoodie',
    'Edition 001 Hoodie',
    'Hoodies',
    10900,
    'Limited Edition',
  ],
  [
    'balkan-nights-tee',
    'Balkan Nights Tee',
    'T-Shirts',
    4900,
    'Balkan Edition',
  ],
  ['anniversary-tee', 'Anniversary Tee', 'T-Shirts', 4900, 'Limited Edition'],
  ['archive-reissue-tee', 'Archive Reissue Tee', 'T-Shirts', 5500, 'Archive'],
]
const sale = new Set([
  'heavyweight-tee',
  'archive-tee',
  'washed-black-hoodie',
  'essential-sweatpants',
  'founders-tee',
  'anniversary-tee',
  'archive-reissue-tee',
  'oversized-washed-tee',
  'studio-sweatshirt',
  'logo-tote',
  'coach-jacket',
])
const limited = new Set([
  'balkan-edition-tee',
  'limited-drop-tee',
  'varsity-jacket',
  'founders-tee',
  'edition-001-hoodie',
  'balkan-nights-tee',
  'anniversary-tee',
  'archive-reissue-tee',
])
const featured = new Set([
  'identity-logo-tee',
  'oversized-signature-tee',
  'heavyweight-identity-hoodie',
  'core-zip-hoodie',
  'varsity-jacket',
  'essential-sweatpants',
  'logo-cap',
  'balkan-edition-tee',
  'form-tee',
])
const newSet = new Set([
  'identity-logo-tee',
  'backprint-signature-tee',
  'oversized-signature-tee',
  'oversized-backprint-tee',
  'oversized-washed-tee',
  'essential-hoodie',
  'oversized-logo-hoodie',
  'core-zip-hoodie',
  'utility-zip-hoodie',
  'studio-sweatshirt',
  'coach-jacket',
  'crossbody-bag',
  'balkan-nights-tee',
  'edition-001-hoodie',
])
const legacy: Record<string, string> = {
  'form-tee': 'p1',
  'essential-hoodie': 'p2',
  'everyday-overshirt': 'p3',
  'studio-cap': 'p4',
  'heavyweight-tee': 'p5',
  'utility-jacket': 'p6',
  'canvas-tote': 'p8',
}
const omitted = new Set([
  'world-tour-tee',
  'studio-tee',
  'distorted-logo-tee',
  'midnight-tee',
  'coordinates-tee',
  'heavy-oversized-tee',
  'oversized-studio-tee',
  'archive-long-sleeve',
  'minimal-embroidery-hoodie',
  'studio-hoodie',
  'midnight-zip-hoodie',
  'utility-zip-hoodie',
  'heavyweight-crewneck',
  'lightweight-windbreaker',
  'studio-track-pants',
  'essential-shorts',
  'essential-cap',
  'utility-shoulder-bag',
  'wristband',
  'studio-poster',
])
const defaults: Record<string, string[]> = {
  'T-Shirts': ['Black', 'White', 'Charcoal'],
  'Oversized T-Shirts': ['Black', 'Stone', 'Cream'],
  'Long Sleeve T-Shirts': ['Black', 'White'],
  Hoodies: ['Black', 'Heather Gray', 'Navy'],
  'Zip Hoodies': ['Black', 'Charcoal'],
  Sweatshirts: ['Black', 'Heather Gray'],
  Jackets: ['Black', 'Olive'],
  Pants: ['Black', 'Heather Gray'],
  Shorts: ['Black', 'Stone'],
  Caps: ['Black', 'Cream'],
  Beanies: ['Black', 'Charcoal'],
  Bags: ['Black', 'Natural'],
  Accessories: ['Black'],
}
const apparel = new Set([
  'T-Shirts',
  'Oversized T-Shirts',
  'Long Sleeve T-Shirts',
  'Hoodies',
  'Zip Hoodies',
  'Sweatshirts',
  'Jackets',
  'Pants',
  'Shorts',
])
const sizes = (c: string) =>
  ['Caps', 'Beanies', 'Bags', 'Accessories'].includes(c)
    ? ['One Size']
    : ['Pants', 'Shorts'].includes(c)
      ? ['S', 'M', 'L', 'XL']
      : c === 'Oversized T-Shirts'
        ? ['S', 'M', 'L', 'XL', 'XXL']
        : ['S', 'M', 'L', 'XL']
const weight = (c: string) =>
  c === 'Jackets'
    ? 950
    : c.includes('Hoodie')
      ? 820
      : c === 'Pants'
        ? 680
        : c === 'Caps'
          ? 160
          : c === 'Beanies'
            ? 140
            : c === 'Accessories'
              ? 80
              : 300
const namedProductPlaceholders = new Set([
  'form-tee',
  'essential-hoodie',
  'everyday-overshirt',
  'studio-cap',
  'heavyweight-tee',
  'utility-jacket',
  'canvas-tote',
])
const image = (s: Spec, position: number) => ({
  id: `${s.slug}-${position}`,
  url: namedProductPlaceholders.has(s.slug)
    ? `/placeholders/products/${s.slug}-placeholder.svg`
    : '/placeholders/products/catalog-placeholder.svg',
  alt: `${s.name}, ${position === 0 ? 'front' : position === 1 ? 'back' : 'detail'} view`,
  position,
})

export const products: Product[] = groups
  .filter(([slug]) => !omitted.has(slug))
  .map(([slug, name, category, price, collection], index) => {
    const s: Spec = { slug, name, category, price, collection }
    const id = legacy[slug] || `demo-${String(index + 1).padStart(2, '0')}`
    const colors = (defaults[category] || ['Black']).slice(0, 2)
    const productSizes = [
      'identity-logo-tee',
      'essential-black-tee',
      'essential-hoodie',
      'heavyweight-identity-hoodie',
    ].includes(slug)
      ? ['XS', 'S', 'M', 'L', 'XL', 'XXL']
      : sizes(category)
    const variants = colors.flatMap((color, ci) =>
      productSizes.map((size, si): ProductVariant => ({
        id: `${id}-${color}-${size}`,
        sku: `LIC-${category.slice(0, 4).toUpperCase()}-${slug.replaceAll('-', '').slice(0, 8).toUpperCase()}-${color.replaceAll(' ', '').slice(0, 3).toUpperCase()}-${size.replace(' ', '')}`,
        productId: id,
        color,
        size,
        price: { amount: price, currency: 'EUR' },
        salePrice: sale.has(slug)
          ? { amount: Math.max(500, price - 1000), currency: 'EUR' }
          : undefined,
        stock:
          (limited.has(slug)
            ? [3, 5, 8, 12][(ci + si) % 4]
            : [14, 22, 7, 3, 0, 6, 12][(index + ci + si) % 7]) || 0,
        active: true,
        weightGrams: weight(category),
      })),
    )
    return {
      id,
      slug,
      name,
      category,
      description: `${name} is a considered Ličnost piece with a clean silhouette, durable finish, and an everyday point of view.`,
      material:
        category === 'Jackets'
          ? 'Nylon shell with cotton lining'
          : category === 'Accessories'
            ? 'Cotton twill and metal hardware'
            : '100% cotton',
      fit: category.includes('Oversized')
        ? 'Oversized'
        : category === 'Pants'
          ? 'Relaxed'
          : 'Unisex',
      care: 'Machine wash at 30°C. Wash inside out. Do not tumble dry.',
      images: [0, 1, ...(apparel.has(category) ? [2] : [])].map((p) =>
        image(s, p),
      ),
      variants,
      collection,
      featured: featured.has(slug),
      isNew: newSet.has(slug),
      onSale: sale.has(slug),
    }
  })
export interface ProductRepository {
  list(): Promise<Product[]>
  findBySlug(slug: string): Promise<Product | undefined>
}
export const productRepository: ProductRepository = {
  async list() {
    return products
  },
  async findBySlug(slug) {
    return products.find((p) => p.slug === slug)
  },
}
