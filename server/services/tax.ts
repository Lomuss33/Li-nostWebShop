import type { CurrencyCode } from '~/../shared/types/domain'
export const calculateTax = (input: {
  countryCode: string
  subtotalMinor: number
  shippingMinor: number
  currency: CurrencyCode
}) => {
  const mode = process.env.TAX_MODE || 'DEVELOPMENT_ZERO'
  if (mode === 'DEVELOPMENT_ZERO' && process.env.NODE_ENV === 'production')
    throw new Error('Tax configuration is not ready for production.')
  const basis = input.subtotalMinor + input.shippingMinor
  const rateBps =
    mode === 'MANUAL_CONFIG'
      ? Math.max(0, Number(process.env.TAX_MANUAL_RATE_BPS || 0))
      : 0
  return {
    amountMinor: Math.round((basis * rateBps) / 10_000),
    mode,
    rateBps,
    jurisdiction: input.countryCode,
    includedInPrices: process.env.PRICES_INCLUDE_TAX === 'true',
    currency: input.currency,
    explanation:
      mode === 'DEVELOPMENT_ZERO'
        ? 'Development-only zero tax mode.'
        : 'Manual configuration; review with tax adviser before production.',
  }
}
