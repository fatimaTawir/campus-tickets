import Link from "next/link";
import pool from "./lib/db";
import EventCard from "./components/EventCard";
import SearchBar from "@/app/components/SearchBar";
import { getCurrentUser } from "@/app/lib/auth";
import { Bell } from "lucide-react";

export const dynamic = "force-dynamic";

const categoryColors: { [key: string]: string } = {
  Sports: "bg-blue-100 text-blue-700",
  Cultural: "bg-yellow-100 text-yellow-700",
  Academic: "bg-red-100 text-red-700",
  Workshop: "bg-green-100 text-green-700",
  Music: "bg-purple-100 text-purple-700",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const { search, category } = await searchParams;
  const user = await getCurrentUser();

  let query = "SELECT * FROM events";
  const conditions: string[] = [];
  const values: string[] = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(title ILIKE $${values.length} OR venue ILIKE $${values.length})`
    );
  }

  if (category && category !== "All") {
    values.push(category);
    conditions.push(`category = $${values.length}`);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY created_at DESC";

  let events: any[] = [];

  try {
    const result = await pool.query(query, values);
    events = result.rows;
  } catch (error) {
    console.error("Database connection error:", error);
    events = [];
  }

  const categories = [
    "All",
    "Academic",
    "Sports",
    "Cultural",
    "Workshop",
    "Music",
  ];

  const initials = user ? `${user.firstName?.[0] ?? ''}`.toUpperCase() : "";

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="bg-[#002868] px-8 py-4 flex items-center justify-between border-b border-blue-900 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-[#f0b429] rounded p-1.5 flex items-center justify-center">
            <TicketIcon className="w-5 h-5 text-[#002868]" />
          </div>
          <span className="font-bold text-lg text-white tracking-wide">CETS</span>
          <span className="text-[#f0b429] text-sm font-semibold">· Campus Events</span>
        </div>

        <div className="flex gap-6 items-center">
          <Link href="/" className="text-blue-100 hover:text-white text-sm font-medium transition-colors">
            Events
          </Link>
          <Link href="/about" className="text-blue-100 hover:text-white text-sm font-medium transition-colors">
            About
          </Link>
          <Link href="/help" className="text-blue-100 hover:text-white text-sm font-medium transition-colors">
            Help
          </Link>

          {user ? (
            <>
              {/* Notification Bell */}
              <Link href="/dashboard/notifications" className="relative p-1 text-blue-100 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
              </Link>
              {/* User profile dropdown action */}
              <Link href="/dashboard" className="flex items-center gap-2 bg-[#001f52] px-3.5 py-1.5 rounded-full cursor-pointer hover:bg-[#001840] transition-colors border border-blue-800">
                <div className="w-6 h-6 bg-[#f0b429] rounded-full flex items-center justify-center text-[#002868] text-xs font-bold">
                  {initials}
                </div>
                <span className="text-sm text-white font-medium">{user.firstName}</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-blue-100 hover:text-white text-sm font-medium transition-colors">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-[#f0b429] text-[#002868] px-5 py-2 rounded-xl text-sm font-bold hover:bg-yellow-400 transition-all shadow-md"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Banner Section */}
      <section className="bg-[#002868] py-20 px-8 text-center flex flex-col items-center relative overflow-hidden">
        {/* Subtle decorative glow element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        <p className="text-[#f0b429] text-xs font-bold uppercase tracking-widest mb-4">
          UNITED STATES INTERNATIONAL UNIVERSITY – AFRICA
        </p>

        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight max-w-3xl">
          Your Campus. Your Events.
        </h2>

        <p className="text-blue-200 text-base md:text-lg mb-8 max-w-2xl font-light">
          Buy tickets for USIU-A events — sports, conferences, culture &amp; more.
        </p>

        <div className="w-full max-w-xl mb-6">
          <SearchBar />
        </div>

        {/* Category Pills Navigation */}
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={cat === "All" ? "/" : `/?category=${cat}`}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                (category === cat) || (cat === "All" && !category)
                  ? "bg-[#f0b429] text-[#002868] shadow-md"
                  : "bg-blue-950/40 text-blue-200 border border-blue-800/80 hover:bg-blue-900/60"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Cards Section */}
      <section className="max-w-6xl mx-auto w-full px-8 -mt-8 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-[#002868] mb-1">120+</p>
            <p className="text-xs font-medium text-gray-400">Events this semester</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">
            📅
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-2xl font-black text-[#002868] mb-1">4,800</p>
            <p className="text-xs font-medium text-gray-400">Students registered</p>
          </div>
          <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-2xl">
            🎓
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-[#002868]">Host an Event</p>
            <p className="text-xs text-gray-400 mt-0.5">Are you an organizer?</p>
          </div>
          <Link
            href="/signup?role=organizer"
            className="bg-[#f0b429] hover:bg-yellow-400 text-[#002868] font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow"
          >
            Join
          </Link>
        </div>
      </section>

      {/* Events Listing Grid */}
      <section className="px-8 py-16 max-w-6xl mx-auto w-full flex-1">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {search ? `Results for "${search}"` : "Upcoming Events"}
        </h3>

        <p className="text-sm text-gray-400 mb-8 font-medium">
          {events.length} event{events.length !== 1 ? "s" : ""} found
        </p>

        {events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 font-semibold text-lg mb-2">No events found</p>
            <p className="text-gray-400 text-sm max-w-xs mx-auto mb-6">We couldn&apos;t find any events matching your search criteria.</p>
            <Link
              href="/"
              className="inline-block bg-[#002868] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-900 transition-colors shadow"
            >
              Clear Filters
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
                color={
                  categoryColors[event.category] ||
                  "bg-gray-100 text-gray-700"
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-[#002868] text-blue-200/60 text-center py-8 text-xs border-t border-blue-950 font-medium">
        © 2026 CETS · Campus Events · Nairobi, Kenya
      </footer>
    </main>
  );
}

function TicketIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="10" rx="2" ry="2" />
      <path d="M7 7v10" />
      <path d="M17 7v10" />
      <path d="M2 12h20" />
    </svg>
  );
}