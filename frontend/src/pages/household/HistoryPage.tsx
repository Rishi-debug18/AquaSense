import { useState, useEffect } from 'react'
import { getConsumptionHistory } from '../../api/household'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const PERIODS = [
  { label: '24h', value: '24h' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '3 Months', value: '3m' },
  { label: '6 Months', value: '6m' },
]

export default function HistoryPage() {
  const [period, setPeriod] = useState('7d')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getConsumptionHistory(period)
      .then(d => setData(d.data || []))
      .finally(() => setLoading(false))
  }, [period])

  const total = data.reduce((s, d) => s + (d.consumption_litre || 0), 0)
  const avg = data.length ? total / data.length : 0
  const max = data.length ? Math.max(...data.map(d => d.consumption_litre)) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Consumption History</h1>
        <p className="text-slate-500 text-sm mt-1">Your water usage over time</p>
      </div>

      {/* Period selector */}
      <div className="flex gap-2 flex-wrap">
        {PERIODS.map(p => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              period === p.value
                ? 'bg-sky-500 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-sky-300'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: `${total.toFixed(0)} L` },
          { label: 'Daily Average', value: `${avg.toFixed(0)} L` },
          { label: 'Peak Day', value: `${max.toFixed(0)} L` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-sky-600 font-mono">{value}</div>
            <div className="text-xs text-slate-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white border border-slate-100 rounded-xl p-5">
        <h3 className="font-semibold text-slate-700 mb-4">
          Consumption ({PERIODS.find(p => p.value === period)?.label})
        </h3>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-400">No data for this period</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={d => period === '24h' ? d.slice(11, 16) : d.slice(5)}
                interval={Math.max(0, Math.floor(data.length / 8))}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v}L`}
              />
              <Tooltip
                formatter={(v: any) => [`${v} L`, 'Consumption']}
                labelFormatter={l => `Date: ${l}`}
              />
              <Area
                type="monotone"
                dataKey="consumption_litre"
                stroke="#0EA5E9"
                fill="url(#areaGrad)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
