import { getCurrentUser } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import pool from '@/app/lib/db'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const ticketsResult = await pool.query(
    `SELECT t.id, t.qr_code, t.payment_status, t.created_at,
            e.title, e.venue, e.date, e.time, e.price_amount
     FROM tickets t
     JOIN events e ON t.event_id = e.id
     WHERE t.user_id = $1
     ORDER BY t.created_at DESC`,
    [user.userId]
  ).catch(() => ({ rows: [] }))

  const tickets = ticketsResult.rows

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
        <div className="flex items-center gap-4">
          <span className="text-blue-200 text-sm">Hi, {user.firstName}!</span>
          <Link
            href="/api/auth/logout"
            className="bg-[#BF0A30] text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
          >
            Log out
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 w-full">

        {/* Welcome banner */}
        <div className="bg-[#002868] rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div>
            <p className="text-[#f0b429] text-sm font-semibold uppercase tracking-widest mb-1">
              Student Dashboard
            </p>
            <h2 className="text-2xl font-bold text-white">
              Welcome back, {user.firstName}!
            </h2>
            <p className="text-blue-200 text-sm mt-1">{user.email}</p>
          </div>
          <div className="text-6xl">🎓</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <p className="text-3xl font-bold text-[#002868]">{tickets.length}</p>
            <p className="text-gray-500 text-sm mt-1">Tickets Purchased</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <p className="text-3xl font-bold text-[#BF0A30]">
              {tickets.filter((t: any) => t.payment_status === 'paid').length}
            </p>
            <p className="text-gray-500 text-sm mt-1">Confirmed Tickets</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <p className="text-3xl font-bold text-[#f0b429]">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </p>
            <p className="text-gray-500 text-sm mt-1">Account Type</p>
          </div>
        </div>

        {/* My Tickets */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">My Tickets</h3>
          {tickets.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">🎟️</p>
              <p className="text-gray-500 text-sm">You haven't bought any tickets yet.</p>
              <Link
                href="/"
                className="inline-block mt-4 bg-[#002868] text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-900"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {tickets.map((ticket: any) => (
                <div key={ticket.id} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{ticket.title}</p>
                    <p className="text-sm text-gray-500">📍 {ticket.venue} · 📅 {ticket.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                      ticket.payment_status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {ticket.payment_status}
                    </span>
                    {ticket.payment_status === 'pending' && (
                      <Link
                        href={`/pay/${ticket.id}`}
                        className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700"
                      >
                        Pay Now
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Browse Events button */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block bg-[#BF0A30] text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-red-700"
          >
            Browse Upcoming Events
          </Link>
        </div>

      </div>
    </main>
  )
}