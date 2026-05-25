import { NextRequest, NextResponse } from 'next/server'
import pool from '@/app/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('M-Pesa callback received:', JSON.stringify(body))

    const { Body } = body

    if (!Body || !Body.stkCallback) {
      console.log('Invalid callback body')
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' })
    }

    const { ResultCode, CallbackMetadata, CheckoutRequestID } = Body.stkCallback

    console.log('ResultCode:', ResultCode)
    console.log('CheckoutRequestID:', CheckoutRequestID)

    if (ResultCode === 0) {
      // Payment was successful
      console.log('Payment successful!')

      // Get account reference from metadata
      const items = CallbackMetadata?.Item || []
      const accountRef = items.find((item: any) => item.Name === 'AccountReference')?.Value

      console.log('Account reference:', accountRef)

      if (accountRef) {
        // Extract ticket ID from CampusTickets-{ticketId}
        const ticketId = accountRef.split('-')[1]
        console.log('Ticket ID:', ticketId)

        if (ticketId) {
          await pool.query(
            'UPDATE tickets SET payment_status = $1 WHERE id = $2',
            ['paid', ticketId]
          )
          console.log('Ticket updated to paid:', ticketId)
        }
      }
    } else {
      console.log('Payment failed with ResultCode:', ResultCode)
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' })

  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' })
  }
}