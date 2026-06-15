import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
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