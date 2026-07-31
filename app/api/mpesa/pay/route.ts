import { NextRequest, NextResponse } from 'next/server'
import pool from '@/app/lib/db'
import { getCurrentUser } from '@/app/lib/auth'

async function getMpesaToken() {
  if (process.env.MPESA_SANDBOX === 'true') {
    return 'mock-sandbox-token-12345';
  }

  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${auth}`,
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      }
    )

    const text = await response.text()

    if (!text || text.trim() === '') {
      throw new Error(`Empty response from Safaricom. Status: ${response.status}`)
    }

    const data = JSON.parse(text)

    if (!data.access_token) {
      throw new Error(`No access token in Safaricom response`)
    }

    return data.access_token

  } finally {
    clearTimeout(timeout)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { phone, amount, ticketId, eventTitle } = await request.json()

    if (!phone || !amount || !ticketId) {
      return NextResponse.json(
        { error: 'Phone, amount and ticket ID are required' },
        { status: 400 }
      )
    }

    // Verify the ticket belongs to the authenticated user
    const ticketCheck = await pool.query(
      'SELECT id FROM tickets WHERE id = $1 AND user_id = $2',
      [ticketId, Number(user.userId)]
    )
    if (ticketCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Ticket not found or access denied' },
        { status: 403 }
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

    let stkData;

    if (process.env.MPESA_SANDBOX === 'true') {
      stkData = {
        ResponseCode: '0',
        CheckoutRequestID: `ws_CO_${Math.floor(Math.random() * 1000000)}`,
        CustomerMessage: 'Success. Request accepted for processing'
      };
    } else {
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

      if (!stkText || stkText.trim() === '') {
        return NextResponse.json(
          { error: 'No response from Safaricom STK push' },
          { status: 500 }
        )
      }
      stkData = JSON.parse(stkText)
    }

    if (stkData.ResponseCode === '0') {
      return NextResponse.json({
        message: 'STK push sent! Check your phone and enter your M-Pesa PIN.',
        checkoutRequestId: stkData.CheckoutRequestID,
      })
    } else {
      console.error('STK push failed:', stkData.errorMessage || stkData.ResultDesc)
      return NextResponse.json(
        { error: `Payment failed: ${stkData.errorMessage || stkData.ResultDesc || 'Unknown error'}` },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('M-Pesa error:', error)
    return NextResponse.json(
      { error: error.message || 'Payment failed. Please try again.' },
      { status: 500 }
    )
  }
}