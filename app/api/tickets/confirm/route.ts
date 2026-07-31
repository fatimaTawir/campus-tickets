import { NextRequest, NextResponse } from 'next/server'
import pool from '@/app/lib/db'
import { getCurrentUser } from '@/app/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { ticketId, quantity = 1 } = await request.json()

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 })
    }

    // Only allow confirming tickets that belong to this user
    const result = await pool.query(
      'UPDATE tickets SET payment_status = $1, quantity = $2 WHERE id = $3 AND user_id = $4 RETURNING id, payment_status, quantity',
      ['paid', quantity, ticketId, Number(user.userId)]
    )

    console.log('Confirm result:', result.rows)

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Ticket not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({ success: true, ticketId })

  } catch (error: any) {
    console.error('Confirm error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}