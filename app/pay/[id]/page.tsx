"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

export default function PayPage() {
  const router = useRouter()
  const params = useParams()
  const ticketId = params.id
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")
  const [stkSent, setStkSent] = useState(false)
  const [confirming, setConfirming] = useState(false)

  async function handlePay() {
    if (!phone) {
      setMessageType("error")
      setMessage("Please enter your M-Pesa phone number")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/mpesa/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          amount: 1,
          ticketId,
          eventTitle: "Campus Event",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessageType("error")
        setMessage(data.error || "Payment failed. Please try again.")
        return
      }

      setMessageType("success")
      setMessage("✅ STK push sent! Enter your M-Pesa PIN on your phone.")
      setStkSent(true)

      // Auto-check payment status every 5 seconds for 2 minutes
      let attempts = 0
      const interval = setInterval(async () => {
        attempts++
        try {
          const res = await fetch(`/api/tickets/status?ticketId=${ticketId}`)
          const statusData = await res.json()
          if (statusData.status === "paid") {
            clearInterval(interval)
            router.push(`/booking-confirmed/${ticketId}`)
          }
        } catch (e) {
          console.error("Status check error:", e)
        }
        if (attempts >= 24) clearInterval(interval)
      }, 5000)

    } catch (err) {
      setMessageType("error")
      setMessage("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleManualConfirm() {
    setConfirming(true)
    try {
      const res = await fetch("/api/tickets/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      })

      const data = await res.json()
      console.log("Confirm response:", data)

      if (res.ok && data.success) {
        router.push(`/booking-confirmed/${ticketId}`)
      } else {
        setMessageType("error")
        setMessage(`Error: ${data.error || "Could not confirm. Try again."}`)
      }
    } catch (e: any) {
      setMessageType("error")
      setMessage("Network error. Please try again.")
    } finally {
      setConfirming(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-[#002868] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#BF0A30] text-white text-xs font-bold px-2 py-1 rounded">
            USIU-A
          </div>
          <Link href="/" className="text-white text-lg font-bold">CampusTickets</Link>
        </div>
      </nav>

      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md">

          <div className="text-center mb-8">
            <div className="text-5xl mb-4">💳</div>
            <h2 className="text-2xl font-bold text-gray-800">M-Pesa Payment</h2>
            <p className="text-gray-500 text-sm mt-1">Pay securely with M-Pesa</p>
          </div>

          {message && (
            <div className={`text-sm px-4 py-3 rounded-lg mb-4 ${
              messageType === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}>
              {message}
            </div>
          )}

          {!stkSent ? (
            <>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  M-Pesa Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 0712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Sending STK Push..." : "Pay with M-Pesa"}
              </button>
            </>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
              <p className="text-2xl mb-3">📱</p>
              <p className="text-blue-800 font-semibold text-sm mb-1">
                Check your phone!
              </p>
              <p className="text-blue-600 text-xs mb-4">
                Enter your M-Pesa PIN on the prompt sent to your phone. Once done, click below.
              </p>
              <button
                onClick={handleManualConfirm}
                disabled={confirming}
                className="w-full py-3 rounded-xl text-sm font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {confirming ? "Confirming payment..." : "✅ I have paid — View my ticket"}
              </button>
            </div>
          )}

          <Link
            href="/dashboard"
            className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-4"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}