import { NextRequest, NextResponse } from 'next/server'

async function getMpesaToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64')

  const response = await fetch(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      headers: { Authorization: `Basic ${auth}` },
      signal: AbortSignal.timeout(10000),
    }
  )

  const text = await response.text()

  if (!text) {
    throw new Error('Empty response from Safaricom. Sandbox may be unavailable.')
  }

  const data = JSON.parse(text)
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const { phone, amount, ticketId, eventTitle } = await request.json()

    if (!phone || !amount || !ticketId) {
      return NextResponse.json(
        { error: 'Phone, amount and ticket ID are required' },
        { status: 400 }
      )
    }

    let formattedPhone = phone.replace(/\s/g, '')
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1)
    }
    if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.slice(1)
    }

    const token = await getMpesaToken()

    const now = new Date()
    const timestamp = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0')

    const shortcode = process.env.MPESA_SHORTCODE!
    const passkey = process.env.MPESA_PASSKEY!
    const password = Buffer.from(shortcode + passkey + timestamp).toString('base64')

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

    const stkText = await stkResponse.text()
    
    if (!stkText) {
      return NextResponse.json(
        { error: 'No response from Safaricom. Please try again.' },
        { status: 500 }
      )
    }

    const stkData = JSON.parse(stkText)

    if (stkData.ResponseCode === '0') {
      return NextResponse.json({
        message: 'STK push sent! Check your phone and enter your M-Pesa PIN.',
        checkoutRequestId: stkData.CheckoutRequestID,
      })
    } else {
      console.error('STK push failed:', JSON.stringify(stkData))
      return NextResponse.json(
        { error: `Payment failed: ${stkData.errorMessage || stkData.ResultDesc || 'Unknown error'}` },
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