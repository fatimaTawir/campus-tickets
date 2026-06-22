import { getCurrentUser } from '@/app/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function OrganizerProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?redirect=/organizer/profile')

  const initials = `${user.firstName?.[0] ?? ''}`.toUpperCase()

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h2>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
          <div className="w-20 h-20 bg-[#002868] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md">
            {initials}
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{user.firstName}</p>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
            <div className="mt-2 inline-block">
              <span className="text-xs bg-[#f0b429] text-[#002868] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold block mb-2">Full Name</label>
            <p className="text-gray-800 font-medium bg-gray-50 px-5 py-3 rounded-xl border border-gray-100">{user.firstName}</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold block mb-2">Email Address</label>
            <p className="text-gray-800 font-medium bg-gray-50 px-5 py-3 rounded-xl border border-gray-100">{user.email}</p>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold block mb-2">Account Role</label>
            <p className="text-gray-800 font-medium bg-gray-50 px-5 py-3 rounded-xl border border-gray-100 capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
