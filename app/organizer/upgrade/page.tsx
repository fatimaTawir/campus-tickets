import { getCurrentUser } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import { Star } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function OrganizerUpgradePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?redirect=/organizer/upgrade')

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upgrade to Pro</h2>
        <p className="text-gray-500">Get access to premium organizer features to boost your event sales.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Free Tier */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Basic</p>
          <p className="text-4xl font-bold text-gray-800 mb-6">Free</p>
          <ul className="flex flex-col gap-4 mb-8 flex-1">
            {['Create unlimited events', 'Basic analytics dashboard', 'Standard ticket sales', 'Email support'].map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                <span className="text-[#002868] font-bold">✓</span> {f}
              </li>
            ))}
          </ul>
          <div className="bg-gray-50 text-gray-500 text-center py-3.5 rounded-xl text-sm font-bold w-full border border-gray-200">
            Current Plan
          </div>
        </div>

        {/* Pro Tier */}
        <div className="bg-[#002868] rounded-3xl p-8 shadow-lg flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-bl-full opacity-20 -z-0"></div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-[#f0b429] uppercase tracking-widest mb-2 flex items-center gap-2">
              Pro <Star className="w-4 h-4 fill-current" />
            </p>
            <p className="text-4xl font-bold text-white mb-6">
              KES 1,500<span className="text-sm font-medium text-blue-300"> / mo</span>
            </p>
            <ul className="flex flex-col gap-4 mb-8 flex-1">
              {[
                'Everything in Basic',
                'Advanced sales analytics & reports',
                'Priority 24/7 support',
                'Custom ticket branding',
                'Export audit logs to CSV',
                'Featured placement on homepage'
              ].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-blue-100 font-medium">
                  <span className="text-[#f0b429] font-bold">✓</span> {f}
                </li>
              ))}
            </ul>
            <button className="w-full bg-[#f0b429] text-[#002868] font-bold py-3.5 rounded-xl text-sm hover:bg-yellow-400 shadow-md transition-colors">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
