import { useState, useEffect } from 'react'
import { getMyAlerts, markAlertRead } from '../../api/household'
import { AlertTriangle, Info, CheckCircle, Bell, BellOff } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const SEVERITY_CONFIG: Record<string, { icon: any; bg: string; border: string; text: string }> = {
  critical: { icon: AlertTriangle, bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700' },
  warning:  { icon: AlertTriangle, bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700' },
  info:     { icon: Info,          bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700' },
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyAlerts().then(setAlerts).finally(() => setLoading(false))
  }, [])

  const handleMarkRead = async (id: string) => {
    await markAlertRead(id)
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a))
  }

  const unread = alerts.filter(a => !a.is_read)
  const read = alerts.filter(a => a.is_read)

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-7 h-7 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
    </div>
  )

  const AlertItem = ({ alert }: { alert: any }) => {
    const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info
    const Icon = cfg.icon
    return (
      <div className={`flex gap-3 p-4 rounded-xl border transition ${cfg.bg} ${cfg.border} ${alert.is_read ? 'opacity-60' : ''}`}>
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${cfg.text}`} />
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-sm ${cfg.text}`}>{alert.title}</div>
          <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">{alert.message}</div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-slate-400">
              {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
            </span>
            {!alert.is_read && (
              <button
                onClick={() => handleMarkRead(alert.id)}
                className="text-xs text-sky-600 hover:underline flex items-center gap-1"
              >
                <CheckCircle className="w-3 h-3" /> Mark as read
              </button>
            )}
          </div>
        </div>
        {!alert.is_read && (
          <div className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 flex-shrink-0" />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Alerts</h1>
          <p className="text-slate-500 text-sm mt-1">
            {unread.length > 0 ? `${unread.length} unread alert${unread.length > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <Bell className={`w-6 h-6 ${unread.length > 0 ? 'text-amber-500' : 'text-slate-300'}`} />
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-xl">
          <BellOff className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500">No alerts yet. Your consumption is being monitored.</p>
        </div>
      ) : (
        <>
          {unread.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Unread</h2>
              {unread.map(a => <AlertItem key={a.id} alert={a} />)}
            </div>
          )}
          {read.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Read</h2>
              {read.map(a => <AlertItem key={a.id} alert={a} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
