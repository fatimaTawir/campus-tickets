import Link from "next/link"
import pool from "./lib/db"
import EventCard from "./components/EventCard"
import SearchBar from "@/app/components/SearchBar"

export const dynamic = 'force-dynamic'

const categoryColors: { [key: string]: string } = {
  Sports: "bg-blue-100 text-blue-700",
  Cultural: "bg-yellow-100 text-yellow-700",
  Academic: "bg-red-100 text-red-700",
  Workshop: "bg-green-100 text-green-700",
  Music: "bg-purple-100 text-purple-700",
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>
}) {
  const { search, category } = await searchParams

  let query = 'SELECT * FROM events'
  const conditions: string[] = []
  const values: string[] = []

  if (search) {
    values.push(`%${search}%`)
    conditions.push(`(title ILIKE $${values.length} OR venue ILIKE $${values.length})`)
  }

  if (category && category !== 'All') {
    values.push(category)
    conditions.push(`category = $${values.length}`)
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ')
  }

  query += ' ORDER BY created_at DESC'

  const result = await pool.query(query, values)
  const events = result.rows

  const categories = ['All', 'Academic', 'Sports', 'Cultural', 'Workshop', 'Music']

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
        <div className="flex gap-4 items-center">
          <Link href="/about" className="text-blue-200 hover:text-white text-sm">About</Link>
          <Link href="/help" className="text-blue-200 hover:text-white text-sm">Help</Link>
          <Link href="/organizer" className="text-blue-200 hover:text-white text-sm">Organizer</Link>
          <Link href="/login" className="text-blue-200 hover:text-white text-sm">Log in</Link>
          <Link href="/signup" className="bg-[#BF0A30] text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">
            Sign up
          </Link>
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

        {/* Search bar */}
        <SearchBar />

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={cat === 'All' ? '/' : `/?category=${cat}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                (category === cat) || (cat === 'All' && !category)
                  ? 'bg-white text-[#002868]'
                  : 'bg-[#002868] text-blue-200 border border-blue-400 hover:bg-blue-800'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-[#f0b429] py-4 px-6 flex justify-center gap-12">
        <div className="text-center">
          <p className="text-[#002868] font-bold text-xl">{events.length}+</p>
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
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          {search ? `Results for "${search}"` : 'Upcoming Events'}
        </h3>
        <p className="text-sm text-gray-400 mb-6">{events.length} event{events.length !== 1 ? 's' : ''} found</p>

        {events.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-500">No events found. Try a different search.</p>
            <Link href="/" className="inline-block mt-4 bg-[#002868] text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-900">
              Clear search
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                category={event.category}
                date={event.date}
                time={event.time}
                venue={event.venue}
                price={event.price}
                color={categoryColors[event.category] || "bg-gray-100 text-gray-700"}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-[#002868] text-blue-200 text-center py-6 text-sm">
        © 2026 CampusTickets · USIU-Africa · Nairobi, Kenya
      </footer>

    </main>
  )
}