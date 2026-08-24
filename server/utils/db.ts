import pg from 'pg'

const { Pool } = pg
let pool: pg.Pool | undefined

export const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL
  if (!url)
    throw new Error(
      'DATABASE_URL is required for database-backed server features.',
    )
  return url
}

export const getPool = () => {
  pool ??= new Pool({
    connectionString: getDatabaseUrl(),
    max: 10,
    idleTimeoutMillis: 30_000,
  })
  return pool
}

export const withTransaction = async <T>(
  callback: (client: pg.PoolClient) => Promise<T>,
) => {
  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
