import { getCurrentUser } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import pool from '@/app/lib/db'
import { Home, Calendar, Ticket, Bell, Settings, HelpCircle, LogOut } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function OrganizerDashboard() {
  const user = await getCurrentUser()

  if (!user) redirect('/login?redirect=/organizer')
  if (user.role !== 'organizer' && user.role !== 'admin') redirect('/dashboard')

  // Get events created by this organizer
  const eventsResult = await pool.query(
    `SELECT e.*, 
      COUNT(t.id) as tickets_sold_count,
      SUM(CASE WHEN t.payment_status = 'paid' THEN e.price_amount ELSE 0 END) as revenue
     FROM events e
     LEFT JOIN tickets t ON e.id = t.event_id
     WHERE e.organizer_id = $1
     GROUP BY e.id
     ORDER BY e.created_at DESC`,
    [user.userId]
  )

  const events = eventsResult.rows
  const totalTickets = events.reduce((sum: number, e: any) => sum + parseInt(e.tickets_sold_count || 0), 0)
  const totalRevenue = events.reduce((sum: number, e: any) => sum + parseFloat(e.revenue || 0), 0)

  return (
    <main className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <aside className="w-64 bg-[#002868] min-h-screen flex flex-col">
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-[#BF0A30] text-white text-xs font-bold px-2 py-0.5 rounded">USIU-A</div>
            <span className="text-white text-sm font-bold">CampusTickets</span>
          </div>
          <p className="text-blue-300 text-xs mt-2">{user.firstName} · Organizer</p>
        </div>

        <nav className="flex-1 p-4">
          <p className="text-blue-400 text-xs uppercase tracking-wider mb-3">Menu</p>
          <div className="flex flex-col gap-1">
            <Link href="/organizer" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-800 text-white text-sm">
              <Home className="w-4 h-4" /> Dashboard
            </Link>
            <Link href="/organizer/events" className="flex items-center gap-3 px-3 py-2 rounded-lg text-blue-200 hover:bg-blue-800 text-sm">
              📅 My Events
            </Link>
            <Link href="/organizer/create" className="flex items-center gap-3 px-3 py-2 rounded-lg text-blue-200 hover:bg-blue-800 text-sm">
              ➕ Create Event
            </Link>
            <Link href="/analytics" className="flex items-center gap-3 px-3 py-2 rounded-lg text-blue-200 hover:bg-blue-800 text-sm">
              📊 Analytics
            </Link>
          </div>

          <p className="text-blue-400 text-xs uppercase tracking-wider mb-3 mt-6">Account</p>
          <div className="flex flex-col gap-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-blue-200 hover:bg-blue-800 text-sm">
              👤 Profile
            </Link>
            <Link href="/api/auth/logout" className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-300 hover:bg-blue-800 text-sm">
              <LogOut className="w-4 h-4" /> Sign out
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 p-8">

        {/* Header */}
        <div className="bg-[#002868] rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div>
            <p className="text-[#f0b429] text-sm font-semibold uppercase tracking-widest mb-1">
              Organizer Dashboard
            </p>
            <h2 className="text-2xl font-bold text-white">Welcome, {user.firstName}!</h2>
          </div>
          <Link
            href="/organizer/create"
            className="bg-[#f0b429] text-[#002868] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-yellow-400"
          >
            + Create Event
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <p className="text-3xl font-bold text-[#002868]">{events.length}</p>
            <p className="text-gray-500 text-sm mt-1">Total Events</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <p className="text-3xl font-bold text-green-600">{events.filter((e: any) => e.tickets_sold < e.capacity).length}</p>
            <p className="text-gray-500 text-sm mt-1">Active Events</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <p className="text-3xl font-bold text-[#BF0A30]">{totalTickets}</p>
            <p className="text-gray-500 text-sm mt-1">Tickets Sold</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
            <p className="text-3xl font-bold text-[#f0b429]">KES {totalRevenue.toLocaleString()}</p>
            <p className="text-gray-500 text-sm mt-1">Revenue</p>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Events</h3>
            <Link href="/organizer/events" className="text-sm text-[#002868] hover:underline">View all</Link>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">📅</p>
              <p className="text-gray-500 text-sm">No events yet.</p>
              <Link
                href="/organizer/create"
                className="inline-block mt-4 bg-[#002868] text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-900"
              >
                Create your first event
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Event</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                  <th className="text-center py-3 px-4 text-gray-500 font-medium">Sales</th>
                  <th className="text-center py-3 px-4 text-gray-500 font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event: any) => (
                  <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{event.title}</td>
                    <td className="py-3 px-4 text-gray-500">{event.date}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[#002868] font-bold">{event.tickets_sold_count}</span>
                      <span className="text-gray-400">/{event.capacity}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/events/${event.id}`} className="text-[#002868] hover:underline text-xs">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}