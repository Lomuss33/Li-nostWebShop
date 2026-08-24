import { processOutboxBatch } from '../services/outbox'
const result = await processOutboxBatch()
console.log(`Processed ${result.processed} outbox event(s).`)
await (await import('../utils/db')).getPool().end()
