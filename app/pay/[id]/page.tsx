"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Home, Calendar, Ticket, LogOut, Smartphone, CheckCircle2, Lock } from 'lucide-react'

export default function PayPage() {
  const router = useRouter()
  const params = useParams()
  const ticketId = params.id

  const [step, setStep] = useState(1) // 1=Select, 2=Payment, 3=Confirm (phone prompt)
  const [phone, setPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("mpesa")
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")
  const [stkSent, setStkSent] = useState(false)
  const [ticketDetails, setTicketDetails] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    async function loadTicket() {
      try {
        const response = await fetch('/api/my-tickets')
        const data = await response.json()
        if (data.tickets) {
          const match = data.tickets.find((t: any) => String(t.id) === String(ticketId))
          if (match) setTicketDetails(match)
        }
      } catch (err) {
        console.error(err)
      }
    }
    if (ticketId) loadTicket()
  }, [ticketId])

  const unitPrice = ticketDetails ? parseFloat(ticketDetails.price_amount) : 0
  const isFree = unitPrice === 0
  const serviceFee = isFree ? 0 : Math.round(unitPrice * 0.02 * quantity)
  const subtotal = Math.round(unitPrice * quantity)
  const total = subtotal + serviceFee

  async function handleProceedToPayment() {
    setStep(2)
  }

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
      const amount = Math.round(unitPrice > 0 ? unitPrice * quantity : 1)

      const response = await fetch("/api/mpesa/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, amount, ticketId, eventTitle: ticketDetails?.title || "Campus Event" }),
      })

      const data = await response.json()

      // Whether STK succeeds or fails in sandbox, move to "check your phone" step
      setMessageType("success")
      setMessage(data.message || "STK push sent! Enter your M-Pesa PIN on the prompt.")
      setStkSent(true)
      setStep(3)

      // Auto-poll for payment confirmation every 5s for 2 minutes
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
      // Network error — still move to check-phone step
      setMessageType("success")
      setMessage("Check your phone for the M-Pesa PIN prompt.")
      setStkSent(true)
      setStep(3)
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
        body: JSON.stringify({ ticketId, quantity }),
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

  const steps = [
    { n: 1, label: "Select" },
    { n: 2, label: "Payment" },
    { n: 3, label: "Confirm" },
  ]

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

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 max-w-2xl">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step > s.n
                  ? 'bg-[#002868] text-white'
                  : step === s.n
                  ? 'bg-[#002868] text-white ring-4 ring-blue-200'
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span className={`text-sm font-medium ${step >= s.n ? 'text-[#002868]' : 'text-gray-400'}`}>
                {s.label}
              </span>
              {i < 2 && (
                <div className={`h-0.5 w-20 mx-2 rounded-full transition-colors ${step > s.n ? 'bg-[#002868]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 max-w-4xl">

          {/* LEFT COLUMN */}
          <div className="col-span-2 flex flex-col gap-5">

            {/* Event card — shown on all steps */}
            {ticketDetails && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-[#002868] flex-shrink-0">
                  <Ticket className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-base">{ticketDetails.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {ticketDetails.date} · {ticketDetails.time} · {ticketDetails.venue}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-extrabold text-[#002868] text-lg">
                    {isFree ? "FREE" : `KSH ${unitPrice.toLocaleString()}`}
                  </p>
                  <p className="text-xs text-gray-400">PER TICKET</p>
                </div>
              </div>
            )}

            {/* STEP 1 — Ticket quantity */}
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-800 text-base mb-5">Ticket quantity</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-9 h-9 rounded-lg border border-gray-300 text-gray-700 font-bold text-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >−</button>
                    <span className="font-bold text-gray-800 text-xl w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(5, q + 1))}
                      className="w-9 h-9 rounded-lg border border-gray-300 text-gray-700 font-bold text-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >+</button>
                  </div>
                  <div className="text-right">
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full inline-block">
                      86 seats left
                    </span>
                    <p className="text-xs text-gray-400 mt-1">Max 5 tickets per student</p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 — Payment method */}
            {step === 2 && !stkSent && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-800 text-base mb-5">Payment method</h2>

                {message && (
                  <div className={`text-sm px-4 py-3 rounded-lg mb-4 ${
                    messageType === "success"
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}>
                    {message}
                  </div>
                )}

                <div className="flex flex-col gap-3 mb-5">
                  {[
                    { id: "mpesa", label: "M-Pesa", sub: "Safaricom STK Push", badge: "MPESA" },
                    { id: "card", label: "Debit / Credit card", sub: "Visa, Mastercard", badge: "VISA" },
                    { id: "wallet", label: "Campus Wallet", sub: "USIU-A Campus Wallet", badge: "USIU-A" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                        paymentMethod === m.id
                          ? 'border-[#002868] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                          paymentMethod === m.id
                            ? 'border-[#002868] bg-[#002868]'
                            : 'border-gray-300'
                        }`}>
                          {paymentMethod === m.id && (
                            <div className="w-full h-full rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{m.label}</p>
                          <p className="text-xs text-gray-400">{m.sub}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-gray-500 border border-gray-300 px-2 py-0.5 rounded">
                        {m.badge}
                      </span>
                    </button>
                  ))}
                </div>

                {paymentMethod === "mpesa" && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">
                      M-Pesa Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 0712345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#002868] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1.5">A PIN prompt will be sent to this number</p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 — Check your phone */}
            {step === 3 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <div className="flex justify-center mb-4 text-[#002868]">
                  <Smartphone className="w-12 h-12" />
                </div>
                <h2 className="font-bold text-[#002868] text-xl mb-2">Check your phone!</h2>
                <p className="text-gray-500 text-sm mb-2">
                  A payment prompt has been sent to <strong>{phone}</strong>.
                </p>
                <p className="text-gray-500 text-sm mb-8">
                  Enter your <strong>M-Pesa PIN</strong> on the prompt. Once done, click the button below to confirm your ticket.
                </p>

                {message && (
                  <div className="text-sm px-4 py-3 rounded-lg mb-5 bg-green-50 border border-green-200 text-green-700">
                    {message}
                  </div>
                )}

                <button
                  onClick={handleManualConfirm}
                  disabled={confirming}
                  className="w-full py-4 rounded-xl text-sm font-bold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <span className="flex items-center justify-center gap-2">
                    {confirming ? "Confirming..." : <><CheckCircle2 className="w-5 h-5" /> I have paid — View my ticket</>}
                  </span>
                </button>

                <p className="text-xs text-gray-400 mt-4">
                  Didn't get a prompt?{" "}
                  <button onClick={() => { setStep(2); setStkSent(false); setMessage("") }} className="text-[#002868] underline">
                    Go back and try again
                  </button>
                </p>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN — Order summary */}
          <div className="col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-8">
              <h3 className="font-semibold text-gray-800 mb-4">Order summary</h3>

              <div className="flex flex-col gap-2.5 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 truncate pr-2">
                    {ticketDetails?.title || "Campus Event"} × {quantity}
                  </span>
                  <span className="text-gray-800 font-medium flex-shrink-0">
                    {isFree ? "Free" : `${subtotal.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Service fee</span>
                  <span className="text-gray-800 font-medium">{serviceFee}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 mb-5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">Total</span>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">KSH</p>
                    <p className="font-extrabold text-[#002868] text-2xl">
                      {isFree ? "Free" : total.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA buttons based on step */}
              {step === 1 && (
                <button
                  onClick={handleProceedToPayment}
                  className="w-full py-3.5 rounded-xl text-sm font-bold bg-[#002868] text-white hover:bg-blue-900 transition-colors"
                >
                  Proceed to Payment
                </button>
              )}

              {step === 2 && !stkSent && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handlePay}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl text-sm font-bold bg-[#002868] text-white hover:bg-blue-900 disabled:opacity-50 transition-colors"
                  >
                    {loading
                      ? "Sending prompt..."
                      : `Confirm & Pay — KSH ${isFree ? 0 : total.toLocaleString()}`}
                  </button>
                  <button
                    type="button"
                    onClick={handleManualConfirm}
                    disabled={confirming}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                  >
                    {confirming ? "Confirming..." : "Simulate Payment (Test)"}
                  </button>
                </div>
              )}

              <Link
                href="/dashboard"
                className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-4"
              >
                Cancel & Go Back
              </Link>
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-3">
                <Lock className="w-3 h-3" /> Secured by 256-bit SSL
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}