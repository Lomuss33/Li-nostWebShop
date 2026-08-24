import type { CartItem } from '~/../shared/types/domain'
const key = 'licnost-cart'
export const useCart = () => {
  const items = useState<CartItem[]>('cart-items', () => [])
  if (import.meta.client && items.value.length === 0) {
    try {
      items.value = JSON.parse(localStorage.getItem(key) || '[]') as CartItem[]
    } catch {
      items.value = []
    }
  }
  const persist = () => {
    if (import.meta.client)
      localStorage.setItem(key, JSON.stringify(items.value))
  }
  const add = (item: CartItem) => {
    const existing = items.value.find((i) => i.variantId === item.variantId)
    if (existing) existing.quantity += item.quantity
    else items.value.push(item)
    persist()
  }
  const remove = (id: string) => {
    items.value = items.value.filter((i) => i.variantId !== id)
    persist()
  }
  const update = (id: string, quantity: number) => {
    const item = items.value.find((i) => i.variantId === id)
    if (item) item.quantity = Math.max(1, quantity)
    persist()
  }
  const subtotal = computed(() =>
    items.value.reduce((sum, i) => sum + i.price.amount * i.quantity, 0),
  )
  return {
    items,
    add,
    remove,
    update,
    subtotal,
    count: computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0)),
  }
}
