export type TransactionalEmail = {
  emailType: string
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}
export type EmailSendResult = { providerMessageId?: string }
export interface EmailProvider {
  send(input: TransactionalEmail): Promise<EmailSendResult>
}
