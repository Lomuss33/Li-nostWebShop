import { z } from 'zod'
export const purchaseRequestSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(5).max(30),
  countryCode: z.string().length(2),
  preferredContact: z.enum(['email', 'phone', 'whatsapp', 'viber']),
  address: z
    .object({
      firstName: z.string(),
      lastName: z.string(),
      addressLine1: z.string().min(1),
      city: z.string().min(1),
      postalCode: z.string().min(1),
      countryCode: z.string().length(2),
    })
    .optional(),
  message: z.string().max(1000).optional(),
  items: z
    .array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().positive().max(20),
      }),
    )
    .min(1),
})
export type PurchaseRequestInput = z.infer<typeof purchaseRequestSchema>
