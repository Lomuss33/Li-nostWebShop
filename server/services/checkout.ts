import { randomUUID } from 'node:crypto'
import {
  checkoutSchema,
  type CheckoutInput,
} from '~/../shared/validation/checkout'
import { withTransaction } from '../utils/db'
import { getShippingQuote } from './shipping'
import { calculateTax } from './tax'
import { StripePaymentProvider } from '../integrations/payments/stripe-provider'
import { assertOnlineMarket } from './markets'
type VariantRow = {
  id: string
  product_id: string
  sku: string
  color: string
  size: string
  price_minor: number
  sale_price_minor: number | null
  currency: string
  stock: number
  active: boolean
  product_name: string
  product_active: boolean
}
type PendingOrder = {
  id: string
  orderNumber: string
  subtotalMinor: number
  shippingMinor: number
  taxMinor: number
  grandTotalMinor: number
  items: {
    name: string
    sku: string
    unitPriceMinor: number
    quantity: number
  }[]
}
export const createCheckout = async (rawInput: unknown) => {
  const parsed = checkoutSchema.safeParse(rawInput)
  if (!parsed.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Please provide valid checkout details.',
    })
  const input: CheckoutInput = parsed.data
  if (
    process.env.NODE_ENV === 'production' &&
    (process.env.TAX_MODE || 'DEVELOPMENT_ZERO') === 'DEVELOPMENT_ZERO'
  )
    throw createError({
      statusCode: 503,
      statusMessage: 'Tax configuration is not ready for production.',
    })
  await assertOnlineMarket(input.shippingCountry as never, input.currency)
  const pending = (await withTransaction(async (client) => {
    const ids = input.items.map((item) => item.variantId)
    const result = await client.query(
      'SELECT v.id,v.product_id,v.sku,v.color,v.size,v.price_minor,v.sale_price_minor,v.currency,v.stock,v.active,p.name AS product_name,p.active AS product_active FROM product_variants v JOIN products p ON p.id=v.product_id WHERE v.id=ANY($1::uuid[])',
      [ids],
    )
    const rows = result.rows as VariantRow[]
    const byId = new Map(rows.map((row) => [row.id, row]))
    let subtotalMinor = 0
    const items: PendingOrder['items'] = []
    for (const requested of input.items) {
      const row = byId.get(requested.variantId)
      if (!row)
        throw createError({
          statusCode: 404,
          statusMessage: 'One of the selected products no longer exists.',
        })
      if (!row.active || !row.product_active)
        throw createError({
          statusCode: 409,
          statusMessage: 'One of the selected products is no longer available.',
        })
      if (row.stock < requested.quantity)
        throw createError({
          statusCode: 409,
          statusMessage:
            'There is not enough stock for one of the selected products.',
        })
      if (row.currency !== input.currency)
        throw createError({
          statusCode: 422,
          statusMessage:
            'One of the selected products is not available in this currency.',
        })
      const unitPriceMinor = row.sale_price_minor ?? row.price_minor
      subtotalMinor += unitPriceMinor * requested.quantity
      items.push({
        name: row.product_name,
        sku: row.sku,
        unitPriceMinor,
        quantity: requested.quantity,
      })
    }
    const shipping = await getShippingQuote({
      countryCode: input.shippingCountry as never,
      subtotalMinor,
      currency: input.currency,
    })
    const tax = calculateTax({
      countryCode: input.shippingCountry,
      subtotalMinor,
      shippingMinor: shipping.amountMinor,
      currency: input.currency,
    })
    const grandTotalMinor =
      subtotalMinor + shipping.amountMinor + tax.amountMinor
    const orderId = randomUUID()
    const order = await client.query(
      "INSERT INTO orders (id,email,currency,subtotal_minor,shipping_total_minor,tax_total_minor,grand_total_minor,order_status,payment_status,fulfillment_status,shipping_country_code,tax_calculation_mode,tax_jurisdiction,tax_rate_basis,prices_include_tax,shipping_method_snapshot) VALUES ($1,$2,$3,$4,$5,$6,$7,'PENDING_PAYMENT','UNPAID','UNFULFILLED',$8,$9,$10,$11,$12,$13) RETURNING order_number",
      [
        orderId,
        input.email,
        input.currency,
        subtotalMinor,
        shipping.amountMinor,
        tax.amountMinor,
        grandTotalMinor,
        input.shippingCountry,
        tax.mode,
        tax.jurisdiction,
        `${tax.rateBps} bps`,
        tax.includedInPrices,
        shipping.name,
      ],
    )
    for (const requested of input.items) {
      const row = byId.get(requested.variantId)!
      const unitPriceMinor = row.sale_price_minor ?? row.price_minor
      await client.query(
        'INSERT INTO order_items (order_id,product_id,variant_id,product_name_snapshot,sku_snapshot,color_snapshot,size_snapshot,unit_price_minor,quantity,line_total_minor) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
        [
          orderId,
          row.product_id,
          row.id,
          row.product_name,
          row.sku,
          row.color,
          row.size,
          unitPriceMinor,
          requested.quantity,
          unitPriceMinor * requested.quantity,
        ],
      )
    }
    await client.query(
      "INSERT INTO payments (order_id,provider,amount_minor,currency,status) VALUES ($1,'STRIPE',$2,$3,'UNPAID')",
      [orderId, grandTotalMinor, input.currency],
    )
    return {
      id: orderId,
      orderNumber: order.rows[0].order_number,
      subtotalMinor,
      shippingMinor: shipping.amountMinor,
      taxMinor: tax.amountMinor,
      grandTotalMinor,
      items,
    }
  })) as PendingOrder
  try {
    const provider = new StripePaymentProvider()
    const config = useRuntimeConfig()
    const session = await provider.createCheckoutSession({
      orderId: pending.id,
      orderNumber: pending.orderNumber,
      email: input.email,
      currency: input.currency,
      items: pending.items,
      shippingMinor: pending.shippingMinor,
      successUrl: `${config.public.siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${config.public.siteUrl}/cart?checkout=cancelled`,
    })
    await withTransaction(async (client) => {
      await client.query(
        "UPDATE payments SET provider_checkout_session_id=$1,status='PROCESSING',updated_at=now() WHERE order_id=$2 AND provider='STRIPE'",
        [session.id, pending.id],
      )
    })
    return { checkoutUrl: session.url }
  } catch {
    await withTransaction(async (client) => {
      await client.query(
        "UPDATE orders SET order_status='CANCELLED',updated_at=now() WHERE id=$1 AND order_status='PENDING_PAYMENT'",
        [pending.id],
      )
    })
    throw createError({
      statusCode: 502,
      statusMessage: 'Checkout is temporarily unavailable.',
    })
  }
}
