'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Calendar, PlusCircle, TrendingUp, FileText,
  Settings, HelpCircle, LogOut, Rocket, Bell
} from 'lucide-react'

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

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  exact?: boolean
}

const mainNav: NavItem[] = [
  { href: '/organizer', label: 'Dashboard', icon: <Home className="w-4 h-4" />, exact: true },
  { href: '/organizer/events', label: 'My events', icon: <Calendar className="w-4 h-4" /> },
  { href: '/organizer/create', label: 'Create event', icon: <PlusCircle className="w-4 h-4" />, exact: true },
  { href: '/analytics', label: 'Reports', icon: <TrendingUp className="w-4 h-4" />, exact: true },
  { href: '/organizer/audit', label: 'Audit logs', icon: <FileText className="w-4 h-4" />, exact: true },
]

const bottomNav: NavItem[] = [
  { href: '/organizer/profile', label: 'Profile settings', icon: <Settings className="w-4 h-4" />, exact: true },
  { href: '/organizer/help', label: 'Help & support', icon: <HelpCircle className="w-4 h-4" />, exact: true },
]

interface OrganizerSidebarProps {
  initials: string
  firstName: string
}

export default function OrganizerSidebar({ initials, firstName }: OrganizerSidebarProps) {
  const pathname = usePathname()

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <>
      {/* Top Navbar — fixed at top */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-[#002868] text-white px-6 py-3 flex items-center justify-between h-[52px]">
        <div className="flex items-center gap-3">
          <div className="bg-[#f0b429] rounded p-1.5 flex items-center justify-center">
            <TicketIcon className="w-5 h-5 text-[#002868]" />
          </div>
          <span className="font-bold text-lg tracking-wide">CETS</span>
          <span className="text-[#f0b429] text-sm font-semibold">· Campus Events</span>
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
            <span className="text-sm font-medium">{firstName}</span>
          </div>
        </div>
      </header>

      {/* Sidebar — fixed on left, below the header */}
      <aside className="fixed top-[52px] left-0 bottom-0 w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto z-20">
        <div className="px-6 py-4">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Menu</p>
          <nav className="flex flex-col gap-1">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(item)
                    ? 'bg-[#002868] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="px-6 py-2 mt-auto mb-4">
          <nav className="flex flex-col gap-1 mb-4">
            {bottomNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(item)
                    ? 'bg-[#002868] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/organizer/upgrade"
            className="block bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-4 hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <Rocket className="w-5 h-5 text-[#f0b429]" />
              <p className="text-xs font-bold text-[#002868]">UPGRADE</p>
            </div>
            <p className="text-[11px] text-gray-500">Get CETS Pro features</p>
          </Link>

          <Link
            href="/api/auth/logout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </Link>
        </div>
      </aside>
    </>
  )
}
