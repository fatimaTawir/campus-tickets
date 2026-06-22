import pool from '@/app/lib/db'
import { getCurrentUser } from '@/app/lib/auth'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OrganizerDashboard() {
  const user = await getCurrentUser()
  if (!user) return null

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
  const totalEvents = events.length
  const activeEvents = events.filter((e: any) => parseInt(e.tickets_sold_count || 0) < parseInt(e.capacity || 0)).length
  const totalTickets = events.reduce((sum: number, e: any) => sum + parseInt(e.tickets_sold_count || 0), 0)
  const totalRevenue = events.reduce((sum: number, e: any) => sum + parseFloat(e.revenue || 0), 0)

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Total Events</p>
          <p className="text-4xl font-bold text-gray-800">{totalEvents}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Active Events</p>
          <p className="text-4xl font-bold text-green-600">{activeEvents}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Tickets Sold</p>
          <p className="text-4xl font-bold text-[#002868]">{totalTickets}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Revenue</p>
          <p className="text-4xl font-bold text-[#f0b429]">UGX {totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">Recent Events</h3>
          <Link href="/organizer/events" className="text-sm font-medium text-[#002868] hover:text-blue-800 transition-colors">
            View all
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No events found.</p>
            <Link
              href="/organizer/create"
              className="bg-[#002868] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors"
            >
              Create Event
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-3 px-4 font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Event</th>
                  <th className="text-left pb-3 px-4 font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Date</th>
                  <th className="text-center pb-3 px-4 font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Status</th>
                  <th className="text-center pb-3 px-4 font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Sales</th>
                  <th className="text-right pb-3 px-4 font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event: any) => {
                  const date = new Date(event.date)
                  const formattedDate = \`\${date.getMonth() + 1}/\${date.getDate()}/\${date.getFullYear()}\`
                  
                  return (
                    <tr key={event.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-4 font-semibold text-gray-800 uppercase">{event.title}</td>
                      <td className="py-4 px-4 text-gray-600">{formattedDate}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                          Upcoming
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3 justify-center">
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gray-300 rounded-full" 
                              style={{ width: \`\${Math.min(100, (event.tickets_sold_count / event.capacity) * 100)}%\` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-500 w-12 text-right">
                            {event.tickets_sold_count}/{event.capacity}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link href={\`/organizer/events/\${event.id}\`} className="text-sm font-medium text-[#002868] hover:text-blue-800 transition-colors">
                          Dashboard
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}