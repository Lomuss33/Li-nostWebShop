import { describe, expect, it } from 'vitest'
import { formatMoney } from '../app/composables/useMoney'
import { purchaseRequestSchema } from '../shared/validation/purchase-request'
describe('domain foundations', () => {
  it('formats minor units', () =>
    expect(formatMoney({ amount: 3999, currency: 'EUR' })).toContain('39,99'))
  it('accepts unicode names', () =>
    expect(
      purchaseRequestSchema.safeParse({
        firstName: 'Đorđe',
        lastName: 'Müller',
        email: 'a@example.com',
        phone: '+387 61 123 456',
        countryCode: 'DE',
        preferredContact: 'email',
        items: [{ variantId: 'p1-M', quantity: 1 }],
      }).success,
    ).toBe(true))
  it('rejects empty requests', () =>
    expect(purchaseRequestSchema.safeParse({}).success).toBe(false))
})
