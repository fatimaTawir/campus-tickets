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

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload
    
    console.log('Current user from token:', decoded)
    
    return decoded

  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}