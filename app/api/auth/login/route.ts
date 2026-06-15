import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '@/app/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Please enter your email and password' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const user = result.rows[0]
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const secret = process.env.JWT_SECRET || 'usiu_campus_tickets_secret_key_2026'
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
      },
      secret,
      { expiresIn: '30d' }
    )

    const response = NextResponse.json({
      message: 'Login successful!',
      token: token,
      user: {
        id: user.id,
        firstName: user.first_name,
        email: user.email,
        role: user.role,
      }
    }, { status: 200 })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}