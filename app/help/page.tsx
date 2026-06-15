"use client"

import Link from 'next/link'
import { useState } from 'react'
import { Home, Calendar, Ticket, Bell, Settings, HelpCircle, LogOut } from 'lucide-react'

const faqs = [
  {
    question: "How do I buy a ticket?",
    answer: "Browse events on the homepage, click on any event to view details, then click 'Book Ticket Now'. If the event is free your ticket is confirmed instantly. For paid events you'll be prompted to pay via M-Pesa."
  },
  {
    question: "How do I pay with M-Pesa?",
    answer: "After booking a ticket, click 'Pay Now' on your dashboard. Enter your M-Pesa phone number and you'll receive an STK push prompt on your phone. Enter your M-Pesa PIN to complete payment."
  },
  {
    question: "Where is my QR code ticket?",
    answer: "After payment is confirmed, go to your Dashboard and click on the event name. Your QR code ticket will appear there. Show it at the entrance to be scanned."
  },
  {
    question: "What happens if my ticket scan fails?",
    answer: "Show your booking reference number to the event staff. They can manually verify your ticket in the system. Contact support if the issue persists."
  },
  {
    question: "Can I buy tickets for multiple events?",
    answer: "Yes! You can buy tickets for as many events as you want. Each event will appear separately in your dashboard under My Tickets."
  },
  {
    question: "How do I become an event organizer?",
    answer: "Sign up with your USIU-A email and select 'Organizer' as your account type. Once approved by admin, you can create and manage events from the Organizer Dashboard."
  },
  {
    question: "Can I get a refund?",
    answer: "Refund policies are set by individual event organizers. Contact the event organizer directly for refund requests. Free tickets can be cancelled from your dashboard."
  },
]

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-[#002868] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#BF0A30] text-white text-xs font-bold px-2 py-1 rounded">
            USIU-A
          </div>
          <Link href="/" className="text-white text-lg font-bold">CampusTickets</Link>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/" className="text-blue-200 hover:text-white text-sm">Events</Link>
          <Link href="/about" className="text-blue-200 hover:text-white text-sm">About</Link>
          <Link href="/help" className="text-white text-sm font-medium">Help</Link>
          <Link href="/login" className="text-blue-200 hover:text-white text-sm">Log in</Link>
          <Link href="/signup" className="bg-[#BF0A30] text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">
            Sign up
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="bg-[#002868] rounded-2xl p-10 text-center mb-10">
          <div className="text-5xl mb-4 flex justify-center"><HelpCircle className="w-12 h-12 text-blue-600" /></div>
          <h1 className="text-3xl font-bold text-white mb-2">How can we help?</h1>
          <p className="text-blue-200">Find answers to common questions or reach out directly.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* FAQs */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick FAQs</h2>
            <div className="flex flex-col gap-3">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-gray-800">{faq.question}</span>
                    <span className="text-gray-400 text-lg">{openIndex === index ? '-' : '+'}</span>
                  </button>
                  {openIndex === index && (
                    <div className="px-5 pb-4 text-sm text-gray-500 border-t border-gray-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Support</h2>
            <div className="bg-[#002868] rounded-xl p-6 text-white">
              <p className="text-blue-200 text-sm mb-4">
                If your issue persists or you have special requests, contact our support team.
                We aim to respond within 24 hours.
              </p>
              <Link
                href="mailto:ftosman@usiu.ac.ke"
                className="block bg-white text-[#002868] text-center text-sm font-medium px-4 py-3 rounded-lg hover:bg-blue-50"
              >
                ftosman@usiu.ac.ke
              </Link>
              <div className="mt-4 pt-4 border-t border-blue-800">
                <p className="text-blue-300 text-xs text-center">
                  USIU-Africa Campus · Nairobi, Kenya
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 mt-4">
              <h3 className="font-semibold text-gray-800 mb-3">Quick Links</h3>
              <div className="flex flex-col gap-2">
                <Link href="/" className="text-sm text-[#002868] hover:underline">Browse Events</Link>
                <Link href="/signup" className="text-sm text-[#002868] hover:underline">Create Account</Link>
                <Link href="/dashboard" className="text-sm text-[#002868] hover:underline">My Dashboard</Link>
                <Link href="/about" className="text-sm text-[#002868] hover:underline">About Us</Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#002868] text-blue-200 text-center py-6 text-sm">
        © 2026 CampusTickets · USIU-Africa · Nairobi, Kenya
      </footer>

    </main>
  )
}