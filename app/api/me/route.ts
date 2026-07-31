import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getCurrentUser } from '@/app/lib/auth'
export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  return NextResponse.json({ user })
}