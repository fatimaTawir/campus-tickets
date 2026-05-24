import { getCurrentUser } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import pool from '@/app/lib/db'

export const dynamic = 'force-dynamic'

export default async function BookingConfirmedPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const { id } = await params

  const result = await pool.query(
    `SELECT t.id, t.qr_code, t.payment_status, t.created_at,
            e.title, e.venue, e.date, e.time,
            u.first_name, u.last_name
     FROM tickets t
     JOIN events e ON t.event_id = e.id
     JOIN users u ON t.user_id = u.id
     WHERE t.id = $1 AND t.user_id = $2`,
    [id, Number(user.userId)]
  )

  if (result.rows.length === 0) redirect('/dashboard')

  const ticket = result.rows[0]

  // Generate booking reference from QR code
  const bookingRef = ticket.qr_code.replace('USIU-', '').substring(0, 8).toUpperCase()

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">

      {/* Navbar */}
      <nav className="bg-[#002868] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#BF0A30] text-white text-xs font-bold px-2 py-1 rounded">
            USIU-A
          </div>
          <Link href="/" className="text-white text-lg font-bold">CampusTickets</Link>
        </div>
      </nav>

      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md text-center">

          {/* Success icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your ticket has been booked successfully.
          </p>

          {/* Booking reference */}
          <div className="bg-[#002868] rounded-xl p-4 mb-6">
            <p className="text-[#f0b429] text-xs uppercase tracking-widest mb-1">
              Booking Reference
            </p>
            <p className="text-white text-2xl font-bold tracking-widest">
              USIU-{bookingRef}
            </p>
          </div>

          {/* Event details */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-3">{ticket.title}</h3>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-gray-500">📅 {ticket.date} · {ticket.time}</p>
              <p className="text-sm text-gray-500">📍 {ticket.venue}</p>
              <p className="text-sm text-gray-500">🎓 {ticket.first_name} {ticket.last_name}</p>
            </div>
          </div>

          {/* Status */}
          <div className={`px-4 py-2 rounded-lg mb-6 text-sm font-medium ${
            ticket.payment_status === 'paid'
              ? 'bg-green-50 text-green-700'
              : 'bg-yellow-50 text-yellow-700'
          }`}>
            {ticket.payment_status === 'paid' ? '✅ Payment Confirmed' : '⏳ Payment Pending'}
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              href={`/tickets/${ticket.id}`}
              className="bg-[#002868] text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-900"
            >
              View QR Code Ticket
            </Link>
            <Link
              href="/dashboard"
              className="border border-gray-300 text-gray-600 py-3 rounded-xl text-sm hover:bg-gray-50"
            >
              Back to Dashboard
            </Link>
          </div>

        </div>
      </div>

    </main>
  )
}