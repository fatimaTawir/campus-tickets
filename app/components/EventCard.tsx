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
  price: string
  color: string
}

const categoryImages: Record<string, string> = {
  Academic: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop",
  Sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=600&auto=format&fit=crop",
  Cultural: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
  "Club Activity": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop",
  Workshop: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=600&auto=format&fit=crop",
  Music: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600&auto=format&fit=crop"
}

function getEventImage(title: string, category: string): string {
  const t = title.toLowerCase()
  if (t.includes("dinner") || t.includes("gala") || t.includes("food") || t.includes("feast")) {
    return "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=600&auto=format&fit=crop" // Dinner
  }
  if (t.includes("party") || t.includes("prom") || t.includes("dance") || t.includes("night") || t.includes("ball")) {
    return "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop" // Prom / Party
  }
  return categoryImages[category] || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=600&auto=format&fit=crop"
}

export default function EventCard({ id, title, category, date, time, venue, price }: EventCardProps) {
  const router = useRouter()
  const imageUrl = getEventImage(title, category)

  // Replace UGX / KES with KSH consistently
  const formattedPrice = price
    .replace(/UGX/gi, "KSH")
    .replace(/KES/gi, "KSH")
    .replace(/Ksh/gi, "KSH")

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
        />
        {/* Price Badge Overlay */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-md border border-gray-100">
          {formattedPrice}
        </div>
      </div>

      {/* Event Info Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Tag & Date */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#002868] bg-[#f0b429]/15 px-2 py-0.5 rounded-full">
              {category}
            </span>
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