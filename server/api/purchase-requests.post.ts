import { purchaseRequestSchema } from '~/../shared/validation/purchase-request'
import { randomUUID } from 'node:crypto'
import { withTransaction } from '../utils/db'
import { normalizePhone } from '../utils/phone'
export default defineEventHandler(async (event) => {
  const parsed = purchaseRequestSchema.safeParse(await readBody(event))
  if (!parsed.success)
    throw createError({
      statusCode: 400,
      statusMessage: 'Please provide valid request details.',
    })
  const normalizedPhone = normalizePhone(
    parsed.data.phone,
    parsed.data.countryCode,
  )
  if (!normalizedPhone)
    throw createError({
      statusCode: 400,
      statusMessage: 'Please provide a valid international phone number.',
    })
  try {
    return await withTransaction(async (client) => {
      const ids = parsed.data.items.map((item) => item.variantId)
      const variants = await client.query(
        `SELECT v.id,v.product_id,v.sku,v.color,v.size,v.price_minor,v.sale_price_minor,v.currency,v.stock,v.active,p.name,p.active AS product_active FROM product_variants v JOIN products p ON p.id=v.product_id WHERE v.id = ANY($1::uuid[])`,
        [ids],
      )
      const byId = new Map(variants.rows.map((row) => [row.id, row]))
      let subtotal = 0
      const resolved = parsed.data.items.map((item) => {
        const row = byId.get(item.variantId)
        if (!row)
          throw createError({
            statusCode: 404,
            statusMessage: 'One of the selected items no longer exists.',
          })
        if (!row.active || !row.product_active || row.stock < item.quantity)
          throw createError({
            statusCode: 409,
            statusMessage: 'One of the selected items is no longer available.',
          })
        const unitPrice = row.sale_price_minor ?? row.price_minor
        subtotal += unitPrice * item.quantity
        return { ...item, row, unitPrice }
      })
      const requestId = randomUUID()
      const header = await client.query(
        `INSERT INTO purchase_requests (id, first_name, last_name, email, phone, country_code, preferred_contact_method, message, currency, subtotal_minor, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'NEW') RETURNING request_number`,
        [
          requestId,
          parsed.data.firstName,
          parsed.data.lastName,
          parsed.data.email,
          normalizedPhone,
          parsed.data.countryCode,
          parsed.data.preferredContact,
          parsed.data.message ?? null,
          'EUR',
          subtotal,
        ],
      )
      for (const item of resolved)
        await client.query(
          `INSERT INTO purchase_request_items (purchase_request_id, product_id, variant_id, product_name_snapshot, sku_snapshot, color_snapshot, size_snapshot, unit_price_minor, quantity) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [
            requestId,
            item.row.product_id,
            item.row.id,
            item.row.name,
            item.row.sku,
            item.row.color,
            item.row.size,
            item.unitPrice,
            item.quantity,
          ],
        )
      await client.query(
        "INSERT INTO outbox_events (event_type,aggregate_type,aggregate_id,payload_json) VALUES ('PURCHASE_REQUEST_RECEIVED','PURCHASE_REQUEST',$1,$2)",
        [
          requestId,
          JSON.stringify({ requestNumber: header.rows[0].request_number }),
        ],
      )
      return { success: true, requestNumber: header.rows[0].request_number }
    })
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'statusCode' in error)
      throw error
    console.error('purchase_request_creation_failed')
    throw createError({
      statusCode: 500,
      statusMessage: 'We could not save your request right now.',
    })
  }
})
