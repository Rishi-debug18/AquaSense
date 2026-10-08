import { useEffect, useState } from 'react'
import { getAuditLog } from '../../api/household'
import { ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

export default function AuditPage() {
  const [data, setData] = useState<any>({ total: 0, data: [] })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getAuditLog(page).then(setData).finally(() => setLoading(false))
  }, [page])

  const PER_PAGE = 50
  const totalPages = Math.ceil(data.total / PER_PAGE)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-sky-500" /> Audit Log
        </h1>
        <p className="text-slate-500 text-sm mt-1">{data.total} events recorded</p>
      </div>

      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400 tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Target</th>
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12"><div className="w-7 h-7 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto" /></td></tr>
              ) : data.data.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400">No audit records found.</td></tr>
              ) : data.data.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-xs text-slate-400 font-mono whitespace-nowrap">
                    {format(new Date(log.created_at), 'dd MMM HH:mm:ss')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-xs rounded font-mono">{log.action}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {log.target_type && <span className="text-slate-400">{log.target_type}/</span>}
                    {log.target_id?.slice(0, 12)}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-500">
                    {log.user_id?.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 font-mono">{log.ip_address || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
