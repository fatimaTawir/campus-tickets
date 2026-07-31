import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/app/lib/db'
import { rateLimit } from '@/app/lib/rate-limit'
import { signToken } from '@/app/lib/auth'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    // Rate-limit: 5 signups per IP per hour
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'
    const rl = rateLimit(`signup:${ip}`, 5, 60 * 60 * 1000)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const { firstName, lastName, email, studentId, password } = await request.json()

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      )
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    // Role is ALWAYS 'student' — never trust the client-supplied role
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, student_id, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, first_name, last_name, email, role`,
      [firstName.trim(), lastName.trim(), email.toLowerCase().trim(), studentId || null, passwordHash, 'student']
    )

    const newUser = result.rows[0]

    const token = await signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      firstName: newUser.first_name,
    })

    const isProduction = process.env.NODE_ENV === 'production'

    const response = NextResponse.json({
      message: 'Account created successfully!',
      user: newUser
    }, { status: 201 })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}