type EventCardProps = {
  title: string
  category: string
  date: string
  time: string
  venue: string
  price: string
  color: string
}

export default function EventCard({ title, category, date, time, venue, price, color }: EventCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className={`text-xs font-medium px-3 py-1 rounded-full w-fit mb-3 ${color}`}>
        {category}
      </div>
      <h4 className="font-semibold text-gray-800 mb-2 leading-snug">
        {title}
      </h4>
      <p className="text-sm text-gray-500 mb-1">📅 {date} · {time}</p>
      <p className="text-sm text-gray-500 mb-4">📍 {venue}</p>
      <div className="flex items-center justify-between">
        <span className="text-[#002868] font-bold">{price}</span>
        <button className="bg-[#BF0A30] text-white text-sm px-4 py-1.5 rounded-lg hover:bg-red-700">
          Get Ticket
        </button>
      </div>
    </div>
  )
}