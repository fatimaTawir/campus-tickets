import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    // Try to get token from cookie
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const secret = process.env.JWT_SECRET || 'usiu_campus_tickets_secret_key_2026'
    const decoded = jwt.verify(token, secret) as any

    return NextResponse.json({ user: decoded })

  } catch (error) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
}