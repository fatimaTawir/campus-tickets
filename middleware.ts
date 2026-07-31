import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

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
    jwt.verify(token, secret)
    // Token is valid — pass the request through, forwarding the cookie
    return NextResponse.next()
  } catch {
    // Token invalid/expired — clear it and redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.set('token', '', { maxAge: 0, path: '/' })
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