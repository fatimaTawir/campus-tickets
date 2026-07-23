import { getCurrentUser } from '@/app/lib/auth'
import { redirect } from 'next/navigation'
import { FileText, Download } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function OrganizerAuditLogsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?redirect=/organizer/audit')

  // Mock data for audit logs since we don't have a table yet
  const logs = [
    { id: 1, action: 'User Login', user: user.firstName, date: new Date().toISOString(), status: 'Success' },
    { id: 2, action: 'Event Created', user: user.firstName, date: new Date(Date.now() - 86400000).toISOString(), status: 'Success' },
    { id: 3, action: 'Profile Updated', user: user.firstName, date: new Date(Date.now() - 172800000).toISOString(), status: 'Success' },
    { id: 4, action: 'Ticket Scan', user: 'Scanner Terminal 1', date: new Date(Date.now() - 259200000).toISOString(), status: 'Success' },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Audit Logs</h2>
          <p className="text-sm text-gray-500">Track and monitor all activities across your events.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-4 px-6 font-semibold text-gray-600 uppercase text-xs tracking-wider">Action / Event</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 uppercase text-xs tracking-wider">User</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600 uppercase text-xs tracking-wider">Date & Time</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-600 uppercase text-xs tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const dateObj = new Date(log.date)
                const formattedDate = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                
                return (
                  <tr key={log.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-800 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      {log.action}
                    </td>
                    <td className="py-4 px-6 text-gray-600">{log.user}</td>
                    <td className="py-4 px-6 text-gray-500 text-xs">{formattedDate}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
