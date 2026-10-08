import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getBillDetail } from '../../api/household'
import { FileText, Printer, ArrowLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  paid: { label: 'PAID', color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle },
  generated: { label: 'GENERATED', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: FileText },
  sent: { label: 'SENT', color: 'text-cyan-700 bg-cyan-50 border-cyan-200', icon: FileText },
  overdue: { label: 'OVERDUE', color: 'text-red-700 bg-red-50 border-red-200', icon: AlertCircle },
  draft: { label: 'DRAFT', color: 'text-slate-600 bg-slate-50 border-slate-200', icon: Clock },
  cancelled: { label: 'CANCELLED', color: 'text-slate-500 bg-slate-50 border-slate-100', icon: AlertCircle },
}

export default function BillDetailPage() {
  const { id } = useParams()
  const [bill, setBill] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showCalc, setShowCalc] = useState(true)

  useEffect(() => {
    if (!id) return
    getBillDetail(id).then(setBill).catch(console.error).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
    </div>
  )

  if (!bill) return <div className="p-6 text-slate-500">Bill not found.</div>

  const status = STATUS_CONFIG[bill.status] || STATUS_CONFIG.draft
  const StatusIcon = status.icon

  const handlePrint = () => window.print()

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Back */}
      <Link to="/household/bills" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-sky-600 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Bills
      </Link>

      {/* Invoice Card */}
      <div id="bill-print" className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-[#0C1F3F] text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="AquaSense" className="h-10 w-10 object-contain" />
              <div>
                <div className="font-bold text-xl">AquaSense</div>
                <div className="text-sky-300 text-xs">Smart Water Management System</div>
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 ${status.color}`}>
              <StatusIcon className="w-3 h-3" /> {status.label}
            </div>
          </div>
          <div className="text-slate-300 text-sm">WATER BILL / TAX INVOICE</div>
          <div className="text-2xl font-bold mt-1">{bill.bill_number}</div>
        </div>

        <div className="p-6 space-y-6">
          {/* Household info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Household</div>
              <div className="font-semibold text-slate-800">{bill.house_number}</div>
              <div className="text-sm text-slate-600">{bill.area}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Billing Period</div>
              <div className="font-semibold text-slate-800">{bill.billing_period}</div>
              {bill.billing_period_start && (
                <div className="text-sm text-slate-600">
                  {format(new Date(bill.billing_period_start), 'dd MMM')} — {format(new Date(bill.billing_period_end), 'dd MMM yyyy')}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Generated</div>
              <div className="text-sm text-slate-700">
                {bill.generated_at ? format(new Date(bill.generated_at), 'dd MMM yyyy HH:mm') : '—'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Due Date</div>
              <div className="text-sm text-slate-700">
                {bill.due_date ? format(new Date(bill.due_date), 'dd MMM yyyy') : '—'}
              </div>
            </div>
          </div>

          {/* Consumption readings */}
          <div>
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center justify-between">
              Meter Readings
              <button
                onClick={() => setShowCalc(!showCalc)}
                className="text-xs text-sky-500 hover:underline font-normal"
              >
                {showCalc ? 'Hide Calculation' : 'View Calculation ↓'}
              </button>
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-400 mb-1">Opening Reading</div>
                <div className="font-bold text-slate-700">{bill.opening_reading_litre.toFixed(1)} L</div>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-400 mb-1">Closing Reading</div>
                <div className="font-bold text-slate-700">{bill.closing_reading_litre.toFixed(1)} L</div>
              </div>
              <div className="text-center p-3 bg-sky-50 rounded-lg border border-sky-100">
                <div className="text-xs text-sky-600 mb-1">Total Consumption</div>
                <div className="font-bold text-sky-700">{bill.total_consumption_litre.toFixed(1)} L</div>
                <div className="text-xs text-sky-500">{bill.total_consumption_m3.toFixed(3)} m³</div>
              </div>
            </div>
          </div>

          {/* Tariff calculation */}
          {showCalc && bill.slab_breakdown && bill.slab_breakdown.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-700 mb-3">
                Tariff Calculation
                <span className="ml-2 text-xs font-normal text-slate-400">(Slab-based progressive tariff)</span>
              </h3>
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left p-3">Usage Range</th>
                      <th className="text-right p-3">Units (m³)</th>
                      <th className="text-right p-3">Rate (₹/m³)</th>
                      <th className="text-right p-3">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.slab_breakdown.map((slab: any, i: number) => (
                      <tr key={i} className="border-t border-slate-50">
                        <td className="p-3 text-slate-600">{slab.range}</td>
                        <td className="p-3 text-right text-slate-700 font-mono">{slab.units_m3.toFixed(4)}</td>
                        <td className="p-3 text-right text-slate-700 font-mono">₹{slab.rate_per_unit.toFixed(2)}</td>
                        <td className="p-3 text-right font-medium text-slate-800 font-mono">₹{slab.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bill summary */}
          <div className="border-t border-slate-100 pt-4">
            <div className="space-y-2">
              {[
                { label: 'Base Charge', value: bill.base_charge },
                { label: 'Water Charge', value: bill.water_charge },
                { label: 'Other Charges', value: bill.other_charge },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm text-slate-600">
                  <span>{label}</span>
                  <span className="font-mono">₹{(value || 0).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <span className="text-lg font-bold text-slate-800">Total Amount</span>
                <span className="text-2xl font-extrabold text-sky-600 font-mono">₹{bill.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition"
            >
              <Printer className="w-4 h-4" /> Download / Print Bill
            </button>
          </div>

          <div className="text-center text-xs text-slate-400">
            ⚠️ DEMO BILL — Tariff rates are configurable demonstration values, not official rates.
          </div>
        </div>
      </div>
    </div>
  )
}
