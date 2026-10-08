import { useState, useEffect } from 'react'
import { getMyMessages, markMessageRead } from '../../api/household'
import { MessageSquare, Mail, MailOpen } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high:   'bg-orange-100 text-orange-700',
  normal: 'bg-sky-100 text-sky-700',
  low:    'bg-slate-100 text-slate-600',
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    getMyMessages().then(setMessages).finally(() => setLoading(false))
  }, [])

  const handleOpen = async (msg: any) => {
    if (expanded === msg.id) { setExpanded(null); return }
    setExpanded(msg.id)
    if (!msg.is_read) {
      await markMessageRead(msg.id)
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m))
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-7 h-7 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
        <p className="text-slate-500 text-sm mt-1">Notifications from the water authority</p>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-xl">
          <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map(msg => (
            <div key={msg.id} className="bg-white border border-slate-100 rounded-xl overflow-hidden">
              <button
                onClick={() => handleOpen(msg)}
                className="w-full flex items-start gap-3 p-4 hover:bg-slate-50 transition text-left"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.is_read ? 'bg-slate-100' : 'bg-sky-100'}`}>
                  {msg.is_read
                    ? <MailOpen className="w-4 h-4 text-slate-400" />
                    : <Mail className="w-4 h-4 text-sky-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className={`font-semibold text-sm ${msg.is_read ? 'text-slate-600' : 'text-slate-800'}`}>
                      {msg.title}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${PRIORITY_COLORS[msg.priority] || PRIORITY_COLORS.normal}`}>
                      {msg.priority}
                    </span>
                    {!msg.is_read && <span className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0" />}
                  </div>
                  <div className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </div>
                </div>
              </button>
              {expanded === msg.id && (
                <div className="px-4 pb-4 border-t border-slate-50">
                  <p className="text-sm text-slate-700 leading-relaxed mt-3">{msg.body}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
