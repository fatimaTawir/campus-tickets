"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function NotificationsPage() {
  const [pendingTickets, setPendingTickets] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/me')
        if (!res.ok) {
          window.location.href = '/login?redirect=/dashboard/notifications'
          return
        }
        const data = await res.json()
        setUser(data.user)

        const ticketsRes = await fetch('/api/my-tickets')
        if (ticketsRes.ok) {
          const ticketsData = await ticketsRes.json()
          const pending = ticketsData.tickets.filter((t: any) => t.payment_status === 'pending')
          setPendingTickets(pending)
        }
      } catch (e) {
        window.location.href = '/login'
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const initials = user?.firstName?.[0]?.toUpperCase() || '?'

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen fixed left-0 top-0 z-10">
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#002868] rounded-lg flex items-center justify-center">
              <span className="text-[#f0b429] text-xs font-bold">CT</span>
            </div>
            <span className="font-bold text-gray-800">CampusTickets</span>
          </Link>
        </div>
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#002868] rounded-full flex items-center justify-center text-white font-bold text-sm">{initials}</div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{user?.firstName}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3 px-2">Menu</p>
          <div className="flex flex-col gap-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm"><span>🏠</span> Dashboard</Link>
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm"><span>🎫</span> Browse events</Link>
            <Link href="/dashboard/tickets" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm"><span>🎟️</span> My tickets</Link>
            <Link href="/dashboard/notifications" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#002868] text-white text-sm font-medium"><span>🔔</span> Notifications</Link>
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3 px-2 mt-6">Account</p>
          <div className="flex flex-col gap-1">
            <Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm"><span>⚙️</span> Profile settings</Link>
            <Link href="/help" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm"><span>❓</span> Help & support</Link>
          </div>
        </nav>
        <div className="px-4 py-4 border-t border-gray-100">
          <Link href="/dashboard/upgrade" className="block bg-[#f0b429]/10 rounded-xl p-3 mb-3 hover:bg-[#f0b429]/20">
            <p className="text-xs font-bold text-[#002868]">⭐ UPGRADE</p>
            <p className="text-xs text-gray-500">Get Pro features</p>
          </Link>
          <Link href="/api/auth/logout" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 text-sm"><span>🚪</span> Sign out</Link>
        </div>
      </aside>

      <main className="ml-64 flex-1">
        <div className="bg-[#002868] px-8 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f0b429] rounded-lg flex items-center justify-center"><span className="text-[#002868] text-xs font-bold">CT</span></div>
            <span className="text-white font-bold text-sm">USIU-A · Campus Tickets</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-blue-200 hover:text-white text-sm">Events</Link>
            <Link href="/about" className="text-blue-200 hover:text-white text-sm">About</Link>
            <Link href="/help" className="text-blue-200 hover:text-white text-sm">Help</Link>
            <span className="text-xl text-blue-200">🔔</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#f0b429] rounded-full flex items-center justify-center text-[#002868] text-xs font-bold">{initials}</div>
              <span className="text-sm font-medium text-white">{user?.firstName}</span>
            </div>
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Notifications</h2>
          {pendingTickets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <span className="text-4xl mb-3 block">🔔</span>
              <p className="font-medium text-gray-700">No notifications</p>
              <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingTickets.map((ticket: any) => (
                <div key={ticket.id} className="bg-white rounded-2xl border border-yellow-200 p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Payment pending — {ticket.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Complete your payment · 📅 {ticket.date}</p>
                    </div>
                  </div>
                  <Link href={`/pay/${ticket.id}`} className="bg-[#002868] text-white text-xs px-4 py-2 rounded-lg hover:bg-blue-900">
                    Pay Now
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}