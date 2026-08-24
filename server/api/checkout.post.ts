import { createCheckout } from '../services/checkout'
export default defineEventHandler(async (event) =>
  createCheckout(await readBody(event)),
)
