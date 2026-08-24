import { requireRole } from '../../../../utils/admin-auth'
import { withTransaction, getPool } from '../../../../utils/db'
import { StripePaymentProvider } from '../../../../integrations/payments/stripe-provider'

export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN', 'OPERATOR'])
  const orderNumber = getRouterParam(event, 'orderNumber')
  if (!orderNumber)
    throw createError({
      statusCode: 400,
      statusMessage: 'Order number is required.',
    })
  const orderResult = await getPool().query(
    'SELECT * FROM orders WHERE order_number=$1',
    [orderNumber],
  )
  const order = orderResult.rows[0]
  if (!order)
    throw createError({ statusCode: 404, statusMessage: 'Order not found.' })
  if (
    order.order_status === 'CANCELLED' ||
    ['PAID', 'REFUNDED'].includes(order.payment_status)
  )
    throw createError({
      statusCode: 409,
      statusMessage: 'This order cannot receive another payment session.',
    })
  if (
    order.order_status !== 'PENDING_PAYMENT' ||
    !['UNPAID', 'FAILED'].includes(order.payment_status)
  )
    throw createError({
      statusCode: 409,
      statusMessage: 'This order is not awaiting payment.',
    })
  const items = await getPool().query(
    'SELECT product_name_snapshot AS name,sku_snapshot AS sku,unit_price_minor,quantity FROM order_items WHERE order_id=$1 ORDER BY created_at',
    [order.id],
  )
  try {
    const provider = new StripePaymentProvider()
    const config = useRuntimeConfig()
    const session = await provider.createCheckoutSession({
      orderId: order.id,
      orderNumber: order.order_number,
      email: order.email,
      currency: order.currency,
      items: items.rows,
      shippingMinor: order.shipping_total_minor,
      successUrl: `${config.public.siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${config.public.siteUrl}/cart?checkout=cancelled`,
    })
    return await withTransaction(async (client) => {
      const locked = await client.query(
        'SELECT payment_status,order_status FROM orders WHERE id=$1 FOR UPDATE',
        [order.id],
      )
      if (
        locked.rows[0].order_status === 'CANCELLED' ||
        locked.rows[0].payment_status === 'PAID'
      )
        throw createError({
          statusCode: 409,
          statusMessage: 'Order state changed while creating payment.',
        })
      const payment = await client.query(
        "INSERT INTO payments (order_id,provider,provider_checkout_session_id,amount_minor,currency,status) VALUES ($1,'STRIPE',$2,$3,$4,'PROCESSING') RETURNING id",
        [order.id, session.id, order.grand_total_minor, order.currency],
      )
      await client.query(
        "UPDATE purchase_requests SET status='PAYMENT_LINK_SENT',updated_at=now() WHERE id=(SELECT purchase_request_id FROM orders WHERE id=$1) AND status <> 'CONVERTED_TO_ORDER'",
        [order.id],
      )
      await client.query(
        'INSERT INTO outbox_events (event_type,aggregate_type,aggregate_id,payload_json) VALUES ($1,$2,$3,$4)',
        [
          'ORDER_PAYMENT_REQUESTED',
          'ORDER',
          order.id,
          JSON.stringify({
            orderNumber: order.order_number,
            checkoutUrl: session.url,
            paymentId: payment.rows[0].id,
          }),
        ],
      )
      await client.query(
        'INSERT INTO admin_activity (admin_user_id,action,entity_type,entity_id,metadata_json) VALUES ($1,$2,$3,$4,$5)',
        [
          admin.id,
          'PAYMENT_SESSION_CREATED',
          'order',
          order.id,
          JSON.stringify({ orderNumber: order.order_number }),
        ],
      )
      return { checkoutUrl: session.url, paymentId: payment.rows[0].id }
    })
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    if (error instanceof Error && error.message.includes('STRIPE_SECRET_KEY'))
      throw createError({
        statusCode: 503,
        statusMessage: 'Stripe payment configuration is not available.',
      })
    throw createError({
      statusCode: 502,
      statusMessage: 'Payment session could not be created.',
    })
  }
})
