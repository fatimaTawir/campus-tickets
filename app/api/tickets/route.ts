import { NextRequest, NextResponse } from 'next/server'
import pool from '@/app/lib/db'
import { getCurrentUser } from '@/app/lib/auth'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // 1. Check user is logged in
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Please log in to buy a ticket' },
        { status: 401 }
      )
    }

    // 2. Get event ID from request
    const { eventId } = await request.json()

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    // 3. Check the event exists
    const eventResult = await pool.query(
      'SELECT * FROM events WHERE id = $1',
      [eventId]
    )

    if (eventResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    const event = eventResult.rows[0]

    // 4. Check if event is full
    if (event.tickets_sold >= event.capacity) {
      return NextResponse.json(
        { error: 'Sorry, this event is sold out' },
        { status: 400 }
      )
    }

    // 5. Check if user already has a ticket for this event
    const existingTicket = await pool.query(
      'SELECT id FROM tickets WHERE user_id = $1 AND event_id = $2',
      [user.userId, eventId]
    )

    if (existingTicket.rows.length > 0) {
      return NextResponse.json(
        { error: 'You already have a ticket for this event' },
        { status: 400 }
      )
    }

    // 6. Generate a unique QR code ID
    const qrCode = `USIU-${randomUUID().toUpperCase()}`

    // 7. Save the ticket to database
    const ticketResult = await pool.query(
      `INSERT INTO tickets (user_id, event_id, qr_code, payment_status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user.userId, eventId, qrCode, event.price_amount === 0 ? 'paid' : 'pending']
    )

    // 8. Update tickets sold count on the event
    await pool.query(
      'UPDATE events SET tickets_sold = tickets_sold + 1 WHERE id = $1',
      [eventId]
    )

    return NextResponse.json({
      message: 'Ticket booked successfully!',
      ticket: ticketResult.rows[0]
    }, { status: 201 })

  } catch (error: any) {
    // Handle duplicate ticket error from database
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'You already have a ticket for this event' },
        { status: 400 }
      )
    }

    console.error('Ticket error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}