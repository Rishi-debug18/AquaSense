import { useState } from 'react'
import { Download, FileText, BarChart3, AlertTriangle } from 'lucide-react'

const REPORTS = [
  {
    id: 'billing',
    icon: FileText,
    title: 'Billing Report',
    desc: 'All bills with consumption, amount, and payment status',
    endpoint: '/api/v1/reports/billing',
    color: 'sky',
  },
  {
    id: 'high-usage',
    icon: BarChart3,
    title: 'High Usage Alerts',
    desc: 'All households flagged for excessive consumption',
    endpoint: '/api/v1/reports/high-usage',
    color: 'amber',
  },
  {
    id: 'leakage',
    icon: AlertTriangle,
    title: 'Leakage Events',
    desc: 'All detected pipeline leakage events with flow data',
    endpoint: '/api/v1/reports/leakage',
    color: 'red',
  },
]

const COLOR_CLASSES: Record<string, string> = {
  sky:   'bg-sky-50 text-sky-600 border-sky-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
  red:   'bg-red-50 text-red-600 border-red-100',
}

export default function ReportsPage() {
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7))

  const handleDownload = (id: string, endpoint: string) => {
    const token = localStorage.getItem('aquasense_token')
    const url = id === 'billing' ? `${endpoint}?period=${period}` : endpoint

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const objUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = objUrl
        link.download = `${id}_report.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(objUrl)
      })
      .catch(() => alert('Download failed. Make sure you are logged in.'))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <p className="text-slate-500 text-sm mt-1">Export data as CSV for offline analysis</p>
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-600 font-medium">Billing Period:</label>
        <input
          type="month"
          value={period}
          onChange={e => setPeriod(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <span className="text-xs text-slate-400">(applies to billing report only)</span>
      </div>

      {/* Report cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {REPORTS.map(({ id, icon: Icon, title, desc, endpoint, color }) => (
          <div key={id} className="bg-white border border-slate-100 rounded-xl p-5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${COLOR_CLASSES[color]}`}>
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
            <p className="text-sm text-slate-500 mb-4">{desc}</p>
            <button
              onClick={() => handleDownload(id, endpoint)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition"
            >
              <Download className="w-4 h-4" /> Download CSV
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl text-sm text-sky-700">
        📄 Reports are generated in real time from the database. CSV files can be imported into Excel or Google Sheets.
        <strong> Demo data only — not actual government records.</strong>
      </div>
    </div>
  )
}
