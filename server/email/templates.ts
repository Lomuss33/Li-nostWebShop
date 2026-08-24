type Item = {
  name: string
  color: string
  size: string
  quantity: number
  unitPriceMinor: number
  lineTotalMinor: number
}
const money = (amount: number, currency: string) =>
  new Intl.NumberFormat('en', { style: 'currency', currency }).format(
    amount / 100,
  )
const layout = (title: string, body: string) =>
  `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#171717"><h1 style="letter-spacing:.18em">LIČNOST</h1><h2>${title}</h2>${body}<p style="color:#77736c;font-size:12px;margin-top:32px">Ličnost support is available by replying to this email.</p></div>`
export const orderConfirmationEmail = (data: {
  orderNumber: string
  firstName?: string
  email: string
  currency: string
  items: Item[]
  subtotalMinor: number
  shippingMinor: number
  taxMinor: number
  totalMinor: number
}) => {
  const rows = data.items
    .map(
      (item) =>
        `<tr><td>${item.name}<br><small>${item.color} · ${item.size} · ${item.quantity} × ${money(item.unitPriceMinor, data.currency)}</small></td><td>${money(item.lineTotalMinor, data.currency)}</td></tr>`,
    )
    .join('')
  const greeting = data.firstName ? ` ${data.firstName}` : ''
  return {
    emailType: 'ORDER_CONFIRMATION',
    to: data.email,
    subject: `Order confirmed — ${data.orderNumber}`,
    text: [
      `Ličnost order confirmed — ${data.orderNumber}`,
      `Hello${greeting},`,
      ...data.items.map(
        (item) =>
          `${item.name} — ${item.color}, ${item.size}, ${item.quantity} × ${money(item.unitPriceMinor, data.currency)}`,
      ),
      `Subtotal: ${money(data.subtotalMinor, data.currency)}`,
      `Shipping: ${money(data.shippingMinor, data.currency)}`,
      `Tax: ${money(data.taxMinor, data.currency)}`,
      `Total: ${money(data.totalMinor, data.currency)}`,
    ].join('\n'),
    html: layout(
      'Order confirmed',
      `<p>Hello${greeting}, thank you for your order <strong>${data.orderNumber}</strong>.</p><table style="width:100%;line-height:1.8">${rows}</table><p>Subtotal: ${money(data.subtotalMinor, data.currency)}<br>Shipping: ${money(data.shippingMinor, data.currency)}<br>Tax: ${money(data.taxMinor, data.currency)}<br><strong>Total: ${money(data.totalMinor, data.currency)}</strong></p>`,
    ),
  }
}
export const purchaseRequestEmail = (data: {
  requestNumber: string
  firstName: string
  email: string
  preferredContact: string
  currency: string
  subtotalMinor: number
}) => ({
  emailType: 'PURCHASE_REQUEST_CONFIRMATION',
  to: data.email,
  subject: `Request received — ${data.requestNumber}`,
  text: `Hello ${data.firstName},\n\nWe received your request ${data.requestNumber}.\n\nNo payment has been taken.\nYour items are not reserved until confirmed.\n\nPreferred contact method: ${data.preferredContact}\nEstimated subtotal: ${money(data.subtotalMinor, data.currency)}`,
  html: layout(
    'Request received',
    `<p>Hello ${data.firstName},</p><p>We received your request <strong>${data.requestNumber}</strong>.</p><p><strong>No payment has been taken.</strong><br>Your items are not reserved until confirmed.</p><p>Preferred contact method: ${data.preferredContact}<br>Estimated subtotal: ${money(data.subtotalMinor, data.currency)}</p>`,
  ),
})
export const purchaseRequestAdminEmail = (data: {
  requestNumber: string
  firstName: string
  lastName: string
  countryCode: string
  preferredContact: string
  currency: string
  subtotalMinor: number
  message?: string
}) => ({
  emailType: 'PURCHASE_REQUEST_ADMIN_NOTIFICATION',
  to: process.env.ADMIN_NOTIFICATION_EMAIL || '',
  subject: `New purchase request — ${data.requestNumber}`,
  text: `New request ${data.requestNumber}\nCustomer: ${data.firstName} ${data.lastName}\nCountry: ${data.countryCode}\nPreferred contact: ${data.preferredContact}\nEstimated subtotal: ${money(data.subtotalMinor, data.currency)}${data.message ? `\nMessage: ${data.message}` : ''}`,
  html: layout(
    'New purchase request',
    `<p><strong>${data.requestNumber}</strong></p><p>${data.firstName} ${data.lastName} · ${data.countryCode}<br>Preferred contact: ${data.preferredContact}<br>Estimated subtotal: ${money(data.subtotalMinor, data.currency)}</p>${data.message ? `<p>Message: ${data.message}</p>` : ''}`,
  ),
})

export const shippingConfirmationEmail = (data: {
  orderNumber: string
  email: string
  carrier: string
  trackingNumber: string
  trackingUrl?: string
}) => ({
  emailType: 'ORDER_SHIPPED',
  to: data.email,
  subject: `Your order has shipped — ${data.orderNumber}`,
  text: `Your Ličnost order ${data.orderNumber} has shipped.\n\nCarrier: ${data.carrier}\nTracking number: ${data.trackingNumber}${data.trackingUrl ? `\nTracking: ${data.trackingUrl}` : ''}\n\nPlease reply to this email if you need support.`,
  html: layout(
    'Your order has shipped',
    `<p>Your order <strong>${data.orderNumber}</strong> is on its way.</p><p>Carrier: ${data.carrier}<br>Tracking number: ${data.trackingNumber}${data.trackingUrl ? `<br><a href="${data.trackingUrl}">Track shipment</a>` : ''}</p>`,
  ),
})

export const paymentRequestEmail = (data: {
  orderNumber: string
  email: string
  currency: string
  items: Item[]
  subtotalMinor: number
  shippingMinor: number
  taxMinor: number
  totalMinor: number
  checkoutUrl: string
}) => ({
  emailType: 'ORDER_PAYMENT_REQUESTED',
  to: data.email,
  subject: `Complete your order — ${data.orderNumber}`,
  text: [
    `Complete your Ličnost order: ${data.orderNumber}`,
    '',
    ...data.items.map(
      (item) =>
        `${item.name} — ${item.color}, ${item.size}, ${item.quantity} × ${money(item.unitPriceMinor, data.currency)}`,
    ),
    `Subtotal: ${money(data.subtotalMinor, data.currency)}`,
    `Shipping: ${money(data.shippingMinor, data.currency)}`,
    `Tax: ${money(data.taxMinor, data.currency)}`,
    `Total: ${money(data.totalMinor, data.currency)}`,
    '',
    `Pay securely: ${data.checkoutUrl}`,
    '',
    'Your order is not paid until payment is successfully completed.',
  ].join('\n'),
  html: layout(
    'Complete your order',
    `<p>Please complete payment for order <strong>${data.orderNumber}</strong>.</p><table style="width:100%;line-height:1.8">${data.items.map((item) => `<tr><td>${item.name}<br><small>${item.color} · ${item.size} · ${item.quantity} × ${money(item.unitPriceMinor, data.currency)}</small></td><td>${money(item.lineTotalMinor, data.currency)}</td></tr>`).join('')}</table><p>Subtotal: ${money(data.subtotalMinor, data.currency)}<br>Shipping: ${money(data.shippingMinor, data.currency)}<br>Tax: ${money(data.taxMinor, data.currency)}<br><strong>Total: ${money(data.totalMinor, data.currency)}</strong></p><p><a href="${data.checkoutUrl}" style="display:inline-block;background:#171717;color:#fff;padding:12px 18px;text-decoration:none">Pay securely</a></p><p>Your order is not paid until payment is successfully completed.</p>`,
  ),
})
