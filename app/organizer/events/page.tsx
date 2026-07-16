import { getCurrentUser } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import pool from '@/app/lib/db'
import { Calendar, MapPin, Tag, Banknote, Eye, BarChart2 } from 'lucide-react'

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
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">My Events</h2>
          <p className="text-sm text-gray-500">Manage your events and track ticket sales.</p>
        </div>
        <Link
          href="/organizer/create"
          className="bg-[#002868] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-900 shadow-sm transition-colors"
        >
          Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-blue-300" />
          </div>
          <p className="text-gray-500 text-sm font-medium mb-6">You haven't created any events yet.</p>
          <Link
            href="/organizer/create"
            className="inline-block bg-[#002868] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-900 shadow-sm transition-colors"
          >
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {events.map((event: any) => {
            const dateObj = new Date(event.date)
            const formattedDate = dateObj.toLocaleDateString()
            return (
              <div key={event.id} className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{event.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" /> {formattedDate}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" /> {event.venue}</span>
                    <span className="flex items-center gap-1.5"><Tag className="w-4 h-4 text-gray-400" /> {event.category}</span>
                    <span className="flex items-center gap-1.5"><Banknote className="w-4 h-4 text-gray-400" /> KSH {event.price_amount}</span>
                  </div>
                </div>
                <div className="flex items-center gap-8 text-center">
                  <div>
                    <p className="text-2xl font-bold text-[#002868]">{event.tickets_sold_count}</p>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Tickets</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">KSH{parseFloat(event.revenue || 0).toLocaleString()}</p>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Revenue</p>
                  </div>
                  <div className="pl-4 border-l border-gray-100 flex items-center gap-2">
                    <Link
                      href={`/organizer/events/${event.id}`}
                      className="flex items-center gap-2 text-[#002868] text-sm font-semibold hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-xl"
                    >
                      <BarChart2 className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link
                      href={`/events/${event.id}`}
                      className="flex items-center gap-2 text-gray-500 text-sm font-semibold hover:text-gray-700 transition-colors bg-gray-50 px-4 py-2 rounded-xl"
                    >
                      <Eye className="w-4 h-4" /> View
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}