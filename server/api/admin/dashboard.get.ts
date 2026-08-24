import { requireAdmin } from '../../utils/admin-auth'
import { getPool } from '../../utils/db'
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const result = await getPool().query(
    `SELECT (SELECT count(*) FROM orders WHERE created_at::date=current_date AND payment_status='PAID')::int AS orders_today,(SELECT count(*) FROM orders WHERE payment_status='PAID')::int AS paid_orders,(SELECT count(*) FROM orders WHERE payment_status='PAID' AND fulfillment_status='UNFULFILLED')::int AS awaiting_fulfillment,(SELECT count(*) FROM purchase_requests WHERE status='NEW')::int AS new_requests,(SELECT count(*) FROM purchase_requests WHERE status='WAITING_FOR_CUSTOMER')::int AS waiting_requests,(SELECT count(*) FROM product_variants WHERE stock <= $1 AND active=true)::int AS low_stock,(SELECT count(*) FROM orders WHERE requires_review=true AND review_resolved_at IS NULL)::int AS review_orders,(SELECT count(*) FROM email_deliveries WHERE status='FAILED')::int AS failed_emails`,
    [Number(process.env.LOW_STOCK_THRESHOLD || 5)],
  )
  return result.rows[0]
})
