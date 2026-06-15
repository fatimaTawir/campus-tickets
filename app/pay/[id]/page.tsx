"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Home, Calendar, Ticket, Bell, Settings, HelpCircle, LogOut } from 'lucide-react'

export default function PayPage() {
  const router = useRouter()
  const params = useParams()
  const ticketId = params.id
  const [phone, setPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("mpesa")
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")
  const [stkSent, setStkSent] = useState(false)
  const [step, setStep] = useState(2) // 1=Select, 2=Payment, 3=Confirm

  async function handlePay() {
    if (paymentMethod === "mpesa" && !phone) {
      setMessageType("error")
      setMessage("Please enter your M-Pesa phone number")
      return
    }
    if (paymentMethod === "card" || paymentMethod === "wallet") {
      setMessageType("error")
      setMessage("Coming soon! Please use M-Pesa for now.")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/mpesa/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, amount: 1, ticketId, eventTitle: "Campus Event" }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessageType("error")
        setMessage(data.error || "Payment failed. Please try again.")
        return
      }

      setMessageType("success")
      setMessage("STK push sent! Enter your PIN on your phone.")
      setStkSent(true)
      setStep(3)

      // Auto-check every 5 seconds
      let attempts = 0
      const interval = setInterval(async () => {
        attempts++
        try {
          const res = await fetch(`/api/tickets/status?ticketId=${ticketId}`)
          const d = await res.json()
          if (d.status === "paid") {
            clearInterval(interval)
            router.push(`/booking-confirmed/${ticketId}`)
          }
        } catch (e) {}
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
      if (res.ok && data.success) {
        router.push(`/booking-confirmed/${ticketId}`)
      } else {
        setMessageType("error")
        setMessage(data.error || "Could not confirm. Please try again.")
      }
    } catch (e) {
      setMessageType("error")
      setMessage("Network error. Please try again.")
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen fixed left-0 top-0 z-10">
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#002868] rounded-lg flex items-center justify-center">
              <span className="text-[#f0b429] text-xs font-bold">CT</span>
            </div>
            <span className="font-bold text-gray-800">CampusTickets</span>
          </Link>
        </div>
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
          </div>
        </nav>
        <div className="px-4 py-4 border-t border-gray-100">
          <Link href="/api/auth/logout" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 text-sm">
            <LogOut className="w-4 h-4" /> Sign out
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1 p-8">

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8 max-w-2xl">
          {[{ n: 1, label: "Select" }, { n: 2, label: "Payment" }, { n: 3, label: "Confirm" }].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= s.n ? 'bg-[#002868] text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span className={`text-sm ${step >= s.n ? 'text-[#002868] font-medium' : 'text-gray-400'}`}>
                {s.label}
              </span>
              {i < 2 && <div className={`h-0.5 w-16 ${step > s.n ? 'bg-[#002868]' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 max-w-4xl">

          {/* Payment form */}
          <div className="col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment method</h2>

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
                {/* Payment options */}
                <div className="flex flex-col gap-3 mb-6">
                  {[
                    { id: "mpesa", label: "M-Pesa", sub: "Safaricom STK Push", icon: "📱" },
                    { id: "card", label: "Debit / Credit card", sub: "Visa, Mastercard", icon: "💳" },
                    { id: "wallet", label: "Campus Wallet", sub: "USIU-A Campus Wallet", icon: "🎓" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-colors text-left ${
                        paymentMethod === m.id ? 'border-[#002868] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                          {m.icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{m.label}</p>
                          <p className="text-xs text-gray-400">{m.sub}</p>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        paymentMethod === m.id ? 'border-[#002868] bg-[#002868]' : 'border-gray-300'
                      }`} />
                    </button>
                  ))}
                </div>

                {paymentMethod === "mpesa" && (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 block mb-1">M-Pesa Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. 0712345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868]"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                <p className="text-3xl mb-3">📱</p>
                <p className="font-semibold text-blue-800 mb-2">Check your phone!</p>
                <p className="text-sm text-blue-600 mb-6">
                  Enter your M-Pesa PIN on the prompt sent to your phone. Once done, click the button below.
                </p>
                <button
                  onClick={handleManualConfirm}
                  disabled={confirming}
                  className="w-full py-3 rounded-xl text-sm font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {confirming ? "Confirming..." : "✅ I have paid — View my ticket"}
                </button>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Order summary</h3>
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ticket</span>
                  <span className="text-gray-800 font-medium">—</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service fee</span>
                  <span className="text-gray-800">—</span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3 mb-6">
                <div className="flex justify-between font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-[#002868]">—</span>
                </div>
              </div>

              {!stkSent && (
                <button
                  onClick={handlePay}
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-bold bg-[#002868] text-white hover:bg-blue-900 disabled:opacity-50 mb-2"
                >
                  {loading ? "Processing..." : "Confirm & Pay"}
                </button>
              )}
              <Link href="/dashboard" className="block text-center text-sm text-gray-500 hover:text-gray-700">
                Cancel & Go Back
              </Link>
              <p className="text-xs text-gray-400 text-center mt-3">🔒 Secured by 256-bit SSL</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}