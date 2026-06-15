import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/lib/auth'
import pool from '@/app/lib/db'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const result = await pool.query(
    `SELECT t.id, t.qr_code, t.payment_status, t.created_at,
            e.title, e.venue, e.date, e.time, e.price_amount
     FROM tickets t
     JOIN events e ON t.event_id = e.id
     WHERE t.user_id = $1
     ORDER BY t.created_at DESC`,
    [Number(user.userId)]
  )

  return NextResponse.json({ tickets: result.rows })
}