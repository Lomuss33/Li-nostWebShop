import { afterEach, describe, expect, it } from 'vitest'
import { currencyForCountry } from '../server/services/markets'
import { calculateTax } from '../server/services/tax'

describe('market and production safety', () => {
  const originalNodeEnv = process.env.NODE_ENV
  const originalTaxMode = process.env.TAX_MODE
  const originalTaxRate = process.env.TAX_MANUAL_RATE_BPS
  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
    process.env.TAX_MODE = originalTaxMode
    process.env.TAX_MANUAL_RATE_BPS = originalTaxRate
  })
  it('keeps country currency policy explicit', () => {
    expect(currencyForCountry('DE')).toBe('EUR')
    expect(currencyForCountry('US')).toBe('USD')
    expect(currencyForCountry('CH')).toBe('CHF')
  })
  it('rejects development zero-tax mode in production', () => {
    process.env.NODE_ENV = 'production'
    process.env.TAX_MODE = 'DEVELOPMENT_ZERO'
    expect(() =>
      calculateTax({
        countryCode: 'DE',
        subtotalMinor: 1000,
        shippingMinor: 490,
        currency: 'EUR',
      }),
    ).toThrow('Tax configuration')
  })
  it('supports explicit manual tax configuration without frontend logic', () => {
    process.env.NODE_ENV = 'test'
    process.env.TAX_MODE = 'MANUAL_CONFIG'
    process.env.TAX_MANUAL_RATE_BPS = '1900'
    const result = calculateTax({
      countryCode: 'DE',
      subtotalMinor: 10000,
      shippingMinor: 500,
      currency: 'EUR',
    })
    expect(result.amountMinor).toBe(1995)
    expect(result.mode).toBe('MANUAL_CONFIG')
  })
})
