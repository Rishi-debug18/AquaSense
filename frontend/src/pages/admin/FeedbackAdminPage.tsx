import { getTickets, updateTicket } from '../../api/household'
import { useState, useEffect } from 'react'
import { Ticket, Clock, CheckCircle, AlertCircle, X } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700', in_progress: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700', closed: 'bg-slate-100 text-slate-500',
}
const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-slate-500', normal: 'text-sky-600', high: 'text-orange-600', urgent: 'text-red-600',
}

export default function FeedbackAdminPage() {
  const [data, setData] = useState<any>({ total: 0, data: [] })
  const [selected, setSelected] = useState<any>(null)
  const [notes, setNotes] = useState('')
  const [resolution, setResolution] = useState('')
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('')

  const fetchTickets = () => getTickets({ status: filter || undefined, page: 1 }).then(setData)
  useEffect(() => { fetchTickets() }, [filter])

  const handleUpdate = async (status: string) => {
    if (!selected) return
    setSaving(true)
    try {
      await updateTicket(selected.id, { status, admin_notes: notes, resolution: status === 'resolved' ? resolution : selected.resolution })
      toast.success(`Ticket ${selected.ticket_number} → ${status}`)
      fetchTickets()
      setSelected(null)
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Support Tickets & Feedback</h1>
        <p className="text-slate-500 text-sm mt-1">{data.total} tickets — manage household support requests</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['', 'open', 'in_progress', 'resolved', 'closed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === s ? 'bg-sky-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-sky-300'}`}>
            {s === '' ? 'All' : s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* List */}
        <div className="space-y-2">
          {data.data.length === 0 ? (
            <div className="text-center py-10 text-slate-400 bg-white border border-slate-100 rounded-xl">
              <Ticket className="w-8 h-8 mx-auto mb-2 text-slate-200" /> No tickets found.
            </div>
          ) : data.data.map((t: any) => (
            <button key={t.id} onClick={() => { setSelected(t); setNotes(t.admin_notes || ''); setResolution(t.resolution || '') }}
              className={`w-full text-left p-4 rounded-xl border transition ${selected?.id === t.id ? 'border-sky-300 bg-sky-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-slate-400">{t.ticket_number}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_COLORS[t.status] || STATUS_COLORS.open}`}>{t.status.replace('_', ' ')}</span>
                <span className={`text-xs font-semibold ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span>
              </div>
              <div className="text-sm font-medium text-slate-700">{t.category}</div>
              <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{t.description}</div>
              <div className="text-xs text-slate-400 mt-1">{format(new Date(t.created_at), 'dd MMM HH:mm')}</div>
            </button>
          ))}
        </div>

        {/* Detail/Edit */}
        {selected && (
          <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold text-slate-800">{selected.ticket_number}</div>
                <div className="text-sm text-slate-500">{selected.category} · {selected.priority} priority</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700">{selected.description}</div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Admin Notes</label>
              <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Add internal notes..." className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
            </div>

            {(selected.status !== 'resolved' && selected.status !== 'closed') && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Resolution (for closing)</label>
                <textarea rows={2} value={resolution} onChange={e => setResolution(e.target.value)}
                  placeholder="Describe the resolution..." className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              {selected.status === 'open' && (
                <button onClick={() => handleUpdate('in_progress')} disabled={saving}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition disabled:opacity-50">
                  Start Working
                </button>
              )}
              {['open', 'in_progress'].includes(selected.status) && (
                <button onClick={() => handleUpdate('resolved')} disabled={saving || !resolution.trim()}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition disabled:opacity-50">
                  Mark Resolved
                </button>
              )}
              {selected.status === 'resolved' && (
                <button onClick={() => handleUpdate('closed')} disabled={saving}
                  className="px-4 py-2 bg-slate-500 text-white rounded-lg text-sm font-medium hover:bg-slate-600 transition disabled:opacity-50">
                  Close Ticket
                </button>
              )}
              <button onClick={() => handleUpdate(selected.status)} disabled={saving}
                className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition disabled:opacity-50">
                Save Notes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
