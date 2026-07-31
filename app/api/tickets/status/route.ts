import { NextRequest, NextResponse } from 'next/server'
import pool from '@/app/lib/db'
import { getCurrentUser } from '@/app/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get('ticketId')

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 })
    }

    // Only return status for tickets owned by the current user
    const result = await pool.query(
      'SELECT payment_status FROM tickets WHERE id = $1 AND user_id = $2',
      [ticketId, Number(user.userId)]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json({ status: result.rows[0].payment_status })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}