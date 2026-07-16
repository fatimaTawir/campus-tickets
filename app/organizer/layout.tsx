import { getCurrentUser } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import OrganizerSidebar from './OrganizerSidebar'

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
    <div className="min-h-screen bg-[#f4f7f6] font-sans">
      <OrganizerSidebar initials={initials} firstName={user.firstName} />
      <main className="ml-64 pt-[52px] min-h-screen bg-[#f4f7f6]">
        {children}
      </main>
    </div>
  )
}
