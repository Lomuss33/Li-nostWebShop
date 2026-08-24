export interface PaymentProvider {
  createCheckoutSession(input: {
    orderId: string
    successUrl: string
    cancelUrl: string
  }): Promise<{ id: string; url: string }>
  createPaymentLink(input: { orderId: string }): Promise<{ url: string }>
  verifyWebhook(payload: string, signature: string): Promise<unknown>
  refund(paymentId: string, amount?: number): Promise<void>
}
