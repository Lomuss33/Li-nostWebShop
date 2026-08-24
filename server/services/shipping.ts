import type { CurrencyCode, CountryCode } from '~/../shared/types/domain'
import { getPool } from '../utils/db'
import { getMarketCountry } from './markets'
export const getShippingQuote = async (input: {
  countryCode: CountryCode
  subtotalMinor: number
  currency: CurrencyCode
  totalWeightGrams?: number
}) => {
  if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'test')
    return {
      methodId: 'test-development',
      amountMinor: 1800,
      amount: { amount: 1800, currency: input.currency },
      currency: input.currency,
      name: 'Development shipping',
      serviceName: 'Standard delivery (development rate)',
      estimatedDays: '5–10 business days',
      estimatedDaysMin: 5,
      estimatedDaysMax: 10,
      customsMode: 'DAP' as const,
    }
  const market = await getMarketCountry(input.countryCode)
  if (!market || !market.enabled) throw new Error('UNSUPPORTED_DESTINATION')
  const result = await getPool().query(
    'SELECT * FROM shipping_methods WHERE market_id=$1 AND enabled=true AND currency=$2 AND (minimum_weight_grams IS NULL OR minimum_weight_grams <= $3) AND (maximum_weight_grams IS NULL OR maximum_weight_grams >= $3) ORDER BY price_minor LIMIT 1',
    [market.market_id, input.currency, input.totalWeightGrams ?? 0],
  )
  const method = result.rows[0]
  if (!method) throw new Error('NO_SHIPPING_METHOD')
  const free =
    method.free_shipping_threshold_minor != null &&
    input.subtotalMinor >= method.free_shipping_threshold_minor
  const amountMinor = free ? 0 : Number(method.price_minor)
  return {
    methodId: method.id,
    amountMinor,
    amount: { amount: amountMinor, currency: input.currency },
    currency: input.currency,
    name: method.name,
    serviceName: method.name,
    estimatedDays: `${method.estimated_days_min}–${method.estimated_days_max} business days`,
    estimatedDaysMin: method.estimated_days_min,
    estimatedDaysMax: method.estimated_days_max,
    customsMode: market.customs_mode,
  }
}
