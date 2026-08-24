import { processStripeWebhook } from '../../services/payment-webhook'
export default defineEventHandler(async (event) => {
  const signature = getHeader(event, 'stripe-signature')
  if (!signature)
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing Stripe signature.',
    })
  const payload = await readRawBody(event, false)
  if (!payload)
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing webhook payload.',
    })
  try {
    return await processStripeWebhook(payload, signature)
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Stripe webhook.',
    })
  }
})
