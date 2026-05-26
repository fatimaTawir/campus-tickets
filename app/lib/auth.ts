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
    
    // Try both cookie names just in case
    const token = cookieStore.get('token')?.value

    console.log('Auth check - token exists:', !!token)

    if (!token) return null

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET!
    ) as UserPayload
    
    console.log('Auth check - user:', decoded.email)
    
    return decoded

  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}