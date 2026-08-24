import { requireAdmin } from '../../utils/admin-auth'
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return {
    stripe: process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured',
    emailMode: process.env.EMAIL_MODE || 'console',
    resend: process.env.RESEND_API_KEY ? 'Configured' : 'Not configured',
    adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL
      ? 'Configured'
      : 'Not configured',
  }
})
