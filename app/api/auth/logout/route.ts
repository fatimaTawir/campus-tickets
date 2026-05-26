import { NextResponse } from 'next/server'

export async function GET() {
  const response = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'))
  
  response.cookies.set('token', '', {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  path: '/',
  expires: new Date(0),
  maxAge: 0,
})

  return response
}