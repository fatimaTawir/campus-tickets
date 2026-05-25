import { NextRequest, NextResponse } from 'next/server'
import pool from '@/app/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { ticketId } = await request.json()

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 })
    }

    await pool.query(
      'UPDATE tickets SET payment_status = $1 WHERE id = $2',
      ['paid', ticketId]
    )

    return NextResponse.json({ message: 'Payment confirmed!' })

  } catch (error) {
    console.error('Confirm error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
