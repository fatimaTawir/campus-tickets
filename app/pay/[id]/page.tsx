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
          amount: 1, // Using 1 for sandbox testing
          ticketId,
          eventTitle: "USIU-A Event",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessageType("error")
        setMessage(data.error)
        return
      }

      setMessageType("success")
      setMessage("STK push sent! Check your phone and enter your M-Pesa PIN.")

    } catch (err) {
      setMessageType("error")
      setMessage("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
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
            <div className="text-5xl mb-4">📱</div>
            <h2 className="text-2xl font-bold text-gray-800">Pay with M-Pesa</h2>
            <p className="text-gray-500 text-sm mt-1">
              Enter your M-Pesa number to receive the payment prompt
            </p>
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

          <div className="flex flex-col gap-4">
            <div>
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
              <p className="text-xs text-gray-400 mt-1">
                Use 0708374149 for sandbox testing
              </p>
            </div>

            <button
              onClick={handlePay}
              disabled={loading}
              className="bg-green-600 text-white w-full py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Sending request..." : "Pay with M-Pesa"}
            </button>

            <Link
              href="/dashboard"
              className="text-center text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to dashboard
            </Link>
          </div>

        </div>
      </div>
    </main>
  )
}