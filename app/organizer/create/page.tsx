"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

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
    price: "0",
    capacity: "100",
    ticketQuality: "Regular", // New field as requested
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
      // The backend expects priceAmount, so we map price to it
      const payload = {
        ...formData,
        priceAmount: parseFloat(formData.price) || 0,
      }

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    <div className="p-8 max-w-3xl mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="flex flex-col gap-6">
          {/* Event Title */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Event Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g., Annual Tech Symposium"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868] focus:border-transparent transition-all"
            />
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868] focus:border-transparent transition-all bg-white"
              >
                <option>Academic</option>
                <option>Career & Professional</option>
                <option>Club Activity</option>
                <option>Cultural</option>
                <option>Health & Wellness</option>
                <option>Sports</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Location / Venue</label>
              <input
                type="text"
                name="venue"
                placeholder="e.g., Main Hall"
                value={formData.venue}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Ticket Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Ticket Price (KSH)</label>
              <input
                type="number"
                name="price"
                placeholder="0"
                value={formData.price}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Total Capacity</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">Ticket Quality/Type</label>
              <select
                name="ticketQuality"
                value={formData.ticketQuality}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868] focus:border-transparent transition-all bg-white"
              >
                <option>Regular</option>
                <option>VIP</option>
                <option>VVIP</option>
                <option>Early Bird</option>
                <option>Student</option>
              </select>
            </div>
          </div>

          {/* Event Description */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Event Description</label>
            <textarea
              name="description"
              placeholder="Describe what the event is about..."
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868] focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Banner Image */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Banner Image (Optional)</label>
            <div className="w-full border border-gray-200 rounded-lg p-2 flex items-center bg-gray-50">
               <input
                type="file"
                name="bannerImage"
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end items-center gap-4 pt-4 border-t border-gray-100 mt-2">
            <Link
              href="/organizer"
              className="text-gray-500 text-sm font-medium hover:text-gray-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#002868] text-white px-8 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002868] disabled:opacity-50 transition-all"
            >
              {loading ? "Publishing..." : "Publish Event"}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}