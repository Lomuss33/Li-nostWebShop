import type { CountryCode, CurrencyCode } from '~/../shared/types/domain'
import { getPool } from '../utils/db'
export const currencyForCountry = (country: CountryCode): CurrencyCode =>
  country === 'US' ? 'USD' : country === 'CH' ? 'CHF' : 'EUR'
export const getMarketCountry = async (country: CountryCode) => {
  const result = await getPool().query(
    'SELECT * FROM market_country_settings WHERE country_code=$1',
    [country],
  )
  return result.rows[0] as
    | {
        country_code: CountryCode
        market_id: string
        enabled: boolean
        online_checkout: boolean
        purchase_request: boolean
        currency: CurrencyCode
        customs_mode: 'NONE' | 'DAP' | 'DDP'
      }
    | undefined
}
export const assertOnlineMarket = async (
  country: CountryCode,
  currency: CurrencyCode,
) => {
  const market = await getMarketCountry(country)
  if (!market || !market.enabled || !market.online_checkout)
    throw createError({
      statusCode: 422,
      statusMessage:
        'Online checkout is not currently available for this destination.',
    })
  if (market.currency !== currency)
    throw createError({
      statusCode: 422,
      statusMessage: 'This destination does not support the selected currency.',
    })
  return market
}
