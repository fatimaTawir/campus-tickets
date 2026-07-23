import { getCurrentUser } from '@/app/lib/auth'
import pool from '@/app/lib/db'
import AnalyticsCharts from '@/app/components/AnalyticsCharts'

export const dynamic = 'force-dynamic'

export default async function OrganizerReportsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?redirect=/organizer/reports')

  const eventsResult = await pool.query(`
    SELECT 
      e.title,
      e.category,
      e.capacity,
      e.tickets_sold,
      e.price_amount,
      COUNT(t.id) as total_tickets,
      SUM(CASE WHEN t.payment_status = 'paid' THEN e.price_amount ELSE 0 END) as revenue
    FROM events e
    LEFT JOIN tickets t ON e.id = t.event_id
    WHERE e.organizer_id = $1
    GROUP BY e.id, e.title, e.category, e.capacity, e.tickets_sold, e.price_amount
    ORDER BY total_tickets DESC
  `, [user.userId])

  const events = eventsResult.rows

  const totalTickets = events.reduce((sum: number, e: any) => sum + parseInt(e.total_tickets), 0)
  const totalRevenue = events.reduce((sum: number, e: any) => sum + parseFloat(e.revenue || 0), 0)
  const totalCapacity = events.reduce((sum: number, e: any) => sum + parseInt(e.capacity), 0)
  const mostPopular = events[0]

  return (
    <div className="p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="bg-[#002868] rounded-2xl p-6 mb-8 flex items-center justify-between">
        <div>
          <p className="text-[#f0b429] text-sm font-semibold uppercase tracking-widest mb-1">
            Analytics
          </p>
          <h2 className="text-2xl font-bold text-white">Reports &amp; Analytics</h2>
          <p className="text-blue-200 text-sm mt-1">Track your event performance</p>
        </div>
        <div className="text-6xl">📊</div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-[#002868]">{events.length}</p>
          <p className="text-gray-500 text-sm mt-1">Total Events</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-[#BF0A30]">{totalTickets}</p>
          <p className="text-gray-500 text-sm mt-1">Tickets Sold</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-green-600">
            KES {totalRevenue.toLocaleString()}
          </p>
          <p className="text-gray-500 text-sm mt-1">Total Revenue</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-[#f0b429]">{totalCapacity}</p>
          <p className="text-gray-500 text-sm mt-1">Total Capacity</p>
        </div>
      </div>

      {/* Most popular event */}
      {mostPopular && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            🏆 Most Popular Event
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800 text-xl">{mostPopular.title}</p>
              <p className="text-gray-500 text-sm mt-1">
                {mostPopular.total_tickets} tickets sold · {mostPopular.category}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                KES {parseFloat(mostPopular.revenue || 0).toLocaleString()}
              </p>
              <p className="text-gray-400 text-xs">Revenue</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <AnalyticsCharts events={events} />

      {/* Events table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">All Events Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Event</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Category</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">Tickets Sold</th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">Capacity</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event: any, index: number) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-800">{event.title}</td>
                  <td className="py-3 px-4 text-gray-500">{event.category}</td>
                  <td className="py-3 px-4 text-center text-[#002868] font-bold">
                    {event.total_tickets}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-500">{event.capacity}</td>
                  <td className="py-3 px-4 text-right text-green-600 font-bold">
                    KES {parseFloat(event.revenue || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
