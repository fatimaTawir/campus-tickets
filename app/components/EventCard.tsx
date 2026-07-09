"use client"

import { useRouter } from "next/navigation"
import { Calendar, MapPin, Clock } from "lucide-react"

type EventCardProps = {
  id: number
  title: string
  category: string
  date: string
  time: string
  venue: string
  priceAmount?: number | string
  price?: string
  color: string
}

const categoryImages: Record<string, string> = {
  Academic: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop",
  Sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=600&auto=format&fit=crop",
  Cultural: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
  "Club Activity": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop",
  Workshop: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=600&auto=format&fit=crop",
  Music: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600&auto=format&fit=crop",
  Conference: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop",
  Arts: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=600&auto=format&fit=crop",
}

function getEventImage(title: string, category: string): string {
  const t = title.toLowerCase()
  if (t.includes("dinner") || t.includes("gala") || t.includes("food") || t.includes("feast")) {
    return "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=600&auto=format&fit=crop"
  }
  if (t.includes("party") || t.includes("prom") || t.includes("dance") || t.includes("night") || t.includes("ball")) {
    return "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop"
  }
  if (t.includes("hackathon") || t.includes("tech") || t.includes("coding") || t.includes("software")) {
    return "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600&auto=format&fit=crop"
  }
  if (t.includes("debate") || t.includes("speech") || t.includes("talk") || t.includes("lecture")) {
    return "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=600&auto=format&fit=crop"
  }
  if (t.includes("art") || t.includes("exhibition") || t.includes("gallery") || t.includes("craft")) {
    return "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=600&auto=format&fit=crop"
  }
  if (t.includes("indigenous") || t.includes("language") || t.includes("heritage") || t.includes("culture")) {
    return "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=600&auto=format&fit=crop"
  }
  if (t.includes("run") || t.includes("marathon") || t.includes("race") || t.includes("football") || t.includes("basketball")) {
    return "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=600&auto=format&fit=crop"
  }
  return categoryImages[category] || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=600&auto=format&fit=crop"
}

export default function EventCard({ id, title, category, date, time, venue, priceAmount, price, color }: EventCardProps) {
  const router = useRouter()
  const imageUrl = getEventImage(title, category)

  // Format price display
  let displayPrice: string
  if (priceAmount !== undefined && priceAmount !== null) {
    const amount = parseFloat(String(priceAmount))
    displayPrice = amount === 0 ? "Free" : `KSH ${amount.toLocaleString()}`
  } else if (price) {
    displayPrice = price
      .replace(/UGX/gi, "KSH")
      .replace(/KES/gi, "KSH")
      .replace(/Ksh/gi, "KSH")
  } else {
    displayPrice = "Free"
  }

  return (
    <div
      onClick={() => router.push(`/events/${id}`)}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col group h-full"
    >
      {/* Event Cover Image */}
      <div className="relative h-48 w-full bg-gray-100 overflow-hidden flex-shrink-0">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Fallback on image load error
            const target = e.target as HTMLImageElement
            target.src = `https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=600&auto=format&fit=crop`
          }}
        />
        {/* Price Badge Overlay */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-md border border-gray-100">
          {displayPrice}
        </div>
        {/* Category badge on image */}
        <div className="absolute bottom-4 left-4 bg-[#002868]/90 text-[#f0b429] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
          {category}
        </div>
      </div>

      {/* Event Info Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Date */}
          <div className="flex items-center gap-1.5 mb-2">
            <Calendar className="w-3 h-3 text-[#f0b429]" />
            <span className="text-gray-400 text-xs font-medium">{date}</span>
          </div>

          {/* Title */}
          <h4 className="font-bold text-gray-800 text-base mb-3 leading-snug group-hover:text-[#002868] transition-colors line-clamp-2">
            {title}
          </h4>
        </div>

        {/* Location & Time info row */}
        <div className="space-y-1.5 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{venue}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span>{time}</span>
          </div>
        </div>
      </div>
    </div>
  )
}