import { requireAdmin } from '../../utils/admin-auth'
import { getPool } from '../../utils/db'
type Status = 'READY' | 'WARNING' | 'BLOCKED'
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const checks: Array<{ name: string; status: Status; detail: string }> = []
  try {
    await getPool().query('SELECT 1')
    checks.push({
      name: 'Database',
      status: 'READY',
      detail: 'PostgreSQL connection available.',
    })
  } catch {
    checks.push({
      name: 'Database',
      status: 'BLOCKED',
      detail: 'Database connection unavailable.',
    })
  }
  const stripe = process.env.STRIPE_SECRET_KEY
  checks.push({
    name: 'Payments',
    status: stripe ? 'READY' : 'BLOCKED',
    detail: stripe
      ? stripe.startsWith('sk_test_')
        ? 'Stripe TEST MODE configured.'
        : 'Stripe LIVE MODE configured; verify account before launch.'
      : 'Stripe secret key is missing.',
  })
  checks.push({
    name: 'Webhook secret',
    status: process.env.STRIPE_WEBHOOK_SECRET ? 'READY' : 'BLOCKED',
    detail: process.env.STRIPE_WEBHOOK_SECRET ? 'Configured.' : 'Missing.',
  })
  const emailReady =
    process.env.EMAIL_MODE === 'resend' &&
    !!process.env.RESEND_API_KEY &&
    !!process.env.EMAIL_FROM
  checks.push({
    name: 'Email',
    status: emailReady ? 'READY' : 'WARNING',
    detail: emailReady
      ? 'Resend configured; domain delivery still requires provider verification.'
      : 'Console mode or incomplete Resend configuration.',
  })
  const taxMode = process.env.TAX_MODE || 'DEVELOPMENT_ZERO'
  checks.push({
    name: 'Tax',
    status: taxMode === 'DEVELOPMENT_ZERO' ? 'BLOCKED' : 'WARNING',
    detail:
      taxMode === 'DEVELOPMENT_ZERO'
        ? 'Development zero-tax mode is active.'
        : `${taxMode} configured; tax adviser review remains required.`,
  })
  const shipping = await getPool().query(
    'SELECT count(*)::int AS count FROM shipping_methods WHERE enabled=true',
  )
  checks.push({
    name: 'Shipping',
    status:
      Number(shipping.rows[0].count) &&
      process.env.SHIPPING_CONFIGURATION_CONFIRMED === 'true'
        ? 'READY'
        : 'WARNING',
    detail:
      process.env.SHIPPING_CONFIGURATION_CONFIRMED === 'true'
        ? 'Configured rates marked confirmed.'
        : 'Rates exist but require operational confirmation.',
  })
  const merchant = await getPool().query(
    'SELECT legal_business_name,legal_street,legal_postal_code,legal_city,legal_email FROM merchant_settings WHERE id=true',
  )
  const legal =
    merchant.rows[0] &&
    [
      merchant.rows[0].legal_business_name,
      merchant.rows[0].legal_street,
      merchant.rows[0].legal_postal_code,
      merchant.rows[0].legal_city,
      merchant.rows[0].legal_email,
    ].every(Boolean)
  checks.push({
    name: 'Legal',
    status: legal ? 'WARNING' : 'BLOCKED',
    detail: legal
      ? 'Merchant fields configured; legal review still required.'
      : 'Merchant legal identity is incomplete.',
  })
  const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || ''
  checks.push({
    name: 'Domain',
    status: siteUrl.startsWith('https://') ? 'READY' : 'BLOCKED',
    detail: siteUrl.startsWith('https://')
      ? siteUrl
      : 'Production HTTPS site URL is missing.',
  })
  checks.push({
    name: 'Backups',
    status: 'WARNING',
    detail: 'Verify managed backups and independent restore procedure.',
  })
  checks.push({
    name: 'Monitoring',
    status: 'WARNING',
    detail: 'Verify uptime, webhook, outbox, and database monitoring.',
  })
  return { checks, cod: 'UNSUPPORTED' }
})
