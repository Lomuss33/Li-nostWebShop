import { z } from 'zod'
export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().uuid(),
        quantity: z.number().int().positive().max(20),
      }),
    )
    .min(1)
    .max(100),
  email: z.string().email().max(254),
  shippingCountry: z
    .string()
    .length(2)
    .transform((value) => value.toUpperCase()),
  currency: z.enum(['EUR', 'USD']),
})
export type CheckoutInput = z.infer<typeof checkoutSchema>
