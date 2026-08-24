import { getPool } from '../../../utils/db'
export default defineEventHandler(async (event) => {
  const sessionId = getRouterParam(event, 'sessionId')
  if (!sessionId)
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing checkout session.',
    })
  const result = await getPool().query(
    "SELECT o.order_number,o.order_status,o.payment_status FROM orders o JOIN payments p ON p.order_id=o.id WHERE p.provider='STRIPE' AND p.provider_checkout_session_id=$1",
    [sessionId],
  )
  if (!result.rows[0])
    throw createError({
      statusCode: 404,
      statusMessage: 'Checkout session not found.',
    })
  return result.rows[0]
})
