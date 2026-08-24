import type Stripe from 'stripe'
import { withTransaction } from '../utils/db'
import { StripePaymentProvider } from '../integrations/payments/stripe-provider'
const providerName = 'STRIPE'
export const processStripeWebhook = async (
  payload: string | Buffer,
  signature: string,
) => {
  const event = new StripePaymentProvider().verifyWebhook(payload, signature)
  if (
    ![
      'checkout.session.completed',
      'checkout.session.async_payment_succeeded',
      'checkout.session.async_payment_failed',
    ].includes(event.type)
  )
    return { received: true, supported: false }
  return withTransaction(async (client) => {
    const recorded = await client.query(
      'INSERT INTO webhook_events (provider,provider_event_id,event_type) VALUES ($1,$2,$3) ON CONFLICT (provider,provider_event_id) DO NOTHING RETURNING id',
      [providerName, event.id, event.type],
    )
    if (recorded.rowCount === 0) return { received: true, duplicate: true }
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.orderId
    if (!orderId) throw new Error('Missing order metadata')
    if (event.type === 'checkout.session.async_payment_failed') {
      await client.query(
        "UPDATE payments SET status='FAILED',failure_code='ASYNC_PAYMENT_FAILED',failure_message='Stripe reported an asynchronous payment failure',updated_at=now() WHERE order_id=$1 AND provider='STRIPE'",
        [orderId],
      )
      await client.query(
        'UPDATE webhook_events SET processed_at=now() WHERE id=$1',
        [recorded.rows[0].id],
      )
      return { received: true, processed: true }
    }
    const expected = await client.query(
      'SELECT o.id,o.currency,o.grand_total_minor,p.id AS payment_id FROM orders o JOIN payments p ON p.order_id=o.id WHERE o.id=$1 FOR UPDATE',
      [orderId],
    )
    const order = expected.rows[0]
    if (!order) throw new Error('Order not found')
    const stripeAmount = session.amount_total ?? 0
    const stripeCurrency = (session.currency || '').toUpperCase()
    const amountMatches =
      stripeAmount === order.grand_total_minor &&
      stripeCurrency === order.currency
    await client.query(
      "UPDATE payments SET provider_payment_id=$1,amount_minor=$2,currency=$3,status='PAID',paid_at=now(),updated_at=now() WHERE id=$4",
      [
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : null,
        stripeAmount,
        stripeCurrency,
        order.payment_id,
      ],
    )
    let requiresReview = !amountMatches
    let reviewReason = amountMatches ? null : 'PAYMENT_AMOUNT_MISMATCH'
    const items = await client.query(
      'SELECT variant_id,quantity FROM order_items WHERE order_id=$1',
      [orderId],
    )
    for (const item of items.rows) {
      const stock = await client.query(
        'UPDATE product_variants SET stock=stock-$1,updated_at=now() WHERE id=$2 AND stock >= $1 RETURNING id',
        [item.quantity, item.variant_id],
      )
      if (stock.rowCount !== 1) {
        requiresReview = true
        reviewReason = reviewReason || 'INSUFFICIENT_STOCK_AFTER_PAYMENT'
      }
    }
    await client.query(
      "UPDATE orders SET order_status='CONFIRMED',payment_status='PAID',requires_review=$1,review_reason=$2,updated_at=now() WHERE id=$3",
      [requiresReview, reviewReason, orderId],
    )
    await client.query(
      "INSERT INTO outbox_events (event_type,aggregate_type,aggregate_id,payload_json) VALUES ('ORDER_PAID','ORDER',$1,$2) ON CONFLICT DO NOTHING",
      [orderId, JSON.stringify({ orderId, eventId: event.id })],
    )
    await client.query(
      'UPDATE webhook_events SET processed_at=now() WHERE id=$1',
      [recorded.rows[0].id],
    )
    return { received: true, processed: true }
  })
}
