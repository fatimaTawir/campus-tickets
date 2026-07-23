import { getCurrentUser } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import { Mail, MessageCircle, Phone, FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function OrganizerHelpPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?redirect=/organizer/help')

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Help & Support</h2>
        <p className="text-gray-500">Need assistance? We're here to help you make your events successful.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex gap-4 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-[#002868] transition-colors">
            <FileText className="w-6 h-6 text-[#002868] group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">Documentation</h3>
            <p className="text-sm text-gray-500">Read our guides on creating and managing events.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex gap-4 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-600 transition-colors">
            <MessageCircle className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">Live Chat</h3>
            <p className="text-sm text-gray-500">Chat with our organizer support team (9 AM - 5 PM).</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex gap-4 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition-colors">
            <Mail className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">Email Support</h3>
            <p className="text-sm text-gray-500">Send us an email at organizers@campustickets.co.ke</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex gap-4 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-500 transition-colors">
            <Phone className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">Call Us</h3>
            <p className="text-sm text-gray-500">Urgent issues? Call +254 700 000 000</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <h3 className="font-bold text-lg text-gray-800 mb-6">Frequently Asked Questions</h3>
        <div className="flex flex-col gap-4">
          <div className="border-b border-gray-100 pb-4">
            <h4 className="font-semibold text-gray-800 mb-2">How do I scan tickets at the venue?</h4>
            <p className="text-sm text-gray-600">You can download our Organizer app on iOS or Android and log in with this account. It includes a built-in QR scanner that syncs in real-time.</p>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <h4 className="font-semibold text-gray-800 mb-2">When do I receive payouts for my ticket sales?</h4>
            <p className="text-sm text-gray-600">Payouts are processed automatically 24 hours after your event concludes successfully. Funds will be sent to your registered bank account or mobile money number.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Can I cancel or reschedule an event?</h4>
            <p className="text-sm text-gray-600">Yes. If you cancel, all buyers will be automatically refunded. If you reschedule, buyers will be notified and given the option to request a refund.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
