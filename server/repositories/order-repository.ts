import { getPool } from '../utils/db'
export const orderRepository = {
  async findById(id: string) {
    const result = await getPool().query('SELECT * FROM orders WHERE id=$1', [
      id,
    ])
    return result.rows[0]
  },
  async findByOrderNumber(orderNumber: string) {
    const result = await getPool().query(
      'SELECT * FROM orders WHERE order_number=$1',
      [orderNumber],
    )
    return result.rows[0]
  },
  async findByStripeCheckoutSessionId(sessionId: string) {
    const result = await getPool().query(
      "SELECT o.* FROM orders o JOIN payments p ON p.order_id=o.id WHERE p.provider='STRIPE' AND p.provider_checkout_session_id=$1",
      [sessionId],
    )
    return result.rows[0]
  },
  async markPaid(id: string) {
    await getPool().query(
      "UPDATE orders SET order_status='CONFIRMED',payment_status='PAID',updated_at=now() WHERE id=$1",
      [id],
    )
  },
  async markPaymentFailed(id: string) {
    await getPool().query(
      "UPDATE orders SET payment_status='FAILED',updated_at=now() WHERE id=$1 AND payment_status <> 'PAID'",
      [id],
    )
  },
  async cancelPendingOrder(id: string) {
    await getPool().query(
      "UPDATE orders SET order_status='CANCELLED',updated_at=now() WHERE id=$1 AND order_status='PENDING_PAYMENT'",
      [id],
    )
  },
}
