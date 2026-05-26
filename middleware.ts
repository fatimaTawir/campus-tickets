import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const protectedRoutes = [
  '/dashboard',
  '/dashboard/tickets',
  '/dashboard/notifications',
  '/dashboard/profile',
  '/dashboard/upgrade',
  '/booking-confirmed',
  '/tickets',
  '/pay',
  '/organizer',
]

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url))
    }

    try {
      await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET!)
      )
      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/booking-confirmed/:path*',
    '/tickets/:path*',
    '/pay/:path*',
    '/organizer/:path*',
  ]
}