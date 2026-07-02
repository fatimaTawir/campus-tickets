"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SearchBar() {
  const router = useRouter()
  const [search, setSearch] = useState("")

  function handleSearch() {
    if (search.trim()) {
      router.push(`/?search=${encodeURIComponent(search.trim())}`)
    } else {
      router.push('/')
    }
  }


  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="flex max-w-lg mx-auto gap-2 mb-2">
      <input
        type="text"
        placeholder="Search events by name or location..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 px-4 py-3 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#f0b429] bg-white border-2 border-white shadow-lg"
      />
      <button
        onClick={handleSearch}
        className="bg-[#002868] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-900 whitespace-nowrap transition-colors"
      >
        Search
      </button>
    </div>
  )
}