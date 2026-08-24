import { logoutAdmin } from '../../utils/admin-auth'
export default defineEventHandler(async (event) => {
  await logoutAdmin(event)
  return { success: true }
})
