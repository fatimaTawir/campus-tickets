import Link from 'next/link'
import { GraduationCap, Ticket, Smartphone, BarChart3 } from 'lucide-react'

export default function AboutPage() {
  const developers = [
    { name: "Fatna Tawir Osman", role: "Lead Developer", id: "671112" },
  ]

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
        <div className="flex gap-4 items-center">
          <Link href="/" className="text-blue-200 hover:text-white text-sm">Events</Link>
          <Link href="/about" className="text-white text-sm font-medium">About</Link>
          <Link href="/help" className="text-blue-200 hover:text-white text-sm">Help</Link>
          <Link href="/login" className="text-blue-200 hover:text-white text-sm">Log in</Link>
          <Link href="/signup" className="bg-[#BF0A30] text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">
            Sign up
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4 text-[#002868]">
            <GraduationCap className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">About CampusTickets</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            CampusTickets is a premier event ticketing platform crafted to modernize
            and streamline how events, workshops, and gatherings are organized within
            the USIU-Africa university ecosystem.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-[#002868] rounded-2xl p-8 mb-8 text-center">
          <p className="text-[#f0b429] text-sm font-semibold uppercase tracking-widest mb-3">
            Our Mission
          </p>
          <h2 className="text-2xl font-bold text-white mb-3">
            Connecting Students with Campus Life
          </h2>
          <p className="text-blue-200">
            We make it easy for USIU-Africa students to discover, register, and
            attend campus events — from academic conferences to sports days and
            cultural nights.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="flex justify-center mb-3 text-[#002868]">
              <Ticket className="w-10 h-10" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Easy Ticketing</h3>
            <p className="text-gray-500 text-sm">Buy tickets in seconds with M-Pesa integration</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="flex justify-center mb-3 text-[#002868]">
              <Smartphone className="w-10 h-10" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">QR Code Entry</h3>
            <p className="text-gray-500 text-sm">Scan your QR code at the entrance for fast check-in</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="flex justify-center mb-3 text-[#002868]">
              <BarChart3 className="w-10 h-10" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Live Analytics</h3>
            <p className="text-gray-500 text-sm">Organizers get real-time insights on ticket sales</p>
          </div>
        </div>

        {/* Developers */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Meet The Developer</h2>
            <p className="text-gray-500 text-sm mt-1">The brilliant mind behind this platform</p>
          </div>
          <div className="flex justify-center">
            {developers.map((dev, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 text-center max-w-xs">
                <div className="w-16 h-16 bg-[#002868] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                  {dev.name.charAt(0)}
                </div>
                <p className="font-semibold text-gray-800">{dev.name}</p>
                <p className="text-sm text-[#BF0A30] font-medium">{dev.role}</p>
                <p className="text-xs text-gray-400 mt-1">Student ID: {dev.id}</p>
              </div>
            ))}
          </div>
        </div>

        {/* University info */}
        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            Built for · United States International University – Africa · Nairobi, Kenya · 2026
          </p>
        </div>

      </div>

      {/* Footer */}
      <footer className="bg-[#002868] text-blue-200 text-center py-6 text-sm">
        © 2026 CampusTickets · USIU-Africa · Nairobi, Kenya
      </footer>

    </main>
  )
}