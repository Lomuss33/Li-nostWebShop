import { requireAdmin } from '../../utils/admin-auth'
export default defineEventHandler(async (event) => requireAdmin(event))
