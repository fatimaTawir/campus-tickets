"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Home, Calendar, Ticket, Bell, Settings, HelpCircle, LogOut } from 'lucide-react'

export default function CreateEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    category: "Academic",
    venue: "",
    date: "",
    time: "",
    price: "",
    priceAmount: "0",
    capacity: "100",
    description: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    setError("")

    if (!formData.title || !formData.venue || !formData.date || !formData.time) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error)
        return
      }

      router.push("/organizer")

    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <aside className="w-64 bg-[#002868] min-h-screen flex flex-col">
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-[#BF0A30] text-white text-xs font-bold px-2 py-0.5 rounded">USIU-A</div>
            <span className="text-white text-sm font-bold">CampusTickets</span>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <div className="flex flex-col gap-1">
            <Link href="/organizer" className="flex items-center gap-3 px-3 py-2 rounded-lg text-blue-200 hover:bg-blue-800 text-sm">
              <Home className="w-4 h-4" /> Dashboard
            </Link>
            <Link href="/organizer/events" className="flex items-center gap-3 px-3 py-2 rounded-lg text-blue-200 hover:bg-blue-800 text-sm">
              📅 My Events
            </Link>
            <Link href="/organizer/create" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-800 text-white text-sm">
              ➕ Create Event
            </Link>
            <Link href="/analytics" className="flex items-center gap-3 px-3 py-2 rounded-lg text-blue-200 hover:bg-blue-800 text-sm">
              📊 Analytics
            </Link>
          </div>
          <div className="mt-6 flex flex-col gap-1">
            <Link href="/api/auth/logout" className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-300 hover:bg-blue-800 text-sm">
              <LogOut className="w-4 h-4" /> Sign out
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 p-8 max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Event</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4">

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Event Title *</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Annual Tech Symposium"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
              >
                <option>Academic</option>
                <option>Sports</option>
                <option>Cultural</option>
                <option>Workshop</option>
                <option>Music</option>
                <option>Career</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Venue *</label>
              <input
                type="text"
                name="venue"
                placeholder="e.g. Main Hall"
                value={formData.venue}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Time *</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Ticket Price</label>
              <input
                type="text"
                name="price"
                placeholder="e.g. KES 500 or Free"
                value={formData.price}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Price Amount (KES)</label>
              <input
                type="number"
                name="priceAmount"
                placeholder="0 for free"
                value={formData.priceAmount}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Total Capacity</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Event Description</label>
            <textarea
              name="description"
              placeholder="Describe what the event is about..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#002868] text-white px-8 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-900 disabled:opacity-50"
            >
              {loading ? "Publishing..." : "Publish Event"}
            </button>
            <Link
              href="/organizer"
              className="border border-gray-300 text-gray-600 px-8 py-2.5 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>

        </div>
      </div>
    </main>
  )
}