import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/app/lib/db'

export async function POST(request: NextRequest) {
  try {
    // 1. Get the data sent from the signup form
    const { firstName, lastName, email, studentId, password, role } = await request.json()

    // 2. Check all fields are filled
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      )
    }

    // 3. Check if email already exists
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

    // 4. Hash the password — never store plain text passwords
    const passwordHash = await bcrypt.hash(password, 12)

    // 5. Save the new user to the database
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, student_id, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, first_name, last_name, email, role`,
      [firstName, lastName, email, studentId || null, passwordHash, role || 'student']
    )

    const newUser = result.rows[0]

    // 6. Return success
    return NextResponse.json({
      message: 'Account created successfully!',
      user: newUser
    }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}