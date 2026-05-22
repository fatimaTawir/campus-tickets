import { getCurrentUser } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import pool from '@/app/lib/db'
import QRTicket from '@/app/components/QRTicket'

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  // Get ticket details
  const result = await pool.query(
    `SELECT t.id, t.qr_code, t.payment_status, t.created_at,
            e.title, e.venue, e.date, e.time,
            u.first_name, u.last_name
     FROM tickets t
     JOIN events e ON t.event_id = e.id
     JOIN users u ON t.user_id = u.id
     WHERE t.id = $1 AND t.user_id = $2`,
    [id, user.userId]
  )

  if (result.rows.length === 0) {
    redirect('/dashboard')
  }

  const ticket = result.rows[0]

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

      <div className="max-w-lg mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
          Your Ticket
        </h2>

        <QRTicket
          qrCode={ticket.qr_code}
          eventTitle={ticket.title}
          eventDate={`${ticket.date} · ${ticket.time}`}
          eventVenue={ticket.venue}
          studentName={`${ticket.first_name} ${ticket.last_name}`}
          paymentStatus={ticket.payment_status}
        />

        <div className="text-center mt-6">
          <Link
            href="/dashboard"
            className="inline-block bg-[#002868] text-white px-6 py-2.5 rounded-lg text-sm hover:bg-blue-900"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

    </main>
  )
}