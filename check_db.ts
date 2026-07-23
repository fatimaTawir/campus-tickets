import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function check() {
  const res = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'tickets';
  `)
  console.log(res.rows)
  process.exit(0)
}

check()
