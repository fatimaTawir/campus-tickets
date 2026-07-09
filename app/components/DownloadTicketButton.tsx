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

    // Navy header background
    doc.setFillColor(0, 40, 104)
    doc.rect(0, 0, 210, 65, "F")

    // Gold accent line
    doc.setFillColor(240, 180, 41)
    doc.rect(0, 62, 210, 3, "F")

    // Header text - USIU gold
    doc.setTextColor(240, 180, 41)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("UNITED STATES INTERNATIONAL UNIVERSITY – AFRICA", 105, 18, { align: "center" })

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.text("CETS · Campus Events", 105, 35, { align: "center" })

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.text("OFFICIAL EVENT TICKET", 105, 48, { align: "center" })

    // Booking reference pill
    doc.setFillColor(240, 180, 41)
    doc.roundedRect(40, 72, 130, 22, 4, 4, "F")
    doc.setTextColor(0, 40, 104)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("BOOKING REFERENCE", 105, 80, { align: "center" })
    doc.setFontSize(15)
    doc.text(bookingRef, 105, 90, { align: "center" })

    // Divider
    doc.setDrawColor(230, 230, 230)
    doc.setLineWidth(0.3)
    doc.line(20, 100, 190, 100)

    // Event title
    doc.setTextColor(0, 40, 104)
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    const titleLines = doc.splitTextToSize(eventTitle, 150)
    doc.text(titleLines, 105, 112, { align: "center" })

    // Details section
    const detailsY = 130
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(80, 80, 80)

    const details = [
      ["Date & Time", eventDate],
      ["Venue", eventVenue],
      ["Attendee", studentName],
      ["Ticket ID", `#${ticketId}`],
      ["Quantity", `${quantity} Ticket(s)`],
    ]

    details.forEach(([label, value], i) => {
      const y = detailsY + i * 12
      doc.setFont("helvetica", "bold")
      doc.setTextColor(120, 120, 120)
      doc.text(label.toUpperCase(), 25, y)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(30, 30, 30)
      doc.text(String(value), 80, y)
    })

    // Divider
    doc.setDrawColor(230, 230, 230)
    doc.line(20, detailsY + details.length * 12 + 5, 190, detailsY + details.length * 12 + 5)

    // QR code
    const qrDataUrl = await QRCode.toDataURL(qrCode, {
      width: 220,
      margin: 1,
      color: { dark: '#002868', light: '#ffffff' }
    })

    const qrY = detailsY + details.length * 12 + 12
    doc.addImage(qrDataUrl, "PNG", 72, qrY, 66, 66)
    doc.setTextColor(120, 120, 120)
    doc.setFontSize(9)
    doc.text("Scan QR code at entrance", 105, qrY + 72, { align: "center" })

    // Confirmed badge
    doc.setFillColor(220, 252, 231)
    doc.roundedRect(60, qrY + 78, 90, 12, 3, 3, "F")
    doc.setTextColor(22, 101, 52)
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("✓  CONFIRMED & VALID", 105, qrY + 86, { align: "center" })

    // Footer
    doc.setFillColor(0, 40, 104)
    doc.rect(0, 270, 210, 27, "F")
    doc.setTextColor(147, 197, 253)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text("© 2026 CETS · Campus Events · USIU-Africa · Nairobi, Kenya", 105, 280, { align: "center" })
    doc.text("This ticket is valid for one entry per person. Non-transferable.", 105, 288, { align: "center" })

    return doc
  }

  async function handleDownload() {
    setDownloading(true)
    try {
      const doc = await generatePDF()
      doc.save(`CETS-Ticket-${bookingRef}.pdf`)
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
      // Try to generate PDF and open mail client with mailto
      const email = studentEmail || ""
      const subject = encodeURIComponent(`Your Ticket – ${eventTitle}`)
      const body = encodeURIComponent(
        `Hi ${studentName},\n\nYour booking is confirmed!\n\nEvent: ${eventTitle}\nDate: ${eventDate}\nVenue: ${eventVenue}\nBooking Reference: ${bookingRef}\nTicket ID: #${ticketId}\nQuantity: ${quantity} Ticket(s)\n\nPlease download your ticket PDF from the CETS portal:\nhttps://campus-tickets-wheat.vercel.app/booking-confirmed/${ticketId}\n\nThank you!\n– CETS · Campus Events`
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
        className="w-full bg-[#002868] hover:bg-blue-900 text-white py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all disabled:opacity-60 shadow-sm"
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
        className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all border ${
          emailSent
            ? "bg-green-50 border-green-300 text-green-700"
            : "bg-white border-gray-200 text-gray-700 hover:border-[#002868] hover:text-[#002868]"
        } disabled:opacity-60`}
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