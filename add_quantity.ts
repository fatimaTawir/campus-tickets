import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function run() {
  try {
    await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;`)
    console.log("Column 'quantity' added successfully")
  } catch(e) {
    console.error(e)
  }
  process.exit(0)
}

run()
