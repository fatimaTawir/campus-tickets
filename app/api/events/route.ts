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

    const { title, category, venue, date, time, price, priceAmount, capacity, description } = await request.json()

    if (!title || !venue || !date || !time) {
      return NextResponse.json({ error: 'Please fill in all required fields' }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO events (title, category, venue, date, time, price, price_amount, capacity, organizer_id, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [title, category, venue, date, time, price || 'Free', priceAmount || 0, capacity || 100, user.userId, description || '']
    )

    return NextResponse.json({ message: 'Event created!', event: result.rows[0] }, { status: 201 })

  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}