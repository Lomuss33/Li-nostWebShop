import { Resend } from 'resend'
import type {
  EmailProvider,
  EmailSendResult,
  TransactionalEmail,
} from './provider'
export class ResendEmailProvider implements EmailProvider {
  private readonly client: Resend
  constructor(apiKey = process.env.RESEND_API_KEY) {
    if (!apiKey)
      throw new Error('RESEND_API_KEY is required for Resend email mode.')
    this.client = new Resend(apiKey)
  }
  async send(input: TransactionalEmail): Promise<EmailSendResult> {
    const from = process.env.EMAIL_FROM
    if (!from) throw new Error('EMAIL_FROM is required for Resend email mode.')
    const result = await this.client.emails.send({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo || process.env.EMAIL_REPLY_TO,
    })
    if (result.error) throw new Error(result.error.message)
    return { providerMessageId: result.data?.id }
  }
}
