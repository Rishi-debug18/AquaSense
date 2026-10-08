import { useState, useEffect } from 'react'
import { getAdminOverview, getConsumptionTrend, getAreaComparison, getTopConsumers } from '../../api/household'
import {
  Home, Gauge, Droplets, AlertTriangle, Wifi, WifiOff, Receipt, IndianRupee,
  TrendingUp, Users, BarChart3
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts'

function KPICard({ icon: Icon, label, value, color = 'sky', sub }: {
  icon: any; label: string; value: string | number; color?: string; sub?: string
}) {
  const colors: Record<string, { bg: string; text: string; icon: string }> = {
    sky: { bg: 'bg-sky-50', text: 'text-sky-600', icon: 'text-sky-500' },
    green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: 'text-yellow-500' },
    red: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-600', icon: 'text-slate-500' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-500' },
  }
  const c = colors[color] || colors.sky
  return (
    <div className={`${c.bg} border border-${color === 'slate' ? 'slate-100' : color + '-100'} rounded-xl p-5`}>
      <div className={`w-10 h-10 ${c.bg} rounded-lg flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div className={`text-2xl font-bold ${c.text} mb-0.5`}>{value}</div>
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  )
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<any>(null)
  const [trend, setTrend] = useState<any[]>([])
  const [areaData, setAreaData] = useState<any[]>([])
  const [topConsumers, setTopConsumers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAdminOverview(),
      getConsumptionTrend(30),
      getAreaComparison(),
      getTopConsumers(5),
    ]).then(([ov, tr, ac, tc]) => {
      setOverview(ov)
      setTrend(tr)
      setAreaData(ac)
      setTopConsumers(tc)
    }).finally(() => setLoading(false))

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      getAdminOverview().then(setOverview)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
    </div>
  )

  const kpis = overview ? [
    { icon: Home, label: 'Total Households', value: overview.total_households.toLocaleString(), color: 'sky' },
    { icon: Gauge, label: 'Active Meters', value: overview.active_meters.toLocaleString(), color: 'green' },
    { icon: Droplets, label: "Today's Consumption", value: `${(overview.today_consumption_litre / 1000).toFixed(1)} kL`, color: 'sky', sub: 'System-wide' },
    { icon: AlertTriangle, label: 'High Usage Alerts', value: overview.high_usage_alerts, color: 'yellow' },
    { icon: WifiOff, label: 'Offline Devices', value: overview.offline_devices, color: 'red' },
    { icon: AlertTriangle, label: 'Leakage Alerts', value: overview.leakage_alerts, color: 'red' },
    { icon: Receipt, label: 'Bills Generated', value: overview.bills_generated.toLocaleString(), color: 'slate' },
    { icon: IndianRupee, label: 'Pending Billing', value: `₹${(overview.total_billing_amount / 1000).toFixed(1)}k`, color: 'emerald' },
  ] : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">System-wide water management overview — AquaSense Demo</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(kpi => <KPICard key={kpi.label} {...kpi} />)}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Consumption trend */}
        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <h3 className="font-semibold text-slate-700 mb-1">System Consumption (30 days)</h3>
          <p className="text-xs text-slate-400 mb-4">Total daily litres across all 550 households</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false} interval={6} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [`${(v/1000).toFixed(1)} kL`, 'Consumption']} labelFormatter={l => `Date: ${l}`} />
              <Area type="monotone" dataKey="consumption_litre" stroke="#0EA5E9" fill="url(#grad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Area comparison */}
        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <h3 className="font-semibold text-slate-700 mb-1">Area Comparison (This Month)</h3>
          <p className="text-xs text-slate-400 mb-4">Monthly consumption per area</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={areaData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="area_name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => [`${(v/1000).toFixed(1)} kL`, 'Monthly Consumption']} />
              <Bar dataKey="month_consumption_litre" radius={[4,4,0,0]}>
                {areaData.map((_, i) => (
                  <Cell key={i} fill={['#0EA5E9','#38BDF8','#7DD3FC','#BAE6FD','#E0F2FE'][i % 5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top consumers */}
      <div className="bg-white border border-slate-100 rounded-xl p-5">
        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-red-500" /> Top 5 Consuming Households (Last 30 Days)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-400 tracking-wide">
              <tr>
                <th className="text-left pb-3">#</th>
                <th className="text-left pb-3">Household</th>
                <th className="text-left pb-3">Area</th>
                <th className="text-left pb-3">Residents</th>
                <th className="text-right pb-3">30-Day Total</th>
                <th className="text-right pb-3">Daily Avg</th>
              </tr>
            </thead>
            <tbody>
              {topConsumers.map((hh, i) => (
                <tr key={hh.household_id} className="border-t border-slate-50">
                  <td className="py-3 text-slate-400 font-bold">{i + 1}</td>
                  <td className="py-3 font-semibold text-sky-600">{hh.house_number}</td>
                  <td className="py-3 text-slate-600">{hh.area}</td>
                  <td className="py-3 text-slate-600">{hh.resident_count}</td>
                  <td className="py-3 text-right font-medium text-slate-700">{hh.total_litre_30d.toLocaleString()} L</td>
                  <td className="py-3 text-right text-slate-500">{hh.avg_daily_litre.toFixed(1)} L/day</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
