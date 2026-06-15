import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const allCookies = request.cookies.getAll()
  
  return NextResponse.json({
    hasToken: !!token,
    tokenValue: token ? token.substring(0, 20) + '...' : null,
    allCookies: allCookies.map(c => c.name)
  })
}