import type { PurchaseRequest } from '~/../shared/types/domain'
import { withTransaction } from '../utils/db'
export interface PurchaseRequestRepository {
  create(request: PurchaseRequest): Promise<PurchaseRequest>
}
export const postgresPurchaseRequestRepository: PurchaseRequestRepository = {
  async create(request) {
    return withTransaction(async (client) => {
      const header = await client.query(
        `INSERT INTO purchase_requests (id, first_name, last_name, email, phone, country_code, preferred_contact_method, message, currency, subtotal_minor, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'NEW') RETURNING *`,
        [
          request.id,
          request.firstName,
          request.lastName,
          request.email,
          request.phone,
          request.countryCode,
          request.preferredContact,
          request.message ?? null,
          request.items[0]?.unitPrice.currency ?? 'EUR',
          request.total.amount,
        ],
      )
      for (const item of request.items)
        await client.query(
          `INSERT INTO purchase_request_items (purchase_request_id, product_id, variant_id, product_name_snapshot, sku_snapshot, color_snapshot, size_snapshot, unit_price_minor, quantity) SELECT $1,p.id,v.id,p.name,v.sku,v.color,v.size,$2,$3 FROM product_variants v JOIN products p ON p.id=v.product_id WHERE v.id=$4`,
          [
            header.rows[0].id,
            item.unitPrice.amount,
            item.quantity,
            item.variantId,
          ],
        )
      return request
    })
  },
}
