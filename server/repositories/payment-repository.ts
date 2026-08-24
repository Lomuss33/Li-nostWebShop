import { getPool } from '../utils/db'
export const paymentRepository = {
  async create(input: {
    orderId: string
    amountMinor: number
    currency: string
  }) {
    const result = await getPool().query(
      "INSERT INTO payments (order_id,provider,amount_minor,currency,status) VALUES ($1,'STRIPE',$2,$3,'UNPAID') RETURNING *",
      [input.orderId, input.amountMinor, input.currency],
    )
    return result.rows[0]
  },
  async findByOrderId(orderId: string) {
    const result = await getPool().query(
      'SELECT * FROM payments WHERE order_id=$1 ORDER BY created_at DESC',
      [orderId],
    )
    return result.rows
  },
  async findByProviderCheckoutSessionId(sessionId: string) {
    const result = await getPool().query(
      "SELECT * FROM payments WHERE provider='STRIPE' AND provider_checkout_session_id=$1",
      [sessionId],
    )
    return result.rows[0]
  },
  async markProcessing(sessionId: string) {
    await getPool().query(
      "UPDATE payments SET status='PROCESSING',updated_at=now() WHERE provider='STRIPE' AND provider_checkout_session_id=$1",
      [sessionId],
    )
  },
  async markPaid(orderId: string) {
    await getPool().query(
      "UPDATE payments SET status='PAID',paid_at=now(),updated_at=now() WHERE order_id=$1",
      [orderId],
    )
  },
  async markFailed(orderId: string, message: string) {
    await getPool().query(
      "UPDATE payments SET status='FAILED',failure_message=$2,updated_at=now() WHERE order_id=$1",
      [orderId, message],
    )
  },
}
