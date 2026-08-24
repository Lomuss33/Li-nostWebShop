import { z } from 'zod'
import { loginAdmin } from '../../utils/admin-auth'
export default defineEventHandler(async (event) => {
  const input = z
    .object({ email: z.string().email(), token: z.string().min(1) })
    .safeParse(await readBody(event))
  if (!input.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Valid email and bootstrap token are required.',
    })
  return loginAdmin(event, input.data.email, input.data.token)
})
