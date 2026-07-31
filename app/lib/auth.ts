import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

export interface UserPayload {
  userId: number
  email: string
  role: string
  firstName: string
}

export async function getCurrentUser(): Promise<UserPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) return null

    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET environment variable is not set')
    const decoded = jwt.verify(token, secret) as UserPayload
    return decoded

  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}