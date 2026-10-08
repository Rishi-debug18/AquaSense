import { useState, useEffect } from 'react'
import { getBills, generateBills, getTariffs } from '../../api/household'
import { Receipt, Play, CheckCircle, AlertCircle, FileText, Clock } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  paid:      { label: 'Paid',      color: 'bg-green-100 text-green-700' },
  generated: { label: 'Generated', color: 'bg-blue-100 text-blue-700'  },
  sent:      { label: 'Sent',      color: 'bg-cyan-100 text-cyan-700'   },
  overdue:   { label: 'Overdue',   color: 'bg-red-100 text-red-700'     },
  draft:     { label: 'Draft',     color: 'bg-slate-100 text-slate-600' },
  cancelled: { label: 'Cancelled', color: 'bg-slate-100 text-slate-400' },
}

export default function BillingPage() {
  const [bills, setBills] = useState<any>({ total: 0, data: [] })
  const [tariffs, setTariffs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7))
  const [view, setView] = useState<'bills' | 'tariffs'>('bills')

  useEffect(() => {
    Promise.all([
      getBills({ period, per_page: 100 }),
      getTariffs(),
    ]).then(([b, t]) => {
      setBills(b)
      setTariffs(t)
    }).finally(() => setLoading(false))
  }, [period])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const result = await generateBills(period)
      toast.success(`✅ Generated ${result.generated_count} bills for ${period}`)
      const b = await getBills({ period, per_page: 100 })
      setBills(b)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to generate bills')
    } finally {
      setGenerating(false)
    }
  }

  const totalAmount = bills.data.reduce((s: number, b: any) => s + b.total_amount, 0)
  const paidCount = bills.data.filter((b: any) => b.status === 'paid').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Billing Management</h1>
          <p className="text-slate-500 text-sm mt-1">Generate and manage water bills</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('bills')} className={`px-4 py-2 rounded-lg text-sm font-medium ${view === 'bills' ? 'bg-sky-500 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>Bills</button>
          <button onClick={() => setView('tariffs')} className={`px-4 py-2 rounded-lg text-sm font-medium ${view === 'tariffs' ? 'bg-sky-500 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>Tariffs</button>
        </div>
      </div>

      {view === 'bills' ? (
        <>
          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600 font-medium">Period:</label>
              <input
                type="month"
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-5 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              {generating ? 'Generating...' : `Generate Bills for ${period}`}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-slate-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-slate-800">{bills.total}</div>
              <div className="text-xs text-slate-400 mt-1">Total Bills</div>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-sky-600 font-mono">₹{(totalAmount / 1000).toFixed(1)}k</div>
              <div className="text-xs text-slate-400 mt-1">Total Billed</div>
            </div>
            <div className="bg-white border border-slate-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{paidCount}</div>
              <div className="text-xs text-slate-400 mt-1">Paid</div>
            </div>
          </div>

          {/* Bills table */}
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-400 tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-3">Bill No.</th>
                    <th className="text-left px-4 py-3">Period</th>
                    <th className="text-right px-4 py-3">Consumption (m³)</th>
                    <th className="text-right px-4 py-3">Amount (₹)</th>
                    <th className="text-center px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-12"><div className="w-7 h-7 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto" /></td></tr>
                  ) : bills.data.slice(0, 50).map((b: any) => {
                    const s = STATUS_CONFIG[b.status] || STATUS_CONFIG.draft
                    return (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{b.bill_number}</td>
                        <td className="px-4 py-3 text-slate-700">{b.billing_period}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-700">{b.total_consumption_m3?.toFixed(3)}</td>
                        <td className="px-4 py-3 text-right font-bold font-mono text-slate-800">₹{b.total_amount?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${s.color}`}>{s.label}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Tariffs view */
        <div className="space-y-4">
          {tariffs.map(t => (
            <div key={t.id} className={`bg-white border rounded-xl p-5 ${t.is_active ? 'border-sky-200 ring-1 ring-sky-200' : 'border-slate-100'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800">{t.name}</h3>
                    {t.is_active && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">ACTIVE</span>}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{t.description}</p>
                  {t.notes && <p className="text-xs text-amber-600 mt-1">⚠️ {t.notes}</p>}
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Base Charge</div>
                  <div className="font-bold text-slate-700 font-mono">₹{t.base_charge}/month</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-slate-400 uppercase tracking-wide">
                    <tr>
                      <th className="text-left pb-2">Usage Range</th>
                      <th className="text-right pb-2">Rate (₹/m³)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {t.slabs?.map((s: any, i: number) => (
                      <tr key={i} className="border-t border-slate-50">
                        <td className="py-1.5 text-slate-600">{s.min_units}–{s.max_units ?? '∞'} m³</td>
                        <td className="py-1.5 text-right font-mono font-medium text-slate-700">₹{s.rate_per_unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
