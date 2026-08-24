import type { Money } from '~/../shared/types/domain'
export const formatMoney = (money: Money, locale = 'de-DE') =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currency,
  }).format(money.amount / 100)
