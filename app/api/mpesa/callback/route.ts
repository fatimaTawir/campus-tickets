import { NextRequest, NextResponse } from 'next/server'
import pool from '@/app/lib/db'

// Known Safaricom production + sandbox IP ranges
// Override via MPESA_ALLOWED_IPS env var (comma-separated) for flexibility
const DEFAULT_SAFARICOM_IPS = [
  '196.201.214.200',
  '196.201.214.206',
  '196.201.213.114',
  '196.201.214.207',
  '196.201.214.208',
  '196.201.213.44',
  '196.201.212.127',
  '196.201.212.128',
  '196.201.212.129',
  '196.201.212.132',
  '196.201.212.136',
  '196.201.212.138',
]

function getAllowedIps(): Set<string> {
  const env = process.env.MPESA_ALLOWED_IPS
  if (env) {
    return new Set(env.split(',').map((ip) => ip.trim()))
  }
  return new Set(DEFAULT_SAFARICOM_IPS)
}

export async function POST(request: NextRequest) {
  try {
    // --- IP Allowlist ---
    const callerIp =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      ''

    // Skip IP check in sandbox/dev (MPESA_SANDBOX=true)
    const isSandbox = process.env.MPESA_SANDBOX === 'true'
    if (!isSandbox && !getAllowedIps().has(callerIp)) {
      console.warn('M-Pesa callback blocked from IP:', callerIp)
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    const { Body } = body

    if (!Body || !Body.stkCallback) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' })
    }

    const { ResultCode, CallbackMetadata, CheckoutRequestID } = Body.stkCallback

    if (ResultCode === 0) {
      // Payment was successful — extract ticket ID from AccountReference
      const items = CallbackMetadata?.Item || []
      const accountRef: string | undefined = items.find(
        (item: any) => item.Name === 'AccountReference'
      )?.Value

      if (accountRef) {
        // AccountReference format: "CampusTickets-{ticketId}"
        const match = accountRef.match(/^CampusTickets-(\d+)$/)
        const ticketId = match?.[1]

        if (ticketId) {
          await pool.query(
            'UPDATE tickets SET payment_status = $1 WHERE id = $2',
            ['paid', ticketId]
          )
          console.log('Ticket marked as paid via callback:', ticketId)
        } else {
          console.warn('Could not parse ticket ID from AccountReference:', accountRef)
        }
      }
    } else {
      console.log('M-Pesa payment not successful. ResultCode:', ResultCode, 'CheckoutRequestID:', CheckoutRequestID)
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' })

  } catch (error) {
    console.error('Callback error:', error)
    // Always return success to Safaricom to prevent retries
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' })
  }
}