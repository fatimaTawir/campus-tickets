export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-[#002868] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#BF0A30] text-white text-xs font-bold px-2 py-1 rounded">
            USIU-A
          </div>
          <h1 className="text-white text-lg font-bold">CampusTickets</h1>
        </div>
        <button className="text-blue-200 hover:text-white text-sm">Log out</button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 w-full">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">You are logged in!</h2>
          <p className="text-gray-500">Welcome to your CampusTickets dashboard.</p>
          <p className="text-gray-400 text-sm mt-2">We will build this out fully in the next phase.</p>
        </div>
      </div>
    </main>
  )
}