import { NextResponse } from 'next/server'

export async function GET() {
  const isProduction = process.env.NODE_ENV === 'production'

  const response = NextResponse.redirect(
    new URL('/', process.env.NEXT_PUBLIC_URL || 'https://campus-tickets-wheat.vercel.app')
  )

  response.cookies.set('token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  })

  return response
}