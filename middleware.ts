import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const PROTECTED_PATHS = [
  '/dashboard',
  '/booking-confirmed',
  '/pay',
  '/organizer',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  // Try to get token from cookie
  const token = request.cookies.get('token')?.value

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET environment variable is not set')
    await jwtVerify(token, new TextEncoder().encode(secret))
    // Token is valid — pass the request through, forwarding the cookie
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware JWT verification failed:', error)
    // Token invalid/expired — redirect to login
    // Don't clear cookie here; the login page will clear stale cookies after new login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
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