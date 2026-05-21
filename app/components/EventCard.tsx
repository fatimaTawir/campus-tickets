"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type EventCardProps = {
  id: number
  title: string
  category: string
  date: string
  time: string
  venue: string
  price: string
  color: string
}

export default function EventCard({ id, title, category, date, time, venue, price, color }: EventCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  async function handleGetTicket() {
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: id }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          // Not logged in — redirect to login
          router.push("/login")
          return
        }
        setMessageType("error")
        setMessage(data.error)
        return
      }

      setMessageType("success")
      setMessage("Ticket booked! Check your dashboard.")
      router.refresh()

    } catch (err) {
      setMessageType("error")
      setMessage("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className={`text-xs font-medium px-3 py-1 rounded-full w-fit mb-3 ${color}`}>
        {category}
      </div>
      <h4 className="font-semibold text-gray-800 mb-2 leading-snug">
        {title}
      </h4>
      <p className="text-sm text-gray-500 mb-1">📅 {date} · {time}</p>
      <p className="text-sm text-gray-500 mb-4">📍 {venue}</p>

      {message && (
        <p className={`text-xs mb-3 px-3 py-2 rounded-lg ${
          messageType === "success"
            ? "bg-green-50 text-green-700"
            : "bg-red-50 text-red-700"
        }`}>
          {message}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-[#002868] font-bold">{price}</span>
        <button
          onClick={handleGetTicket}
          disabled={loading}
          className="bg-[#BF0A30] text-white text-sm px-4 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Booking..." : "Get Ticket"}
        </button>
      </div>
    </div>
  )
}