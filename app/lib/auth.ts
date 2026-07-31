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

    const secret = process.env.JWT_SECRET || 'usiu_campus_tickets_secret_key_2026'
    const decoded = jwt.verify(token, secret) as UserPayload
    return decoded

  } catch (error) {
    return null
  }
}