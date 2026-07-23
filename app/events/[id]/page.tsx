import { getCurrentUser } from '@/app/lib/auth'
import Link from 'next/link'
import pool from '@/app/lib/db'
import { redirect } from 'next/navigation'
import BookTicketButton from '../../components/BookTicketButton'
export const dynamic = 'force-dynamic'

const categoryImages: Record<string, string> = {
  Academic: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
  Sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop",
  Cultural: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
  "Club Activity": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop",
  Workshop: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop",
  Music: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=800&auto=format&fit=crop",
  Conference: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop",
}

function getEventImage(title: string, category: string): string {
  const t = title.toLowerCase()
  if (t.includes("dinner") || t.includes("gala") || t.includes("food") || t.includes("feast"))
    return "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop"
  if (t.includes("party") || t.includes("prom") || t.includes("dance") || t.includes("night") || t.includes("ball"))
    return "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop"
  if (t.includes("hackathon") || t.includes("tech") || t.includes("coding") || t.includes("software"))
    return "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop"
  if (t.includes("debate") || t.includes("speech") || t.includes("talk") || t.includes("lecture"))
    return "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop"
  if (t.includes("indigenous") || t.includes("language") || t.includes("heritage") || t.includes("culture"))
    return "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800&auto=format&fit=crop"
  return categoryImages[category] || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800&auto=format&fit=crop"
}

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
      <nav className="bg-[#002868] px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-[#f0b429] rounded p-1 flex items-center justify-center">
            <span className="text-[#002868] text-xs font-bold">CT</span>
          </div>
          <span className="font-bold text-white">CETS</span>
          <span className="text-[#f0b429] text-sm font-semibold">· Campus Events</span>
        </div>
        <div className="flex gap-6 items-center">
          <Link href="/" className="text-blue-200 hover:text-white text-sm font-medium">Events</Link>
          <Link href="/about" className="text-blue-200 hover:text-white text-sm font-medium">About</Link>
          <Link href="/help" className="text-blue-200 hover:text-white text-sm font-medium">Help</Link>
          {user ? (
            <Link href="/dashboard" className="text-blue-200 hover:text-white text-sm font-medium">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-blue-200 hover:text-white text-sm font-medium">Sign in</Link>
              <Link href="/signup" className="bg-[#f0b429] text-[#002868] px-5 py-2 rounded-xl text-sm font-bold hover:bg-yellow-400">
                Register
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

            {/* Banner with image */}
            <div className="relative rounded-2xl h-56 overflow-hidden mb-6">
              <img
                src={getEventImage(event.title, event.category)}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="text-[#f0b429] text-xs font-bold uppercase tracking-widest bg-[#002868]/80 px-2.5 py-1 rounded-full">
                  {event.category}
                </span>
                <h1 className="text-white text-2xl font-bold mt-2 leading-tight">{event.title}</h1>
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
              <p className="text-3xl font-bold text-[#002868] mb-4">
                {parseFloat(String(event.price_amount)) === 0 ? 'Free' : `KSH ${parseFloat(String(event.price_amount)).toLocaleString()}`}
              </p>

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