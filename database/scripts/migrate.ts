import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { getPool } from '../../server/utils/db'
const files = (await readdir(resolve('database/migrations')))
  .filter((file) => file.endsWith('.sql'))
  .sort()
for (const file of files)
  await getPool().query(
    await readFile(resolve('database/migrations', file), 'utf8'),
  )
await getPool().end()
console.log(`Applied ${files.length} database migrations.`)
