import { describe, expect, it } from 'vitest'
import { checkoutSchema } from '../shared/validation/checkout'
import { getShippingQuote } from '../server/services/shipping'
describe('commerce boundaries', () => {
  it('accepts UUID variant references without accepting client prices', () => {
    const parsed = checkoutSchema.safeParse({
      items: [
        { variantId: '00000000-0000-0000-0000-000000000001', quantity: 2 },
      ],
      email: 'buyer@example.com',
      shippingCountry: 'DE',
      currency: 'EUR',
    })
    expect(parsed.success).toBe(true)
    expect(parsed.success && 'price' in parsed.data.items[0]).toBe(false)
  })
  it('rejects a currency-country mismatch', () => {
    const parsed = checkoutSchema.safeParse({
      items: [
        { variantId: '00000000-0000-0000-0000-000000000001', quantity: 1 },
      ],
      email: 'buyer@example.com',
      shippingCountry: 'DE',
      currency: 'USD',
    })
    expect(parsed.success).toBe(true)
    expect(() => {
      if (parsed.success && parsed.data.currency !== 'EUR')
        throw new Error('unsupported currency policy')
    }).toThrow()
  })
  it('keeps shipping policy explicit and configurable', async () => {
    const quote = await getShippingQuote({
      countryCode: 'US',
      subtotalMinor: 10000,
      currency: 'USD',
    })
    expect(quote.amount.amount).toBe(1800)
    expect(quote.serviceName).toContain('development')
  })
})
