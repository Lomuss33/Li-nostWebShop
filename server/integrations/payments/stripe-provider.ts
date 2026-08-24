import Stripe from 'stripe'
export type CreateCheckoutInput = {
  orderId: string
  orderNumber: string
  email: string
  currency: string
  items: {
    name: string
    sku: string
    unitPriceMinor: number
    quantity: number
  }[]
  shippingMinor: number
  successUrl: string
  cancelUrl: string
}
export class StripePaymentProvider {
  private readonly stripe: Stripe
  constructor(secretKey = process.env.STRIPE_SECRET_KEY) {
    if (!secretKey)
      throw new Error('STRIPE_SECRET_KEY is required for checkout.')
    this.stripe = new Stripe(secretKey)
  }
  async createCheckoutSession(input: CreateCheckoutInput) {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      input.items.map((item) => ({
        price_data: {
          currency: input.currency.toLowerCase(),
          product_data: { name: item.name, metadata: { sku: item.sku } },
          unit_amount: item.unitPriceMinor,
        },
        quantity: item.quantity,
      }))
    if (input.shippingMinor > 0)
      lineItems.push({
        price_data: {
          currency: input.currency.toLowerCase(),
          product_data: { name: 'Standard delivery' },
          unit_amount: input.shippingMinor,
        },
        quantity: 1,
      })
    return this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: input.email,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      client_reference_id: input.orderNumber,
      metadata: { orderId: input.orderId, orderNumber: input.orderNumber },
    })
  }
  verifyWebhook(payload: string | Buffer, signature: string) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET
    if (!secret)
      throw new Error(
        'STRIPE_WEBHOOK_SECRET is required for webhook verification.',
      )
    return this.stripe.webhooks.constructEvent(payload, signature, secret)
  }
}
