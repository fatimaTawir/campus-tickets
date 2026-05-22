import { NextRequest, NextResponse } from 'next/server'
import pool from '@/app/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { Body } = body

    if (Body.stkCallback.ResultCode === 0) {
      // Payment successful
      const accountRef = Body.stkCallback.CallbackMetadata.Item
        .find((item: any) => item.Name === 'AccountReference')?.Value

      // Extract ticket ID from account reference (CampusTickets-{ticketId})
      const ticketId = accountRef?.split('-')[1]

      if (ticketId) {
        // Update ticket status to paid
        await pool.query(
          'UPDATE tickets SET payment_status = $1 WHERE id = $2',
          ['paid', ticketId]
        )
      }
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' })

  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' })
  }
}