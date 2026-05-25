import { NextRequest, NextResponse } from 'next/server'
import pool from '@/app/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { ticketId } = await request.json()

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 })
    }

    const result = await pool.query(
      'UPDATE tickets SET payment_status = $1 WHERE id = $2 RETURNING id, payment_status',
      ['paid', ticketId]
    )

    console.log('Confirm result:', result.rows)

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, ticketId })

  } catch (error: any) {
    console.error('Confirm error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}