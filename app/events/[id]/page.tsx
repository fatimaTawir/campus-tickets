import { getCurrentUser } from '@/app/lib/auth'
import Link from 'next/link'
import pool from '@/app/lib/db'
import { redirect } from 'next/navigation'
import BookTicketButton from '../../components/BookTicketButton'
export const dynamic = 'force-dynamic'

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()

  const result = await pool.query(
    'SELECT * FROM events WHERE id = $1',
    [id]
  )

  if (result.rows.length === 0) {
    redirect('/')
  }

  const event = result.rows[0]
  const availableTickets = event.capacity - event.tickets_sold
  const percentageSold = Math.round((event.tickets_sold / event.capacity) * 100)

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-[#002868] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#BF0A30] text-white text-xs font-bold px-2 py-1 rounded">
            USIU-A
          </div>
          <Link href="/" className="text-white text-lg font-bold">CampusTickets</Link>
        </div>
        <div className="flex gap-4">
          {user ? (
            <Link href="/dashboard" className="text-blue-200 hover:text-white text-sm">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-blue-200 hover:text-white text-sm">Log in</Link>
              <Link href="/signup" className="bg-[#BF0A30] text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Back link */}
        <Link href="/" className="text-sm text-gray-500 hover:text-[#002868] flex items-center gap-1 mb-6">
          ← Back to events
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left — Event details */}
          <div className="lg:col-span-2">

            {/* Banner */}
            <div className="bg-[#002868] rounded-2xl h-48 flex items-center justify-center mb-6">
              <div className="text-center">
                <p className="text-[#f0b429] text-sm font-semibold uppercase tracking-widest mb-2">
                  {event.category}
                </p>
                <h1 className="text-white text-2xl font-bold px-6">{event.title}</h1>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Event Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Date</p>
                  <p className="text-gray-800 font-medium">📅 {event.date}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Time</p>
                  <p className="text-gray-800 font-medium">🕐 {event.time}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Venue</p>
                  <p className="text-gray-800 font-medium">📍 {event.venue}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Category</p>
                  <p className="text-gray-800 font-medium">🏷️ {event.category}</p>
                </div>
              </div>

              {event.description && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">About this event</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{event.description}</p>
                </div>
              )}
            </div>

            {/* Organizer */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Organizer Details</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#002868] rounded-full flex items-center justify-center text-white font-bold">
                  U
                </div>
                <div>
                  <p className="font-medium text-gray-800">USIU-Africa</p>
                  <p className="text-sm text-gray-500">Event Organizer</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right — Ticket booking */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-6">

              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Ticket Price</p>
              <p className="text-3xl font-bold text-[#002868] mb-4">{event.price}</p>

              <div className="flex flex-col gap-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">📅 {event.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">🕐 {event.time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">📍 {event.venue}</span>
                </div>
              </div>

              {/* Availability bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Availability</span>
                  <span className="text-[#002868] font-medium">{availableTickets} left</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-[#002868] h-2 rounded-full"
                    style={{ width: `${Math.max(5, 100 - percentageSold)}%` }}
                  />
                </div>
              </div>

              <BookTicketButton
                eventId={event.id}
                eventTitle={event.title}
                price={event.price}
                priceAmount={event.price_amount}
                isLoggedIn={!!user}
                isSoldOut={availableTickets <= 0}
              />

            </div>
          </div>

        </div>
      </div>
    </main>
  )
}