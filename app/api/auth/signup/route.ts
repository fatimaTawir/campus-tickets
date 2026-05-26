import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '@/app/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, studentId, password, role } = await request.json()

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      )
    }

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, student_id, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, first_name, last_name, email, role`,
      [firstName, lastName, email, studentId || null, passwordHash, role || 'student']
    )

    const newUser = result.rows[0]

    // Auto-login: create JWT token immediately after signup
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.first_name,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    )

    const response = NextResponse.json({
      message: 'Account created successfully!',
      user: newUser
    }, { status: 201 })

    // Set cookie so user is logged in immediately after signup
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
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