import { getCurrentUser } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import pool from '@/app/lib/db'
import {
  Calendar, MapPin, Tag, Banknote, Users, TrendingUp,
  ArrowLeft, CheckCircle, Clock, BarChart2, Download, Eye
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EventDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login?redirect=/organizer')
  if (user.role !== 'organizer' && user.role !== 'admin') redirect('/dashboard')

  const { id } = await params

  // Fetch the event (must belong to this organizer)
  const eventResult = await pool.query(
    `SELECT e.*,
      COUNT(t.id) as tickets_sold_count,
      SUM(CASE WHEN t.payment_status = 'paid' THEN e.price_amount ELSE 0 END) as revenue,
      SUM(CASE WHEN t.payment_status = 'paid' THEN 1 ELSE 0 END) as paid_count,
      SUM(CASE WHEN t.payment_status = 'pending' THEN 1 ELSE 0 END) as pending_count
     FROM events e
     LEFT JOIN tickets t ON e.id = t.event_id
     WHERE e.id = $1 AND e.organizer_id = $2
     GROUP BY e.id`,
    [id, user.userId]
  ).catch(() => ({ rows: [] }))

  if (eventResult.rows.length === 0) {
    redirect('/organizer/events')
  }

  const event = eventResult.rows[0]

  // Fetch ticket buyers for this event
  const ticketsResult = await pool.query(
    `SELECT t.id, t.payment_status, t.created_at, t.qr_code,
            u.first_name, u.last_name, u.email
     FROM tickets t
     JOIN users u ON t.user_id = u.id
     WHERE t.event_id = $1
     ORDER BY t.created_at DESC`,
    [id]
  ).catch(() => ({ rows: [] }))

  const buyers = ticketsResult.rows

  const totalTickets = parseInt(event.tickets_sold_count || 0)
  const paidCount = parseInt(event.paid_count || 0)
  const pendingCount = parseInt(event.pending_count || 0)
  const capacity = parseInt(event.capacity || 1)
  const revenue = parseFloat(event.revenue || 0)
  const fillRate = Math.min(100, Math.round((totalTickets / capacity) * 100))

  const dateObj = new Date(event.date)
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Back + Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/organizer/events"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#002868] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            My Events
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-700 truncate max-w-xs">{event.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/events/${event.id}`}
            className="flex items-center gap-2 text-sm text-[#002868] font-medium hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-xl border border-blue-100"
          >
            <Eye className="w-4 h-4" /> Public View
          </Link>
        </div>
      </div>

      {/* Event title + info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#002868] bg-blue-50 px-2.5 py-1 rounded-full mb-3 inline-block">
              {event.category}
            </span>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" /> {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" /> {event.venue}
              </span>
              <span className="flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-gray-400" />
                {parseFloat(event.price_amount) === 0 ? 'Free' : `KSH ${parseFloat(event.price_amount).toLocaleString()}`}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gray-400" /> Capacity: {capacity}
              </span>
            </div>
          </div>
          {event.description && (
            <p className="text-sm text-gray-500 max-w-md leading-relaxed">{event.description}</p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Tickets</p>
          <p className="text-3xl font-bold text-[#002868]">{totalTickets}</p>
          <p className="text-xs text-gray-400 mt-1">of {capacity} capacity</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Confirmed</p>
          <p className="text-3xl font-bold text-green-600">{paidCount}</p>
          <p className="text-xs text-gray-400 mt-1">paid tickets</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-500">{pendingCount}</p>
          <p className="text-xs text-gray-400 mt-1">awaiting payment</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Revenue</p>
          <p className="text-3xl font-bold text-[#f0b429]">KSH {revenue.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">from paid tickets</p>
        </div>
      </div>

      {/* Fill rate bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#002868]" />
            <p className="text-sm font-semibold text-gray-700">Ticket Fill Rate</p>
          </div>
          <span className="text-sm font-bold text-[#002868]">{fillRate}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all ${
              fillRate >= 80 ? 'bg-green-500' : fillRate >= 50 ? 'bg-[#f0b429]' : 'bg-[#002868]'
            }`}
            style={{ width: `${fillRate}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{totalTickets} sold</span>
          <span>{Math.max(0, capacity - totalTickets)} remaining</span>
        </div>
      </div>

      {/* Buyers Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Ticket Holders</h2>
            <p className="text-sm text-gray-400 mt-0.5">{buyers.length} attendee{buyers.length !== 1 ? 's' : ''} registered</p>
          </div>
        </div>

        {buyers.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-blue-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium">No tickets sold yet</p>
            <p className="text-gray-400 text-xs mt-1">Share your event link to start getting registrations.</p>
            <Link
              href={`/events/${event.id}`}
              className="mt-4 text-sm text-[#002868] font-semibold hover:text-blue-800 flex items-center gap-1"
            >
              <Eye className="w-4 h-4" /> View Event Page
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3.5 px-6 font-semibold text-gray-500 uppercase text-[11px] tracking-wider">#</th>
                  <th className="text-left py-3.5 px-6 font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Attendee</th>
                  <th className="text-left py-3.5 px-6 font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Email</th>
                  <th className="text-left py-3.5 px-6 font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Booked</th>
                  <th className="text-center py-3.5 px-6 font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Status</th>
                  <th className="text-left py-3.5 px-6 font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Ticket Ref</th>
                </tr>
              </thead>
              <tbody>
                {buyers.map((buyer: any, index: number) => {
                  const bookedDate = new Date(buyer.created_at)
                  const ref = buyer.qr_code.replace('USIU-', '').substring(0, 8).toUpperCase()
                  return (
                    <tr
                      key={buyer.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 px-6 text-gray-400 text-xs font-medium">{index + 1}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#002868] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {buyer.first_name?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <span className="font-semibold text-gray-800">
                            {buyer.first_name} {buyer.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-500 text-sm">{buyer.email}</td>
                      <td className="py-4 px-6 text-gray-400 text-xs">
                        {bookedDate.toLocaleDateString()} {bookedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {buyer.payment_status === 'paid' ? (
                          <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-gray-500">
                        {ref}
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
