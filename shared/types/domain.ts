export type CountryCode =
  | 'DE'
  | 'AT'
  | 'CH'
  | 'BA'
  | 'HR'
  | 'RS'
  | 'ME'
  | 'MK'
  | 'SI'
  | 'US'
  | 'FR'
  | 'IT'
  | 'ES'
  | 'NL'
  | 'BE'
  | 'LU'
  | 'IE'
  | 'PT'
  | 'PL'
  | 'CZ'
  | 'SK'
  | 'HU'
  | 'RO'
  | 'BG'
  | 'GR'
  | 'SE'
  | 'FI'
  | 'DK'
  | 'EE'
  | 'LV'
  | 'LT'
  | 'CY'
  | 'MT'
  | 'AL'
  | 'XK'
export type CurrencyCode = 'EUR' | 'CHF' | 'USD'
export type Money = { amount: number; currency: CurrencyCode }
export type ProductImage = {
  id: string
  url: string
  alt: string
  position: number
}
export type ProductVariant = {
  id: string
  sku: string
  productId: string
  color: string
  size: string
  price: Money
  salePrice?: Money
  stock: number
  active: boolean
  weightGrams: number
}
export type Product = {
  id: string
  slug: string
  name: string
  category: string
  description: string
  material: string
  fit: string
  care: string
  images: ProductImage[]
  variants: ProductVariant[]
  featured?: boolean
  isNew?: boolean
  onSale?: boolean
  collection: string
}
export type Collection = {
  id: string
  slug: string
  name: string
  description: string
  imageUrl?: string
}
export type CartItem = {
  variantId: string
  quantity: number
  productId: string
  name: string
  color: string
  size: string
  price: Money
  imageUrl: string
}
export type Cart = { items: CartItem[] }
export type Address = {
  firstName: string
  lastName: string
  company?: string
  addressLine1: string
  addressLine2?: string
  city: string
  postalCode: string
  stateProvince?: string
  countryCode: CountryCode
  phone?: string
}
export type Customer = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  addresses: Address[]
}
export type OrderItem = {
  variantId: string
  quantity: number
  unitPrice: Money
}
export type Order = {
  id: string
  customerId?: string
  items: OrderItem[]
  total: Money
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled'
}
export type PurchaseRequestItem = { variantId: string; quantity: number }
export type PurchaseRequest = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  countryCode: CountryCode
  preferredContact: 'email' | 'phone' | 'whatsapp' | 'viber'
  address?: Address
  message?: string
  items: PurchaseRequestItem[]
  status: 'received' | 'contacted' | 'confirmed'
}
