import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/app/lib/db'
import { rateLimit } from '@/app/lib/rate-limit'
import { signToken } from '@/app/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Rate-limit: 10 login attempts per IP per 15 minutes
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'
    const rl = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          },
        }
      )
    }

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

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
    })

    const isProduction = process.env.NODE_ENV === 'production'

    const response = NextResponse.json({
      message: 'Login successful!',
      user: {
        id: user.id,
        firstName: user.first_name,
        email: user.email,
        role: user.role,
      }
    }, { status: 200 })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response

  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error.message || 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}