"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  eventId: number
  eventTitle: string
  price: string
  priceAmount: number
  isLoggedIn: boolean
  isSoldOut: boolean
}

export default function BookTicketButton({ eventId, eventTitle, price, priceAmount, isLoggedIn, isSoldOut }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleBook() {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    if (isSoldOut) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error)
        return
      }

      const ticketId = data.ticket.id

      
     // Always go to booking confirmed page first
if (priceAmount === 0) {
  router.push(`/booking-confirmed/${ticketId}`)
} else {
  router.push(`/pay/${ticketId}`)
}

    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg mb-3">
          {error}
        </div>
      )}
      <button
        onClick={handleBook}
        disabled={loading || isSoldOut}
        className={`w-full py-3 rounded-xl text-sm font-medium transition-colors ${
          isSoldOut
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-[#002868] text-white hover:bg-blue-900'
        } disabled:opacity-50`}
      >
        {loading ? "Booking..." : isSoldOut ? "Sold Out" : "Book Ticket Now"}
      </button>
      {!isLoggedIn && (
        <p className="text-xs text-gray-400 text-center mt-2">
          You need to log in to book a ticket
        </p>
      )}
    </div>
  )
}