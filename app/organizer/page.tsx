import pool from '@/app/lib/db'
import { getCurrentUser } from '@/app/lib/auth'
import Link from 'next/link'
import { PlusCircle, TrendingUp, Users, CalendarCheck, Banknote, ArrowRight, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function OrganizerDashboard() {
  const user = await getCurrentUser()
  if (!user) return null

  // Get events + ticket/revenue stats for this organizer
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
  ).catch(() => ({ rows: [] }))

  // Get recent ticket purchases across all organizer events
  const recentSalesResult = await pool.query(
    `SELECT t.id, t.payment_status, t.created_at,
            e.title as event_title,
            u.first_name, u.last_name, u.email,
            e.price_amount
     FROM tickets t
     JOIN events e ON t.event_id = e.id
     JOIN users u ON t.user_id = u.id
     WHERE e.organizer_id = $1
     ORDER BY t.created_at DESC
     LIMIT 8`,
    [user.userId]
  ).catch(() => ({ rows: [] }))

  const events = eventsResult.rows as any[]
  const recentSales = recentSalesResult.rows as any[]

  const totalEvents = events.length
  const activeEvents = events.filter(
    (e: any) => parseInt(e.tickets_sold_count || 0) < parseInt(e.capacity || 0)
  ).length
  const totalTickets = events.reduce(
    (sum: number, e: any) => sum + parseInt(e.tickets_sold_count || 0),
    0
  )
  const totalRevenue = events.reduce(
    (sum: number, e: any) => sum + parseFloat(e.revenue || 0),
    0
  )
  const paidSales = recentSales.filter((s: any) => s.payment_status === 'paid').length

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* Welcome Banner */}
      <div
        className="rounded-2xl p-7 flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, #002868 0%, #003fa3 60%, #1a5fcc 100%)',
        }}
      >
        <div>
          <p className="text-blue-300 text-sm font-medium mb-1">{greeting}, {user.firstName} 👋</p>
          <h1 className="text-2xl font-bold text-white mb-1">Organizer Dashboard</h1>
          <p className="text-blue-300 text-sm">
            {totalEvents === 0
              ? "Create your first event to get started."
              : `You have ${activeEvents} active event${activeEvents !== 1 ? 's' : ''} with ${totalTickets} tickets sold.`}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/organizer/events"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
          >
            My Events
          </Link>
          <Link
            href="/organizer/create"
            className="flex items-center gap-2 bg-[#f0b429] hover:bg-yellow-400 text-[#002868] text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg"
          >
            <PlusCircle className="w-4 h-4" />
            Create Event
          </Link>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Total Events</p>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-[#002868]" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalEvents}</p>
          <p className="text-xs text-gray-400 mt-1">{activeEvents} currently active</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Tickets Sold</p>
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalTickets}</p>
          <p className="text-xs text-gray-400 mt-1">Across all events</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Total Revenue</p>
            <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Banknote className="w-4 h-4 text-[#f0b429]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">UGX {totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Paid tickets only</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Confirmed Sales</p>
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{paidSales}</p>
          <p className="text-xs text-gray-400 mt-1">Of last 8 transactions</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/organizer/create"
          className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#002868]/20 transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-[#002868] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <PlusCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800 text-sm">Create New Event</p>
            <p className="text-xs text-gray-400 mt-0.5">Publish & sell tickets</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#002868] group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/organizer/events"
          className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#002868]/20 transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <CalendarCheck className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800 text-sm">Manage Events</p>
            <p className="text-xs text-gray-400 mt-0.5">View, edit & track sales</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/organizer/audit"
          className="group bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#002868]/20 transition-all flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-[#f0b429] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5 text-[#002868]" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800 text-sm">Audit Logs</p>
            <p className="text-xs text-gray-400 mt-0.5">Review ticket activity</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#f0b429] group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Events + Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* My Events — left 3/5 */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800">My Events</h2>
            <Link
              href="/organizer/events"
              className="text-xs font-medium text-[#002868] hover:text-blue-800 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <CalendarCheck className="w-7 h-7 text-blue-300" />
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">No events yet</p>
              <p className="text-xs text-gray-400 mb-5">Create your first event and start selling tickets.</p>
              <Link
                href="/organizer/create"
                className="bg-[#002868] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-blue-900 transition-colors"
              >
                + Create Event
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {events.slice(0, 5).map((event: any) => {
                const sold = parseInt(event.tickets_sold_count || 0)
                const capacity = parseInt(event.capacity || 1)
                const fillPercent = Math.min(100, Math.round((sold / capacity) * 100))
                const isFull = sold >= capacity
                const date = new Date(event.date)

                return (
                  <div key={event.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{event.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {date.toLocaleDateString('en-UG', { month: 'short', day: 'numeric', year: 'numeric' })} · {event.venue}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-bold text-green-600">
                          UGX {parseFloat(event.revenue || 0).toLocaleString()}
                        </p>
                        <p className="text-[11px] text-gray-400">revenue</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isFull ? 'bg-red-400' : 'bg-[#002868]'}`}
                          style={{ width: `${fillPercent}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-gray-500 whitespace-nowrap">
                        {sold}/{capacity} tickets
                      </span>
                      {isFull && (
                        <span className="text-[10px] bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">SOLD OUT</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Sales — right 2/5 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Recent Sales</h2>
            <p className="text-xs text-gray-400 mt-0.5">Latest ticket purchases</p>
          </div>

          {recentSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <p className="text-sm text-gray-400">No sales yet.</p>
              <p className="text-xs text-gray-300 mt-1">Ticket sales will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentSales.map((sale: any) => {
                const isPaid = sale.payment_status === 'paid'
                const buyerName = `${sale.first_name ?? ''} ${sale.last_name ?? ''}`.trim() || sale.email
                const timeAgo = (() => {
                  const diff = Date.now() - new Date(sale.created_at).getTime()
                  const mins = Math.floor(diff / 60000)
                  if (mins < 60) return `${mins}m ago`
                  const hrs = Math.floor(mins / 60)
                  if (hrs < 24) return `${hrs}h ago`
                  return `${Math.floor(hrs / 24)}d ago`
                })()

                return (
                  <div key={sale.id} className="px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isPaid ? 'bg-green-100' : 'bg-yellow-100'}`}>
                        {isPaid
                          ? <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                          : <AlertCircle className="w-3.5 h-3.5 text-yellow-600" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{buyerName}</p>
                        <p className="text-[11px] text-gray-400 truncate">{sale.event_title}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-gray-700">
                          UGX {parseFloat(sale.price_amount || 0).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1 justify-end mt-0.5">
                          <Clock className="w-2.5 h-2.5 text-gray-300" />
                          <span className="text-[10px] text-gray-400">{timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}