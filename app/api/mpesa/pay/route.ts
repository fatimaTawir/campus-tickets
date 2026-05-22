import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/lib/auth'

async function getMpesaToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64')

  const response = await fetch(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  )

  const data = await response.json()
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    // 1. Check user is logged in
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Please log in first' },
        { status: 401 }
      )
    }

    // 2. Get payment details from request
    const { phone, amount, ticketId, eventTitle } = await request.json()

    if (!phone || !amount || !ticketId) {
      return NextResponse.json(
        { error: 'Phone, amount and ticket ID are required' },
        { status: 400 }
      )
    }

    // 3. Format phone number (must start with 254)
    let formattedPhone = phone.replace(/\s/g, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1)
    }
    if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.slice(1)
    }

    // 4. Get M-Pesa access token
    const token = await getMpesaToken()

    // 5. Generate timestamp
    const now = new Date()
    const timestamp = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0')

    // 6. Generate password
    const shortcode = process.env.MPESA_SHORTCODE!
    const passkey = process.env.MPESA_PASSKEY!
    const password = Buffer.from(shortcode + passkey + timestamp).toString('base64')

    // 7. Send STK push request
    const stkResponse = await fetch(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: amount,
          PartyA: formattedPhone,
          PartyB: shortcode,
          PhoneNumber: formattedPhone,
          CallBackURL: process.env.MPESA_CALLBACK_URL,
          AccountReference: `CampusTickets-${ticketId}`,
          TransactionDesc: `Ticket for ${eventTitle}`,
        }),
      }
    )

    const stkData = await stkResponse.json()

    if (stkData.ResponseCode === '0') {
      return NextResponse.json({
        message: 'STK push sent! Check your phone and enter your M-Pesa PIN.',
        checkoutRequestId: stkData.CheckoutRequestID,
      })
    } else {
      return NextResponse.json(
        { error: 'Payment request failed. Try again.' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('M-Pesa error:', error)
    return NextResponse.json(
      { error: 'Payment failed. Please try again.' },
      { status: 500 }
    )
  }
}