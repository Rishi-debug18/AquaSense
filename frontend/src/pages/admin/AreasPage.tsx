import { useEffect, useState } from 'react'
import { getAreaComparison } from '../../api/household'
import { MapPin, Users, Droplets } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

const COLORS = ['#0EA5E9', '#38BDF8', '#7DD3FC', '#BAE6FD', '#E0F2FE']

export default function AreasPage() {
  const [areas, setAreas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAreaComparison().then(setAreas).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-48"><div className="w-7 h-7 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" /></div>

  const totalConsumption = areas.reduce((s, a) => s + a.month_consumption_litre, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Areas Overview</h1>
        <p className="text-slate-500 text-sm mt-1">5 areas — Vangaon / Kumpare demo region, Maharashtra</p>
      </div>

      {/* Area cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {areas.map((area, i) => (
          <div key={area.area_id} className="bg-white border border-slate-100 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: COLORS[i] + '20' }}>
                <MapPin className="w-5 h-5" style={{ color: COLORS[i] }} />
              </div>
              <div>
                <div className="font-bold text-slate-800">{area.area_name}</div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3" /> {area.population} residents
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Households</div>
                <div className="font-bold text-slate-700">{area.total_households}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Avg/Household</div>
                <div className="font-bold text-slate-700">{area.avg_per_household?.toFixed(0)} L</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1"><Droplets className="w-3.5 h-3.5" /> Month Total</span>
                <span className="font-bold text-slate-700">{(area.month_consumption_litre / 1000).toFixed(1)} kL</span>
              </div>
              <div className="mt-2 bg-slate-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full"
                  style={{ width: `${totalConsumption > 0 ? (area.month_consumption_litre / totalConsumption * 100).toFixed(1) : 0}%`, backgroundColor: COLORS[i] }}
                />
              </div>
              <div className="text-xs text-slate-400 mt-1 text-right">
                {totalConsumption > 0 ? ((area.month_consumption_litre / totalConsumption) * 100).toFixed(1) : 0}% of total
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison chart */}
      <div className="bg-white border border-slate-100 rounded-xl p-5">
        <h3 className="font-semibold text-slate-700 mb-4">Monthly Consumption by Area</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={areas} margin={{ left: -15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="area_name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}kL`} />
            <Tooltip formatter={(v: any) => [`${(v / 1000).toFixed(2)} kL`, 'Monthly Consumption']} />
            <Bar dataKey="month_consumption_litre" radius={[6, 6, 0, 0]}>
              {areas.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
