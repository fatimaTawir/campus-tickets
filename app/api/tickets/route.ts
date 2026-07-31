import { NextRequest, NextResponse } from 'next/server'
import pool from '@/app/lib/db'
import { getCurrentUser } from '@/app/lib/auth'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  const client = await pool.connect()
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

    await client.query('BEGIN')

    // 3. Lock the event row to prevent concurrent oversell (SELECT FOR UPDATE)
    const eventResult = await client.query(
      'SELECT * FROM events WHERE id = $1 FOR UPDATE',
      [eventId]
    )

    if (eventResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    const event = eventResult.rows[0]

    // 4. Check if event is full (inside the lock)
    if (event.tickets_sold >= event.capacity) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { error: 'Sorry, this event is sold out' },
        { status: 400 }
      )
    }

    // 5. Check if user already has a ticket for this event
    const existingTicket = await client.query(
      'SELECT id FROM tickets WHERE user_id = $1 AND event_id = $2',
      [user.userId, eventId]
    )

    if (existingTicket.rows.length > 0) {
      await client.query('ROLLBACK')
      // Return the existing ticket so user can pay
      return NextResponse.json({
        message: 'You already have a ticket for this event',
        ticket: existingTicket.rows[0],
        alreadyExists: true
      }, { status: 200 })
    }

    // 6. Generate a unique QR code ID
    const qrCode = `USIU-${randomUUID().toUpperCase()}`

    // 7. Save the ticket to database
    const ticketResult = await client.query(
      `INSERT INTO tickets (user_id, event_id, qr_code, payment_status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user.userId, eventId, qrCode, event.price_amount === 0 ? 'paid' : 'pending']
    )

    // 8. Atomically increment tickets sold count
    await client.query(
      'UPDATE events SET tickets_sold = tickets_sold + 1 WHERE id = $1',
      [eventId]
    )

    await client.query('COMMIT')

    return NextResponse.json({
      message: 'Ticket booked successfully!',
      ticket: ticketResult.rows[0]
    }, { status: 201 })

  } catch (error: any) {
    await client.query('ROLLBACK').catch(() => {})
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
  } finally {
    client.release()
  }
}