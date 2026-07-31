import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const PROTECTED_PATHS = [
  '/dashboard',
  '/booking-confirmed',
  '/pay',
  '/organizer',
]

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      // In production we can't throw (middleware must return a response),
      // so redirect everyone to login with a clear reason logged
      console.error('FATAL: JWT_SECRET is not set. Set it in Vercel Environment Variables.')
      return new TextEncoder().encode('__invalid_secret__')
    }
    return new TextEncoder().encode('usiu_campus_tickets_secret_key_2026')
  }
  return new TextEncoder().encode(secret)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const token = request.cookies.get('token')?.value

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    await jwtVerify(token, getSecret())
    return NextResponse.next()
  } catch (error: any) {
    // Only log unexpected errors, not normal expiry/invalid
    const msg = error?.message ?? ''
    if (!msg.includes('expired') && !msg.includes('invalid')) {
      console.error('Middleware JWT error:', error)
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    return response
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/booking-confirmed/:path*',
    '/pay/:path*',
    '/organizer/:path*',
  ]
}