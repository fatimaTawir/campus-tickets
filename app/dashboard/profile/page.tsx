import { getCurrentUser } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?redirect=/dashboard/profile')
  const initials = `${user.firstName?.[0] ?? ''}`.toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen fixed left-0 top-0 z-10">
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#002868] rounded-lg flex items-center justify-center"><span className="text-[#f0b429] text-xs font-bold">CT</span></div>
            <span className="font-bold text-gray-800">CampusTickets</span>
          </Link>
        </div>
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#002868] rounded-full flex items-center justify-center text-white font-bold text-sm">{initials}</div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{user.firstName}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3 px-2">Menu</p>
          <div className="flex flex-col gap-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm"><span>🏠</span> Dashboard</Link>
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm"><span>🎫</span> Browse events</Link>
            <Link href="/dashboard/tickets" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm"><span>🎟️</span> My tickets</Link>
            <Link href="/dashboard/notifications" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm"><span>🔔</span> Notifications</Link>
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3 px-2 mt-6">Account</p>
          <div className="flex flex-col gap-1">
            <Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#002868] text-white text-sm font-medium"><span>⚙️</span> Profile settings</Link>
            <Link href="/help" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm"><span>❓</span> Help & support</Link>
          </div>
        </nav>
        <div className="px-4 py-4 border-t border-gray-100">
          <Link href="/dashboard/upgrade" className="block bg-[#f0b429]/10 rounded-xl p-3 mb-3 hover:bg-[#f0b429]/20">
            <p className="text-xs font-bold text-[#002868]">⭐ UPGRADE</p>
            <p className="text-xs text-gray-500">Get Pro features</p>
          </Link>
          <Link href="/api/auth/logout" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 text-sm"><span>🚪</span> Sign out</Link>
        </div>
      </aside>

      <main className="ml-64 flex-1">
        <div className="bg-[#002868] px-8 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f0b429] rounded-lg flex items-center justify-center"><span className="text-[#002868] text-xs font-bold">CT</span></div>
            <span className="text-white font-bold text-sm">USIU-A · Campus Tickets</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-blue-200 hover:text-white text-sm">Events</Link>
            <Link href="/about" className="text-blue-200 hover:text-white text-sm">About</Link>
            <Link href="/help" className="text-blue-200 hover:text-white text-sm">Help</Link>
            <span className="text-xl text-blue-200">🔔</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#f0b429] rounded-full flex items-center justify-center text-[#002868] text-xs font-bold">{initials}</div>
              <span className="text-sm font-medium text-white">{user.firstName}</span>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="w-16 h-16 bg-[#002868] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {initials}
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800">{user.firstName}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
                <span className="text-xs bg-[#002868] text-white px-2 py-0.5 rounded-full capitalize">{user.role}</span>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">Full Name</label>
                <p className="text-gray-800 font-medium bg-gray-50 px-4 py-2.5 rounded-lg">{user.firstName}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">Email</label>
                <p className="text-gray-800 font-medium bg-gray-50 px-4 py-2.5 rounded-lg">{user.email}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">Role</label>
                <p className="text-gray-800 font-medium bg-gray-50 px-4 py-2.5 rounded-lg capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}