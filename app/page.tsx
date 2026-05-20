import EventCard from "./components/EventCard"

const events = [
  {
    title: "USIU-Africa Half Marathon",
    category: "Sports",
    date: "July 26, 2026",
    time: "6:00 AM",
    venue: "USIU-Africa Campus",
    price: "KES 1,700",
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Africa Day 2026",
    category: "Cultural",
    date: "May 21, 2026",
    time: "9:00 AM",
    venue: "Nairobi, Kenya",
    price: "Free",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    title: "11th Criminology & Criminal Justice Conference",
    category: "Academic",
    date: "July 30, 2026",
    time: "9:00 AM",
    venue: "USIU-Africa Campus",
    price: "Free",
    color: "bg-red-100 text-red-700",
  },
  {
    title: "4th Accountability in African Public Policy",
    category: "Academic",
    date: "July 15, 2026",
    time: "8:00 AM",
    venue: "Nairobi, Kenya",
    price: "150 – 200 USD",
    color: "bg-red-100 text-red-700",
  },
  {
    title: "Workshop on Kenyan Indigenous Languages",
    category: "Workshop",
    date: "May 29, 2026",
    time: "9:00 AM",
    venue: "USIU-Africa Campus",
    price: "Free",
    color: "bg-green-100 text-green-700",
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-[#002868] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#BF0A30] text-white text-xs font-bold px-2 py-1 rounded">
            USIU-A
          </div>
          <h1 className="text-white text-lg font-bold">CampusTickets</h1>
        </div>
        <div className="flex gap-4">
          <a href="/login" className="text-blue-200 hover:text-white text-sm">Log in</a>
          <a href="/signup" className="bg-[#BF0A30] text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">
            Sign up
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[#002868] text-center py-16 px-6">
        <p className="text-[#f0b429] text-sm font-semibold uppercase tracking-widest mb-3">
          United States International University – Africa
        </p>
        <h2 className="text-4xl font-bold text-white mb-4">
          Your Campus. Your Events.
        </h2>
        <p className="text-blue-200 text-lg mb-8">
          Buy tickets for USIU-A events — sports, conferences, culture & more.
        </p>
        <button className="bg-[#BF0A30] text-white px-6 py-3 rounded-lg text-base hover:bg-red-700">
          Browse All Events
        </button>
      </section>

      {/* Stats bar */}
      <div className="bg-[#f0b429] py-4 px-6 flex justify-center gap-12">
        <div className="text-center">
          <p className="text-[#002868] font-bold text-xl">5+</p>
          <p className="text-[#002868] text-xs">Upcoming Events</p>
        </div>
        <div className="text-center">
          <p className="text-[#002868] font-bold text-xl">3</p>
          <p className="text-[#002868] text-xs">Categories</p>
        </div>
        <div className="text-center">
          <p className="text-[#002868] font-bold text-xl">Free</p>
          <p className="text-[#002868] text-xs">Some Events</p>
        </div>
      </div>

      {/* Event Cards */}
      <section className="px-6 py-12 max-w-6xl mx-auto">
        <h3 className="text-xl font-semibold text-gray-700 mb-6">Upcoming Events</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <EventCard key={index} {...event} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#002868] text-blue-200 text-center py-6 text-sm">
        © 2026 CampusTickets · USIU-Africa · Nairobi, Kenya
      </footer>

    </main>
  )
}