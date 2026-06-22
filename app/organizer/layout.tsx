import { getCurrentUser } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Home, Calendar, PlusCircle, BarChart2, FileText, Settings, HelpCircle, LogOut, Bell, Rocket } from 'lucide-react'

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) redirect('/login?redirect=/organizer')
  if (user.role !== 'organizer' && user.role !== 'admin') redirect('/dashboard')

  const initials = `${user.firstName?.[0] ?? ''}`.toUpperCase()

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-[#002868] text-white px-6 py-3 flex items-center justify-between z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="bg-[#f0b429] rounded p-1.5 flex items-center justify-center">
            <TicketIcon className="w-5 h-5 text-[#002868]" />
          </div>
          <span className="font-bold text-lg tracking-wide">USIU</span>
          <span className="text-blue-300 text-sm">· Campus</span>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-blue-200 transition-colors">Events</Link>
          <Link href="/about" className="text-sm font-medium hover:text-blue-200 transition-colors">About</Link>
          <Link href="/help" className="text-sm font-medium hover:text-blue-200 transition-colors">Help</Link>
          
          <Link href="/dashboard/notifications" className="relative p-1 hover:text-blue-200 transition-colors">
            <Bell className="w-5 h-5" />
          </Link>
          
          <div className="flex items-center gap-2 bg-[#001f52] px-3 py-1.5 rounded-full cursor-pointer hover:bg-[#001840] transition-colors border border-blue-800">
            <div className="w-6 h-6 bg-[#f0b429] rounded-full flex items-center justify-center text-[#002868] text-xs font-bold">
              {initials}
            </div>
            <span className="text-sm font-medium">{user.firstName}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
          <div className="px-6 py-4">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Menu</p>
            <nav className="flex flex-col gap-1">
              <Link href="/organizer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#002868] text-white text-sm font-medium shadow-sm">
                <Home className="w-4 h-4" /> Dashboard
              </Link>
              <Link href="/organizer/events" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
                <Calendar className="w-4 h-4" /> My events
              </Link>
              <Link href="/organizer/create" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
                <PlusCircle className="w-4 h-4" /> Create event
              </Link>
              <Link href="/organizer/audit" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
                <FileText className="w-4 h-4" /> Audit logs
              </Link>
            </nav>
          </div>

          <div className="px-6 py-2 mt-auto mb-4">
            <nav className="flex flex-col gap-1 mb-4">
              <Link href="/organizer/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
                <Settings className="w-4 h-4" /> Profile settings
              </Link>
              <Link href="/organizer/help" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
                <HelpCircle className="w-4 h-4" /> Help & support
              </Link>
            </nav>

            <Link href="/organizer/upgrade" className="block bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-4 hover:bg-blue-100 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <Rocket className="w-5 h-5 text-[#f0b429]" />
                <p className="text-xs font-bold text-[#002868]">UPGRADE</p>
              </div>
              <p className="text-[11px] text-gray-500 mb-2">Get CETS Pro features</p>
            </Link>

            <Link href="/api/auth/logout" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-sm font-medium transition-colors">
              <LogOut className="w-4 h-4" /> Sign out
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#f4f7f6]">
          {children}
        </main>
      </div>
    </div>
  )
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
  )
}
