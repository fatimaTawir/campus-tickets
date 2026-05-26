import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '@/app/lib/db'

export async function POST(request: NextRequest) {
  try {
    // 1. Get email and password from the form
    const { email, password } = await request.json()

    // 2. Check fields are filled
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Please enter your email and password' },
        { status: 400 }
      )
    }

    // 3. Find the user in the database
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

    // 4. Compare the password with the stored hash
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // 5. Create a JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    )

    // 6. Send back the token and user info
    const response = NextResponse.json({
      message: 'Login successful!',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
      }
    }, { status: 200 })

    // 7. Save token in a cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
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