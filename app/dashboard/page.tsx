import { getCurrentUser } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import pool from '@/app/lib/db'
import {
  Home, Calendar, Ticket, Bell, Settings,
  HelpCircle, LogOut, Star, Search,
  CheckCircle, Clock, XCircle, ArrowRight, MapPin
} from 'lucide-react'

export const dynamic = 'force-dynamic'

type DashboardTicket = {
  id: number
  title: string
  venue: string
  date: string
  time: string
  price_amount: number
  payment_status: 'paid' | 'pending' | string
}

type UpcomingEvent = {
  id: number
  title: string
  venue: string
  date: string
  category: string
  price_amount: number
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

  // Upcoming events the student hasn't bought a ticket to yet
  const upcomingResult = await pool.query(
    `SELECT e.id, e.title, e.venue, e.date, e.category, e.price_amount
     FROM events e
     WHERE e.date >= CURRENT_DATE
       AND e.id NOT IN (
         SELECT t.event_id FROM tickets t WHERE t.user_id = $1
       )
     ORDER BY e.date ASC
     LIMIT 5`,
    [Number(user.userId)]
  ).catch(() => ({ rows: [] as UpcomingEvent[] }))

  const tickets = ticketsResult.rows as DashboardTicket[]
  const upcomingEvents = upcomingResult.rows as UpcomingEvent[]
  const paidTickets = tickets.filter((t) => t.payment_status === 'paid')
  const pendingTickets = tickets.filter((t) => t.payment_status === 'pending')
  const initials = `${user.firstName?.[0] ?? ''}`.toUpperCase()

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

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
              <p className="text-xs text-gray-400 capitalize">
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  Student
                </span>
              </p>
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
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm transition-colors">
              <Search className="w-4 h-4" /> Browse Events
            </Link>
            <Link href="/dashboard/tickets" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm transition-colors">
              <Ticket className="w-4 h-4" /> My Tickets
              {paidTickets.length > 0 && (
                <span className="ml-auto bg-[#002868] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {paidTickets.length}
                </span>
              )}
            </Link>
            <Link href="/dashboard/notifications" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm transition-colors">
              <Bell className="w-4 h-4" /> Notifications
              {pendingTickets.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {pendingTickets.length}
                </span>
              )}
            </Link>
          </div>

          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3 px-2 mt-6">Account</p>
          <div className="flex flex-col gap-1">
            <Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm transition-colors">
              <Settings className="w-4 h-4" /> Profile Settings
            </Link>
            <Link href="/help" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm transition-colors">
              <HelpCircle className="w-4 h-4" /> Help &amp; Support
            </Link>
            {(user.role === 'organizer' || user.role === 'admin') && (
              <Link href="/organizer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm transition-colors">
                <Calendar className="w-4 h-4" /> Organizer Panel
              </Link>
            )}
          </div>
        </nav>

        {/* Upgrade + Logout */}
        <div className="px-4 py-4 border-t border-gray-100">
          <Link href="/dashboard/upgrade" className="block bg-gradient-to-r from-[#002868] to-[#1a5fcc] rounded-xl p-3 mb-3 hover:opacity-90 transition-opacity">
            <div className="flex items-center gap-2 mb-0.5">
              <Star className="w-3.5 h-3.5 text-[#f0b429] fill-current" />
              <p className="text-xs font-bold text-white">UPGRADE TO PRO</p>
            </div>
            <p className="text-[11px] text-blue-300">Priority booking &amp; exclusive events</p>
          </Link>
          <Link
            href="/api/auth/logout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 text-sm w-full transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 min-h-screen">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="font-bold text-gray-800">Student Dashboard</h1>
            <p className="text-xs text-gray-400">USIU-A · Campus Tickets</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="bg-[#002868] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-900 transition-colors">
              + Book a Ticket
            </Link>
            <div className="relative">
              <Bell className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
              {pendingTickets.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {pendingTickets.length}
                </span>
              )}
            </div>
            <div className="w-8 h-8 bg-[#002868] rounded-full flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">

          {/* Welcome */}
          <div
            className="rounded-2xl p-6 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #002868 0%, #1a5fcc 100%)' }}
          >
            <div>
              <p className="text-blue-300 text-sm mb-1">{greeting},</p>
              <h2 className="text-2xl font-bold text-white">{user.firstName} 🎟️</h2>
              <p className="text-blue-300 text-sm mt-1">
                {paidTickets.length === 0
                  ? "You haven't booked any tickets yet. Explore upcoming events!"
                  : `You have ${paidTickets.length} confirmed ticket${paidTickets.length !== 1 ? 's' : ''}. Ready to go!`}
              </p>
            </div>
            <Link
              href="/"
              className="bg-[#f0b429] text-[#002868] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-yellow-400 transition-colors shadow-lg"
            >
              Browse Events →
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Confirmed Tickets</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{paidTickets.length}</p>
              <p className="text-xs text-gray-400 mt-1">Ready to use</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Pending Payment</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{pendingTickets.length}</p>
              <p className="text-xs text-gray-400 mt-1">Complete payment to confirm</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-[#002868]" />
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Events Available</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{upcomingEvents.length}+</p>
              <p className="text-xs text-gray-400 mt-1">Explore &amp; book now</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">

            {/* My Tickets — left 2/3 */}
            <div className="col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">My Tickets</h3>
                  <Link href="/dashboard/tickets" className="text-xs text-[#002868] hover:underline flex items-center gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {tickets.length === 0 ? (
                  <div className="text-center py-14 px-6">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Ticket className="w-7 h-7 text-gray-300" />
                    </div>
                    <p className="font-medium text-gray-700 mb-1">No tickets yet</p>
                    <p className="text-sm text-gray-400 mb-5">Browse events and book your first ticket!</p>
                    <Link href="/" className="bg-[#002868] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-blue-900 transition-colors">
                      Browse Events
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {tickets.slice(0, 5).map((ticket) => {
                      const isPaid = ticket.payment_status === 'paid'
                      const isPending = ticket.payment_status === 'pending'
                      const eventDate = new Date(ticket.date)

                      return (
                        <div key={ticket.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-center gap-4">
                            {/* Date badge */}
                            <div className="bg-[#002868] text-white rounded-xl p-2.5 text-center min-w-[48px]">
                              <p className="text-[10px] font-bold uppercase">
                                {eventDate.toLocaleString('default', { month: 'short' })}
                              </p>
                              <p className="text-lg font-bold leading-none mt-0.5">{eventDate.getDate()}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{ticket.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {ticket.venue}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {isPaid && (
                              <>
                                <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 font-medium px-3 py-1 rounded-full">
                                  <CheckCircle className="w-3 h-3" /> Confirmed
                                </span>
                                <Link
                                  href={`/booking-confirmed/${ticket.id}`}
                                  className="bg-[#002868] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-900 transition-colors"
                                >
                                  View Ticket
                                </Link>
                              </>
                            )}
                            {isPending && (
                              <>
                                <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 font-medium px-3 py-1 rounded-full">
                                  <Clock className="w-3 h-3" /> Pending
                                </span>
                                <Link
                                  href={`/pay/${ticket.id}`}
                                  className="bg-[#f0b429] text-[#002868] text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-yellow-400 transition-colors"
                                >
                                  Pay Now
                                </Link>
                              </>
                            )}
                            {!isPaid && !isPending && (
                              <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-500 font-medium px-3 py-1 rounded-full">
                                <XCircle className="w-3 h-3" /> {ticket.payment_status}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Events — right 1/3 */}
            <div className="col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Explore Events</h3>
                  <Link href="/" className="text-xs text-[#002868] hover:underline">View all</Link>
                </div>

                <div className="divide-y divide-gray-50">
                  {upcomingEvents.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">No new events available.</p>
                  ) : (
                    upcomingEvents.map((event) => {
                      const d = new Date(event.date)
                      return (
                        <Link
                          key={event.id}
                          href={`/events/${event.id}`}
                          className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50/50 transition-colors group"
                        >
                          <div className="bg-[#f0b429]/10 text-[#002868] rounded-lg p-2 text-center min-w-[40px]">
                            <p className="text-[10px] font-bold uppercase">
                              {d.toLocaleString('default', { month: 'short' })}
                            </p>
                            <p className="text-sm font-bold">{d.getDate()}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 group-hover:text-[#002868] transition-colors truncate">
                              {event.title}
                            </p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">📍 {event.venue}</p>
                            <p className="text-xs font-semibold text-[#002868] mt-1">
                              UGX {parseFloat(String(event.price_amount)).toLocaleString()}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#002868] group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" />
                        </Link>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Pending payment CTA */}
              {pendingTickets.length > 0 && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <p className="font-semibold text-yellow-800 text-sm">Payment Pending</p>
                  </div>
                  <p className="text-xs text-yellow-700 mb-3">
                    You have {pendingTickets.length} ticket{pendingTickets.length !== 1 ? 's' : ''} awaiting payment. Complete payment to confirm your spot!
                  </p>
                  <Link
                    href={`/pay/${pendingTickets[0].id}`}
                    className="block text-center bg-yellow-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-yellow-600 transition-colors"
                  >
                    Complete Payment
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
