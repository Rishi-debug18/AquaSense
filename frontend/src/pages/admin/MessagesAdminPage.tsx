import { useState, useEffect } from 'react'
import { sendMessage, getSentMessages } from '../../api/household'
import { Send, MessageSquare, Globe, MapPin, Home, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

const TARGET_OPTIONS = [
  { value: 'ALL', label: 'All Households', icon: Globe, desc: 'Broadcast to all 550 households' },
  { value: 'AREA', label: 'Specific Area', icon: MapPin, desc: 'Target one area (Kumpare, Vangaon, etc.)' },
]

const PRIORITY_OPTIONS = ['low', 'normal', 'high', 'urgent']
const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600', normal: 'bg-sky-100 text-sky-700',
  high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700',
}

const DEMO_TEMPLATES = [
  { title: 'Supply Interruption Notice', body: 'Water supply will be interrupted tomorrow from 10:00 AM to 3:00 PM due to scheduled maintenance. Please store sufficient water.' },
  { title: 'Water Conservation Appeal', body: 'Dear residents, please use water judiciously. We are facing seasonal demand increase. Report any visible leakage immediately.' },
  { title: 'New Tariff Notification', body: 'A revised water tariff structure will be implemented from next billing cycle. Details available at the municipal office.' },
]

export default function MessagesAdminPage() {
  const [form, setForm] = useState({
    title: '', body: '', target_type: 'ALL', target_area_id: '', priority: 'normal',
  })
  const [sent, setSent] = useState<any[]>([])
  const [sending, setSending] = useState(false)
  const [view, setView] = useState<'compose' | 'sent'>('compose')

  useEffect(() => {
    getSentMessages().then(setSent)
  }, [])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('Title and message body are required')
      return
    }
    setSending(true)
    try {
      const result = await sendMessage({
        title: form.title,
        body: form.body,
        target_type: form.target_type,
        target_area_id: form.target_type === 'AREA' ? form.target_area_id : undefined,
        priority: form.priority,
      })
      toast.success(`✅ Message sent to ${result.recipient_count} households`)
      setForm({ title: '', body: '', target_type: 'ALL', target_area_id: '', priority: 'normal' })
      getSentMessages().then(setSent)
      setView('sent')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Messaging Center</h1>
          <p className="text-slate-500 text-sm mt-1">Broadcast messages to households and areas</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('compose')} className={`px-4 py-2 rounded-lg text-sm font-medium ${view === 'compose' ? 'bg-sky-500 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>Compose</button>
          <button onClick={() => setView('sent')} className={`px-4 py-2 rounded-lg text-sm font-medium ${view === 'sent' ? 'bg-sky-500 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>Sent ({sent.length})</button>
        </div>
      </div>

      {view === 'compose' ? (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Compose form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSend} className="bg-white border border-slate-100 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2"><Send className="w-4 h-4 text-sky-500" /> Compose Message</h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                  placeholder="Message title..." required
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message Body</label>
                <textarea value={form.body} onChange={e => setForm(f => ({...f, body: e.target.value}))}
                  placeholder="Type your message..." required rows={5}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target</label>
                  <select value={form.target_type} onChange={e => setForm(f => ({...f, target_type: e.target.value}))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                    <option value="ALL">All Households</option>
                    <option value="AREA">Specific Area</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({...f, priority: e.target.value}))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" disabled={sending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 transition disabled:opacity-50">
                <Send className="w-4 h-4" />
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Templates */}
          <div>
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">Quick Templates</h3>
            <div className="space-y-2">
              {DEMO_TEMPLATES.map((t, i) => (
                <button key={i} onClick={() => setForm(f => ({...f, title: t.title, body: t.body}))}
                  className="w-full text-left p-3 bg-white border border-slate-100 rounded-xl hover:border-sky-200 transition">
                  <div className="font-medium text-sm text-slate-700">{t.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">{t.body}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Sent messages */
        <div className="space-y-3">
          {sent.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-100 rounded-xl text-slate-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-200" />
              No messages sent yet.
            </div>
          ) : sent.map(msg => (
            <div key={msg.id} className="bg-white border border-slate-100 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800">{msg.title}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${PRIORITY_COLORS[msg.priority] || PRIORITY_COLORS.normal}`}>{msg.priority}</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-500">{msg.target_type}</span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{msg.body}</p>
                </div>
                <div className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                  {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
