import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'

export interface UserPayload {
  userId: number
  email: string
  role: string
  firstName: string
}

/** Returns the JWT secret as a Uint8Array for use with jose */
export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    // In production this should never happen — set JWT_SECRET in Vercel env vars
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is not set in production')
    }
    // Safe dev-only fallback
    return new TextEncoder().encode('usiu_campus_tickets_secret_key_2026')
  }
  return new TextEncoder().encode(secret)
}

export async function getCurrentUser(): Promise<UserPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) return null

    const { payload } = await jwtVerify(token, getJwtSecret())

    return {
      userId: payload.userId as number,
      email: payload.email as string,
      role: payload.role as string,
      firstName: payload.firstName as string,
    }

  } catch (error) {
    // Only log unexpected errors (not normal expired-token errors)
    const msg = (error as any)?.message ?? ''
    if (!msg.includes('expired') && !msg.includes('invalid')) {
      console.error('Auth verification error:', error)
    }
    return null
  }
}

/** Create a signed JWT with jose (Edge + Node compatible) */
export async function signToken(payload: UserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret())
}