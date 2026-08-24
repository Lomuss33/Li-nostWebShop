import { randomUUID } from 'node:crypto'
import { ConsoleEmailProvider } from '../integrations/email/console-provider'
import { ResendEmailProvider } from '../integrations/email/resend-provider'
import type {
  EmailProvider,
  TransactionalEmail,
} from '../integrations/email/provider'
import {
  orderConfirmationEmail,
  purchaseRequestAdminEmail,
  purchaseRequestEmail,
  shippingConfirmationEmail,
  paymentRequestEmail,
} from '../email/templates'
import { getPool } from '../utils/db'
const retryMinutes = [0, 1, 5, 30, 120]
const provider = (): EmailProvider =>
  process.env.EMAIL_MODE === 'resend'
    ? new ResendEmailProvider()
    : new ConsoleEmailProvider()
const nextAttempt = (attempts: number) =>
  new Date(
    Date.now() +
      retryMinutes[Math.min(attempts, retryMinutes.length - 1)] * 60_000,
  )
const claim = async (workerId: string) => {
  const result = await getPool().query(
    "UPDATE outbox_events SET locked_at=now(),locked_by=$1 WHERE id=(SELECT id FROM outbox_events WHERE processed_at IS NULL AND failed_at IS NULL AND (next_attempt_at IS NULL OR next_attempt_at<=now()) AND (locked_at IS NULL OR locked_at < now()-interval '10 minutes') ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING *",
    [workerId],
  )
  return result.rows[0]
}
const loadEmails = async (event: {
  event_type: string
  aggregate_id: string
}): Promise<TransactionalEmail[]> => {
  if (event.event_type === 'ORDER_PAID') {
    const result = await getPool().query(
      "SELECT o.*, json_agg(json_build_object('name',oi.product_name_snapshot,'color',oi.color_snapshot,'size',oi.size_snapshot,'quantity',oi.quantity,'unitPriceMinor',oi.unit_price_minor,'lineTotalMinor',oi.line_total_minor)) AS items FROM orders o JOIN order_items oi ON oi.order_id=o.id WHERE o.id=$1 GROUP BY o.id",
      [event.aggregate_id],
    )
    const order = result.rows[0]
    if (!order) throw new Error('Order not found for ORDER_PAID')
    return [
      orderConfirmationEmail({
        orderNumber: order.order_number,
        email: order.email,
        currency: order.currency,
        items: order.items,
        subtotalMinor: order.subtotal_minor,
        shippingMinor: order.shipping_total_minor,
        taxMinor: order.tax_total_minor,
        totalMinor: order.grand_total_minor,
      }),
    ]
  }
  if (event.event_type === 'PURCHASE_REQUEST_RECEIVED') {
    const result = await getPool().query(
      'SELECT pr.*, count(pri.id)::int AS item_count FROM purchase_requests pr LEFT JOIN purchase_request_items pri ON pri.purchase_request_id=pr.id WHERE pr.id=$1 GROUP BY pr.id',
      [event.aggregate_id],
    )
    const request = result.rows[0]
    if (!request) throw new Error('Purchase request not found')
    const customer = purchaseRequestEmail({
      requestNumber: request.request_number,
      firstName: request.first_name,
      email: request.email,
      preferredContact: request.preferred_contact_method,
      currency: request.currency,
      subtotalMinor: request.subtotal_minor,
    })
    const emails: TransactionalEmail[] = [customer]
    const admin = purchaseRequestAdminEmail({
      requestNumber: request.request_number,
      firstName: request.first_name,
      lastName: request.last_name,
      countryCode: request.country_code,
      preferredContact: request.preferred_contact_method,
      currency: request.currency,
      subtotalMinor: request.subtotal_minor,
      message: request.message || undefined,
    })
    if (admin.to) emails.push(admin)
    return emails
  }
  if (event.event_type === 'ORDER_SHIPPED') {
    const result = await getPool().query(
      'SELECT order_number,email,carrier,tracking_number,tracking_url FROM orders WHERE id=$1',
      [event.aggregate_id],
    )
    const order = result.rows[0]
    if (!order || !order.carrier || !order.tracking_number)
      throw new Error('Shipment details are missing')
    return [
      shippingConfirmationEmail({
        orderNumber: order.order_number,
        email: order.email,
        carrier: order.carrier,
        trackingNumber: order.tracking_number,
        trackingUrl: order.tracking_url || undefined,
      }),
    ]
  }
  if (event.event_type === 'ORDER_PAYMENT_REQUESTED') {
    const payload = (
      await getPool().query(
        'SELECT payload_json FROM outbox_events WHERE id=$1',
        [event.id],
      )
    ).rows[0]?.payload_json
    const result = await getPool().query(
      "SELECT o.*, json_agg(json_build_object('name',oi.product_name_snapshot,'color',oi.color_snapshot,'size',oi.size_snapshot,'quantity',oi.quantity,'unitPriceMinor',oi.unit_price_minor,'lineTotalMinor',oi.line_total_minor)) AS items FROM orders o JOIN order_items oi ON oi.order_id=o.id WHERE o.id=$1 GROUP BY o.id",
      [event.aggregate_id],
    )
    const order = result.rows[0]
    if (!order || !payload?.checkoutUrl)
      throw new Error('Payment request data is missing')
    return [
      paymentRequestEmail({
        orderNumber: order.order_number,
        email: order.email,
        currency: order.currency,
        items: order.items,
        subtotalMinor: order.subtotal_minor,
        shippingMinor: order.shipping_total_minor,
        taxMinor: order.tax_total_minor,
        totalMinor: order.grand_total_minor,
        checkoutUrl: payload.checkoutUrl,
      }),
    ]
  }
  return []
}
const deliver = async (event: {
  id: string
  event_type: string
  aggregate_id: string
}) => {
  const emails = await loadEmails(event)
  for (const email of emails) {
    const existing = await getPool().query(
      'SELECT status FROM email_deliveries WHERE outbox_event_id=$1 AND email_type=$2 AND recipient=$3',
      [event.id, email.emailType, email.to],
    )
    if (existing.rows[0]?.status === 'SENT') continue
    await getPool().query(
      "INSERT INTO email_deliveries (outbox_event_id,email_type,recipient,provider,status,attempts) VALUES ($1,$2,$3,$4,'SENDING',1) ON CONFLICT (outbox_event_id,email_type,recipient) DO UPDATE SET status='SENDING',attempts=email_deliveries.attempts+1",
      [
        event.id,
        email.emailType,
        email.to,
        process.env.EMAIL_MODE === 'resend' ? 'RESEND' : 'CONSOLE',
      ],
    )
    try {
      const result = await provider().send(email)
      await getPool().query(
        "UPDATE email_deliveries SET status='SENT',provider_message_id=$1,sent_at=now(),last_error=NULL WHERE outbox_event_id=$2 AND email_type=$3 AND recipient=$4",
        [result.providerMessageId || null, event.id, email.emailType, email.to],
      )
    } catch (error) {
      await getPool().query(
        "UPDATE email_deliveries SET status='FAILED',last_error=$1 WHERE outbox_event_id=$2 AND email_type=$3 AND recipient=$4",
        [
          error instanceof Error ? error.message : 'Email provider failed',
          event.id,
          email.emailType,
          email.to,
        ],
      )
      throw error
    }
  }
}
export const processOutboxBatch = async (batchSize = 10) => {
  const workerId = randomUUID()
  const processed: string[] = []
  for (let index = 0; index < batchSize; index++) {
    const event = await claim(workerId)
    if (!event) break
    try {
      await deliver(event)
      await getPool().query(
        'UPDATE outbox_events SET processed_at=now(),locked_at=NULL,locked_by=NULL WHERE id=$1',
        [event.id],
      )
      processed.push(event.id)
    } catch (error) {
      const attempts = Number(event.attempts) + 1
      const failed = attempts >= retryMinutes.length
      await getPool().query(
        'UPDATE outbox_events SET attempts=$1,next_attempt_at=$2,failed_at=$3,last_error=$4,locked_at=NULL,locked_by=NULL WHERE id=$5',
        [
          attempts,
          failed ? null : nextAttempt(attempts),
          failed ? new Date() : null,
          error instanceof Error ? error.message : 'Outbox processing failed',
          event.id,
        ],
      )
    }
  }
  return { processed: processed.length }
}
