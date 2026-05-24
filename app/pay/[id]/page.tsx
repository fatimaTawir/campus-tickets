"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

export default function PayPage() {
  const router = useRouter()
  const params = useParams()
  const ticketId = params.id
  const [phone, setPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("mpesa")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  async function handlePay() {
    if (paymentMethod === "mpesa" && !phone) {
      setMessageType("error")
      setMessage("Please enter your M-Pesa phone number")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      if (paymentMethod === "mpesa") {
        const response = await fetch("/api/mpesa/pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone,
            amount: 1,
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

      } else if (paymentMethod === "card") {
        setMessageType("success")
        setMessage("Card payment coming soon! Please use M-Pesa for now.")

      } else if (paymentMethod === "wallet") {
        setMessageType("success")
        setMessage("Campus wallet payment coming soon! Please use M-Pesa for now.")
      }

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
            <div className="text-5xl mb-4">💳</div>
            <h2 className="text-2xl font-bold text-gray-800">Choose Payment Method</h2>
            <p className="text-gray-500 text-sm mt-1">Select how you want to pay for your ticket</p>
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

          {/* Payment methods */}
          <div className="flex flex-col gap-3 mb-6">

            {/* M-Pesa */}
            <button
              onClick={() => setPaymentMethod("mpesa")}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${
                paymentMethod === "mpesa"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-lg">
                  📱
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800 text-sm">M-Pesa</p>
                  <p className="text-xs text-gray-400">Safaricom M-Pesa STK Push</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${
                paymentMethod === "mpesa" ? "border-green-500 bg-green-500" : "border-gray-300"
              }`} />
            </button>

            {/* Card */}
            <button
              onClick={() => setPaymentMethod("card")}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${
                paymentMethod === "card"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                  💳
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800 text-sm">Debit / Credit Card</p>
                  <p className="text-xs text-gray-400">Visa, Mastercard</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${
                paymentMethod === "card" ? "border-blue-500 bg-blue-500" : "border-gray-300"
              }`} />
            </button>

            {/* Campus Wallet */}
            <button
              onClick={() => setPaymentMethod("wallet")}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${
                paymentMethod === "wallet"
                  ? "border-[#002868] bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg">
                  🎓
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800 text-sm">Campus Wallet</p>
                  <p className="text-xs text-gray-400">USIU-A Campus Wallet</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${
                paymentMethod === "wallet" ? "border-[#002868] bg-[#002868]" : "border-gray-300"
              }`} />
            </button>

          </div>

          {/* M-Pesa phone input */}
          {paymentMethod === "mpesa" && (
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
              <p className="text-xs text-gray-400 mt-1">
                Use 0708374149 for sandbox testing
              </p>
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={loading}
            className={`w-full py-3 rounded-xl text-sm font-medium disabled:opacity-50 ${
              paymentMethod === "mpesa"
                ? "bg-green-600 text-white hover:bg-green-700"
                : paymentMethod === "card"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-[#002868] text-white hover:bg-blue-900"
            }`}
          >
            {loading ? "Processing..." : `Pay with ${
              paymentMethod === "mpesa" ? "M-Pesa" :
              paymentMethod === "card" ? "Card" : "Campus Wallet"
            }`}
          </button>

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