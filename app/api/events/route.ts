import { NextRequest, NextResponse } from 'next/server'
import pool from '@/app/lib/db'
import { getCurrentUser } from '@/app/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Please log in' }, { status: 401 })
    }

    if (user.role !== 'organizer' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only organizers can create events' }, { status: 403 })
    }

    const body = await request.json()
    const title = body.title?.trim()
    const category = body.category?.trim() || 'General'
    const venue = body.venue?.trim()
    const date = body.date?.trim()
    const time = body.time?.trim()
    const description = body.description?.trim() || ''
    const price = body.price || 'Free'
    const priceAmount = parseFloat(body.priceAmount) || 0
    const capacity = parseInt(body.capacity) || 100

    if (!title || !venue || !date || !time) {
      return NextResponse.json({ error: 'Please fill in all required fields' }, { status: 400 })
    }

    if (title.length > 200) return NextResponse.json({ error: 'Title too long (max 200 chars)' }, { status: 400 })
    if (venue.length > 200) return NextResponse.json({ error: 'Venue too long (max 200 chars)' }, { status: 400 })
    if (description.length > 5000) return NextResponse.json({ error: 'Description too long (max 5000 chars)' }, { status: 400 })
    if (priceAmount < 0) return NextResponse.json({ error: 'Price amount cannot be negative' }, { status: 400 })
    if (capacity < 1 || capacity > 100000) return NextResponse.json({ error: 'Capacity must be between 1 and 100,000' }, { status: 400 })

    const result = await pool.query(
      `INSERT INTO events (title, category, venue, date, time, price, price_amount, capacity, organizer_id, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [title, category, venue, date, time, price, priceAmount, capacity, user.userId, description]
    )

    return NextResponse.json({ message: 'Event created!', event: result.rows[0] }, { status: 201 })

  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}