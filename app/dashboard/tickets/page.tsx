import { getCurrentUser } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import pool from '@/app/lib/db'
import { Home, Calendar, Ticket, Bell, Settings, HelpCircle, LogOut, Star, Check } from 'lucide-react'

export const dynamic = 'force-dynamic'

type Ticket = {
  id: number
  title: string
  venue: string
  date: string
  time: string
  payment_status: 'paid' | 'pending' | string
}

export default async function MyTicketsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?redirect=/dashboard/tickets')

  const result = await pool.query(
    `SELECT t.id, t.qr_code, t.payment_status, t.created_at,
            e.title, e.venue, e.date, e.time, e.price_amount
     FROM tickets t
     JOIN events e ON t.event_id = e.id
     WHERE t.user_id = $1
     ORDER BY t.created_at DESC`,
    [Number(user.userId)]
  ).catch(() => ({ rows: [] as Ticket[] }))

  const tickets = result.rows as Ticket[]
  const pendingTickets = tickets.filter((t) => t.payment_status === 'pending')
  const initials = `${user.firstName?.[0] ?? ''}`.toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen fixed left-0 top-0 z-10">
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#002868] rounded-lg flex items-center justify-center">
              <span className="text-[#f0b429] text-xs font-bold">CT</span>
            </div>
            <span className="font-bold text-gray-800">CampusTickets</span>
          </Link>
        </div>
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
        <nav className="flex-1 px-4 py-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3 px-2">Menu</p>
          <div className="flex flex-col gap-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm">
              <Home className="w-4 h-4" /> Dashboard
            </Link>
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm">
              <Calendar className="w-4 h-4" /> Browse events
            </Link>
            <Link href="/dashboard/tickets" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#002868] text-white text-sm font-medium">
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
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="bg-[#f0b429]/10 rounded-xl p-3 mb-3">
            <p className="text-xs font-bold text-[#002868]"><Star className="w-4 h-4 fill-current" /> UPGRADE</p>
            <p className="text-xs text-gray-500">Get Pro features</p>
          </div>
          <Link href="/api/auth/logout" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 text-sm w-full">
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">My Tickets</h2>
          {tickets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <Ticket className="w-10 h-10 mb-3 text-blue-600" />
              <p className="font-medium text-gray-700 mb-1">No tickets yet</p>
              <p className="text-sm text-gray-400 mb-4">Browse events and book your first ticket!</p>
              <Link href="/" className="bg-[#002868] text-white px-6 py-2.5 rounded-xl text-sm hover:bg-blue-900">
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{ticket.title}</p>
                    <p className="text-sm text-gray-400 mt-1">📍 {ticket.venue} · 📅 {ticket.date} · 🕐 {ticket.time}</p>
                  </div>
                  <div className="flex items-center gap-3">
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
      </main>
    </div>
  )
}