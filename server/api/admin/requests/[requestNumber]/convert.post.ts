import { requireRole } from '../../../../utils/admin-auth'
import { withTransaction } from '../../../../utils/db'
import { getShippingQuote } from '../../../../services/shipping'
import { calculateTax } from '../../../../services/tax'

export default defineEventHandler(async (event) => {
  const admin = await requireRole(event, ['ADMIN', 'OPERATOR'])
  const requestNumber = getRouterParam(event, 'requestNumber')
  if (!requestNumber)
    throw createError({
      statusCode: 400,
      statusMessage: 'Request number is required.',
    })
  try {
    return await withTransaction(async (client) => {
      const request = await client.query(
        'SELECT * FROM purchase_requests WHERE request_number=$1 FOR UPDATE',
        [requestNumber],
      )
      if (!request.rowCount)
        throw createError({
          statusCode: 404,
          statusMessage: 'Request not found.',
        })
      const current = request.rows[0]
      if (current.status === 'CONVERTED_TO_ORDER')
        throw createError({
          statusCode: 409,
          statusMessage: 'This request has already been converted.',
        })
      const items = await client.query(
        'SELECT pri.*,v.id AS current_variant_id,v.product_id AS current_product_id,v.sku AS current_sku,v.color AS current_color,v.size AS current_size,v.price_minor,v.sale_price_minor,v.currency AS variant_currency,v.stock,v.active AS variant_active,p.name AS current_product_name,p.active AS product_active FROM purchase_request_items pri LEFT JOIN product_variants v ON v.id=pri.variant_id LEFT JOIN products p ON p.id=v.product_id WHERE pri.purchase_request_id=$1 ORDER BY pri.created_at',
        [current.id],
      )
      if (!items.rowCount)
        throw createError({
          statusCode: 409,
          statusMessage: 'The request has no items.',
        })
      let subtotal = 0
      const differences: Array<Record<string, unknown>> = []
      for (const item of items.rows) {
        if (
          !item.current_variant_id ||
          !item.variant_active ||
          !item.product_active
        )
          throw createError({
            statusCode: 409,
            statusMessage: `Variant ${item.sku_snapshot} is no longer available.`,
          })
        if (item.stock < item.quantity)
          throw createError({
            statusCode: 409,
            statusMessage: `Variant ${item.sku_snapshot} no longer has sufficient stock.`,
          })
        const price = Number(item.sale_price_minor ?? item.price_minor)
        subtotal += price * Number(item.quantity)
        differences.push({
          sku: item.sku_snapshot,
          requestedPriceMinor: item.unit_price_minor,
          currentPriceMinor: price,
        })
      }
      const currency = current.currency as 'EUR' | 'USD'
      const shipping = await getShippingQuote({
        countryCode: current.country_code,
        subtotalMinor: subtotal,
        currency,
      })
      const tax = calculateTax({
        countryCode: current.country_code,
        subtotalMinor: subtotal,
        shippingMinor: shipping.amountMinor,
        currency,
      })
      const grandTotal = subtotal + shipping.amountMinor + tax.amountMinor
      const order = await client.query(
        "INSERT INTO orders (email,phone,currency,subtotal_minor,shipping_total_minor,tax_total_minor,grand_total_minor,order_status,payment_status,fulfillment_status,shipping_country_code,source,purchase_request_id,tax_calculation_mode,tax_jurisdiction,tax_rate_basis,prices_include_tax,shipping_method_snapshot) VALUES ($1,$2,$3,$4,$5,$6,$7,'PENDING_PAYMENT','UNPAID','UNFULFILLED',$8,'PURCHASE_REQUEST',$9,$10,$11,$12,$13,$14) RETURNING id,order_number",
        [
          current.email,
          current.phone,
          currency,
          subtotal,
          shipping.amountMinor,
          tax.amountMinor,
          grandTotal,
          current.country_code,
          current.id,
          tax.mode,
          tax.jurisdiction,
          `${tax.rateBps} bps`,
          tax.includedInPrices,
          shipping.name,
        ],
      )
      for (const item of items.rows) {
        const price = Number(item.sale_price_minor ?? item.price_minor)
        await client.query(
          'INSERT INTO order_items (order_id,product_id,variant_id,product_name_snapshot,sku_snapshot,color_snapshot,size_snapshot,unit_price_minor,quantity,line_total_minor) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
          [
            order.rows[0].id,
            item.current_product_id,
            item.current_variant_id,
            item.current_product_name,
            item.current_sku,
            item.current_color,
            item.current_size,
            price,
            item.quantity,
            price * Number(item.quantity),
          ],
        )
      }
      await client.query(
        "INSERT INTO payments (order_id,provider,amount_minor,currency,status) VALUES ($1,'STRIPE',$2,$3,'UNPAID')",
        [order.rows[0].id, grandTotal, currency],
      )
      await client.query(
        "UPDATE purchase_requests SET status='CONVERTED_TO_ORDER',updated_at=now() WHERE id=$1",
        [current.id],
      )
      await client.query(
        'INSERT INTO admin_activity (admin_user_id,action,entity_type,entity_id,metadata_json) VALUES ($1,$2,$3,$4,$5)',
        [
          admin.id,
          'REQUEST_CONVERTED',
          'purchase_request',
          current.id,
          JSON.stringify({ orderNumber: order.rows[0].order_number }),
        ],
      )
      return {
        orderNumber: order.rows[0].order_number,
        totalMinor: grandTotal,
        currency,
        differences,
      }
    })
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'Request conversion failed.',
    })
  }
})
