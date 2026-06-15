import 'server-only'
import { Pool, type QueryConfig, type QueryResult, type QueryResultRow } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
})

const rawQuery = pool.query.bind(pool)

function getQueryText(query: unknown) {
  if (typeof query === 'string') {
    return query
  }

  if (
    query &&
    typeof query === 'object' &&
    'text' in query &&
    typeof (query as QueryConfig).text === 'string'
  ) {
    return (query as QueryConfig).text
  }

  return ''
}

function isConnectionError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false
  }

  const { code, message } = error as { code?: string; message?: string }

  return (
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'ETIMEDOUT' ||
    message?.includes('ECONNREFUSED') === true
  )
}

function isReadQuery(queryText: string) {
  const normalized = queryText.trimStart().toLowerCase()
  return (
    normalized.startsWith('select') ||
    normalized.startsWith('with') ||
    normalized.startsWith('show') ||
    normalized.startsWith('explain')
  )
}

function emptyResult<T extends QueryResultRow = QueryResultRow>(): QueryResult<T> {
  return {
    rows: [],
    rowCount: 0,
    command: 'SELECT',
    oid: 0,
    fields: [],
  } as QueryResult<T>
}

pool.query = (async (...args: Parameters<typeof rawQuery>) => {
  try {
    return await rawQuery(...args)
  } catch (error) {
    const queryText = getQueryText(args[0])

    if (isConnectionError(error) && isReadQuery(queryText)) {
      return emptyResult()
    }

    throw error
  }
}) as typeof pool.query

export default pool
