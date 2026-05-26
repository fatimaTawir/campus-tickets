import { NextRequest, NextResponse } from 'next/server'

const protectedRoutes = [
  '/dashboard',
  '/booking-confirmed',
  '/tickets',
  '/pay',
  '/organizer',
]

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtected && !token) {
    return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url))
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