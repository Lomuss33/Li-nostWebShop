import type {
  EmailProvider,
  EmailSendResult,
  TransactionalEmail,
} from './provider'
export class ConsoleEmailProvider implements EmailProvider {
  async send(input: TransactionalEmail): Promise<EmailSendResult> {
    console.info('transactional_email_queued', {
      emailType: input.emailType,
      subject: input.subject,
      recipientDomain: input.to.split('@')[1] || 'unknown',
    })
    return { providerMessageId: `console_${Date.now()}` }
  }
}
