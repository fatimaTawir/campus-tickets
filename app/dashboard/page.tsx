import { getCurrentUser } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import pool from '@/app/lib/db'
import { Home, Calendar, Ticket, Bell, Settings, HelpCircle, LogOut, Star, Check } from 'lucide-react'

export const dynamic = 'force-dynamic'

type DashboardTicket = {
  id: number
  title: string
  venue: string
  date: string
  payment_status: 'paid' | 'pending' | string
}

type CountRow = {
  count: number | string
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const ticketsResult = await pool.query(
    `SELECT t.id, t.qr_code, t.payment_status, t.created_at,
            e.title, e.venue, e.date, e.time, e.price_amount
     FROM tickets t
     JOIN events e ON t.event_id = e.id
     WHERE t.user_id = $1
     ORDER BY t.created_at DESC`,
    [Number(user.userId)]
  ).catch(() => ({ rows: [] as DashboardTicket[] }))

  const eventsResult = await pool.query(
    `SELECT COUNT(*) as count FROM events WHERE date >= CURRENT_DATE`
  ).catch(() => ({ rows: [{ count: 0 }] as CountRow[] }))

  const tickets = ticketsResult.rows as DashboardTicket[]
  const upcomingCount = Number(eventsResult.rows[0]?.count ?? 0)
  const paidTickets = tickets.filter((ticket) => ticket.payment_status === 'paid')
  const pendingTickets = tickets.filter((ticket) => ticket.payment_status === 'pending')
  const initials = `${user.firstName?.[0] ?? ''}`.toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen fixed left-0 top-0 z-10">

        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#002868] rounded-lg flex items-center justify-center">
              <span className="text-[#f0b429] text-xs font-bold">CT</span>
            </div>
            <span className="font-bold text-gray-800">CampusTickets</span>
          </Link>
        </div>

        {/* User profile */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#002868] rounded-full flex items-center justify-center text-white font-bold text-sm">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{user.firstName}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3 px-2">Menu</p>
          <div className="flex flex-col gap-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#002868] text-white text-sm font-medium">
              <Home className="w-4 h-4" /> Dashboard
            </Link>
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm">
               <Calendar className="w-4 h-4" /> Browse events
            </Link>
            <Link href="/dashboard/tickets" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm">
                  <Ticket className="w-4 h-4" /> My tickets
            </Link>
            <Link href="/dashboard/notifications" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm">
              <Bell className="w-4 h-4" /> Notifications
            </Link>
          </div>

          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3 px-2 mt-6">Account</p>
          <div className="flex flex-col gap-1">
            <Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm">
              <Settings className="w-4 h-4" /> Profile settings
            </Link>
            <Link href="/help" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm">
              <HelpCircle className="w-4 h-4" /> Help & support
            </Link>
            {(user.role === 'organizer' || user.role === 'admin') && (
              <Link href="/organizer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm">
                <span>📊</span> Organizer
              </Link>
            )}
          </div>
        </nav>

        {/* Bottom */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="bg-[#f0b429]/10 rounded-xl p-3 mb-3">
            <p className="text-xs font-bold text-[#002868]"><Star className="w-4 h-4 fill-current" /> UPGRADE</p>
            <p className="text-xs text-gray-500">Get Pro features</p>
          </div>
          <Link
            href="/api/auth/logout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 text-sm w-full"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1">

        {/* Top navbar */}
        <div className="bg-[#002868] px-8 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f0b429] rounded-lg flex items-center justify-center">
              <span className="text-[#002868] text-xs font-bold">CT</span>
            </div>
            <span className="text-white font-bold text-sm">USIU-A · Campus Tickets</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-blue-200 hover:text-white text-sm font-medium">Events</Link>
            <Link href="/about" className="text-blue-200 hover:text-white text-sm font-medium">About</Link>
            <Link href="/help" className="text-blue-200 hover:text-white text-sm font-medium">Help</Link>
            <div className="relative">
              <Bell className="w-5 h-5 text-blue-200 cursor-pointer" />
              {pendingTickets.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingTickets.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#f0b429] rounded-full flex items-center justify-center text-[#002868] text-xs font-bold">
                {initials}
              </div>
              <span className="text-sm font-medium text-white">{user.firstName}</span>
            </div>
          </div>
        </div>

        <div className="p-8">

          {/* Welcome banner */}
          <div className="bg-[#002868] rounded-2xl p-6 mb-6 flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm mb-1">Good morning,</p>
              <h2 className="text-2xl font-bold text-white">{user.firstName}</h2>
              <p className="text-blue-300 text-sm mt-1">{user.email}</p>
            </div>
            <Link
              href="/"
              className="bg-[#f0b429] text-[#002868] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-yellow-400"
            >
              + Book a ticket
            </Link>
          </div>

          {/* Stats */}
        
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Upcoming Events</p>
              <p className="text-3xl font-bold text-[#002868]">{upcomingCount}</p>
              <p className="text-xs text-gray-400 mt-1">Available now</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">My Tickets</p>
              <p className="text-3xl font-bold text-[#002868]">{tickets.length}</p>
              <p className="text-xs text-gray-400 mt-1">All time</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Notifications</p>
              <p className="text-3xl font-bold text-[#f0b429]">{pendingTickets.length}</p>
              <p className="text-xs text-gray-400 mt-1">Pending payments</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">

            {/* My tickets — left 2/3 */}
            <div className="col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Your Next Ticket</h3>
                {paidTickets.length === 0 && pendingTickets.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">📁</span>
                    </div>
                    <p className="font-medium text-gray-700 mb-1">No upcoming tickets</p>
                    <p className="text-sm text-gray-400 mb-4">You don&apos;t have any valid tickets for upcoming events.</p>
                    <Link href="/" className="border border-gray-300 text-gray-600 text-sm px-5 py-2 rounded-xl hover:bg-gray-50">
                      Browse events
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{ticket.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">📍 {ticket.venue} · 📅 {ticket.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            ticket.payment_status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {ticket.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                          </span>
                          {ticket.payment_status === 'pending' && (
                            <Link href={`/pay/${ticket.id}`} className="bg-[#002868] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-900">
                              Pay Now
                            </Link>
                          )}
                          {ticket.payment_status === 'paid' && (
                            <Link href={`/booking-confirmed/${ticket.id}`} className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700">
                              View Ticket
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming events — right 1/3 */}
            <div className="col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Upcoming events</h3>
                  <Link href="/" className="text-xs text-[#002868] hover:underline">View all</Link>
                </div>
                <div className="flex flex-col gap-3">
                  {tickets.slice(0, 3).map((ticket) => (
                    <div key={ticket.id} className="flex items-start gap-3">
                      <div className="bg-[#002868] text-white rounded-lg p-2 text-center min-w-[40px]">
                        <p className="text-xs font-bold">{new Date(ticket.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</p>
                        <p className="text-sm font-bold">{new Date(ticket.date).getDate()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{ticket.title}</p>
                        <p className="text-xs text-gray-400">📍 {ticket.venue}</p>
                      </div>
                    </div>
                  ))}
                  {tickets.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">No events yet</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
