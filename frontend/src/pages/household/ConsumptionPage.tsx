import { useState, useEffect } from 'react'
import { getConsumptionHistory, getHouseholdDashboard } from '../../api/household'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts'
import { Droplets, Gauge, TrendingUp } from 'lucide-react'

export default function ConsumptionPage() {
  const [today, setToday] = useState<any[]>([])
  const [monthly, setMonthly] = useState<any[]>([])
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getConsumptionHistory('24h'),
      getConsumptionHistory('30d'),
      getHouseholdDashboard(),
    ]).then(([h24, h30, dash]) => {
      setToday(h24.data || [])
      setMonthly(h30.data || [])
      setInfo(dash)
    }).finally(() => setLoading(false))
  }, [])

  const todayTotal = today.reduce((s, d) => s + (d.consumption_litre || 0), 0)
  const monthTotal = monthly.reduce((s, d) => s + (d.consumption_litre || 0), 0)

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-7 h-7 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Live Consumption</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time and historical water usage</p>
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-xl p-4 text-center">
          <Gauge className="w-6 h-6 mx-auto mb-2 opacity-80" />
          <div className="text-2xl font-bold">{info?.flow_rate_lpm?.toFixed(1) || '0.0'}</div>
          <div className="text-sky-200 text-xs">L/min (Live)</div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-4 text-center">
          <Droplets className="w-6 h-6 mx-auto mb-2 text-sky-400" />
          <div className="text-2xl font-bold text-slate-800">{todayTotal.toFixed(0)}</div>
          <div className="text-slate-400 text-xs">Litres Today</div>
        </div>
        <div className="bg-white border border-slate-100 rounded-xl p-4 text-center">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-sky-400" />
          <div className="text-2xl font-bold text-slate-800">{monthTotal.toFixed(0)}</div>
          <div className="text-slate-400 text-xs">Litres This Month</div>
        </div>
      </div>

      {/* Hourly chart */}
      <div className="bg-white border border-slate-100 rounded-xl p-5">
        <h3 className="font-semibold text-slate-700 mb-4">Hourly Usage — Today</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={today} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(11, 16)} axisLine={false} tickLine={false} interval={3} />
            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: any) => [`${v} L`, 'Consumption']} labelFormatter={l => l.slice(11, 16)} />
            <Bar dataKey="consumption_litre" radius={[3, 3, 0, 0]} fill="#0EA5E9" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 30-day chart */}
      <div className="bg-white border border-slate-100 rounded-xl p-5">
        <h3 className="font-semibold text-slate-700 mb-4">Daily Usage — Last 30 Days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthly} margin={{ left: -20 }}>
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false} interval={6} />
            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: any) => [`${v} L`, 'Daily Consumption']} />
            <Area type="monotone" dataKey="consumption_litre" stroke="#0EA5E9" fill="url(#areaFill)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
