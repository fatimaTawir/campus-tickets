import { getCurrentUser } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import pool from '@/app/lib/db'
import DownloadTicketButton from '@/app/components/DownloadTicketButton'
import { Home, Calendar, Ticket, Bell, Settings, HelpCircle, LogOut, Star, Check } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BookingConfirmedPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login?redirect=/dashboard')

  const { id } = await params

  const result = await pool.query(
    `SELECT t.id, t.qr_code, t.payment_status, t.created_at, t.quantity,
            e.title, e.venue, e.date, e.time,
            u.first_name, u.last_name, u.email
     FROM tickets t
     JOIN events e ON t.event_id = e.id
     JOIN users u ON t.user_id = u.id
     WHERE t.id = $1 AND t.user_id = $2`,
    [id, Number(user.userId)]
  )

  if (result.rows.length === 0) redirect('/dashboard')

  const ticket = result.rows[0]
  const bookingRef = `CETS-${ticket.qr_code.replace('USIU-', '').substring(0, 6).toUpperCase()}`
  const initials = `${user.firstName?.[0] ?? ''}`.toUpperCase()
  const quantity = ticket.quantity ?? 1

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen fixed left-0 top-0 z-10">

        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#002868] rounded-lg flex items-center justify-center">
              <span className="text-[#f0b429] text-xs font-bold">CT</span>
            </div>
            <span className="font-bold text-gray-800">CampusTickets</span>
          </Link>
        </div>

        {/* User profile */}
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

        {/* Menu */}
        <nav className="flex-1 px-4 py-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3 px-2">Menu</p>
          <div className="flex flex-col gap-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm">
              <Home className="w-4 h-4" /> Dashboard
            </Link>
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm">
              <Calendar className="w-4 h-4" /> Browse events
            </Link>
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#002868] text-white text-sm font-medium">
              <Ticket className="w-4 h-4" /> My tickets
            </Link>
            <Link href="/dashboard#notifications" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm">
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
          </div>
        </nav>

        {/* Bottom */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="bg-[#f0b429]/10 rounded-xl p-3 mb-3">
            <p className="text-xs font-bold text-[#002868]"><Star className="w-4 h-4 fill-current inline mr-1" />UPGRADE</p>
            <p className="text-xs text-gray-500">Get Pro features</p>
          </div>
          <Link
            href="/api/auth/logout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 text-sm w-full"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </Link>
        </div>
      </aside>

      {/* Main */}
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
            <Bell className="w-5 h-5 text-blue-200 cursor-pointer" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#f0b429] rounded-full flex items-center justify-center text-[#002868] text-xs font-bold">
                {initials}
              </div>
              <span className="text-sm font-medium text-white">{user.firstName}</span>
            </div>
          </div>
        </div>

        <div className="p-8 flex items-start justify-center">
          <div className="w-full max-w-lg">

            {/* Success */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 border-4 border-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Booking Confirmed!</h1>
              <p className="text-gray-500 mt-1">Your ticket has been sent to your email.</p>
            </div>

            {/* Booking reference */}
            <div className="bg-[#002868] rounded-2xl p-6 mb-4">
              <p className="text-[#f0b429] text-xs uppercase tracking-widest text-center mb-1">Booking Reference</p>
              <p className="text-white text-2xl font-bold tracking-widest text-center">{bookingRef}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">

                {/* Left — details */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Ticket details</p>
                  <p className="font-semibold text-gray-800 mb-2">{ticket.title}</p>
                  <p className="text-sm text-gray-500 mb-1">📅 {ticket.date} · {ticket.time}</p>
                  <p className="text-sm text-gray-500 mb-1">📍 {ticket.venue}</p>
                  <p className="text-sm text-gray-500">🎓 {ticket.first_name} {ticket.last_name}</p>

                  {/* Quantity display */}
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Quantity</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🎟️</span>
                      <p className="font-bold text-gray-800">{quantity} Ticket{quantity > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>

                {/* Right — QR code */}
                <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticket.qr_code)}`}
                    alt="QR Code"
                    className="w-32 h-32 mb-2"
                  />
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Scan at entrance</p>
                </div>

              </div>

              {/* Buttons */}
              <DownloadTicketButton
                ticketId={ticket.id}
                eventTitle={ticket.title}
                eventDate={`${ticket.date} · ${ticket.time}`}
                eventVenue={ticket.venue}
                studentName={`${ticket.first_name} ${ticket.last_name}`}
                studentEmail={ticket.email}
                qrCode={ticket.qr_code}
                bookingRef={bookingRef}
                quantity={quantity}
              />
              <Link
                href="/dashboard"
                className="block text-center border border-gray-300 text-gray-600 py-3 rounded-xl text-sm hover:bg-gray-50 mt-3"
              >
                Back to Dashboard
              </Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}