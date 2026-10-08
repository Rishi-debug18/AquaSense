import { useState, useEffect } from 'react'
import { getMyBills } from '../../api/household'
import { Link } from 'react-router-dom'
import { Receipt, ChevronRight, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react'
import { format } from 'date-fns'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  paid:      { label: 'Paid',      color: 'bg-green-100 text-green-800',  icon: CheckCircle },
  generated: { label: 'Generated', color: 'bg-blue-100 text-blue-800',   icon: FileText },
  sent:      { label: 'Sent',      color: 'bg-cyan-100 text-cyan-800',    icon: FileText },
  overdue:   { label: 'Overdue',   color: 'bg-red-100 text-red-800',      icon: AlertCircle },
  draft:     { label: 'Draft',     color: 'bg-slate-100 text-slate-600',  icon: Clock },
  cancelled: { label: 'Cancelled', color: 'bg-slate-100 text-slate-400',  icon: AlertCircle },
}

export default function BillsPage() {
  const [bills, setBills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyBills().then(setBills).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-7 h-7 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
    </div>
  )

  const totalPending = bills.filter(b => !['paid','cancelled'].includes(b.status)).reduce((s, b) => s + b.total_amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Water Bills</h1>
          <p className="text-slate-500 text-sm mt-1">Your billing history and current charges</p>
        </div>
        {totalPending > 0 && (
          <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm font-semibold text-amber-800">
            Pending: ₹{totalPending.toFixed(2)}
          </div>
        )}
      </div>

      {bills.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-100 rounded-xl">
          <Receipt className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500">No bills generated yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bills.map(bill => {
            const s = STATUS_CONFIG[bill.status] || STATUS_CONFIG.draft
            const StatusIcon = s.icon
            return (
              <Link
                key={bill.id}
                to={`/household/bills/${bill.id}`}
                className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl hover:border-sky-200 hover:shadow-sm transition group"
              >
                <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Receipt className="w-5 h-5 text-sky-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-slate-800">{bill.billing_period}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
                      <StatusIcon className="w-3 h-3" />{s.label}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>{bill.total_consumption_litre?.toLocaleString() || 0} L consumed</span>
                    {bill.due_date && (
                      <span>Due: {format(new Date(bill.due_date), 'dd MMM yyyy')}</span>
                    )}
                    <span className="font-mono text-slate-400">{bill.bill_number}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-bold text-slate-800 font-mono">₹{bill.total_amount.toFixed(2)}</div>
                  <ChevronRight className="w-4 h-4 text-slate-300 mx-auto mt-1 group-hover:text-sky-400 transition" />
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <div className="text-center text-xs text-slate-400 py-2">
        ⚠️ DEMO DATA — Bills generated from simulated meter readings. Not actual charges.
      </div>
    </div>
  )
}
