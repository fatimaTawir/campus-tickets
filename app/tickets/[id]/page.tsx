import { getCurrentUser } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import pool from '@/app/lib/db'
import QRTicket from '@/app/components/QRTicket'

export const dynamic = 'force-dynamic'

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

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

  if (result.rows.length === 0) {
    redirect('/dashboard')
  }

  const ticket = result.rows[0]
  const bookingRef = ticket.qr_code.replace('USIU-', '').substring(0, 8).toUpperCase()

  // Define tracking steps
  const steps = [
    {
      label: 'Ticket Booked',
      description: 'Your ticket has been reserved',
      done: true,
      icon: '🎟️',
    },
    {
      label: 'Payment Confirmed',
      description: ticket.payment_status === 'paid'
        ? 'Payment received successfully'
        : 'Waiting for payment',
      done: ticket.payment_status === 'paid',
      icon: '💳',
    },
    {
      label: 'Ticket Ready',
      description: ticket.payment_status === 'paid'
        ? 'Your QR code is ready to scan'
        : 'QR code will be available after payment',
      done: ticket.payment_status === 'paid',
      icon: '📱',
    },
    {
      label: 'Scanned at Entrance',
      description: 'Show QR code at event entrance',
      done: false,
      icon: '✅',
    },
  ]

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-[#002868] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#BF0A30] text-white text-xs font-bold px-2 py-1 rounded">
            USIU-A
          </div>
          <Link href="/" className="text-white text-lg font-bold">CampusTickets</Link>
        </div>
        <Link href="/dashboard" className="text-blue-200 hover:text-white text-sm">
          ← Back to Dashboard
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Your Ticket
        </h2>
        <p className="text-gray-400 text-sm text-center mb-8">
          Booking Ref: <span className="font-mono font-bold text-[#002868]">USIU-{bookingRef}</span>
        </p>

        {/* Tracking timeline */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Ticket Status</h3>
          <div className="flex flex-col gap-0">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                {/* Icon and line */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 ${
                    step.done
                      ? 'bg-green-100 border-green-500'
                      : 'bg-gray-100 border-gray-300'
                  }`}>
                    {step.icon}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-0.5 h-8 ${
                      step.done ? 'bg-green-400' : 'bg-gray-200'
                    }`} />
                  )}
                </div>

                {/* Content */}
                <div className="pb-8">
                  <p className={`font-medium text-sm ${
                    step.done ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${
                    step.done ? 'text-gray-500' : 'text-gray-300'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QR Code ticket */}
        <QRTicket
          qrCode={ticket.qr_code}
          eventTitle={ticket.title}
          eventDate={`${ticket.date} · ${ticket.time}`}
          eventVenue={ticket.venue}
          studentName={`${ticket.first_name} ${ticket.last_name}`}
          paymentStatus={ticket.payment_status}
        />

        {/* Action buttons */}
        <div className="flex flex-col gap-3 mt-6">
          {ticket.payment_status === 'pending' && (
            <Link
              href={`/pay/${ticket.id}`}
              className="bg-green-600 text-white text-center py-3 rounded-xl text-sm font-medium hover:bg-green-700"
            >
              💳 Pay Now
            </Link>
          )}
          <Link
            href="/dashboard"
            className="bg-[#002868] text-white text-center py-3 rounded-xl text-sm font-medium hover:bg-blue-900"
          >
            Back to Dashboard
          </Link>
        </div>

      </div>
    </main>
  )
}