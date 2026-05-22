"use client"

import { QRCodeSVG } from "qrcode.react"

type QRTicketProps = {
  qrCode: string
  eventTitle: string
  eventDate: string
  eventVenue: string
  studentName: string
  paymentStatus: string
}

export default function QRTicket({
  qrCode,
  eventTitle,
  eventDate,
  eventVenue,
  studentName,
  paymentStatus,
}: QRTicketProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden max-w-sm mx-auto">

      {/* Ticket header */}
      <div className="bg-[#002868] px-6 py-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-[#BF0A30] text-white text-xs font-bold px-2 py-0.5 rounded">
            USIU-A
          </div>
          <span className="text-white text-sm font-semibold">CampusTickets</span>
        </div>
        <p className="text-[#f0b429] text-xs uppercase tracking-widest">
          Event Ticket
        </p>
      </div>

      {/* Event details */}
      <div className="px-6 py-4 border-b border-dashed border-gray-200">
        <h3 className="font-bold text-gray-800 text-lg leading-snug mb-3">
          {eventTitle}
        </h3>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-gray-500">📅 {eventDate}</p>
          <p className="text-sm text-gray-500">📍 {eventVenue}</p>
          <p className="text-sm text-gray-500">🎓 {studentName}</p>
        </div>
      </div>

      {/* QR Code */}
      <div className="px-6 py-6 flex flex-col items-center">
        {paymentStatus === 'paid' ? (
          <>
            <QRCodeSVG
              value={qrCode}
              size={180}
              bgColor="#ffffff"
              fgColor="#002868"
              level="H"
            />
            <p className="text-xs text-gray-400 mt-3 text-center">
              Show this QR code at the entrance
            </p>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-4xl mb-2">🔒</p>
            <p className="text-sm text-gray-500">
              QR code will appear after payment
            </p>
          </div>
        )}
      </div>

      {/* Status badge */}
      <div className={`px-6 py-3 text-center text-sm font-medium ${
        paymentStatus === 'paid'
          ? 'bg-green-50 text-green-700'
          : 'bg-yellow-50 text-yellow-700'
      }`}>
        {paymentStatus === 'paid' ? '✅ Confirmed' : '⏳ Payment Pending'}
      </div>

    </div>
  )
}