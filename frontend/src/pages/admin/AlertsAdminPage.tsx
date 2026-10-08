import { useState, useEffect } from 'react'
import { getAdminAlerts, dismissAlert } from '../../api/household'
import { AlertTriangle, Info, X, Filter } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-50 border-red-200 text-red-700',
  warning:  'bg-amber-50 border-amber-200 text-amber-700',
  info:     'bg-blue-50 border-blue-200 text-blue-700',
}

const TYPE_LABELS: Record<string, string> = {
  HIGH_USAGE: 'High Usage', VERY_HIGH_USAGE: 'Very High Usage',
  POSSIBLE_LEAK: 'Possible Leak', CRITICAL_LEAK: 'Critical Leak',
  DEVICE_OFFLINE: 'Device Offline', SYSTEM_ERROR: 'System Error',
  BILL_GENERATED: 'Bill Generated', GENERAL_INFORMATION: 'Information',
}

export default function AlertsAdminPage() {
  const [data, setData] = useState<any>({ total: 0, data: [] })
  const [filter, setFilter] = useState({ alert_type: '', severity: '' })
  const [loading, setLoading] = useState(true)

  const fetchAlerts = async () => {
    setLoading(true)
    const result = await getAdminAlerts({ ...filter, per_page: 100 })
    setData(result)
    setLoading(false)
  }

  useEffect(() => { fetchAlerts() }, [filter])

  const handleDismiss = async (id: string) => {
    try {
      await dismissAlert(id)
      toast.success('Alert dismissed')
      setData((prev: any) => ({
        ...prev,
        data: prev.data.filter((a: any) => a.id !== id),
        total: prev.total - 1,
      }))
    } catch { toast.error('Failed to dismiss') }
  }

  const criticalCount = data.data.filter((a: any) => a.severity === 'critical').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Alerts</h1>
          <p className="text-slate-500 text-sm mt-1">
            {data.total} active alerts{criticalCount > 0 && ` — ${criticalCount} critical`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filter.severity}
          onChange={e => setFilter(f => ({ ...f, severity: e.target.value }))}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
        <select
          value={filter.alert_type}
          onChange={e => setFilter(f => ({ ...f, alert_type: e.target.value }))}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="">All Types</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* Alerts list */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-7 h-7 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
        </div>
      ) : data.data.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-100 rounded-xl text-slate-400">
          <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-slate-200" />
          No alerts found.
        </div>
      ) : (
        <div className="space-y-2">
          {data.data.map((alert: any) => (
            <div key={alert.id} className={`flex items-start gap-3 p-4 rounded-xl border ${SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.info}`}>
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-semibold text-sm">{alert.title}</span>
                  <span className="px-2 py-0.5 bg-white/60 text-xs rounded-full font-medium">
                    {TYPE_LABELS[alert.alert_type] || alert.alert_type}
                  </span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">{alert.message}</p>
                <div className="text-xs opacity-60 mt-1">
                  {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                  {alert.household_id && ` · HH: ${alert.household_id.slice(0, 8)}...`}
                </div>
              </div>
              <button
                onClick={() => handleDismiss(alert.id)}
                className="flex-shrink-0 p-1 hover:bg-white/40 rounded-lg transition"
                title="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
