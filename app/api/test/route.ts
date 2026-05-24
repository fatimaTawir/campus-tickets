import { NextRequest, NextResponse } from 'next/server'
import pool from '@/app/lib/db'
import { getCurrentUser } from '@/app/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
    }

    const { ticketId } = await request.json()

    await pool.query(
      'UPDATE tickets SET payment_status = $1 WHERE id = $2 AND user_id = $3',
      ['paid', ticketId, user.userId]
    )

    return NextResponse.json({ message: 'Payment confirmed!' })

  } catch (error) {
    console.error('Confirm error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}