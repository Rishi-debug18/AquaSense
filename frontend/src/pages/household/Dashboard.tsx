import { useState, useEffect, useRef } from 'react'
import { getHouseholdDashboard } from '../../api/household'
import {
  Droplets, TrendingUp, Receipt, Activity, Wifi, WifiOff,
  Clock, AlertTriangle, Home, Users, MapPin, Gauge
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { format } from 'date-fns'

interface DashboardData {
  house_number: string; area: string; resident_count: number
  today_consumption_litre: number; month_consumption_litre: number
  flow_rate_lpm: number; device_status: string; device_code: string
  last_updated: string; usage_status: string
  baseline_litres_per_day: number; percentage_change: number
  estimated_bill: number | null; billing_period: string; unread_alerts: number
}

const STATUS_COLORS: Record<string, string> = {
  NORMAL: 'bg-green-100 text-green-800 border-green-200',
  HIGH: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  VERY_HIGH: 'bg-red-100 text-red-800 border-red-200',
  ANOMALY: 'bg-red-100 text-red-900 border-red-300',
}

function StatCard({ icon: Icon, label, value, sub, color = 'sky' }: {
  icon: any; label: string; value: string; sub?: string; color?: string
}) {
  const colorMap: Record<string, string> = {
    sky: 'bg-sky-50 border-sky-100',
    green: 'bg-green-50 border-green-100',
    amber: 'bg-amber-50 border-amber-100',
    red: 'bg-red-50 border-red-100',
  }
  return (
    <div className={`rounded-xl border p-5 ${colorMap[color] || colorMap.sky}`}>
      <div className="flex items-start justify-between mb-3">
        <Icon className={`w-5 h-5 text-${color}-500`} />
      </div>
      <div className="text-2xl font-bold text-slate-800 mb-0.5">{value}</div>
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  )
}

export default function HouseholdDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [secondsAgo, setSecondsAgo] = useState<number>(0)
  const ws = useRef<WebSocket | null>(null)

  const fetchDashboard = async () => {
    try {
      const d = await getHouseholdDashboard()
      setData(d)
      setSecondsAgo(0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()

    // WebSocket connection for real-time updates
    const token = localStorage.getItem('aquasense_token')
    const user = JSON.parse(localStorage.getItem('aquasense_user') || '{}')

    if (token && user.id) {
      const wsUrl = `ws://${window.location.hostname}:8000/ws/household_${user.id}?token=${token}`
      try {
        ws.current = new WebSocket(wsUrl)
        ws.current.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data)
            if (msg.event === 'reading_update') {
              setData(prev => prev ? {
                ...prev,
                flow_rate_lpm: msg.flow_rate_lpm,
                today_consumption_litre: msg.today_total_litre,
                usage_status: msg.usage_status,
                last_updated: msg.timestamp,
              } : prev)
              setSecondsAgo(0)
            } else if (msg.event === 'new_message') {
              // Toast notification for new message (imported in App)
            }
          } catch {}
        }
        ws.current.onerror = () => console.log('[WS] Error, falling back to polling')
      } catch {}
    }

    // Fallback polling every 15 seconds
    const pollInterval = setInterval(fetchDashboard, 15000)

    // Seconds counter
    const secInterval = setInterval(() => setSecondsAgo(s => s + 1), 1000)

    return () => {
      clearInterval(pollInterval)
      clearInterval(secInterval)
      ws.current?.close()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
          <span className="text-slate-500 text-sm">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (!data) return <div className="p-6 text-slate-500">Failed to load dashboard. Please refresh.</div>

  const isOnline = data.device_status === 'ONLINE'

  // Mock weekly data for chart (last 7 days)
  const weeklyData = Array.from({ length: 7 }, (_, i) => ({
    day: format(new Date(Date.now() - (6 - i) * 86400000), 'dd MMM'),
    litres: Math.round(data.month_consumption_litre / 30 * (0.7 + Math.random() * 0.6)),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Household Dashboard</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{data.area}</span>
            <span className="flex items-center gap-1"><Home className="w-3.5 h-3.5" />{data.house_number}</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{data.resident_count} residents</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${STATUS_COLORS[data.usage_status] || STATUS_COLORS.NORMAL}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${data.usage_status === 'NORMAL' ? 'bg-green-500' : 'bg-red-500'}`} />
            Usage: {data.usage_status}
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            Device {data.device_status}
          </div>
        </div>
      </div>

      {/* Real-time stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-5 h-5 opacity-80" />
            <span className="text-sm font-medium opacity-80">Current Flow</span>
          </div>
          <div className="text-4xl font-bold mb-1">
            {data.flow_rate_lpm.toFixed(1)}
          </div>
          <div className="text-sky-100 text-sm">Litres / minute</div>
          <div className="mt-3 text-xs text-sky-200 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {secondsAgo < 60 ? `${secondsAgo}s ago` : `${Math.floor(secondsAgo / 60)}m ago`}
          </div>
        </div>

        <StatCard icon={Droplets} label="Today's Usage" value={`${data.today_consumption_litre.toLocaleString()} L`}
          sub={format(new Date(), 'dd MMM yyyy')} color="sky" />
        <StatCard icon={TrendingUp} label="This Month" value={`${data.month_consumption_litre.toLocaleString()} L`}
          sub={data.billing_period} color="sky" />
        <StatCard
          icon={Receipt}
          label="Estimated Bill"
          value={data.estimated_bill !== null ? `₹${data.estimated_bill.toFixed(2)}` : 'Not yet generated'}
          sub={data.billing_period}
          color="amber"
        />
      </div>

      {/* Consumption Analysis */}
      {data.baseline_litres_per_day > 0 && (
        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-500" /> Usage Analysis
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-slate-400 mb-1">30-Day Baseline</div>
              <div className="text-xl font-bold text-slate-700">{data.baseline_litres_per_day.toFixed(0)} L/day</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Today</div>
              <div className="text-xl font-bold text-slate-700">{data.today_consumption_litre.toFixed(0)} L</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Change</div>
              <div className={`text-xl font-bold ${data.percentage_change > 50 ? 'text-red-600' : data.percentage_change > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                {data.percentage_change > 0 ? '+' : ''}{data.percentage_change.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly chart */}
        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <h3 className="font-semibold text-slate-700 mb-4">Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => [`${v} L`, 'Consumption']} />
              <Bar dataKey="litres" radius={[4, 4, 0, 0]}>
                {weeklyData.map((_, i) => (
                  <Cell key={i} fill={i === 6 ? '#0EA5E9' : '#BAE6FD'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Device info */}
        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <h3 className="font-semibold text-slate-700 mb-4">Meter Information</h3>
          <div className="space-y-3">
            {[
              { label: 'House Number', value: data.house_number },
              { label: 'Area', value: data.area },
              { label: 'Device Code', value: data.device_code || 'Not assigned' },
              { label: 'Status', value: data.device_status },
              { label: 'Last Reading', value: data.last_updated ? format(new Date(data.last_updated), 'dd MMM HH:mm:ss') : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-sm font-medium text-slate-700">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts banner */}
      {data.unread_alerts > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            You have <strong>{data.unread_alerts}</strong> unread alert{data.unread_alerts > 1 ? 's' : ''}.
            <a href="/household/alerts" className="ml-2 underline font-medium">View Alerts →</a>
          </div>
        </div>
      )}
    </div>
  )
}
