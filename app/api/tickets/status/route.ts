import { NextRequest, NextResponse } from 'next/server'
import pool from '@/app/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get('ticketId')

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 })
    }

    const result = await pool.query(
      'SELECT payment_status FROM tickets WHERE id = $1',
      [ticketId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json({ status: result.rows[0].payment_status })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}