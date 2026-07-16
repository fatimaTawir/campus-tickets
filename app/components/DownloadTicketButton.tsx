"use client"

import { useState } from "react"
import { Download, Mail, Check, Loader2 } from "lucide-react"

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
  studentEmail,
  qrCode,
  bookingRef,
  quantity = 1,
}: Props) {
  const [downloading, setDownloading] = useState(false)
  const [emailing, setEmailing] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function generatePDF() {
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
    doc.text(`Quantity: ${quantity}`, 30, 155)

    // Divider
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.line(20, 165, 190, 165)

    // QR Code
    const qrDataUrl = await QRCode.toDataURL(qrCode, {
      width: 200,
      margin: 1,
      color: {
        dark: '#002868',
        light: '#ffffff',
      }
    })

    doc.addImage(qrDataUrl, "PNG", 70, 170, 70, 70)

    doc.setTextColor(80, 80, 80)
    doc.setFontSize(10)
    doc.text("Scan QR code at entrance", 105, 248, { align: "center" })

    // Status
    doc.setFillColor(220, 252, 231)
    doc.rect(60, 253, 90, 10, "F")
    doc.setTextColor(22, 101, 52)
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("✓ CONFIRMED", 105, 260, { align: "center" })

    // Footer
    doc.setFillColor(0, 40, 104)
    doc.rect(0, 270, 210, 27, "F")
    doc.setTextColor(147, 197, 253)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text("© 2026 CampusTickets · USIU-Africa · Nairobi, Kenya", 105, 282, { align: "center" })
    doc.text("This ticket is valid for one entry only", 105, 290, { align: "center" })

    return doc
  }

  async function handleDownload() {
    setDownloading(true)
    try {
      const doc = await generatePDF()
      doc.save(`USIU-Ticket-${bookingRef}.pdf`)
    } catch (error) {
      console.error("PDF generation error:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setDownloading(false)
    }
  }

  async function handleEmail() {
    setEmailing(true)
    try {
      const email = studentEmail || ""
      const subject = encodeURIComponent(`Your Ticket – ${eventTitle}`)
      const body = encodeURIComponent(
        `Hi ${studentName},\n\nYour booking is confirmed!\n\nEvent: ${eventTitle}\nDate: ${eventDate}\nVenue: ${eventVenue}\nBooking Reference: ${bookingRef}\nTicket ID: #${ticketId}\nQuantity: ${quantity} Ticket(s)\n\nPlease download your ticket PDF from the CampusTickets portal.\n\nThank you!\n– CampusTickets`
      )
      window.open(`mailto:${email}?subject=${subject}&body=${body}`)
      setEmailSent(true)
      setTimeout(() => setEmailSent(false), 3000)
    } catch (error) {
      alert("Could not open email client. Please download the PDF instead.")
    } finally {
      setEmailing(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full bg-[#002868] hover:bg-blue-900 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
      >
        {downloading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...</>
        ) : (
          <><Download className="w-4 h-4" /> Download Ticket (PDF)</>
        )}
      </button>

      <button
        onClick={handleEmail}
        disabled={emailing || emailSent}
        className={`w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors border ${
          emailSent
            ? "bg-green-50 border-green-300 text-green-700"
            : "bg-white border-gray-200 text-gray-700 hover:border-[#002868] hover:text-[#002868]"
        } disabled:opacity-50`}
      >
        {emailing ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Opening email...</>
        ) : emailSent ? (
          <><Check className="w-4 h-4" /> Email client opened!</>
        ) : (
          <><Mail className="w-4 h-4" /> Send to Email</>
        )}
      </button>
    </div>
  )
}