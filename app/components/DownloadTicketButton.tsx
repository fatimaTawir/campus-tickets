"use client"

import { useState } from "react"

type Props = {
  ticketId: number
  eventTitle: string
  eventDate: string
  eventVenue: string
  studentName: string
  studentEmail?: string
  qrCode: string
  bookingRef: string
  quantity?: number
}

export default function DownloadTicketButton({
  ticketId,
  eventTitle,
  eventDate,
  eventVenue,
  studentName,
  qrCode,
  bookingRef,
}: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)

    try {
      const { jsPDF } = await import("jspdf")
      const QRCode = await import("qrcode")

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Background
      doc.setFillColor(0, 40, 104) // USIU-A navy blue
      doc.rect(0, 0, 210, 60, "F")

      // Header text
      doc.setTextColor(240, 180, 41) // USIU-A gold
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("UNITED STATES INTERNATIONAL UNIVERSITY - AFRICA", 105, 20, { align: "center" })

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.text("CampusTickets", 105, 35, { align: "center" })

      doc.setFontSize(12)
      doc.text("EVENT TICKET", 105, 47, { align: "center" })

      // Booking reference box
      doc.setFillColor(191, 10, 48) // USIU-A red
      doc.rect(20, 65, 170, 20, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.text("BOOKING REFERENCE", 105, 73, { align: "center" })
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text(`USIU-${bookingRef}`, 105, 81, { align: "center" })

      // Event details
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text(eventTitle, 105, 100, { align: "center", maxWidth: 170 })

      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(80, 80, 80)
      doc.text(`Date: ${eventDate}`, 30, 115)
      doc.text(`Venue: ${eventVenue}`, 30, 125)
      doc.text(`Attendee: ${studentName}`, 30, 135)
      doc.text(`Ticket ID: #${ticketId}`, 30, 145)

      // Divider
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.5)
      doc.line(20, 155, 190, 155)

      // QR Code
      const qrDataUrl = await QRCode.toDataURL(qrCode, {
        width: 200,
        margin: 1,
        color: {
          dark: '#002868',
          light: '#ffffff',
        }
      })

      doc.addImage(qrDataUrl, "PNG", 70, 160, 70, 70)

      doc.setTextColor(80, 80, 80)
      doc.setFontSize(10)
      doc.text("Scan QR code at entrance", 105, 238, { align: "center" })

      // Status
      doc.setFillColor(220, 252, 231)
      doc.rect(60, 243, 90, 10, "F")
      doc.setTextColor(22, 101, 52)
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("✓ CONFIRMED", 105, 250, { align: "center" })

      // Footer
      doc.setFillColor(0, 40, 104)
      doc.rect(0, 270, 210, 27, "F")
      doc.setTextColor(147, 197, 253)
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text("© 2026 CampusTickets · USIU-Africa · Nairobi, Kenya", 105, 282, { align: "center" })
      doc.text("This ticket is valid for one entry only", 105, 290, { align: "center" })

      doc.save(`USIU-Ticket-${bookingRef}.pdf`)

    } catch (error) {
      console.error("PDF generation error:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function handleEmail() {
    const subject = encodeURIComponent(`Your Ticket for ${eventTitle}`)
    const body = encodeURIComponent(`Hi ${studentName},\n\nYour booking for ${eventTitle} is confirmed.\nYour Booking Reference is USIU-${bookingRef}.\n\nPlease find your ticket attached as a PDF (download it from the app).\n\nEnjoy the event!\nCampusTickets Team`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="w-full bg-[#002868] text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-900 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>⏳ Generating PDF...</>
        ) : (
          <>📄 Download Ticket (PDF)</>
        )}
      </button>
      
      <button
        onClick={handleEmail}
        className="w-full bg-white text-[#002868] border-2 border-[#002868] py-3 rounded-xl text-sm font-medium hover:bg-blue-50 flex items-center justify-center gap-2"
      >
        📧 Send to Email
      </button>
    </div>
  )
}