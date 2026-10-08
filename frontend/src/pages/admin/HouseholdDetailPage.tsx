import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getHouseholdDetail } from '../../api/household'
import { ArrowLeft, Wifi, WifiOff, Droplets, Receipt, AlertTriangle, Home } from 'lucide-react'
import { format } from 'date-fns'

export default function HouseholdDetailPage() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getHouseholdDetail(id).then(setData).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-48"><div className="w-7 h-7 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" /></div>
  if (!data) return <div className="p-6 text-slate-500">Household not found.</div>

  const isOnline = data.device?.status === 'online'

  return (
    <div className="max-w-4xl space-y-6">
      <Link to="/admin/households" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-sky-600 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Households
      </Link>

      {/* Header */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-sky-50 rounded-xl flex items-center justify-center">
              <Home className="w-7 h-7 text-sky-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{data.house_number}</h1>
              <p className="text-slate-500 text-sm">{data.area} • {data.address}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            Device {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <div className="text-xs text-slate-400">Residents</div>
            <div className="font-bold text-slate-800 text-lg">{data.resident_count}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Device Code</div>
            <div className="font-medium text-slate-700 text-sm">{data.device?.device_code || '—'}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Last Seen</div>
            <div className="font-medium text-slate-700 text-sm">
              {data.device?.last_seen ? format(new Date(data.device.last_seen), 'dd MMM HH:mm') : '—'}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Firmware</div>
            <div className="font-medium text-slate-700 text-sm">{data.device?.firmware_version || '—'}</div>
          </div>
        </div>
      </div>

      {/* Consumption stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
          <Droplets className="w-5 h-5 text-sky-500 mb-2" />
          <div className="text-2xl font-bold text-sky-700">{data.consumption?.today_litre?.toLocaleString()} L</div>
          <div className="text-xs text-sky-500">Today</div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-4">
          <div className="text-2xl font-bold text-slate-700">{data.consumption?.month_litre?.toLocaleString()} L</div>
          <div className="text-xs text-slate-400">This Month</div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-4">
          <div className="text-2xl font-bold text-slate-700">{data.consumption?.baseline_daily_litre?.toFixed(0)} L</div>
          <div className="text-xs text-slate-400">Daily Avg (90d)</div>
        </div>
      </div>

      {/* Bills + Alerts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><Receipt className="w-4 h-4 text-sky-400" /> Recent Bills</h3>
          {data.bills?.length === 0 ? <p className="text-slate-400 text-sm">No bills yet.</p> : (
            <div className="space-y-2">
              {data.bills?.map((b: any) => (
                <div key={b.id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0 text-sm">
                  <div>
                    <div className="font-medium text-slate-700">{b.billing_period}</div>
                    <div className="text-xs text-slate-400">{b.bill_number}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold font-mono text-slate-700">₹{b.total_amount?.toFixed(2)}</div>
                    <div className={`text-xs px-1.5 py-0.5 rounded ${b.status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>{b.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" /> Recent Alerts</h3>
          {data.alerts?.length === 0 ? <p className="text-slate-400 text-sm">No alerts.</p> : (
            <div className="space-y-2">
              {data.alerts?.map((a: any) => (
                <div key={a.id} className={`p-3 rounded-lg text-sm border ${a.severity === 'critical' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                  <div className="font-medium">{a.title}</div>
                  <div className="text-xs mt-0.5 opacity-80">{format(new Date(a.created_at), 'dd MMM HH:mm')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
