import { getCurrentUser } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import pool from '@/app/lib/db'
import { Home, Calendar, Ticket, Bell, Settings, HelpCircle, LogOut } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function OrganizerEventsPage() {
  const user = await getCurrentUser()

  if (!user) redirect('/login')
  if (user.role !== 'organizer' && user.role !== 'admin') redirect('/dashboard')

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
          <div className="flex flex-col gap-1">
            <Link href="/organizer" className="flex items-center gap-3 px-3 py-2 rounded-lg text-blue-200 hover:bg-blue-800 text-sm">
              <Home className="w-4 h-4" /> Dashboard
            </Link>
            <Link href="/organizer/events" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-800 text-white text-sm">
              📅 My Events
            </Link>
            <Link href="/organizer/create" className="flex items-center gap-3 px-3 py-2 rounded-lg text-blue-200 hover:bg-blue-800 text-sm">
              ➕ Create Event
            </Link>
            <Link href="/analytics" className="flex items-center gap-3 px-3 py-2 rounded-lg text-blue-200 hover:bg-blue-800 text-sm">
              📊 Analytics
            </Link>
          </div>
          <div className="mt-6 flex flex-col gap-1">
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Events</h2>
          <Link
            href="/organizer/create"
            className="bg-[#002868] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-900"
          >
            + Create Event
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-gray-500 text-sm">You haven't created any events yet.</p>
            <Link
              href="/organizer/create"
              className="inline-block mt-4 bg-[#002868] text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-900"
            >
              Create your first event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {events.map((event: any) => (
              <div key={event.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{event.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">📅 {event.date} · 📍 {event.venue}</p>
                  <p className="text-sm text-gray-500">🏷️ {event.category} · 💰 {event.price}</p>
                </div>
                <div className="flex items-center gap-6 text-center">
                  <div>
                    <p className="text-xl font-bold text-[#002868]">{event.tickets_sold_count}</p>
                    <p className="text-xs text-gray-400">Tickets sold</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-green-600">KES {parseFloat(event.revenue || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Revenue</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/events/${event.id}`}
                      className="bg-[#002868] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-900"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}